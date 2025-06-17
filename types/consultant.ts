export interface Consultant {
	id: string;
	name: string;
	cost_per_hour: number;
	bill_rate: number;
	capacity_hours_per_week: number;
	created_at: string;
	updated_at: string;
	user_id: string;
}

export interface CreateConsultantRequest {
	name: string;
	cost_per_hour: number;
	bill_rate: number;
	capacity_hours_per_week: number;
}

export interface UpdateConsultantRequest {
	id: string;
	name?: string;
	cost_per_hour?: number;
	bill_rate?: number;
	capacity_hours_per_week?: number;
}
