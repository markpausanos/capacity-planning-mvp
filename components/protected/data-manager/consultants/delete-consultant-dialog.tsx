'use client';

import { useState } from 'react';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { deleteConsultant } from '@/actions/consultants';
import { Consultant } from '@/types/consultant';
import { AlertTriangle, X } from 'lucide-react';

interface DeleteConsultantDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onConsultantDeleted: () => void;
	consultant: Consultant | null;
}

export default function DeleteConsultantDialog({
	open,
	onOpenChange,
	onConsultantDeleted,
	consultant,
}: DeleteConsultantDialogProps) {
	const [isDeleting, setIsDeleting] = useState(false);

	const handleDelete = async () => {
		if (!consultant) return;

		try {
			setIsDeleting(true);
			await deleteConsultant(consultant.id);
			onConsultantDeleted();
		} catch (error) {
			console.error('Error deleting consultant:', error);
			// TODO: Add proper error handling/toast notification
		} finally {
			setIsDeleting(false);
		}
	};

	const handleCancel = () => {
		onOpenChange(false);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-md">
				<DialogHeader className="flex flex-row items-center justify-between">
					<div className="flex items-center gap-3">
						<div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
							<AlertTriangle className="h-5 w-5 text-red-600" />
						</div>
						<div>
							<DialogTitle className="text-lg font-semibold">
								Delete Consultant
							</DialogTitle>
							<DialogDescription className="text-sm text-gray-600">
								This action cannot be undone
							</DialogDescription>
						</div>
					</div>
				</DialogHeader>

				<div className="py-4">
					<p className="text-sm text-gray-700">
						Are you sure you want to delete{' '}
						<span className="font-semibold">{consultant?.name}</span>? This will
						permanently remove their information and cannot be undone.
					</p>
				</div>

				<div className="flex justify-end gap-3">
					<Button
						type="button"
						variant="outline"
						onClick={handleCancel}
						disabled={isDeleting}
					>
						Cancel
					</Button>
					<Button
						type="button"
						variant="destructive"
						onClick={handleDelete}
						disabled={isDeleting}
					>
						{isDeleting ? 'Deleting...' : 'Delete Consultant'}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
