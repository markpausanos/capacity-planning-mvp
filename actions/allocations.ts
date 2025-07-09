'use server';

import { prisma } from '@/lib/prisma';
import {
	CreateAllocationData,
	UpdateAllocationData,
	Allocation,
} from '@/types/allocation';
import { revalidatePath } from 'next/cache';
import { currentUser } from '@clerk/nextjs/server';


export async function getAllocations(): Promise<Allocation[]> {
	const user = await currentUser();

	if (!user) {
		throw new Error('Unauthorized: User not authenticated');
	}

	const allocations = await prisma.allocation.findMany({
		where: {
			clerkUserId: user.id,
		},
		include: {
			consultant: {
				select: {
					name: true,
					capacityHoursPerWeek: true,
				},
			},
			project: {
				select: {
					name: true,
					client: {
						select: {
							name: true,
						},
					},
				},
			},
		},
		orderBy: {
			startDate: 'desc',
		},
	});

	// Transform the data to match the expected interface
	return allocations.map((allocation): Allocation => ({
		id: allocation.id,
		consultant_id: allocation.consultantId,
		project_id: allocation.projectId,
		start_date: allocation.startDate.toISOString().split('T')[0], // Convert Date to string
		end_date: allocation.endDate.toISOString().split('T')[0], // Convert Date to string
		hours_per_week: allocation.hoursPerWeek,
		user_id: allocation.clerkUserId,
		created_at: allocation.createdAt.toISOString(),
		updated_at: allocation.updatedAt.toISOString(),
		consultant_name: allocation.consultant.name,
		consultant_capacity: allocation.consultant.capacityHoursPerWeek,
		project_name: allocation.project.name,
		client_name: allocation.project.client.name,
	}));
}

export async function createAllocation(
	data: CreateAllocationData
): Promise<void> {
	const user = await currentUser();

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

	await prisma.allocation.create({
		data: {
			consultantId: data.consultant_id,
			projectId: data.project_id,
			startDate: new Date(data.start_date),
			endDate: new Date(data.end_date),
			hoursPerWeek: data.hours_per_week,
			clerkUserId: user.id,
		},
	});

	revalidatePath('/data-manager/allocations');
}

export async function updateAllocation(
	id: string,
	data: UpdateAllocationData
): Promise<void> {
	const user = await currentUser();

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

	// Build update data object, only including defined fields
	const updateData: any = {};
	if (data.consultant_id !== undefined) updateData.consultantId = data.consultant_id;
	if (data.project_id !== undefined) updateData.projectId = data.project_id;
	if (data.start_date !== undefined) updateData.startDate = new Date(data.start_date);
	if (data.end_date !== undefined) updateData.endDate = new Date(data.end_date);
	if (data.hours_per_week !== undefined) updateData.hoursPerWeek = data.hours_per_week;

	await prisma.allocation.update({
		where: {
			id: id,
			clerkUserId: user.id, // Ensure user can only update their own allocations
		},
		data: updateData,
	});

	revalidatePath('/data-manager/allocations');
}

export async function deleteAllocation(id: string): Promise<void> {
	const user = await currentUser();

	if (!user) {
		throw new Error('Unauthorized: User not authenticated');
	}

	await prisma.allocation.delete({
		where: {
			id: id,
			clerkUserId: user.id, // Ensure user can only delete their own allocations
		},
	});

	revalidatePath('/data-manager/allocations');
}
