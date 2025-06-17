'use server';

import {
	Project,
	CreateProjectRequest,
	UpdateProjectRequest,
} from '@/types/project';
import createClient from '@/utils/supabase/server';

export async function getProjects(): Promise<{ projects: Project[] }> {
	const supabase = await createClient();
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
	const { data, error } = await supabase
		.from('projects')
		.insert([project])
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
	const { id, ...updateData } = project;

	const { data, error } = await supabase
		.from('projects')
		.update({
			...updateData,
			updated_at: new Date().toISOString(),
		})
		.eq('id', id)
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
	const { error } = await supabase.from('projects').delete().eq('id', id);

	if (error) {
		throw error;
	}

	return { success: true };
}
