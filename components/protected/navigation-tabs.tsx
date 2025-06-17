'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { logout } from '@/actions/auth';
import { toast } from 'sonner';
import { LogOut } from 'lucide-react';
import { Button } from '../ui/button';

const tabs = [
	{ label: 'Dashboard', href: '/dashboard' },
	{ label: 'Data Manager', href: '/data-manager' },
];

export function NavigationTabs() {
	const pathname = usePathname();
	const router = useRouter();

	const handleLogout = async () => {
		try {
			await logout();
			toast.success('Logged out successfully');
			router.push('/login');
		} catch (error) {
			console.error('Logout error:', error);
			toast.error('Failed to logout. Please try again.');
		}
	};

	return (
		<nav className="flex items-center justify-between">
			<div className="flex space-x-1">
				{tabs.map((tab) => {
					const isActive = pathname.startsWith(tab.href);

					return (
						<Link
							key={tab.href}
							href={tab.href}
							className={cn(
								'px-4 py-2 text-sm font-medium rounded-md transition-colors',
								isActive
									? 'text-white bg-gray-900'
									: 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
							)}
						>
							{tab.label}
						</Link>
					);
				})}
			</div>

			<Button
				onClick={handleLogout}
				variant="outline"
				size="sm"
				className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors"
			>
				<LogOut size={16} />
				Logout
			</Button>
		</nav>
	);
}
