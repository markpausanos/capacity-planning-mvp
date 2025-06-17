import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Project } from '@/types/project';
import { ColumnDef } from '@tanstack/react-table';
import { Edit, Trash2 } from 'lucide-react';

type Props = {
	onEditProject: (project: Project) => void;
	onDeleteProject: (project: Project) => void;
};

const projectColumn = ({
	onEditProject,
	onDeleteProject,
}: Props): ColumnDef<Project>[] => [
	{
		accessorKey: 'name',
		header: () => <span>Project Name</span>,
		size: 200,
		cell: ({ row }) => {
			const project = row.original;
			return (
				<div className="flex items-center gap-2">
					<p className="truncate font-medium">{project.name}</p>
				</div>
			);
		},
	},
	{
		accessorKey: 'client_name',
		header: () => <span>Client</span>,
		size: 150,
		cell: ({ row }) => {
			const project = row.original;
			return (
				<div className="flex items-center gap-2">
					<p className="truncate">{project.client_name}</p>
				</div>
			);
		},
	},
	{
		accessorKey: 'billing_model',
		header: () => <span>Billing Model</span>,
		size: 120,
		cell: ({ row }) => {
			const project = row.original;
			return (
				<div className="flex items-center gap-2">
					<Badge
						variant={project.billing_model === 'flat' ? 'secondary' : 'outline'}
					>
						{project.billing_model === 'flat' ? 'Flat' : 'Hourly'}
					</Badge>
				</div>
			);
		},
	},
	{
		accessorKey: 'flat_fee',
		header: () => <span>Flat Fee $</span>,
		size: 100,
		cell: ({ row }) => {
			const project = row.original;
			return (
				<div className="flex items-center gap-2">
					<p className="text-right">
						{project.billing_model === 'flat' && project.flat_fee
							? `$${project.flat_fee.toLocaleString()}`
							: '–'}
					</p>
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
			const project = row.original;

			return (
				<div className="flex items-center gap-1">
					<Button
						variant="ghost"
						size="sm"
						className="h-8 w-8 p-0"
						onClick={() => onEditProject(project)}
					>
						<Edit className="h-4 w-4" />
					</Button>
					<Button
						variant="ghost"
						size="sm"
						className="h-8 w-8 p-0 text-destructive hover:text-destructive"
						onClick={() => onDeleteProject(project)}
					>
						<Trash2 className="h-4 w-4" />
					</Button>
				</div>
			);
		},
	},
];

export default projectColumn;
