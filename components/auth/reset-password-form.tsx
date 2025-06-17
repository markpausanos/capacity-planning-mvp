'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import Image from 'next/image';
import { BeatLoader } from 'react-spinners';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
} from '@/components/ui/form';
import { updatePassword } from '@/actions/auth';

const resetSchema = z
	.object({
		password: z.string().min(8, { message: 'At least 8 characters' }),
		confirm: z.string().min(8, { message: 'At least 8 characters' }),
	})
	.refine((data) => data.password === data.confirm, {
		path: ['confirm'],
		message: 'Passwords must match',
	});

type ResetForm = z.infer<typeof resetSchema>;

export default function ResetPasswordForm() {
	const router = useRouter();

	const form = useForm<ResetForm>({
		resolver: zodResolver(resetSchema),
		defaultValues: { password: '', confirm: '' },
	});

	const [isLoading, setIsLoading] = useState(false);

	const onSubmit = async (data: ResetForm) => {
		setIsLoading(true);
		try {
			await updatePassword(data.password);
			toast.success('Password reset! You can now sign in.');
			router.push('/login');
		} catch (err) {
			toast.error(err instanceof Error ? err.message : 'Reset failed');
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="flex flex-col gap-6 w-full max-w-md mx-auto py-16">
			{/* Title */}
			<h1 className="text-center text-3xl font-bold">Reset Password</h1>

			{/* Form */}
			<Form {...form}>
				<form
					onSubmit={form.handleSubmit(onSubmit)}
					className="flex flex-col gap-4"
				>
					{/* New Password */}
					<FormField
						control={form.control}
						name="password"
						render={({ field }) => (
							<FormItem>
								<FormLabel className="text-xs">New Password</FormLabel>
								<FormControl>
									<Input
										type="password"
										placeholder="Enter new password"
										{...field}
									/>
								</FormControl>
							</FormItem>
						)}
					/>

					{/* Confirm Password */}
					<FormField
						control={form.control}
						name="confirm"
						render={({ field }) => (
							<FormItem>
								<FormLabel className="text-xs">Confirm Password</FormLabel>
								<FormControl>
									<Input
										type="password"
										placeholder="Repeat your password"
										{...field}
									/>
								</FormControl>
							</FormItem>
						)}
					/>

					{/* Submit */}
					<Button disabled={isLoading} type="submit" className="w-full">
						{isLoading ? (
							<BeatLoader size={8} color="white" />
						) : (
							'Set New Password'
						)}
					</Button>
				</form>
			</Form>
		</div>
	);
}
