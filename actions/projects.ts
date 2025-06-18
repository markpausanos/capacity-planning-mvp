'use server';

import {
	Project,
	CreateProjectRequest,
	UpdateProjectRequest,
} from '@/types/project';
import createClient from '@/utils/supabase/server';
import { getUser } from './auth';

export async function getProjects(): Promise<{ projects: Project[] }> {
	const supabase = await createClient();
	const { user } = await getUser();

	if (!user) {
		throw new Error('Unauthorized: User not authenticated');
	}

	const { data, error } = await supabase
		.from('projects')
		.select(
			`
      *,
      clients (
        name
      )
    `
		)
		.eq('user_id', user.id)
		.order('created_at', { ascending: false });

	if (error) {
		throw error;
	}

	// Transform the data to include client_name
	const projects =
		data?.map((project) => ({
			...project,
			client_name: project.clients?.name || 'Unknown Client',
		})) || [];

	return { projects };
}

export async function getProject(id: string): Promise<{ project: Project }> {
	const supabase = await createClient();
	const { user } = await getUser();

	if (!user) {
		throw new Error('Unauthorized: User not authenticated');
	}

	const { data, error } = await supabase
		.from('projects')
		.select(
			`
      *,
      clients (
        name
      )
    `
		)
		.eq('id', id)
		.eq('user_id', user.id)
		.single();

	if (error) {
		throw error;
	}

	const project = {
		...data,
		client_name: data.clients?.name || 'Unknown Client',
	};

	return { project };
}

export async function createProject(
	project: CreateProjectRequest
): Promise<{ project: Project }> {
	const supabase = await createClient();
	const { user } = await getUser();

	if (!user) {
		throw new Error('Unauthorized: User not authenticated');
	}

	// Add user_id to the project data
	const projectData = {
		...project,
		user_id: user.id,
	};

	const { data, error } = await supabase
		.from('projects')
		.insert([projectData])
		.select(
			`
      *,
      clients (
        name
      )
    `
		)
		.single();

	if (error) {
		throw error;
	}

	const newProject = {
		...data,
		client_name: data.clients?.name || 'Unknown Client',
	};

	return { project: newProject };
}

export async function updateProject(
	project: UpdateProjectRequest
): Promise<{ project: Project }> {
	const supabase = await createClient();
	const { user } = await getUser();

	if (!user) {
		throw new Error('Unauthorized: User not authenticated');
	}

	const { id, ...updateData } = project;

	const { data, error } = await supabase
		.from('projects')
		.update({
			...updateData,
			updated_at: new Date().toISOString(),
		})
		.eq('id', id)
		.eq('user_id', user.id)
		.select(
			`
      *,
      clients (
        name
      )
    `
		)
		.single();

	if (error) {
		throw error;
	}

	const updatedProject = {
		...data,
		client_name: data.clients?.name || 'Unknown Client',
	};

	return { project: updatedProject };
}

export async function deleteProject(id: string): Promise<{ success: boolean }> {
	const supabase = await createClient();
	const { user } = await getUser();

	if (!user) {
		throw new Error('Unauthorized: User not authenticated');
	}

	const { error } = await supabase
		.from('projects')
		.delete()
		.eq('id', id)
		.eq('user_id', user.id);

	if (error) {
		throw error;
	}

	return { success: true };
}
