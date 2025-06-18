'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { DashboardData } from '@/types/dashboard';
import { getDashboardData } from '@/actions/dashboard';
import CapacityChart from '@/components/protected/dashboard/capacity-chart';
import SummaryTable, {
	exportWeeklySummaryToCSV,
} from '@/components/protected/dashboard/summary-table';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

export default function Page() {
	const [dashboardData, setDashboardData] = useState<DashboardData | null>(
		null
	);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const loadDashboardData = useCallback(async () => {
		try {
			setLoading(true);
			setError(null);
			const data = await getDashboardData();

			if (!data || typeof data !== 'object') {
				throw new Error('Invalid data format received from server');
			}

			if (!Array.isArray(data.consultants)) {
				console.warn('Invalid consultants data, setting to empty array');
				data.consultants = [];
			}

			if (!Array.isArray(data.weeklySummary)) {
				console.warn('Invalid weeklySummary data, setting to empty array');
				data.weeklySummary = [];
			}

			if (!Array.isArray(data.benchConsultants)) {
				console.warn('Invalid benchConsultants data, setting to empty array');
				data.benchConsultants = [];
			}

			setDashboardData(data);
		} catch (err) {
			console.error('Dashboard data loading error:', err);
			const errorMessage =
				err instanceof Error ? err.message : 'Failed to load dashboard data';
			setError(errorMessage);
			toast.error(errorMessage);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		let isMounted = true;

		const loadData = async () => {
			if (isMounted) {
				await loadDashboardData();
			}
		};

		loadData();

		return () => {
			isMounted = false;
		};
	}, [loadDashboardData]);

	if (loading) {
		return (
			<div className="space-y-6 p-6">
				<div className="flex items-center justify-between">
					<Skeleton className="h-8 w-96" />
					<Skeleton className="h-6 w-48" />
				</div>
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					<div className="lg:col-span-2">
						<Card>
							<CardHeader>
								<Skeleton className="h-6 w-32" />
							</CardHeader>
							<CardContent>
								<Skeleton className="h-96 w-full" />
							</CardContent>
						</Card>
					</div>
					<div>
						<Card>
							<CardHeader>
								<Skeleton className="h-6 w-32" />
							</CardHeader>
							<CardContent>
								<Skeleton className="h-96 w-full" />
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		);
	}

	if (error || !dashboardData) {
		return (
			<div className="space-y-6 p-6">
				<div className="flex items-center justify-between">
					<h1 className="text-3xl font-bold tracking-tight">
						Capacity Planning • 12 Week Horizon
					</h1>
					<Badge variant="destructive">Error loading data</Badge>
				</div>
				<Card>
					<CardContent className="pt-6">
						<div className="text-center py-12">
							<p className="text-muted-foreground mb-4">
								{error || 'Failed to load dashboard data'}
							</p>
							<button
								onClick={loadDashboardData}
								className="text-blue-600 hover:text-blue-800 underline"
							>
								Try again
							</button>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	const benchCount = dashboardData.benchConsultants?.length || 0;

	return (
		<div className="space-y-6 p-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<h1 className="text-3xl font-bold tracking-tight">
					Capacity Planning • 12 Week Horizon
				</h1>
				<div className="flex items-start gap-4">
					<div className="flex flex-col">
						<Badge variant={benchCount > 0 ? 'destructive' : 'secondary'}>
							Bench • {benchCount} consultants
						</Badge>
					</div>
				</div>
			</div>

			{/* Main Content */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Chart Section */}
				<div className="lg:col-span-2">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<span>Utilization %</span>
								<div className="flex items-center gap-4 text-sm">
									<div className="flex items-center gap-1">
										<div className="w-3 h-3 bg-green-500 rounded-sm"></div>
										<span>≤100%</span>
									</div>
									<div className="flex items-center gap-1">
										<div className="w-3 h-3 bg-amber-500 rounded-sm"></div>
										<span>101-120%</span>
									</div>
									<div className="flex items-center gap-1">
										<div className="w-3 h-3 bg-red-500 rounded-sm"></div>
										<span>&gt;120%</span>
									</div>
								</div>
							</CardTitle>
							<p className="text-xs text-muted-foreground">
								Green ≤100%, Orange 101-120%, Red &gt; 120%
							</p>
						</CardHeader>
						<CardContent>
							{dashboardData && dashboardData.consultants ? (
								<CapacityChart data={dashboardData} />
							) : (
								<div className="h-96 flex items-center justify-center text-muted-foreground">
									<p>No chart data available</p>
								</div>
							)}
						</CardContent>
					</Card>
				</div>

				{/* Summary Table */}
				<div>
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center justify-between">
								<span>Weekly Summary</span>
								<Button
									variant="outline"
									size="sm"
									onClick={() => {
										if (dashboardData?.weeklySummary) {
											const validWeeklyData =
												dashboardData.weeklySummary.filter(
													(week) =>
														week && typeof week === 'object' && week.week
												);
											exportWeeklySummaryToCSV(validWeeklyData);
										}
									}}
									disabled={
										!dashboardData?.weeklySummary ||
										dashboardData.weeklySummary.length === 0
									}
									className="gap-2"
								>
									<Download className="h-4 w-4" />
									Export CSV
								</Button>
							</CardTitle>
						</CardHeader>
						<CardContent>
							{dashboardData && dashboardData.weeklySummary ? (
								<SummaryTable data={dashboardData} />
							) : (
								<div className="h-48 flex items-center justify-center text-muted-foreground">
									<p>No summary data available</p>
								</div>
							)}
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
