'use server';

import {
	Client,
	CreateClientRequest,
	UpdateClientRequest,
} from '@/types/client';
import createClient from '@/utils/supabase/server';

export async function getClients(): Promise<{ clients: Client[] }> {
	const supabase = await createClient();
	const { data, error } = await supabase
		.from('clients')
		.select('*')
		.order('created_at', { ascending: false });

	if (error) {
		throw error;
	}

	return { clients: data || [] };
}

export async function getClient(id: string): Promise<{ client: Client }> {
	const supabase = await createClient();
	const { data, error } = await supabase
		.from('clients')
		.select('*')
		.eq('id', id)
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
	const { data, error } = await supabase
		.from('clients')
		.insert([client])
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
	const { id, ...updateData } = client;

	const { data, error } = await supabase
		.from('clients')
		.update({
			...updateData,
			updated_at: new Date().toISOString(),
		})
		.eq('id', id)
		.select()
		.single();

	if (error) {
		throw error;
	}

	return { client: data };
}

export async function deleteClient(id: string): Promise<{ success: boolean }> {
	const supabase = await createClient();
	const { error } = await supabase.from('clients').delete().eq('id', id);

	if (error) {
		throw error;
	}

	return { success: true };
}
