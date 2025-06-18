'use client';

import { useMemo, memo } from 'react';
import { DashboardData, WeeklyData } from '@/types/dashboard';
import DataTable from '@/components/custom/data-table';
import {
	useReactTable,
	getCoreRowModel,
	ColumnDef,
} from '@tanstack/react-table';

interface SummaryTableProps {
	data: DashboardData;
	onExportCSV?: () => void;
}

export const exportWeeklySummaryToCSV = (data: WeeklyData[]) => {
	if (!data || data.length === 0) return;

	const headers = [
		'Week',
		'Capacity Hours',
		'Scheduled Hours',
		'Utilization %',
		'Cost $',
		'Revenue $',
		'Profit $',
	];

	const csvData = data.map((week) => [
		week.week || 'N/A',
		week.capacityHours || 0,
		week.scheduledHours || 0,
		week.utilization || 0,
		week.cost || 0,
		week.revenue || 0,
		week.profit || 0,
	]);

	const csvContent = [
		headers.join(','),
		...csvData.map((row) => row.join(',')),
	].join('\n');

	const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
	const link = document.createElement('a');
	if (link.download !== undefined) {
		const url = URL.createObjectURL(blob);
		link.setAttribute('href', url);
		link.setAttribute('download', 'weekly-summary.csv');
		link.style.visibility = 'hidden';
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	}
};

// Memoized function to create columns
const createSummaryColumns = (): ColumnDef<WeeklyData>[] => [
	{
		accessorKey: 'week',
		header: () => <span>Week</span>,
		size: 60,
		cell: ({ row }) => {
			const week = row.original;
			return (
				<div className="font-medium text-center">{week.week || 'N/A'}</div>
			);
		},
	},
	{
		accessorKey: 'capacityHours',
		header: () => <span>Cap hrs</span>,
		size: 80,
		cell: ({ row }) => {
			const week = row.original;
			const capacityHours =
				typeof week.capacityHours === 'number' && !isNaN(week.capacityHours)
					? week.capacityHours
					: 0;
			return <div className="text-right">{capacityHours.toLocaleString()}</div>;
		},
	},
	{
		accessorKey: 'scheduledHours',
		header: () => <span>Sch hrs</span>,
		size: 80,
		cell: ({ row }) => {
			const week = row.original;
			const scheduledHours =
				typeof week.scheduledHours === 'number' && !isNaN(week.scheduledHours)
					? week.scheduledHours
					: 0;
			return (
				<div className="text-right">{scheduledHours.toLocaleString()}</div>
			);
		},
	},
	{
		accessorKey: 'utilization',
		header: () => <span>Util %</span>,
		size: 80,
		cell: ({ row }) => {
			const week = row.original;
			const utilization =
				typeof week.utilization === 'number' && !isNaN(week.utilization)
					? week.utilization
					: 0;
			return (
				<div className="text-right">
					<span
						className={`font-medium ${
							utilization <= 100
								? 'text-green-600'
								: utilization <= 120
								? 'text-amber-600'
								: 'text-red-600'
						}`}
					>
						{utilization}%
					</span>
				</div>
			);
		},
	},
	{
		accessorKey: 'cost',
		header: () => <span>Cost $</span>,
		size: 80,
		cell: ({ row }) => {
			const week = row.original;
			const cost =
				typeof week.cost === 'number' && !isNaN(week.cost) ? week.cost : 0;
			return <div className="text-right">{cost.toLocaleString()}</div>;
		},
	},
	{
		accessorKey: 'revenue',
		header: () => <span>Rev $</span>,
		size: 80,
		cell: ({ row }) => {
			const week = row.original;
			const revenue =
				typeof week.revenue === 'number' && !isNaN(week.revenue)
					? week.revenue
					: 0;
			return <div className="text-right">{revenue.toLocaleString()}</div>;
		},
	},
	{
		accessorKey: 'profit',
		header: () => <span>Profit $</span>,
		size: 90,
		cell: ({ row }) => {
			const week = row.original;
			const profit =
				typeof week.profit === 'number' && !isNaN(week.profit)
					? week.profit
					: 0;
			return (
				<div className="text-right">
					<span
						className={`font-medium ${
							profit < 0 ? 'text-red-600' : 'text-green-600'
						}`}
					>
						{profit < 0 ? '-' : ''}
						{Math.abs(profit).toLocaleString()}
					</span>
				</div>
			);
		},
	},
];

function SummaryTable({ data }: SummaryTableProps) {
	// Memoize columns to prevent recreation on every render
	const columns = useMemo(() => createSummaryColumns(), []);

	// Filter and validate the data - always return an array
	const validWeeklyData = useMemo(() => {
		if (!data?.weeklySummary || !Array.isArray(data.weeklySummary)) {
			return [];
		}
		return data.weeklySummary.filter(
			(week) => week && typeof week === 'object' && week.week
		);
	}, [data?.weeklySummary]);

	// Create table at top level (hooks must be called at top level)
	const table = useReactTable<WeeklyData>({
		data: validWeeklyData,
		columns,
		getCoreRowModel: getCoreRowModel(),
	});

	// Check if we have data to display
	const hasData = validWeeklyData.length > 0;

	return (
		<div className="space-y-4">
			<DataTable
				table={table}
				columns={columns}
				isLoading={false}
				isError={!hasData}
			/>
			<div className="pt-2 border-t">
				<p className="text-xs text-muted-foreground">
					Profit column colors red when &lt; 0
				</p>
			</div>
		</div>
	);
}

export default memo(SummaryTable);
