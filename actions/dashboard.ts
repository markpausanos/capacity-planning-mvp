'use server';

import createClient from '@/utils/supabase/server';
import {
	DashboardData,
	ConsultantWeeklyData,
	WeeklyData,
	BenchConsultant,
} from '@/types/dashboard';
import { revalidatePath } from 'next/cache';
import { getUser } from './auth';

// Get Monday of current week
function getWeekStart(date: Date): Date {
	const d = new Date(date);
	const day = d.getDay();
	const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
	return new Date(d.setDate(diff));
}

// Format week as "W1", "W2", etc.
function formatWeekLabel(weekNumber: number): string {
	return `W${weekNumber}`;
}

// Calculate the number of weeks between two dates
function getWeeksBetween(startDate: Date, endDate: Date): number {
	const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
	const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
	return Math.ceil(diffDays / 7);
}

export async function getDashboardData(): Promise<DashboardData> {
	try {
		const supabase = await createClient();
		const { user } = await getUser();

		if (!user) {
			throw new Error('Unauthorized: User not authenticated');
		}

		// Calculate 12-week period starting from current week
		const today = new Date();
		const weekStart = getWeekStart(today);
		const weeks: Date[] = [];

		for (let i = 0; i < 12; i++) {
			const weekDate = new Date(weekStart);
			weekDate.setDate(weekStart.getDate() + i * 7);
			weeks.push(weekDate);
		}

		// Get all consultants with timeout - filtered by user
		const consultantsPromise = supabase
			.from('consultants')
			.select('*')
			.eq('user_id', user.id)
			.order('name');

		const timeoutPromise = new Promise((_, reject) =>
			setTimeout(() => reject(new Error('Query timeout: consultants')), 10000)
		);

		const { data: consultants, error: consultantsError } = (await Promise.race([
			consultantsPromise,
			timeoutPromise,
		])) as any;

		if (consultantsError) {
			console.error('Error fetching consultants:', consultantsError);
			throw new Error('Failed to fetch consultants');
		}

		// Get all allocations that overlap with our 12-week period with timeout - filtered by user
		const periodStart = weeks[0].toISOString().split('T')[0];
		const periodEnd = weeks[11].toISOString().split('T')[0];

		const allocationsPromise = supabase
			.from('allocations')
			.select(
				`
			*,
			consultants!inner(name, cost_per_hour, bill_rate, capacity_hours_per_week),
			projects!inner(
				name,
				billing_model,
				flat_fee,
				clients!inner(name)
			)
		`
			)
			.eq('user_id', user.id)
			.or(`start_date.lte.${periodEnd},end_date.gte.${periodStart}`);

		const allocationsTimeoutPromise = new Promise((_, reject) =>
			setTimeout(() => reject(new Error('Query timeout: allocations')), 10000)
		);

		const { data: allocations, error: allocationsError } = (await Promise.race([
			allocationsPromise,
			allocationsTimeoutPromise,
		])) as any;

		if (allocationsError) {
			console.error('Error fetching allocations:', allocationsError);
			throw new Error('Failed to fetch allocations');
		}

		// Process data for each consultant
		const consultantData: ConsultantWeeklyData[] = consultants.map(
			(consultant: any) => {
				const weeklyData: WeeklyData[] = weeks.map((weekDate, index) => {
					const weekEndDate = new Date(weekDate);
					weekEndDate.setDate(weekDate.getDate() + 6);

					// Find allocations for this consultant that overlap with this week
					const weekAllocations = allocations.filter((allocation: any) => {
						const allocationStart = new Date(allocation.start_date);
						const allocationEnd = new Date(allocation.end_date);
						return (
							allocation.consultant_id === consultant.id &&
							allocationStart <= weekEndDate &&
							allocationEnd >= weekDate
						);
					});

					// Calculate totals for this week
					let scheduledHours = 0;
					let cost = 0;
					let revenue = 0;

					weekAllocations.forEach((allocation: any) => {
						scheduledHours += allocation.hours_per_week;
						cost +=
							allocation.hours_per_week * allocation.consultants.cost_per_hour;

						// Calculate revenue based on billing model
						if (allocation.projects.billing_model === 'hourly') {
							revenue +=
								allocation.hours_per_week * allocation.consultants.bill_rate;
						} else if (
							allocation.projects.billing_model === 'flat' &&
							allocation.projects.flat_fee
						) {
							// For flat fee, divide the total fee by the number of weeks in the project
							const projectStart = new Date(allocation.start_date);
							const projectEnd = new Date(allocation.end_date);
							const projectWeeks = getWeeksBetween(projectStart, projectEnd);
							revenue += allocation.projects.flat_fee / projectWeeks;
						}
					});

					const capacityHours = consultant.capacity_hours_per_week;
					const utilization =
						capacityHours > 0
							? Math.round((scheduledHours / capacityHours) * 100)
							: 0;
					const profit = revenue - cost;

					return {
						week: formatWeekLabel(index + 1),
						weekNumber: index + 1,
						capacityHours,
						scheduledHours,
						utilization,
						cost: Math.round(cost),
						revenue: Math.round(revenue),
						profit: Math.round(profit),
					};
				});

				return {
					consultantId: consultant.id,
					consultantName: consultant.name,
					weeks: weeklyData,
				};
			}
		);

		// Calculate weekly summary (totals across all consultants)
		const weeklySummary: WeeklyData[] = weeks.map((_, index) => {
			const weekData = consultantData.reduce(
				(acc, consultant) => {
					const week = consultant.weeks[index];
					return {
						capacityHours: acc.capacityHours + week.capacityHours,
						scheduledHours: acc.scheduledHours + week.scheduledHours,
						cost: acc.cost + week.cost,
						revenue: acc.revenue + week.revenue,
						profit: acc.profit + week.profit,
					};
				},
				{ capacityHours: 0, scheduledHours: 0, cost: 0, revenue: 0, profit: 0 }
			);

			const utilization =
				weekData.capacityHours > 0
					? Math.round((weekData.scheduledHours / weekData.capacityHours) * 100)
					: 0;

			return {
				week: formatWeekLabel(index + 1),
				weekNumber: index + 1,
				capacityHours: weekData.capacityHours,
				scheduledHours: weekData.scheduledHours,
				utilization,
				cost: weekData.cost,
				revenue: weekData.revenue,
				profit: weekData.profit,
			};
		});

		// Find bench consultants (those with no allocations in the 12-week period)
		const allocatedConsultantIds = new Set(
			allocations.map((allocation: any) => allocation.consultant_id)
		);

		const benchConsultants: BenchConsultant[] = consultants
			.filter((consultant: any) => !allocatedConsultantIds.has(consultant.id))
			.map((consultant: any) => ({
				id: consultant.id,
				name: consultant.name,
				capacityHoursPerWeek: consultant.capacity_hours_per_week,
			}));

		return {
			consultants: consultantData,
			weeklySummary,
			benchConsultants,
			totalConsultants: consultants.length,
		};
	} catch (error) {
		console.error('Error in getDashboardData:', error);

		// Return empty but valid data structure instead of throwing
		const emptyWeeks: WeeklyData[] = Array.from({ length: 12 }, (_, index) => ({
			week: formatWeekLabel(index + 1),
			weekNumber: index + 1,
			capacityHours: 0,
			scheduledHours: 0,
			utilization: 0,
			cost: 0,
			revenue: 0,
			profit: 0,
		}));

		return {
			consultants: [],
			weeklySummary: emptyWeeks,
			benchConsultants: [],
			totalConsultants: 0,
		};
	}
}
