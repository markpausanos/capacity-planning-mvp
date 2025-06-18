'use server';

import {
	Consultant,
	CreateConsultantRequest,
	UpdateConsultantRequest,
} from '@/types/consultant';
import createClient from '@/utils/supabase/server';
import { getUser } from './auth';

export async function getConsultants(): Promise<{ consultants: Consultant[] }> {
	const supabase = await createClient();
	const { user } = await getUser();

	if (!user) {
		throw new Error('Unauthorized: User not authenticated');
	}

	const { data, error } = await supabase
		.from('consultants')
		.select('*')
		.eq('user_id', user.id)
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
	const { user } = await getUser();

	if (!user) {
		throw new Error('Unauthorized: User not authenticated');
	}

	const { data, error } = await supabase
		.from('consultants')
		.select('*')
		.eq('id', id)
		.eq('user_id', user.id)
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
	const { user } = await getUser();

	if (!user) {
		throw new Error('Unauthorized: User not authenticated');
	}

	// Add user_id to the consultant data
	const consultantData = {
		...consultant,
		user_id: user.id,
	};

	const { data, error } = await supabase
		.from('consultants')
		.insert([consultantData])
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
	const { user } = await getUser();

	if (!user) {
		throw new Error('Unauthorized: User not authenticated');
	}

	const { id, ...updateData } = consultant;

	const { data, error } = await supabase
		.from('consultants')
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

	return { consultant: data };
}

export async function deleteConsultant(
	id: string
): Promise<{ success: boolean }> {
	const supabase = await createClient();
	const { user } = await getUser();

	if (!user) {
		throw new Error('Unauthorized: User not authenticated');
	}

	const { error } = await supabase
		.from('consultants')
		.delete()
		.eq('id', id)
		.eq('user_id', user.id);

	if (error) {
		throw error;
	}

	return { success: true };
}
