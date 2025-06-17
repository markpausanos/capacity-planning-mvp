'use server';

import { AuthRequest } from '@/types/auth';
import createClient from '@/utils/supabase/server';
import { User } from '@supabase/auth-js';

export async function getUser(): Promise<{ user: User }> {
	const supabase = await createClient();
	const { data, error } = await supabase.auth.getUser();

	if (error) {
		throw error;
	}

	return data;
}

export async function login(user: AuthRequest): Promise<{ user: User }> {
	const supabase = await createClient();
	const { error } = await supabase.auth.signInWithPassword({
		email: user.email,
		password: user.password,
	});

	if (error) {
		throw error;
	}

	return await getUser();
}

export async function signup(user: AuthRequest) {
	const supabase = await createClient();
	const { error } = await supabase.auth.signUp({
		email: user.email,
		password: user.password,
	});

	if (error) {
		throw error;
	}
}

export async function logout() {
	const supabase = await createClient();
	const { error } = await supabase.auth.signOut();

	if (error) {
		throw error;
	}

	return { success: true };
}

export async function updatePassword(
	password: string
): Promise<{ user: User }> {
	const supabase = await createClient();
	const { error } = await supabase.auth.updateUser({
		password,
	});

	if (error) {
		throw error;
	}

	return await getUser();
}

export async function resetPassword(email: string) {
	const supabase = await createClient();
	const { error } = await supabase.auth.resetPasswordForEmail(email);

	if (error) {
		throw error;
	}
}
