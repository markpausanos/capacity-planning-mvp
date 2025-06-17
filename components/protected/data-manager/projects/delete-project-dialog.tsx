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
import { deleteProject } from '@/actions/projects';
import { Project } from '@/types/project';
import { AlertTriangle } from 'lucide-react';

interface DeleteProjectDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onProjectDeleted: () => void;
	project: Project | null;
}

export default function DeleteProjectDialog({
	open,
	onOpenChange,
	onProjectDeleted,
	project,
}: DeleteProjectDialogProps) {
	const [isDeleting, setIsDeleting] = useState(false);

	const handleDelete = async () => {
		if (!project) return;

		try {
			setIsDeleting(true);
			await deleteProject(project.id);
			onProjectDeleted();
		} catch (error) {
			console.error('Error deleting project:', error);
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
								Delete Project
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
						<span className="font-semibold">{project?.name}</span> from{' '}
						<span className="font-medium">{project?.client_name}</span>? This
						will permanently remove the project information and cannot be
						undone.
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
						{isDeleting ? 'Deleting...' : 'Delete Project'}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
