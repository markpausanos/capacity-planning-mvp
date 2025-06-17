import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Allocation } from '@/types/allocation';
import { ColumnDef } from '@tanstack/react-table';
import { Edit, Trash2 } from 'lucide-react';

type Props = {
	onEditAllocation: (allocation: Allocation) => void;
	onDeleteAllocation: (allocation: Allocation) => void;
};

const allocationColumn = ({
	onEditAllocation,
	onDeleteAllocation,
}: Props): ColumnDef<Allocation>[] => [
	{
		accessorKey: 'consultant_name',
		header: () => <span>Consultant</span>,
		size: 150,
		cell: ({ row }) => {
			const allocation = row.original;
			return (
				<div className="flex items-center gap-2">
					<p className="truncate font-medium">{allocation.consultant_name}</p>
				</div>
			);
		},
	},
	{
		accessorKey: 'project_name',
		header: () => <span>Project</span>,
		size: 180,
		cell: ({ row }) => {
			const allocation = row.original;
			return (
				<div className="flex flex-col gap-1">
					<p className="truncate font-medium">{allocation.project_name}</p>
				</div>
			);
		},
	},
	{
		accessorKey: 'start_date',
		header: () => <span>Start Date</span>,
		size: 120,
		cell: ({ row }) => {
			const allocation = row.original;
			const date = new Date(allocation.start_date);
			return (
				<div className="flex items-center gap-2">
					<p className="text-sm">{date.toLocaleDateString()}</p>
				</div>
			);
		},
	},
	{
		accessorKey: 'end_date',
		header: () => <span>End Date</span>,
		size: 120,
		cell: ({ row }) => {
			const allocation = row.original;
			const date = new Date(allocation.end_date);
			return (
				<div className="flex items-center gap-2">
					<p className="text-sm">{date.toLocaleDateString()}</p>
				</div>
			);
		},
	},
	{
		accessorKey: 'hours_per_week',
		header: () => <span>Hours/Wk</span>,
		size: 100,
		cell: ({ row }) => {
			const allocation = row.original;
			return (
				<div className="flex items-center gap-2">
					<p className="text-center font-medium">{allocation.hours_per_week}</p>
				</div>
			);
		},
	},
	{
		id: 'utilization',
		header: () => <span>Util % of Cap</span>,
		size: 120,
		cell: ({ row }) => {
			const allocation = row.original;
			const utilizationPercentage = allocation.consultant_capacity
				? Math.round(
						(allocation.hours_per_week / allocation.consultant_capacity) * 100
				  )
				: 0;

			const getUtilizationColor = (percentage: number) => {
				if (percentage <= 70) return 'secondary';
				if (percentage <= 100) return 'default';
				return 'destructive';
			};

			return (
				<div className="flex items-center gap-2">
					<Badge variant={getUtilizationColor(utilizationPercentage)}>
						{utilizationPercentage}%
					</Badge>
				</div>
			);
		},
	},
	// Actions
	{
		id: 'actions',
		header: () => <span>Actions</span>,
		size: 100,
		cell: ({ row }) => {
			const allocation = row.original;

			return (
				<div className="flex items-center gap-1">
					<Button
						variant="ghost"
						size="sm"
						className="h-8 w-8 p-0"
						onClick={() => onEditAllocation(allocation)}
					>
						<Edit className="h-4 w-4" />
					</Button>
					<Button
						variant="ghost"
						size="sm"
						className="h-8 w-8 p-0 text-destructive hover:text-destructive"
						onClick={() => onDeleteAllocation(allocation)}
					>
						<Trash2 className="h-4 w-4" />
					</Button>
				</div>
			);
		},
	},
];

export default allocationColumn;
