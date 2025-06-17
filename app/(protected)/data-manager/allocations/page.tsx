'use client';

import { useState, useEffect } from 'react';
import { useReactTable, getCoreRowModel } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import DataTable from '@/components/custom/data-table';
import { getAllocations } from '@/actions/allocations';
import { Allocation } from '@/types/allocation';
import allocationColumn from '@/components/protected/data-manager/allocations/allocations-column';
import AddAllocationDialog from '@/components/protected/data-manager/allocations/add-allocation-dialog';
import EditAllocationDialog from '@/components/protected/data-manager/allocations/edit-allocation-dialog';
import DeleteAllocationDialog from '@/components/protected/data-manager/allocations/delete-allocation-dialog';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

export default function Page() {
	const [allocations, setAllocations] = useState<Allocation[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Dialog states
	const [showAddDialog, setShowAddDialog] = useState(false);
	const [showEditDialog, setShowEditDialog] = useState(false);
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);
	const [selectedAllocation, setSelectedAllocation] =
		useState<Allocation | null>(null);

	const loadAllocations = async () => {
		try {
			setLoading(true);
			setError(null);
			const data = await getAllocations();
			setAllocations(data);
		} catch (err) {
			const errorMessage =
				err instanceof Error ? err.message : 'Failed to load allocations';
			setError(errorMessage);
			toast.error(errorMessage);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadAllocations();
	}, []);

	const handleEditAllocation = (allocation: Allocation) => {
		setSelectedAllocation(allocation);
		setShowEditDialog(true);
	};

	const handleDeleteAllocation = (allocation: Allocation) => {
		setSelectedAllocation(allocation);
		setShowDeleteDialog(true);
	};

	const handleAllocationAdded = () => {
		loadAllocations();
	};

	const handleAllocationUpdated = () => {
		loadAllocations();
	};

	const handleAllocationDeleted = () => {
		loadAllocations();
	};

	const columns = allocationColumn({
		onEditAllocation: handleEditAllocation,
		onDeleteAllocation: handleDeleteAllocation,
	});

	const table = useReactTable<Allocation>({
		data: allocations,
		columns,
		getCoreRowModel: getCoreRowModel(),
	});

	return (
		<div className="flex flex-col gap-4 p-4">
			<div className="flex items-center justify-between">
				<h2 className="text-lg font-semibold">Allocations</h2>
				<Button
					onClick={() => setShowAddDialog(true)}
					className="flex items-center gap-2"
				>
					<Plus className="h-4 w-4" />
					Add Allocation
				</Button>
			</div>

			<DataTable
				table={table}
				columns={columns}
				isLoading={loading}
				isError={!!error}
			/>

			{/* Dialogs */}
			<AddAllocationDialog
				open={showAddDialog}
				onOpenChange={setShowAddDialog}
				onAllocationAdded={handleAllocationAdded}
			/>

			<EditAllocationDialog
				open={showEditDialog}
				onOpenChange={setShowEditDialog}
				allocation={selectedAllocation}
				onAllocationUpdated={handleAllocationUpdated}
			/>

			<DeleteAllocationDialog
				open={showDeleteDialog}
				onOpenChange={setShowDeleteDialog}
				allocation={selectedAllocation}
				onAllocationDeleted={handleAllocationDeleted}
			/>
		</div>
	);
}
