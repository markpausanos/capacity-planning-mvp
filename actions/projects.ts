'use server';

import {
	Project,
	CreateProjectRequest,
	UpdateProjectRequest,
} from '@/types/project';
import { prisma } from '@/lib/prisma';
import { currentUser } from '@clerk/nextjs/server';

export async function getProjects(): Promise<{ projects: Project[] }> {
	const user = await currentUser();

	if (!user) {
		throw new Error('Unauthorized: User not authenticated');
	}

	const projects = await prisma.project.findMany({
		where: {
			clerkUserId: user.id,
		},
		include: {
			client: {
				select: {
					name: true,
				},
			},
		},
		orderBy: {
			createdAt: 'desc',
		},
	});

	// Transform the data to match the expected interface
	const transformedProjects = projects.map((project) => ({
		id: project.id,
		client_id: project.clientId,
		name: project.name,
		billing_model: project.billingModel as 'flat' | 'hourly',
		flat_fee: project.flatFee ? Number(project.flatFee) : null,
		user_id: project.clerkUserId,
		created_at: project.createdAt.toISOString(),
		updated_at: project.updatedAt.toISOString(),
		client_name: project.client?.name || 'Unknown Client',
	}));

	return { projects: transformedProjects };
}

export async function getProject(id: string): Promise<{ project: Project }> {
	const user = await currentUser();

	if (!user) {
		throw new Error('Unauthorized: User not authenticated');
	}

	const project = await prisma.project.findUnique({
		where: {
			id: id,
			clerkUserId: user.id,
		},
		include: {
			client: {
				select: {
					name: true,
				},
			},
		},
	});

	if (!project) {
		throw new Error('Project not found');
	}

	// Transform the data to match the expected interface
	const transformedProject = {
		id: project.id,
		client_id: project.clientId,
		name: project.name,
		billing_model: project.billingModel as 'flat' | 'hourly',
		flat_fee: project.flatFee ? Number(project.flatFee) : null,
		user_id: project.clerkUserId,
		created_at: project.createdAt.toISOString(),
		updated_at: project.updatedAt.toISOString(),
		client_name: project.client?.name || 'Unknown Client',
	};

	return { project: transformedProject };
}

export async function createProject(
	projectData: CreateProjectRequest
): Promise<{ project: Project }> {
	const user = await currentUser();

	if (!user) {
		throw new Error('Unauthorized: User not authenticated');
	}

	const project = await prisma.project.create({
		data: {
			clientId: projectData.client_id,
			name: projectData.name,
			billingModel: projectData.billing_model,
			flatFee: projectData.flat_fee || null,
			clerkUserId: user.id,
		},
		include: {
			client: {
				select: {
					name: true,
				},
			},
		},
	});

	// Transform the data to match the expected interface
	const transformedProject = {
		id: project.id,
		client_id: project.clientId,
		name: project.name,
		billing_model: project.billingModel as 'flat' | 'hourly',
		flat_fee: project.flatFee ? Number(project.flatFee) : null,
		user_id: project.clerkUserId,
		created_at: project.createdAt.toISOString(),
		updated_at: project.updatedAt.toISOString(),
		client_name: project.client?.name || 'Unknown Client',
	};

	return { project: transformedProject };
}

export async function updateProject(
	projectData: UpdateProjectRequest
): Promise<{ project: Project }> {
	const user = await currentUser();

	if (!user) {
		throw new Error('Unauthorized: User not authenticated');
	}

	const { id, ...updateData } = projectData;

	// Build update data object, only including defined fields
	const prismaUpdateData: any = {};
	if (updateData.client_id !== undefined) prismaUpdateData.clientId = updateData.client_id;
	if (updateData.name !== undefined) prismaUpdateData.name = updateData.name;
	if (updateData.billing_model !== undefined) prismaUpdateData.billingModel = updateData.billing_model;
	if (updateData.flat_fee !== undefined) prismaUpdateData.flatFee = updateData.flat_fee;

	const project = await prisma.project.update({
		where: {
			id: id,
			clerkUserId: user.id,
		},
		data: prismaUpdateData,
		include: {
			client: {
				select: {
					name: true,
				},
			},
		},
	});

	// Transform the data to match the expected interface
	const transformedProject = {
		id: project.id,
		client_id: project.clientId,
		name: project.name,
		billing_model: project.billingModel as 'flat' | 'hourly',
		flat_fee: project.flatFee ? Number(project.flatFee) : null,
		user_id: project.clerkUserId,
		created_at: project.createdAt.toISOString(),
		updated_at: project.updatedAt.toISOString(),
		client_name: project.client?.name || 'Unknown Client',
	};

	return { project: transformedProject };
}

export async function deleteProject(id: string): Promise<{ success: boolean }> {
	const user = await currentUser();

	if (!user) {
		throw new Error('Unauthorized: User not authenticated');
	}

	await prisma.project.delete({
		where: {
			id: id,
			clerkUserId: user.id,
		},
	});

	return { success: true };
}
