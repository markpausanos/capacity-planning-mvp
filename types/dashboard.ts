export interface WeeklyData {
	week: string;
	weekNumber: number;
	capacityHours: number;
	scheduledHours: number;
	utilization: number;
	cost: number;
	revenue: number;
	profit: number;
}

export interface ConsultantWeeklyData {
	consultantId: string;
	consultantName: string;
	weeks: WeeklyData[];
}

export interface BenchConsultant {
	id: string;
	name: string;
	capacityHoursPerWeek: number;
}

export interface DashboardData {
	consultants: ConsultantWeeklyData[];
	weeklySummary: WeeklyData[];
	benchConsultants: BenchConsultant[];
	totalConsultants: number;
}
