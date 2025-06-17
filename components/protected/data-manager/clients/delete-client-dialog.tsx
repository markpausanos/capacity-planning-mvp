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
import { deleteClient } from '@/actions/clients';
import { Client } from '@/types/client';
import { AlertTriangle } from 'lucide-react';

interface DeleteClientDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onClientDeleted: () => void;
	client: Client | null;
}

export default function DeleteClientDialog({
	open,
	onOpenChange,
	onClientDeleted,
	client,
}: DeleteClientDialogProps) {
	const [isDeleting, setIsDeleting] = useState(false);

	const handleDelete = async () => {
		if (!client) return;

		try {
			setIsDeleting(true);
			await deleteClient(client.id);
			onClientDeleted();
		} catch (error) {
			console.error('Error deleting client:', error);
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
				<DialogHeader>
					<div className="flex items-center gap-3">
						<div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
							<AlertTriangle className="h-5 w-5 text-red-600" />
						</div>
						<div>
							<DialogTitle className="text-lg font-semibold">
								Delete Client
							</DialogTitle>
							<DialogDescription className="text-sm text-gray-600">
								This action cannot be undone
							</DialogDescription>
						</div>
					</div>
				</DialogHeader>

				<div className="py-4 space-y-3">
					<p className="text-sm text-gray-700">
						Are you sure you want to delete{' '}
						<span className="font-semibold">{client?.name}</span>?
					</p>
					<div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
						<p className="text-sm text-yellow-800">
							<strong>Warning:</strong> This will also delete all projects
							associated with this client.
						</p>
					</div>
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
						{isDeleting ? 'Deleting...' : 'Delete Client'}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
