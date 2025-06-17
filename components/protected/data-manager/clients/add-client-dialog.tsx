'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { createProjectClient } from '@/actions/clients';
import { X } from 'lucide-react';

const clientSchema = z.object({
	name: z.string().min(1, 'Client name is required'),
});

type ClientFormData = z.infer<typeof clientSchema>;

interface AddClientDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onClientAdded: () => void;
}

export default function AddClientDialog({
	open,
	onOpenChange,
	onClientAdded,
}: AddClientDialogProps) {
	const [isSubmitting, setIsSubmitting] = useState(false);

	const form = useForm<ClientFormData>({
		resolver: zodResolver(clientSchema),
		defaultValues: {
			name: '',
		},
	});

	const onSubmit = async (data: ClientFormData) => {
		try {
			setIsSubmitting(true);
			await createProjectClient(data);
			form.reset();
			onClientAdded();
		} catch (error) {
			console.error('Error creating client:', error);
			// TODO: Add proper error handling/toast notification
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleCancel = () => {
		form.reset();
		onOpenChange(false);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-md">
				<DialogHeader className="flex flex-row items-center justify-between">
					<DialogTitle className="text-xl font-semibold">
						Add Client
					</DialogTitle>
				</DialogHeader>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>
										Name <span className="text-red-500">*</span>
									</FormLabel>
									<FormControl>
										<Input placeholder="Enter client name" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className="flex justify-end gap-3 pt-4">
							<Button
								type="button"
								variant="outline"
								onClick={handleCancel}
								disabled={isSubmitting}
							>
								Cancel
							</Button>
							<Button type="submit" disabled={isSubmitting}>
								{isSubmitting ? 'Adding...' : 'Add Client'}
							</Button>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
