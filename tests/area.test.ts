import { describe, it, expect } from 'vitest';
import { calculateArea } from '../src/functions/area';

describe('calculateArea', () => {
    describe('circle', () => {
        it('should calculate circle area correctly for positive radius', () => {
            expect(calculateArea('circle', 5)).toBeCloseTo(Math.PI * 25);
            expect(calculateArea('circle', 1)).toBeCloseTo(Math.PI);
            expect(calculateArea('circle', 2.5)).toBeCloseTo(Math.PI * 6.25);
        });

        it('should return 0 for radius 0', () => {
            expect(calculateArea('circle', 0)).toBe(0);
        });

        it('should handle negative radius by returning positive area', () => {
            expect(calculateArea('circle', -5)).toBeCloseTo(Math.PI * 25);
        });

        it('should handle decimal radius', () => {
            expect(calculateArea('circle', 1.5)).toBeCloseTo(Math.PI * 2.25);
        });
    });

    describe('square', () => {
        it('should calculate square area correctly for positive side', () => {
            expect(calculateArea('square', 4)).toBe(16);
            expect(calculateArea('square', 1)).toBe(1);
            expect(calculateArea('square', 10)).toBe(100);
        });

        it('should return 0 for side 0', () => {
            expect(calculateArea('square', 0)).toBe(0);
        });

        it('should handle negative side by returning positive area', () => {
            expect(calculateArea('square', -4)).toBe(16);
            expect(calculateArea('square', -10)).toBe(100);
        });

        it('should handle decimal side', () => {
            expect(calculateArea('square', 2.5)).toBe(6.25);
            expect(calculateArea('square', 1.2)).toBeCloseTo(1.44);
        });
    });

    describe('function overloads', () => {
        it('should work with circle overload', () => {
            const result = calculateArea('circle', 5);
            expect(result).toBeTypeOf('number');
        });

        it('should work with square overload', () => {
            const result = calculateArea('square', 5);
            expect(result).toBeTypeOf('number');
        });
    });
});