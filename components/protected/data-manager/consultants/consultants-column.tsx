import { Button } from '@/components/ui/button';
import { Consultant } from '@/types/consultant';
import { ColumnDef } from '@tanstack/react-table';
import { Edit, Trash2 } from 'lucide-react';

type Props = {
	onEditConsultant: (consultant: Consultant) => void;
	onDeleteConsultant: (consultant: Consultant) => void;
};

const consultantColumn = ({
	onEditConsultant,
	onDeleteConsultant,
}: Props): ColumnDef<Consultant>[] => [
	{
		accessorKey: 'name',
		header: () => <span>Name</span>,
		cell: ({ row }) => {
			const consultant = row.original;
			return (
				<div className="flex max-w-[250px] items-center gap-2">
					<p className="truncate font-medium">{consultant.name}</p>
				</div>
			);
		},
	},
	{
		accessorKey: 'cost_per_hour',
		header: () => <span>Cost/hr</span>,
		cell: ({ row }) => {
			const consultant = row.original;
			return (
				<div className="flex items-center gap-2">
					<p className="text-center">${consultant.cost_per_hour}</p>
				</div>
			);
		},
	},
	{
		accessorKey: 'bill_rate',
		header: () => <span>Bill Rate/hr</span>,
		cell: ({ row }) => {
			const consultant = row.original;
			return (
				<div className="flex items-center gap-2">
					<p className="text-center">${consultant.bill_rate}</p>
				</div>
			);
		},
	},
	{
		accessorKey: 'capacity_hours_per_week',
		header: () => <span>Capacity hrs/wk</span>,
		cell: ({ row }) => {
			const consultant = row.original;
			return (
				<div className="flex items-center gap-2">
					<p className="text-center">{consultant.capacity_hours_per_week}</p>
				</div>
			);
		},
	},
	// Actions
	{
		id: 'actions',
		header: () => <span>Actions</span>,
		cell: ({ row }) => {
			const consultant = row.original;

			return (
				<div className="my-1 flex items-center">
					<Button
						variant="ghost"
						size="sm"
						className="cursor-pointer"
						onClick={() => onEditConsultant(consultant)}
					>
						<Edit className="h-4 w-4" />
					</Button>
					<Button
						variant="ghost"
						size="sm"
						className="my-1 cursor-pointer"
						onClick={() => onDeleteConsultant(consultant)}
					>
						<Trash2 className="h-4 w-4 text-destructive" />
					</Button>
				</div>
			);
		},
	},
];

export default consultantColumn;
