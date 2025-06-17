'use client';

import { useState, useEffect } from 'react';
import { useReactTable, getCoreRowModel } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import DataTable from '@/components/custom/data-table';
import clientColumn from '@/components/protected/data-manager/clients/clients-column';
import projectColumn from '@/components/protected/data-manager/projects/projects-column';
import AddClientDialog from '@/components/protected/data-manager/clients/add-client-dialog';
import EditClientDialog from '@/components/protected/data-manager/clients/edit-client-dialog';
import DeleteClientDialog from '@/components/protected/data-manager/clients/delete-client-dialog';
import AddProjectDialog from '@/components/protected/data-manager/projects/add-project-dialog';
import EditProjectDialog from '@/components/protected/data-manager/projects/edit-project-dialog';
import DeleteProjectDialog from '@/components/protected/data-manager/projects/delete-project-dialog';
import { getClients } from '@/actions/clients';
import { getProjects } from '@/actions/projects';
import { Client } from '@/types/client';
import { Project } from '@/types/project';
import { Plus } from 'lucide-react';

export default function ClientsAndProjectsPage() {
	// Clients state
	const [clients, setClients] = useState<Client[]>([]);
	const [isClientsLoading, setIsClientsLoading] = useState(true);
	const [isClientsError, setIsClientsError] = useState(false);

	// Projects state
	const [projects, setProjects] = useState<Project[]>([]);
	const [isProjectsLoading, setIsProjectsLoading] = useState(true);
	const [isProjectsError, setIsProjectsError] = useState(false);

	// Modal states
	const [isAddClientDialogOpen, setIsAddClientDialogOpen] = useState(false);
	const [isEditClientDialogOpen, setIsEditClientDialogOpen] = useState(false);
	const [isDeleteClientDialogOpen, setIsDeleteClientDialogOpen] =
		useState(false);
	const [selectedClient, setSelectedClient] = useState<Client | null>(null);

	const [isAddProjectDialogOpen, setIsAddProjectDialogOpen] = useState(false);
	const [isEditProjectDialogOpen, setIsEditProjectDialogOpen] = useState(false);
	const [isDeleteProjectDialogOpen, setIsDeleteProjectDialogOpen] =
		useState(false);
	const [selectedProject, setSelectedProject] = useState<Project | null>(null);

	// Client handlers
	const handleEditClient = (client: Client) => {
		setSelectedClient(client);
		setIsEditClientDialogOpen(true);
	};

	const handleDeleteClient = (client: Client) => {
		setSelectedClient(client);
		setIsDeleteClientDialogOpen(true);
	};

	const handleAddClient = () => {
		setIsAddClientDialogOpen(true);
	};

	// Project handlers
	const handleEditProject = (project: Project) => {
		setSelectedProject(project);
		setIsEditProjectDialogOpen(true);
	};

	const handleDeleteProject = (project: Project) => {
		setSelectedProject(project);
		setIsDeleteProjectDialogOpen(true);
	};

	const handleAddProject = () => {
		setIsAddProjectDialogOpen(true);
	};

	// Data refresh handlers
	const handleClientAdded = () => {
		fetchClients();
		setIsAddClientDialogOpen(false);
	};

	const handleClientUpdated = () => {
		fetchClients();
		setIsEditClientDialogOpen(false);
		setSelectedClient(null);
	};

	const handleClientDeleted = () => {
		fetchClients();
		fetchProjects(); // Refresh projects too since they might be affected
		setIsDeleteClientDialogOpen(false);
		setSelectedClient(null);
	};

	const handleProjectAdded = () => {
		fetchProjects();
		setIsAddProjectDialogOpen(false);
	};

	const handleProjectUpdated = () => {
		fetchProjects();
		setIsEditProjectDialogOpen(false);
		setSelectedProject(null);
	};

	const handleProjectDeleted = () => {
		fetchProjects();
		setIsDeleteProjectDialogOpen(false);
		setSelectedProject(null);
	};

	// Column definitions
	const clientColumns = clientColumn({
		onEditClient: handleEditClient,
		onDeleteClient: handleDeleteClient,
	});

	const projectColumns = projectColumn({
		onEditProject: handleEditProject,
		onDeleteProject: handleDeleteProject,
	});

	// Table instances
	const clientsTable = useReactTable({
		data: clients,
		columns: clientColumns,
		getCoreRowModel: getCoreRowModel(),
	});

	const projectsTable = useReactTable({
		data: projects,
		columns: projectColumns,
		getCoreRowModel: getCoreRowModel(),
	});

	// Data fetching functions
	const fetchClients = async () => {
		try {
			setIsClientsLoading(true);
			setIsClientsError(false);
			const { clients: data } = await getClients();
			setClients(data);
		} catch (error) {
			console.error('Error fetching clients:', error);
			setIsClientsError(true);
		} finally {
			setIsClientsLoading(false);
		}
	};

	const fetchProjects = async () => {
		try {
			setIsProjectsLoading(true);
			setIsProjectsError(false);
			const { projects: data } = await getProjects();
			setProjects(data);
		} catch (error) {
			console.error('Error fetching projects:', error);
			setIsProjectsError(true);
		} finally {
			setIsProjectsLoading(false);
		}
	};

	useEffect(() => {
		fetchClients();
		fetchProjects();
	}, []);

	return (
		<div className="flex flex-col gap-6 p-4">
			{/* Two-column layout for tablets and up, single column for mobile */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				{/* Clients Section */}
				<div className="space-y-4">
					<div className="flex items-center justify-between">
						<h2 className="text-lg font-semibold">Clients</h2>
						<Button
							onClick={handleAddClient}
							className="flex items-center gap-2"
						>
							<Plus className="h-4 w-4" />
							Add Client
						</Button>
					</div>

					<DataTable
						table={clientsTable}
						columns={clientColumns}
						isLoading={isClientsLoading}
						isError={isClientsError}
					/>
				</div>

				{/* Projects Section */}
				<div className="space-y-4">
					<div className="flex items-center justify-between">
						<h2 className="text-lg font-semibold">Projects</h2>
						<Button
							onClick={handleAddProject}
							className="flex items-center gap-2"
						>
							<Plus className="h-4 w-4" />
							Add Project
						</Button>
					</div>

					<DataTable
						table={projectsTable}
						columns={projectColumns}
						isLoading={isProjectsLoading}
						isError={isProjectsError}
					/>
				</div>
			</div>

			{/* Client Modals */}
			<AddClientDialog
				open={isAddClientDialogOpen}
				onOpenChange={setIsAddClientDialogOpen}
				onClientAdded={handleClientAdded}
			/>

			<EditClientDialog
				open={isEditClientDialogOpen}
				onOpenChange={setIsEditClientDialogOpen}
				onClientUpdated={handleClientUpdated}
				client={selectedClient}
			/>

			<DeleteClientDialog
				open={isDeleteClientDialogOpen}
				onOpenChange={setIsDeleteClientDialogOpen}
				onClientDeleted={handleClientDeleted}
				client={selectedClient}
			/>

			{/* Project Modals */}
			<AddProjectDialog
				open={isAddProjectDialogOpen}
				onOpenChange={setIsAddProjectDialogOpen}
				onProjectAdded={handleProjectAdded}
			/>

			<EditProjectDialog
				open={isEditProjectDialogOpen}
				onOpenChange={setIsEditProjectDialogOpen}
				onProjectUpdated={handleProjectUpdated}
				project={selectedProject}
			/>

			<DeleteProjectDialog
				open={isDeleteProjectDialogOpen}
				onOpenChange={setIsDeleteProjectDialogOpen}
				onProjectDeleted={handleProjectDeleted}
				project={selectedProject}
			/>
		</div>
	);
}
