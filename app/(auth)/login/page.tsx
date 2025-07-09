import { SignIn } from '@clerk/nextjs';

export default function Page() {
	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50">
			<div className="max-w-md w-full space-y-8">
				<SignIn
					appearance={{
						elements: {
							formButtonPrimary: 'bg-blue-600 hover:bg-blue-700 text-sm',
							card: 'shadow-lg',
							headerTitle: 'text-2xl font-bold',
							socialButtonsBlockButton:
								'border border-gray-300 hover:bg-gray-50',
							dividerLine: 'bg-gray-300',
							dividerText: 'text-gray-500',
							formFieldLabel: 'text-sm font-medium text-gray-700',
							formFieldInput:
								'border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500',
							footerActionLink: 'text-blue-600 hover:text-blue-700 font-medium',
						},
					}}
					fallbackRedirectUrl="/dashboard"
					signUpUrl="/sign-up"
				/>
			</div>
		</div>
	);
}
