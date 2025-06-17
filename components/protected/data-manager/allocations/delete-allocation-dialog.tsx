'use client';

import { useState } from 'react';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { deleteAllocation } from '@/actions/allocations';
import { Allocation } from '@/types/allocation';
import { toast } from 'sonner';

type Props = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	allocation: Allocation | null;
	onAllocationDeleted: () => void;
};

export default function DeleteAllocationDialog({
	open,
	onOpenChange,
	allocation,
	onAllocationDeleted,
}: Props) {
	const [isDeleting, setIsDeleting] = useState(false);

	const handleDelete = async () => {
		if (!allocation) return;

		try {
			setIsDeleting(true);
			await deleteAllocation(allocation.id);
			onAllocationDeleted();
			onOpenChange(false);
			toast.success('Allocation deleted successfully');
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : 'Failed to delete allocation'
			);
		} finally {
			setIsDeleting(false);
		}
	};

	if (!allocation) return null;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Delete Allocation</DialogTitle>
				</DialogHeader>

				<div className="space-y-4">
					<p className="text-sm text-muted-foreground">
						Are you sure you want to delete this allocation? This action cannot
						be undone.
					</p>

					<div className="rounded-md bg-muted p-3 space-y-2">
						<div className="grid grid-cols-2 gap-2 text-sm">
							<span className="font-medium">Consultant:</span>
							<span>{allocation.consultant_name}</span>
						</div>
						<div className="grid grid-cols-2 gap-2 text-sm">
							<span className="font-medium">Project:</span>
							<span>{allocation.project_name}</span>
						</div>
						<div className="grid grid-cols-2 gap-2 text-sm">
							<span className="font-medium">Period:</span>
							<span>
								{new Date(allocation.start_date).toLocaleDateString()} -{' '}
								{new Date(allocation.end_date).toLocaleDateString()}
							</span>
						</div>
						<div className="grid grid-cols-2 gap-2 text-sm">
							<span className="font-medium">Hours/Week:</span>
							<span>{allocation.hours_per_week}</span>
						</div>
					</div>

					<div className="flex justify-end gap-2">
						<Button
							variant="outline"
							onClick={() => onOpenChange(false)}
							disabled={isDeleting}
						>
							Cancel
						</Button>
						<Button
							variant="destructive"
							onClick={handleDelete}
							disabled={isDeleting}
						>
							{isDeleting ? 'Deleting...' : 'Delete Allocation'}
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
