'use client';

import { useState, useEffect } from 'react';
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
import { updateClient } from '@/actions/clients';
import { Client } from '@/types/client';

const clientSchema = z.object({
	name: z.string().min(1, 'Client name is required'),
});

type ClientFormData = z.infer<typeof clientSchema>;

interface EditClientDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onClientUpdated: () => void;
	client: Client | null;
}

export default function EditClientDialog({
	open,
	onOpenChange,
	onClientUpdated,
	client,
}: EditClientDialogProps) {
	const [isSubmitting, setIsSubmitting] = useState(false);

	const form = useForm<ClientFormData>({
		resolver: zodResolver(clientSchema),
		defaultValues: {
			name: '',
		},
	});

	// Update form values when client changes
	useEffect(() => {
		if (client) {
			form.reset({
				name: client.name,
			});
		}
	}, [client, form]);

	const onSubmit = async (data: ClientFormData) => {
		if (!client) return;

		try {
			setIsSubmitting(true);
			await updateClient({
				id: client.id,
				...data,
			});
			onClientUpdated();
		} catch (error) {
			console.error('Error updating client:', error);
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
					Edit Client
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
								{isSubmitting ? 'Updating...' : 'Update Client'}
							</Button>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
