export interface Client {
	id: string;
	name: string;
	user_id: string;
	created_at: string;
	updated_at: string;
}

export interface CreateClientRequest {
	name: string;
}

export interface UpdateClientRequest {
	id: string;
	name?: string;
}
