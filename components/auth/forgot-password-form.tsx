'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
} from '@/components/ui/form';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useState } from 'react';
import Image from 'next/image';
import { BeatLoader } from 'react-spinners';
import { resetPassword } from '@/actions/auth';
import Link from 'next/link';

const forgotPasswordSchema = z.object({
	email: z.string().email({ message: 'Invalid email address' }),
});

export default function ForgotPasswordForm() {
	const form = useForm<z.infer<typeof forgotPasswordSchema>>({
		resolver: zodResolver(forgotPasswordSchema),
		defaultValues: {
			email: '',
		},
	});

	const [isLoading, setIsLoading] = useState(false);

	const onSubmit = async (data: z.infer<typeof forgotPasswordSchema>) => {
		setIsLoading(true);
		try {
			await resetPassword(data.email);
			toast.success('Reset link sent! Check your email.');
		} catch (error) {
			if (error instanceof Error) {
				toast.error(error.message);
			} else {
				toast.error('An unknown error occurred');
			}
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="flex flex-col gap-6 w-full">
			{/* Title */}
			<h1 className="text-center text-3xl font-bold">Forgot Password</h1>

			{/* Form */}
			<Form {...form}>
				<form
					onSubmit={form.handleSubmit(onSubmit)}
					className="flex flex-col gap-4"
				>
					{/* Email Field */}
					<FormField
						control={form.control}
						name="email"
						render={({ field }) => (
							<FormItem>
								<FormLabel className="text-xs">Email</FormLabel>
								<FormControl>
									<Input
										placeholder="Enter your email"
										type="email"
										{...field}
									/>
								</FormControl>
							</FormItem>
						)}
					/>

					{/* Submit Button */}
					<Button disabled={isLoading} type="submit" className="w-full">
						{!isLoading && <p>Send Reset Link</p>}
						{isLoading && <BeatLoader size={8} color="white" />}
					</Button>
				</form>
			</Form>

			{/* Footer */}
			<div className="mt-4 text-center text-xs">
				<span className="text-muted-foreground">
					Remembered your password?{' '}
				</span>
				<Link href="/login" className="text-primary font-bold underline">
					Sign In
				</Link>
			</div>
		</div>
	);
}
