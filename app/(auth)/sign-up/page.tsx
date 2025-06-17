'use client';

import SignUpForm from '@/components/auth/sign-up-form';
import Image from 'next/image';

export default function Page() {
	return (
		<main className="flex h-screen w-full">
			<div className="z-100 w-full md:w-1/2 flex items-center justify-center bg-background px-6 py-8 md:px-16">
				<div className="w-full max-w-sm">
					<SignUpForm />
				</div>
			</div>

			<div className="relative hidden md:block md:w-1/2 h-screen">
				<Image
					src="/auth/sign-up-bg.jpg"
					alt="Sign Up Background"
					fill
					className="object-cover object-center blur-lg"
					priority
				/>
			</div>
		</main>
	);
}
