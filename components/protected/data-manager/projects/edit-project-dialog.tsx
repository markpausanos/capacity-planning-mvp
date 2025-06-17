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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { updateProject } from '@/actions/projects';
import { getClients } from '@/actions/clients';
import { Client } from '@/types/client';
import { Project } from '@/types/project';

const projectSchema = z
	.object({
		name: z.string().min(1, 'Project name is required'),
		client_id: z.string().min(1, 'Client is required'),
		billing_model: z.enum(['flat', 'hourly'], {
			required_error: 'Billing model is required',
		}),
		flat_fee: z
			.number()
			.min(0, 'Flat fee must be a positive number')
			.optional()
			.nullable(),
	})
	.refine(
		(data) => {
			if (
				data.billing_model === 'flat' &&
				(!data.flat_fee || data.flat_fee <= 0)
			) {
				return false;
			}
			return true;
		},
		{
			message: 'Flat fee is required for flat billing model',
			path: ['flat_fee'],
		}
	);

type ProjectFormData = z.infer<typeof projectSchema>;

interface EditProjectDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onProjectUpdated: () => void;
	project: Project | null;
}

export default function EditProjectDialog({
	open,
	onOpenChange,
	onProjectUpdated,
	project,
}: EditProjectDialogProps) {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [clients, setClients] = useState<Client[]>([]);
	const [isLoadingClients, setIsLoadingClients] = useState(false);

	const form = useForm<ProjectFormData>({
		resolver: zodResolver(projectSchema),
		defaultValues: {
			name: '',
			client_id: '',
			billing_model: 'hourly',
			flat_fee: null,
		},
	});

	const billingModel = form.watch('billing_model');

	// Update form values when project changes
	useEffect(() => {
		if (project) {
			form.reset({
				name: project.name,
				client_id: project.client_id,
				billing_model: project.billing_model,
				flat_fee: project.flat_fee,
			});
		}
	}, [project, form]);

	useEffect(() => {
		const fetchClients = async () => {
			try {
				setIsLoadingClients(true);
				const { clients: data } = await getClients();
				setClients(data);
			} catch (error) {
				console.error('Error fetching clients:', error);
			} finally {
				setIsLoadingClients(false);
			}
		};

		if (open) {
			fetchClients();
		}
	}, [open]);

	const onSubmit = async (data: ProjectFormData) => {
		if (!project) return;

		try {
			setIsSubmitting(true);
			await updateProject({
				id: project.id,
				...data,
				flat_fee: data.billing_model === 'flat' ? data.flat_fee : null,
			});
			onProjectUpdated();
		} catch (error) {
			console.error('Error updating project:', error);
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
						Edit Project
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
										Project Name <span className="text-red-500">*</span>
									</FormLabel>
									<FormControl>
										<Input placeholder="Enter project name" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="client_id"
							render={({ field }) => (
								<FormItem>
									<FormLabel>
										Client <span className="text-red-500">*</span>
									</FormLabel>
									<Select onValueChange={field.onChange} value={field.value}>
										<FormControl>
											<SelectTrigger className="w-full">
												<SelectValue placeholder="Select a client" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											{isLoadingClients ? (
												<SelectItem value="loading" disabled>
													Loading clients...
												</SelectItem>
											) : clients.length === 0 ? (
												<SelectItem value="no-clients" disabled>
													No clients available
												</SelectItem>
											) : (
												clients.map((client) => (
													<SelectItem key={client.id} value={client.id}>
														{client.name}
													</SelectItem>
												))
											)}
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="billing_model"
							render={({ field }) => (
								<FormItem>
									<FormLabel>
										Billing Model <span className="text-red-500">*</span>
									</FormLabel>
									<Select onValueChange={field.onChange} value={field.value}>
										<FormControl>
											<SelectTrigger className="w-full">
												<SelectValue placeholder="Select billing model" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											<SelectItem value="hourly">Hourly</SelectItem>
											<SelectItem value="flat">Flat Fee</SelectItem>
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>

						{billingModel === 'flat' && (
							<FormField
								control={form.control}
								name="flat_fee"
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											Flat Fee ($) <span className="text-red-500">*</span>
										</FormLabel>
										<FormControl>
											<Input
												type="number"
												step="0.01"
												placeholder="50000"
												{...field}
												value={field.value || ''}
												onChange={(e) =>
													field.onChange(parseFloat(e.target.value) || null)
												}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						)}

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
								{isSubmitting ? 'Updating...' : 'Update Project'}
							</Button>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
