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
import { createConsultant } from '@/actions/consultants';
import { X } from 'lucide-react';

const consultantSchema = z.object({
	name: z.string().min(1, 'Name is required'),
	cost_per_hour: z.number().min(0, 'Cost per hour must be a positive number'),
	bill_rate: z.number().min(0, 'Bill rate must be a positive number'),
	capacity_hours_per_week: z
		.number()
		.min(1, 'Capacity hours must be at least 1'),
});

type ConsultantFormData = z.infer<typeof consultantSchema>;

interface AddConsultantDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onConsultantAdded: () => void;
}

export default function AddConsultantDialog({
	open,
	onOpenChange,
	onConsultantAdded,
}: AddConsultantDialogProps) {
	const [isSubmitting, setIsSubmitting] = useState(false);

	const form = useForm<ConsultantFormData>({
		resolver: zodResolver(consultantSchema),
		defaultValues: {
			name: '',
			cost_per_hour: 0,
			bill_rate: 0,
			capacity_hours_per_week: 40,
		},
	});

	const onSubmit = async (data: ConsultantFormData) => {
		try {
			setIsSubmitting(true);
			await createConsultant(data);
			form.reset();
			onConsultantAdded();
		} catch (error) {
			console.error('Error creating consultant:', error);
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
						Add Consultant
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
										<Input placeholder="Enter consultant name" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="cost_per_hour"
							render={({ field }) => (
								<FormItem>
									<FormLabel>
										Cost/hr ($) <span className="text-red-500">*</span>
									</FormLabel>
									<FormControl>
										<Input
											type="number"
											step="0.01"
											placeholder="75"
											{...field}
											onChange={(e) =>
												field.onChange(parseFloat(e.target.value) || 0)
											}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="bill_rate"
							render={({ field }) => (
								<FormItem>
									<FormLabel>
										Bill Rate/hr ($) <span className="text-red-500">*</span>
									</FormLabel>
									<FormControl>
										<Input
											type="number"
											step="0.01"
											placeholder="150"
											{...field}
											onChange={(e) =>
												field.onChange(parseFloat(e.target.value) || 0)
											}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="capacity_hours_per_week"
							render={({ field }) => (
								<FormItem>
									<FormLabel>
										Capacity hrs/wk <span className="text-red-500">*</span>
									</FormLabel>
									<FormControl>
										<Input
											type="number"
											placeholder="40"
											{...field}
											onChange={(e) =>
												field.onChange(parseInt(e.target.value) || 0)
											}
										/>
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
								{isSubmitting ? 'Adding...' : 'Add Consultant'}
							</Button>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
