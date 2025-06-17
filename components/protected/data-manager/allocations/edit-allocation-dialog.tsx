'use client';

import { useState, useEffect } from 'react';
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { updateAllocation } from '@/actions/allocations';
import { getConsultants } from '@/actions/consultants';
import { getProjects } from '@/actions/projects';
import { Allocation } from '@/types/allocation';
import { Consultant } from '@/types/consultant';
import { Project } from '@/types/project';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';

const editAllocationSchema = z
	.object({
		consultant_id: z.string().min(1, 'Please select a consultant'),
		project_id: z.string().min(1, 'Please select a project'),
		start_date: z.string().min(1, 'Start date is required'),
		end_date: z.string().min(1, 'End date is required'),
		hours_per_week: z.number().min(1, 'Hours per week must be at least 1'),
	})
	.refine(
		(data) => {
			const startDate = new Date(data.start_date);
			const endDate = new Date(data.end_date);
			return startDate <= endDate;
		},
		{
			message: 'Start date must be before or equal to end date',
			path: ['end_date'],
		}
	);

type EditAllocationFormData = z.infer<typeof editAllocationSchema>;

type Props = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	allocation: Allocation | null;
	onAllocationUpdated: () => void;
};

export default function EditAllocationDialog({
	open,
	onOpenChange,
	allocation,
	onAllocationUpdated,
}: Props) {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [consultants, setConsultants] = useState<Consultant[]>([]);
	const [projects, setProjects] = useState<Project[]>([]);
	const [loadingConsultants, setLoadingConsultants] = useState(false);
	const [loadingProjects, setLoadingProjects] = useState(false);

	const form = useForm<EditAllocationFormData>({
		resolver: zodResolver(editAllocationSchema),
		defaultValues: {
			consultant_id: '',
			project_id: '',
			start_date: '',
			end_date: '',
			hours_per_week: 40,
		},
	});

	// Load consultants and projects when dialog opens
	useEffect(() => {
		if (open) {
			loadConsultants();
			loadProjects();
		}
	}, [open]);

	// Populate form when allocation changes
	useEffect(() => {
		if (allocation) {
			form.reset({
				consultant_id: allocation.consultant_id,
				project_id: allocation.project_id,
				start_date: allocation.start_date,
				end_date: allocation.end_date,
				hours_per_week: allocation.hours_per_week,
			});
		}
	}, [allocation, form]);

	const loadConsultants = async () => {
		try {
			setLoadingConsultants(true);
			const data = await getConsultants();
			setConsultants(data.consultants);
		} catch (error) {
			toast.error('Failed to load consultants');
		} finally {
			setLoadingConsultants(false);
		}
	};

	const loadProjects = async () => {
		try {
			setLoadingProjects(true);
			const data = await getProjects();
			setProjects(data.projects);
		} catch (error) {
			toast.error('Failed to load projects');
		} finally {
			setLoadingProjects(false);
		}
	};

	const onSubmit = async (data: EditAllocationFormData) => {
		if (!allocation) return;

		try {
			setIsSubmitting(true);
			await updateAllocation(allocation.id, data);
			onAllocationUpdated();
			onOpenChange(false);
			toast.success('Allocation updated successfully');
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : 'Failed to update allocation'
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	if (!allocation) return null;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Edit Allocation</DialogTitle>
				</DialogHeader>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name="consultant_id"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Consultant</FormLabel>
									<Select
										onValueChange={field.onChange}
										value={field.value}
										disabled={loadingConsultants}
									>
										<FormControl>
											<SelectTrigger className="w-full">
												<SelectValue placeholder="Select consultant" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											{consultants &&
												consultants.map((consultant) => (
													<SelectItem key={consultant.id} value={consultant.id}>
														{consultant.name}
													</SelectItem>
												))}
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="project_id"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Project</FormLabel>
									<Select
										onValueChange={field.onChange}
										value={field.value}
										disabled={loadingProjects}
									>
										<FormControl>
											<SelectTrigger className="w-full">
												<SelectValue placeholder="Select project" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											{projects &&
												projects.map((project) => (
													<SelectItem key={project.id} value={project.id}>
														{project.name} ({project.client_name})
													</SelectItem>
												))}
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="start_date"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Start Date</FormLabel>
									<FormControl>
										<Input type="date" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="end_date"
							render={({ field }) => (
								<FormItem>
									<FormLabel>End Date</FormLabel>
									<FormControl>
										<Input type="date" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="hours_per_week"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Hours/Week</FormLabel>
									<FormControl>
										<Input
											type="number"
											min="1"
											max="168"
											placeholder="40"
											{...field}
											value={field.value || ''}
											onChange={(e) =>
												field.onChange(parseInt(e.target.value) || null)
											}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className="flex justify-end gap-2 pt-4">
							<Button
								type="button"
								variant="outline"
								onClick={() => onOpenChange(false)}
								disabled={isSubmitting}
							>
								Cancel
							</Button>
							<Button type="submit" disabled={isSubmitting}>
								{isSubmitting ? 'Updating...' : 'Update Allocation'}
							</Button>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
