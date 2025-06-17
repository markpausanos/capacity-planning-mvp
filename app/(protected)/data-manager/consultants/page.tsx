'use client';

import { useState, useEffect } from 'react';
import { useReactTable, getCoreRowModel } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import DataTable from '@/components/custom/data-table';
import consultantColumn from '@/components/protected/data-manager/consultants/consultants-column';
import AddConsultantDialog from '@/components/protected/data-manager/consultants/add-consultant-dialog';
import EditConsultantDialog from '@/components/protected/data-manager/consultants/edit-consultant-dialog';
import DeleteConsultantDialog from '@/components/protected/data-manager/consultants/delete-consultant-dialog';
import { getConsultants } from '@/actions/consultants';
import { Consultant } from '@/types/consultant';
import { Plus } from 'lucide-react';

export default function ConsultantsPage() {
	const [consultants, setConsultants] = useState<Consultant[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isError, setIsError] = useState(false);
	const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [selectedConsultant, setSelectedConsultant] =
		useState<Consultant | null>(null);

	const handleEditConsultant = (consultant: Consultant) => {
		setSelectedConsultant(consultant);
		setIsEditDialogOpen(true);
	};

	const handleDeleteConsultant = (consultant: Consultant) => {
		setSelectedConsultant(consultant);
		setIsDeleteDialogOpen(true);
	};

	const handleAddConsultant = () => {
		setIsAddDialogOpen(true);
	};

	const handleConsultantAdded = () => {
		// Refresh the consultants list after adding
		fetchConsultants();
		setIsAddDialogOpen(false);
	};

	const handleConsultantUpdated = () => {
		// Refresh the consultants list after updating
		fetchConsultants();
		setIsEditDialogOpen(false);
		setSelectedConsultant(null);
	};

	const handleConsultantDeleted = () => {
		// Refresh the consultants list after deleting
		fetchConsultants();
		setIsDeleteDialogOpen(false);
		setSelectedConsultant(null);
	};

	const columns = consultantColumn({
		onEditConsultant: handleEditConsultant,
		onDeleteConsultant: handleDeleteConsultant,
	});

	const table = useReactTable({
		data: consultants,
		columns,
		getCoreRowModel: getCoreRowModel(),
	});

	const fetchConsultants = async () => {
		try {
			setIsLoading(true);
			setIsError(false);
			const { consultants: data } = await getConsultants();
			setConsultants(data);
		} catch (error) {
			console.error('Error fetching consultants:', error);
			setIsError(true);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchConsultants();
	}, []);

	return (
		<div className="flex flex-col gap-4 p-4">
			<div className="flex items-center justify-between">
				<h2 className="text-lg font-semibold">Consultants</h2>
				<Button
					onClick={handleAddConsultant}
					className="flex items-center gap-2"
				>
					<Plus className="h-4 w-4" />
					Add Consultant
				</Button>
			</div>

			<DataTable
				table={table}
				columns={columns}
				isLoading={isLoading}
				isError={isError}
			/>

			<AddConsultantDialog
				open={isAddDialogOpen}
				onOpenChange={setIsAddDialogOpen}
				onConsultantAdded={handleConsultantAdded}
			/>

			<EditConsultantDialog
				open={isEditDialogOpen}
				onOpenChange={setIsEditDialogOpen}
				onConsultantUpdated={handleConsultantUpdated}
				consultant={selectedConsultant}
			/>

			<DeleteConsultantDialog
				open={isDeleteDialogOpen}
				onOpenChange={setIsDeleteDialogOpen}
				onConsultantDeleted={handleConsultantDeleted}
				consultant={selectedConsultant}
			/>
		</div>
	);
}
