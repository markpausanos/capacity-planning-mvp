'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface DataManagerLayoutProps {
	children: ReactNode;
}

const tabs = [
	{ label: 'Consultants', href: '/data-manager/consultants' },
	{ label: 'Clients & Projects', href: '/data-manager/clients-and-projects' },
	{ label: 'Allocations', href: '/data-manager/allocations' },
];

export default function DataManagerLayout({
	children,
}: DataManagerLayoutProps) {
	const pathname = usePathname();

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold tracking-tight">Data Manager</h1>
			</div>

			<div className="space-y-4">
				<div className="h-auto bg-transparent p-0 border-b border-gray-200">
					<div className="flex">
						{tabs.map((tab) => {
							const isActive = pathname.startsWith(tab.href);

							return (
								<Link
									key={tab.href}
									href={tab.href}
									className={cn(
										'relative h-auto bg-transparent px-4 py-3 text-sm font-medium rounded-none border-b-2 border-transparent transition-colors',
										isActive
											? 'text-blue-600 border-b-blue-600'
											: 'text-gray-500 hover:text-gray-900'
									)}
								>
									{tab.label}
								</Link>
							);
						})}
					</div>
				</div>

				<div className="space-y-4">{children}</div>
			</div>
		</div>
	);
}
