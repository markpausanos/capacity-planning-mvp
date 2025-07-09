// Legacy types - these are no longer used with Clerk
// Keeping for backwards compatibility during migration
export type AuthRequest = {
	email: string;
	password: string;
};

// Clerk handles auth types internally, no need for custom types
