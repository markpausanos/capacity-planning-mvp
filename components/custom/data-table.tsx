'use client';

import { memo } from 'react';
import {
	Table as ReactTable,
	ColumnDef,
	flexRender,
} from '@tanstack/react-table';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

import { cn } from '@/lib/utils';
import { FileQuestion } from 'lucide-react';

interface DataTableProps<TData, TValue> {
	table: ReactTable<TData>;
	columns: ColumnDef<TData, TValue>[];
	isLoading: boolean;
	isError?: boolean;
	classNames?: {
		container?: string;
	};
}

function DataTable<TData, TValue>({
	table,
	columns,
	isLoading,
	isError,
	classNames,
}: DataTableProps<TData, TValue>) {
	const rows = table.getRowModel().rows;

	return (
		<div
			className={cn(
				'h-full w-full overflow-auto rounded-lg border',
				classNames?.container
			)}
		>
			<Table>
				<TableHeader className="bg-accent">
					{table.getHeaderGroups().map((headerGroup) => (
						<TableRow key={headerGroup.id}>
							{headerGroup.headers.map((header) => (
								<TableHead className="font-bold" key={header.id}>
									{header.isPlaceholder
										? null
										: flexRender(
												header.column.columnDef.header,
												header.getContext()
										  )}
								</TableHead>
							))}
						</TableRow>
					))}
				</TableHeader>
				<TableBody>
					{isError ? (
						<TableRow>
							<TableCell colSpan={columns.length}>
								<div className="pointer-events-none flex h-[calc(45vh-49px)] flex-col items-center justify-center gap-2">
									<div className="bg-muted rounded-full p-4">
										<FileQuestion size={48} className="text-destructive" />
									</div>
									<div className="text-destructive text-sm font-medium">
										Error fetching data
									</div>
								</div>
							</TableCell>
						</TableRow>
					) : isLoading ? (
						Array.from({ length: 10 }).map((_, rowIndex) => (
							<TableRow key={rowIndex}>
								{table.getVisibleFlatColumns().map((column, colIndex) => (
									<TableCell key={colIndex}>
										{!['select', 'actions'].includes(column.id) && (
											<Skeleton
												className={cn(
													'p-2',
													rowIndex % 2 === 0 ? 'w-full' : 'w-1/2'
												)}
											/>
										)}
									</TableCell>
								))}
							</TableRow>
						))
					) : rows.length > 0 ? (
						rows.map((row) => (
							<TableRow
								key={row.id}
								data-state={row.getIsSelected() && 'selected'}
								className="group"
							>
								{row.getVisibleCells().map((cell) => (
									<TableCell
										key={cell.id}
										className={cell.id.endsWith('_actions') ? 'py-0' : 'w-fit'}
									>
										{flexRender(cell.column.columnDef.cell, cell.getContext())}
									</TableCell>
								))}
							</TableRow>
						))
					) : (
						<TableRow>
							<TableCell colSpan={columns.length}>
								<div className="pointer-events-none flex h-[calc(45vh-49px)] flex-col items-center justify-center gap-2">
									<div className="bg-muted rounded-full p-4">
										<FileQuestion size={48} className="text-muted-foreground" />
									</div>
									<div>Nothing to see here</div>
								</div>
							</TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>
		</div>
	);
}

export default memo(DataTable) as typeof DataTable;
