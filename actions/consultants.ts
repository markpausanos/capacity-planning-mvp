'use server';

import {
	Consultant,
	CreateConsultantRequest,
	UpdateConsultantRequest,
} from '@/types/consultant';
import createClient from '@/utils/supabase/server';

export async function getConsultants(): Promise<{ consultants: Consultant[] }> {
	const supabase = await createClient();
	const { data, error } = await supabase
		.from('consultants')
		.select('*')
		.order('created_at', { ascending: false });

	if (error) {
		throw error;
	}

	return { consultants: data || [] };
}

export async function getConsultant(
	id: string
): Promise<{ consultant: Consultant }> {
	const supabase = await createClient();
	const { data, error } = await supabase
		.from('consultants')
		.select('*')
		.eq('id', id)
		.single();

	if (error) {
		throw error;
	}

	return { consultant: data };
}

export async function createConsultant(
	consultant: CreateConsultantRequest
): Promise<{ consultant: Consultant }> {
	const supabase = await createClient();
	const { data, error } = await supabase
		.from('consultants')
		.insert([consultant])
		.select()
		.single();

	if (error) {
		throw error;
	}

	return { consultant: data };
}

export async function updateConsultant(
	consultant: UpdateConsultantRequest
): Promise<{ consultant: Consultant }> {
	const supabase = await createClient();
	const { id, ...updateData } = consultant;

	const { data, error } = await supabase
		.from('consultants')
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

	return { consultant: data };
}

export async function deleteConsultant(
	id: string
): Promise<{ success: boolean }> {
	const supabase = await createClient();
	const { error } = await supabase.from('consultants').delete().eq('id', id);

	if (error) {
		throw error;
	}

	return { success: true };
}
