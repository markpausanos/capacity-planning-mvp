export interface Allocation {
	id: string;
	consultant_id: string;
	project_id: string;
	start_date: string;
	end_date: string;
	hours_per_week: number;
	user_id: string;
	created_at: string;
	updated_at: string;
	// Joined fields for display
	consultant_name?: string;
	project_name?: string;
	client_name?: string;
	consultant_capacity?: number;
}

export interface CreateAllocationData {
	consultant_id: string;
	project_id: string;
	start_date: string;
	end_date: string;
	hours_per_week: number;
}

export interface UpdateAllocationData {
	consultant_id?: string;
	project_id?: string;
	start_date?: string;
	end_date?: string;
	hours_per_week?: number;
}
