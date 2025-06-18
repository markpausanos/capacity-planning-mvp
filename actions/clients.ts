'use server';

import {
	Client,
	CreateClientRequest,
	UpdateClientRequest,
} from '@/types/client';
import createClient from '@/utils/supabase/server';
import { getUser } from './auth';

export async function getClients(): Promise<{ clients: Client[] }> {
	const supabase = await createClient();
	const { user } = await getUser();

	if (!user) {
		throw new Error('Unauthorized: User not authenticated');
	}

	const { data, error } = await supabase
		.from('clients')
		.select('*')
		.eq('user_id', user.id)
		.order('created_at', { ascending: false });

	if (error) {
		throw error;
	}

	return { clients: data || [] };
}

export async function getClient(id: string): Promise<{ client: Client }> {
	const supabase = await createClient();
	const { user } = await getUser();

	if (!user) {
		throw new Error('Unauthorized: User not authenticated');
	}

	const { data, error } = await supabase
		.from('clients')
		.select('*')
		.eq('id', id)
		.eq('user_id', user.id)
		.single();

	if (error) {
		throw error;
	}

	return { client: data };
}

export async function createProjectClient(
	client: CreateClientRequest
): Promise<{ client: Client }> {
	const supabase = await createClient();
	const { user } = await getUser();

	if (!user) {
		throw new Error('Unauthorized: User not authenticated');
	}

	// Add user_id to the client data
	const clientData = {
		...client,
		user_id: user.id,
	};

	const { data, error } = await supabase
		.from('clients')
		.insert([clientData])
		.select()
		.single();

	if (error) {
		throw error;
	}

	return { client: data };
}

export async function updateClient(
	client: UpdateClientRequest
): Promise<{ client: Client }> {
	const supabase = await createClient();
	const { user } = await getUser();

	if (!user) {
		throw new Error('Unauthorized: User not authenticated');
	}

	const { id, ...updateData } = client;

	const { data, error } = await supabase
		.from('clients')
		.update({
			...updateData,
			updated_at: new Date().toISOString(),
		})
		.eq('id', id)
		.eq('user_id', user.id)
		.select()
		.single();

	if (error) {
		throw error;
	}

	return { client: data };
}

export async function deleteClient(id: string): Promise<{ success: boolean }> {
	const supabase = await createClient();
	const { user } = await getUser();

	if (!user) {
		throw new Error('Unauthorized: User not authenticated');
	}

	const { error } = await supabase
		.from('clients')
		.delete()
		.eq('id', id)
		.eq('user_id', user.id);

	if (error) {
		throw error;
	}

	return { success: true };
}
