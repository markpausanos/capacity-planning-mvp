'use client';

import { useMemo, memo, useCallback } from 'react';
import { DashboardData } from '@/types/dashboard';
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
	Cell,
} from 'recharts';

interface CapacityChartProps {
	data: DashboardData;
}

interface TooltipProps {
	active?: boolean;
	payload?: Array<{
		value: number;
		payload: {
			week: string;
			utilization: number;
		};
	}>;
	label?: string;
}

interface BarClickData {
	week: string;
	utilization: number;
}

// Color function based on utilization percentage
function getUtilizationColor(utilization: number): string {
	if (utilization <= 100) return '#22c55e'; // Green
	if (utilization <= 120) return '#f59e0b'; // Amber
	return '#ef4444'; // Red
}

function CapacityChart({ data }: CapacityChartProps) {
	// Move all hooks to the top level

	// Memoize chart data to use compiled utilization from weekly summary
	const chartData = useMemo(() => {
		if (!data?.weeklySummary || !Array.isArray(data.weeklySummary)) {
			return [];
		}

		return data.weeklySummary.map((weekSummary) => {
			// Ensure utilization is a valid number
			let utilization = 0;
			if (
				weekSummary &&
				typeof weekSummary.utilization === 'number' &&
				!isNaN(weekSummary.utilization) &&
				isFinite(weekSummary.utilization)
			) {
				utilization = Math.max(0, weekSummary.utilization);
			}

			return {
				week: weekSummary.week || 'Unknown',
				utilization: utilization,
			};
		});
	}, [data.weeklySummary]);

	// Memoize click handler to prevent recreation
	const handleBarClick = useCallback(
		(clickData: BarClickData, index: number, consultant: string) => {
			console.log('Bar clicked:', {
				week: clickData.week,
				consultant,
				utilization: clickData.utilization,
				index,
			});
		},
		[]
	);

	// Custom tooltip with error checking for compiled utilization
	const CustomTooltip = useCallback(
		({ active, payload, label }: TooltipProps) => {
			if (active && payload && payload.length && payload[0]) {
				const utilization =
					typeof payload[0].value === 'number' && !isNaN(payload[0].value)
						? payload[0].value
						: 0;
				const week = label || 'Unknown';

				return (
					<div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
						<p className="font-medium text-sm text-gray-900 mb-2">{`Week: ${week}`}</p>
						<div className="flex items-center justify-between gap-2">
							<span className="text-sm">Overall Utilization:</span>
							<span
								className="text-sm font-medium"
								style={{ color: getUtilizationColor(utilization) }}
							>
								{utilization}%
							</span>
						</div>
					</div>
				);
			}
			return null;
		},
		[]
	);

	// Error checking and data validation
	if (!data || !data.consultants || data.consultants.length === 0) {
		return (
			<div className="w-full h-96 flex items-center justify-center text-muted-foreground">
				<p>No consultant data available</p>
			</div>
		);
	}

	// Additional safety check
	if (!Array.isArray(data.consultants)) {
		console.error('Invalid consultants data:', data.consultants);
		return (
			<div className="w-full h-96 flex items-center justify-center text-muted-foreground">
				<p>Invalid consultant data format</p>
			</div>
		);
	}

	// If no valid data after filtering, show empty state
	if (chartData.length === 0) {
		return (
			<div className="w-full h-96 flex items-center justify-center text-muted-foreground">
				<p>No valid chart data available</p>
			</div>
		);
	}

	return (
		<div className="w-full" style={{ height: '400px' }}>
			<ResponsiveContainer width="100%" height="100%">
				<BarChart
					data={chartData}
					margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
				>
					<CartesianGrid strokeDasharray="3 3" />
					<XAxis dataKey="week" tick={{ fontSize: 12 }} />
					<YAxis
						domain={[
							0,
							(dataMax: number) =>
								isNaN(dataMax) ? 120 : Math.max(dataMax + 10, 120),
						]}
						tickFormatter={(value) => `${isNaN(value) ? 0 : value}%`}
					/>
					<Tooltip content={<CustomTooltip />} />

					<Bar
						dataKey="utilization"
						onClick={(clickData, index) =>
							handleBarClick(clickData as BarClickData, index, 'overall')
						}
						style={{ cursor: 'pointer' }}
					>
						{chartData.map((entry, entryIndex) => {
							const utilization = entry.utilization || 0;
							return (
								<Cell
									key={`cell-utilization-${entryIndex}`}
									fill={getUtilizationColor(utilization)}
								/>
							);
						})}
					</Bar>
				</BarChart>
			</ResponsiveContainer>
		</div>
	);
}

export default memo(CapacityChart);
