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
import { createAllocation } from '@/actions/allocations';
import { getConsultants } from '@/actions/consultants';
import { getProjects } from '@/actions/projects';
import { Consultant } from '@/types/consultant';
import { Project } from '@/types/project';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';

const addAllocationSchema = z
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

type AddAllocationFormData = z.infer<typeof addAllocationSchema>;

type Props = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onAllocationAdded: () => void;
};

export default function AddAllocationDialog({
	open,
	onOpenChange,
	onAllocationAdded,
}: Props) {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [consultants, setConsultants] = useState<Consultant[]>([]);
	const [projects, setProjects] = useState<Project[]>([]);
	const [loadingConsultants, setLoadingConsultants] = useState(false);
	const [loadingProjects, setLoadingProjects] = useState(false);

	const form = useForm<AddAllocationFormData>({
		resolver: zodResolver(addAllocationSchema),
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

	const loadConsultants = async () => {
		try {
			setLoadingConsultants(true);
			const data = await getConsultants();
			setConsultants(data.consultants);
		} catch {
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
		} catch {
			toast.error('Failed to load projects');
		} finally {
			setLoadingProjects(false);
		}
	};

	const onSubmit = async (data: AddAllocationFormData) => {
		try {
			setIsSubmitting(true);
			await createAllocation(data);
			form.reset();
			onAllocationAdded();
			onOpenChange(false);
			toast.success('Allocation added successfully');
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : 'Failed to add allocation'
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Add Allocation</DialogTitle>
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
											<SelectTrigger
												className="w-full"
												data-testid="consultant-select"
											>
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
											<SelectTrigger
												className="w-full"
												data-testid="project-select"
											>
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
								{isSubmitting ? 'Adding...' : 'Add Allocation'}
							</Button>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
