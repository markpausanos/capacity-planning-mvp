import { ReactNode, Suspense } from 'react';
import { NavigationTabs } from '@/components/protected/navigation-tabs';
import AppFooter from '@/components/protected/app-footer';
import { redirect } from 'next/navigation';
import { currentUser } from '@clerk/nextjs/server';

interface ProtectedLayoutProps {
	children: ReactNode;
}

export default async function ProtectedLayout({
	children,
}: ProtectedLayoutProps) {
	try {
		const user = await currentUser();
		if (!user) {
			redirect('/login');
		}
	} catch {
		redirect('/login');
	}

	return (
		<div className="min-h-screen flex flex-col bg-gray-50">
			{/* Header with Navigation Tabs */}
			<header className="bg-white border-b">
				<div className="px-6 py-4">
					<NavigationTabs />
				</div>
			</header>

			{/* Main Content */}
			<main className="flex-1 p-4">{children}</main>

			{/* Footer */}
			<Suspense
				fallback={
					<footer className="border-t bg-white px-6 py-4">
						<p className="text-sm text-gray-600">Loading...</p>
					</footer>
				}
			>
				<AppFooter />
			</Suspense>
		</div>
	);
}
