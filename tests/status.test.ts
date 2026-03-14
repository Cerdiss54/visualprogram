import { describe, it, expect } from 'vitest';
import { getStatusColor } from '../src/functions/status';

describe('getStatusColor', () => {
    it('should return green for active status', () => {
        expect(getStatusColor('active')).toBe('green');
    });

    it('should return gray for inactive status', () => {
        expect(getStatusColor('inactive')).toBe('gray');
    });

    it('should return blue for new status', () => {
        expect(getStatusColor('new')).toBe('blue');
    });

    it('should handle all status types in a loop', () => {
        const statuses = ['active', 'inactive', 'new'] as const;
        const expectedColors = ['green', 'gray', 'blue'];

        statuses.forEach((status, index) => {
            expect(getStatusColor(status)).toBe(expectedColors[index]);
        });
    });

    it('should return different colors for different statuses', () => {
        const activeColor = getStatusColor('active');
        const inactiveColor = getStatusColor('inactive');
        const newColor = getStatusColor('new');

        expect(activeColor).not.toBe(inactiveColor);
        expect(activeColor).not.toBe(newColor);
        expect(inactiveColor).not.toBe(newColor);
    });

    it('should always return a string', () => {
        expect(typeof getStatusColor('active')).toBe('string');
        expect(typeof getStatusColor('inactive')).toBe('string');
        expect(typeof getStatusColor('new')).toBe('string');
    });
});