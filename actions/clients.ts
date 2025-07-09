'use server';

import {
	Client,
	CreateClientRequest,
	UpdateClientRequest,
} from '@/types/client';
import { prisma } from '@/lib/prisma';
import { currentUser } from '@clerk/nextjs/server';

export async function getClients(): Promise<{ clients: Client[] }> {
	const user = await currentUser();

	if (!user) {
		throw new Error('Unauthorized: User not authenticated');
	}

	const clients = await prisma.client.findMany({
		where: {
			clerkUserId: user.id,
		},
		orderBy: {
			createdAt: 'desc',
		},
	});

	// Transform the data to match the expected interface
	const transformedClients = clients.map((client) => ({
		id: client.id,
		name: client.name,
		user_id: client.clerkUserId,
		created_at: client.createdAt.toISOString(),
		updated_at: client.updatedAt.toISOString(),
	}));

	return { clients: transformedClients };
}

export async function getClient(id: string): Promise<{ client: Client }> {
	const user = await currentUser();

	if (!user) {
		throw new Error('Unauthorized: User not authenticated');
	}

	const client = await prisma.client.findUnique({
		where: {
			id: id,
			clerkUserId: user.id,
		},
	});

	if (!client) {
		throw new Error('Client not found');
	}

	// Transform the data to match the expected interface
	const transformedClient = {
		id: client.id,
		name: client.name,
		user_id: client.clerkUserId,
		created_at: client.createdAt.toISOString(),
		updated_at: client.updatedAt.toISOString(),
	};

	return { client: transformedClient };
}

export async function createProjectClient(
	clientData: CreateClientRequest
): Promise<{ client: Client }> {
	const user = await currentUser();

	if (!user) {
		throw new Error('Unauthorized: User not authenticated');
	}

	const client = await prisma.client.create({
		data: {
			name: clientData.name,
			clerkUserId: user.id,
		},
	});

	// Transform the data to match the expected interface
	const transformedClient = {
		id: client.id,
		name: client.name,
		user_id: client.clerkUserId,
		created_at: client.createdAt.toISOString(),
		updated_at: client.updatedAt.toISOString(),
	};

	return { client: transformedClient };
}

export async function updateClient(
	clientData: UpdateClientRequest
): Promise<{ client: Client }> {
	const user = await currentUser();

	if (!user) {
		throw new Error('Unauthorized: User not authenticated');
	}

	const { id, ...updateData } = clientData;

	// Build update data object, only including defined fields
	const prismaUpdateData: any = {};
	if (updateData.name !== undefined) prismaUpdateData.name = updateData.name;

	const client = await prisma.client.update({
		where: {
			id: id,
			clerkUserId: user.id,
		},
		data: prismaUpdateData,
	});

	// Transform the data to match the expected interface
	const transformedClient = {
		id: client.id,
		name: client.name,
		user_id: client.clerkUserId,
		created_at: client.createdAt.toISOString(),
		updated_at: client.updatedAt.toISOString(),
	};

	return { client: transformedClient };
}

export async function deleteClient(id: string): Promise<{ success: boolean }> {
	const user = await currentUser();

	if (!user) {
		throw new Error('Unauthorized: User not authenticated');
	}

	await prisma.client.delete({
		where: {
			id: id,
			clerkUserId: user.id,
		},
	});

	return { success: true };
}
