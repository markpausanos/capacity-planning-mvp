'use server';

import createClient from '@/utils/supabase/server';
import {
	CreateAllocationData,
	UpdateAllocationData,
	Allocation,
} from '@/types/allocation';
import { revalidatePath } from 'next/cache';
import { getUser } from './auth';

export async function getAllocations(): Promise<Allocation[]> {
	const supabase = await createClient();
	const { user } = await getUser();

	if (!user) {
		throw new Error('Unauthorized: User not authenticated');
	}

	const { data, error } = await supabase
		.from('allocations')
		.select(
			`
			*,
			consultants!inner(name, capacity_hours_per_week),
			projects!inner(
				name,
				clients!inner(name)
			)
		`
		)
		.eq('user_id', user.id)
		.order('start_date', { ascending: false });

	if (error) {
		console.error('Error fetching allocations:', error);
		throw new Error('Failed to fetch allocations');
	}

	// Transform the data to flatten the nested structure
	return data.map((allocation: any) => ({
		...allocation,
		consultant_name: allocation.consultants.name,
		consultant_capacity: allocation.consultants.capacity_hours_per_week,
		project_name: allocation.projects.name,
		client_name: allocation.projects.clients.name,
	}));
}

export async function createAllocation(
	data: CreateAllocationData
): Promise<void> {
	const supabase = await createClient();
	const { user } = await getUser();

	if (!user) {
		throw new Error('Unauthorized: User not authenticated');
	}

	// Validate date range
	const startDate = new Date(data.start_date);
	const endDate = new Date(data.end_date);

	if (startDate > endDate) {
		throw new Error('Start date must be before or equal to end date');
	}

	// Validate hours per week is positive
	if (data.hours_per_week <= 0) {
		throw new Error('Hours per week must be greater than 0');
	}

	// Add user_id to the data
	const allocationData = {
		...data,
		user_id: user.id,
	};

	const { error } = await supabase.from('allocations').insert([allocationData]);

	if (error) {
		console.error('Error creating allocation:', error);
		throw new Error('Failed to create allocation');
	}

	revalidatePath('/data-manager/allocations');
}

export async function updateAllocation(
	id: string,
	data: UpdateAllocationData
): Promise<void> {
	const supabase = await createClient();
	const { user } = await getUser();

	if (!user) {
		throw new Error('Unauthorized: User not authenticated');
	}

	// Validate date range if both dates are provided
	if (data.start_date && data.end_date) {
		const startDate = new Date(data.start_date);
		const endDate = new Date(data.end_date);

		if (startDate > endDate) {
			throw new Error('Start date must be before or equal to end date');
		}
	}

	// Validate hours per week is positive if provided
	if (data.hours_per_week !== undefined && data.hours_per_week <= 0) {
		throw new Error('Hours per week must be greater than 0');
	}

	const { error } = await supabase
		.from('allocations')
		.update(data)
		.eq('id', id)
		.eq('user_id', user.id);

	if (error) {
		console.error('Error updating allocation:', error);
		throw new Error('Failed to update allocation');
	}

	revalidatePath('/data-manager/allocations');
}

export async function deleteAllocation(id: string): Promise<void> {
	const supabase = await createClient();
	const { user } = await getUser();

	if (!user) {
		throw new Error('Unauthorized: User not authenticated');
	}

	const { error } = await supabase
		.from('allocations')
		.delete()
		.eq('id', id)
		.eq('user_id', user.id);

	if (error) {
		console.error('Error deleting allocation:', error);
		throw new Error('Failed to delete allocation');
	}

	revalidatePath('/data-manager/allocations');
}
