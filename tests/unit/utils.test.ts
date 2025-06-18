import { describe, it, expect } from 'vitest';
import { cn } from '@/lib/utils';

describe('Utils', () => {
	it('should merge classes correctly', () => {
		const result = cn('text-red-500', 'bg-blue-500');
		expect(result).toContain('text-red-500');
		expect(result).toContain('bg-blue-500');
	});
});
