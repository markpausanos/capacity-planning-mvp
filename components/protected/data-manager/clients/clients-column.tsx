import { Button } from '@/components/ui/button';
import { Client } from '@/types/client';
import { ColumnDef } from '@tanstack/react-table';
import { Edit, Trash2 } from 'lucide-react';

type Props = {
	onEditClient: (client: Client) => void;
	onDeleteClient: (client: Client) => void;
};

const clientColumn = ({
	onEditClient,
	onDeleteClient,
}: Props): ColumnDef<Client>[] => [
	{
		accessorKey: 'name',
		header: () => <span>Name</span>,
		cell: ({ row }) => {
			const client = row.original;
			return (
				<div className="flex items-center gap-2 min-w-[250px]">
					<p className="truncate font-medium">{client.name}</p>
				</div>
			);
		},
	},
	// Actions
	{
		id: 'actions',
		header: () => <span>Actions</span>,
		cell: ({ row }) => {
			const client = row.original;

			return (
				<div className="my-1 flex items-center">
					<Button
						variant="ghost"
						size="sm"
						className="h-8 w-8 p-0"
						onClick={() => onEditClient(client)}
					>
						<Edit className="h-4 w-4" />
					</Button>
					<Button
						variant="ghost"
						size="sm"
						className="h-8 w-8 p-0 text-destructive hover:text-destructive"
						onClick={() => onDeleteClient(client)}
					>
						<Trash2 className="h-4 w-4" />
					</Button>
				</div>
			);
		},
	},
];

export default clientColumn;
