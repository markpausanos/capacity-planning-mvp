'use server';

import {
	Consultant,
	CreateConsultantRequest,
	UpdateConsultantRequest,
} from '@/types/consultant';
import { prisma } from '@/lib/prisma';
import { currentUser } from '@clerk/nextjs/server';

export async function getConsultants(): Promise<{ consultants: Consultant[] }> {
	const user = await currentUser();

	if (!user) {
		throw new Error('Unauthorized: User not authenticated');
	}

	const consultants = await prisma.consultant.findMany({
		where: {
			clerkUserId: user.id,
		},
		orderBy: {
			createdAt: 'desc',
		},
	});

	// Transform the data to match the expected interface
	const transformedConsultants = consultants.map((consultant) => ({
		id: consultant.id,
		name: consultant.name,
		cost_per_hour: Number(consultant.costPerHour),
		bill_rate: Number(consultant.billRate),
		capacity_hours_per_week: consultant.capacityHoursPerWeek,
		created_at: consultant.createdAt.toISOString(),
		updated_at: consultant.updatedAt.toISOString(),
		user_id: consultant.clerkUserId,
	}));

	return { consultants: transformedConsultants };
}

export async function getConsultant(
	id: string
): Promise<{ consultant: Consultant }> {
	const user = await currentUser();

	if (!user) {
		throw new Error('Unauthorized: User not authenticated');
	}

	const consultant = await prisma.consultant.findUnique({
		where: {
			id: id,
			clerkUserId: user.id,
		},
	});

	if (!consultant) {
		throw new Error('Consultant not found');
	}

	// Transform the data to match the expected interface
	const transformedConsultant = {
		id: consultant.id,
		name: consultant.name,
		cost_per_hour: Number(consultant.costPerHour),
		bill_rate: Number(consultant.billRate),
		capacity_hours_per_week: consultant.capacityHoursPerWeek,
		created_at: consultant.createdAt.toISOString(),
		updated_at: consultant.updatedAt.toISOString(),
		user_id: consultant.clerkUserId,
	};

	return { consultant: transformedConsultant };
}

export async function createConsultant(
	consultantData: CreateConsultantRequest
): Promise<{ consultant: Consultant }> {
	const user = await currentUser();

	if (!user) {
		throw new Error('Unauthorized: User not authenticated');
	}

	const consultant = await prisma.consultant.create({
		data: {
			name: consultantData.name,
			costPerHour: consultantData.cost_per_hour,
			billRate: consultantData.bill_rate,
			capacityHoursPerWeek: consultantData.capacity_hours_per_week,
			clerkUserId: user.id,
		},
	});

	// Transform the data to match the expected interface
	const transformedConsultant = {
		id: consultant.id,
		name: consultant.name,
		cost_per_hour: Number(consultant.costPerHour),
		bill_rate: Number(consultant.billRate),
		capacity_hours_per_week: consultant.capacityHoursPerWeek,
		created_at: consultant.createdAt.toISOString(),
		updated_at: consultant.updatedAt.toISOString(),
		user_id: consultant.clerkUserId,
	};

	return { consultant: transformedConsultant };
}

export async function updateConsultant(
	consultantData: UpdateConsultantRequest
): Promise<{ consultant: Consultant }> {
	const user = await currentUser();

	if (!user) {
		throw new Error('Unauthorized: User not authenticated');
	}

	const { id, ...updateData } = consultantData;

	// Build update data object, only including defined fields
	const prismaUpdateData: any = {};
	if (updateData.name !== undefined) prismaUpdateData.name = updateData.name;
	if (updateData.cost_per_hour !== undefined) prismaUpdateData.costPerHour = updateData.cost_per_hour;
	if (updateData.bill_rate !== undefined) prismaUpdateData.billRate = updateData.bill_rate;
	if (updateData.capacity_hours_per_week !== undefined) prismaUpdateData.capacityHoursPerWeek = updateData.capacity_hours_per_week;

	const consultant = await prisma.consultant.update({
		where: {
			id: id,
			clerkUserId: user.id,
		},
		data: prismaUpdateData,
	});

	// Transform the data to match the expected interface
	const transformedConsultant = {
		id: consultant.id,
		name: consultant.name,
		cost_per_hour: Number(consultant.costPerHour),
		bill_rate: Number(consultant.billRate),
		capacity_hours_per_week: consultant.capacityHoursPerWeek,
		created_at: consultant.createdAt.toISOString(),
		updated_at: consultant.updatedAt.toISOString(),
		user_id: consultant.clerkUserId,
	};

	return { consultant: transformedConsultant };
}

export async function deleteConsultant(
	id: string
): Promise<{ success: boolean }> {
	const user = await currentUser();

	if (!user) {
		throw new Error('Unauthorized: User not authenticated');
	}

	await prisma.consultant.delete({
		where: {
			id: id,
			clerkUserId: user.id,
		},
	});

	return { success: true };
}
