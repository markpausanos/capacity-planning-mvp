'use server';

import { prisma } from '@/lib/prisma';
import {
	DashboardData,
	ConsultantWeeklyData,
	WeeklyData,
	BenchConsultant,
} from '@/types/dashboard';
import { currentUser } from '@clerk/nextjs/server';

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
		const user = await currentUser();
		
		if (!user) {
			throw new Error('Unauthorized: User not authenticated');
		}

		console.log('user.id =', user.id, '| typeof =', typeof user.id);

		// Calculate 12-week period starting from current week
		const today = new Date();
		const weekStart = getWeekStart(today);
		const weeks: Date[] = [];

		for (let i = 0; i < 12; i++) {
			const weekDate = new Date(weekStart);
			weekDate.setDate(weekStart.getDate() + i * 7);
			weeks.push(weekDate);
		}

		// Get all consultants - filtered by user
		const consultants = await prisma.consultant.findMany({
			where: {
				clerkUserId: user.id,
			},
			orderBy: {
				name: 'asc',
			},
		});

		// Get all allocations that overlap with our 12-week period - filtered by user
		const periodStart = weeks[0];
		const periodEnd = weeks[11];

		const allocations = await prisma.allocation.findMany({
			where: {
				clerkUserId: user.id,
				OR: [
					{
						startDate: {
							lte: periodEnd,
						},
					},
					{
						endDate: {
							gte: periodStart,
						},
					},
				],
			},
			include: {
				consultant: {
					select: {
						name: true,
						costPerHour: true,
						billRate: true,
						capacityHoursPerWeek: true,
					},
				},
				project: {
					select: {
						name: true,
						billingModel: true,
						flatFee: true,
						client: {
							select: {
								name: true,
							},
						},
					},
				},
			},
		});

		// Process data for each consultant
		const consultantData: ConsultantWeeklyData[] = consultants.map(
			(consultant) => {
				const weeklyData: WeeklyData[] = weeks.map((weekDate, index) => {
					const weekEndDate = new Date(weekDate);
					weekEndDate.setDate(weekDate.getDate() + 6);

					// Find allocations for this consultant that overlap with this week
					const weekAllocations = allocations.filter((allocation) => {
						const allocationStart = new Date(allocation.startDate);
						const allocationEnd = new Date(allocation.endDate);
						return (
							allocation.consultantId === consultant.id &&
							allocationStart <= weekEndDate &&
							allocationEnd >= weekDate
						);
					});

					// Calculate totals for this week
					let scheduledHours = 0;
					let cost = 0;
					let revenue = 0;

					weekAllocations.forEach((allocation) => {
						scheduledHours += allocation.hoursPerWeek;
						cost +=
							allocation.hoursPerWeek * Number(allocation.consultant.costPerHour);

						// Calculate revenue based on billing model
						if (allocation.project.billingModel === 'hourly') {
							revenue +=
								allocation.hoursPerWeek * Number(allocation.consultant.billRate);
						} else if (
							allocation.project.billingModel === 'flat' &&
							allocation.project.flatFee
						) {
							// For flat fee, divide the total fee by the number of weeks in the project
							const projectStart = new Date(allocation.startDate);
							const projectEnd = new Date(allocation.endDate);
							const projectWeeks = getWeeksBetween(projectStart, projectEnd);
							revenue += Number(allocation.project.flatFee) / projectWeeks;
						}
					});

					const capacityHours = consultant.capacityHoursPerWeek;
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
			allocations.map((allocation) => allocation.consultantId)
		);

		const benchConsultants: BenchConsultant[] = consultants
			.filter((consultant) => !allocatedConsultantIds.has(consultant.id))
			.map((consultant) => ({
				id: consultant.id,
				name: consultant.name,
				capacityHoursPerWeek: consultant.capacityHoursPerWeek,
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
