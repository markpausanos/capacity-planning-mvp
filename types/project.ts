export interface Project {
	id: string;
	client_id: string;
	name: string;
	billing_model: 'flat' | 'hourly';
	flat_fee: number | null;
	user_id: string;
	created_at: string;
	updated_at: string;
	// Joined fields
	client_name?: string;
}

export interface CreateProjectRequest {
	client_id: string;
	name: string;
	billing_model: 'flat' | 'hourly';
	flat_fee?: number | null;
}

export interface UpdateProjectRequest {
	id: string;
	client_id?: string;
	name?: string;
	billing_model?: 'flat' | 'hourly';
	flat_fee?: number | null;
}
