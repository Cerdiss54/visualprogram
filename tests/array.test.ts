import { describe, it, expect } from 'vitest';
import { getFirstElement } from '../src/functions/array';

describe('getFirstElement', () => {
    it('should return first element of number array', () => {
        const numbers = [10, 20, 30, 40];
        expect(getFirstElement(numbers)).toBe(10);
    });

    it('should return first element of string array', () => {
        const strings = ['a', 'b', 'c'];
        expect(getFirstElement(strings)).toBe('a');
    });

    it('should return first element of boolean array', () => {
        const booleans = [true, false, true];
        expect(getFirstElement(booleans)).toBe(true);
    });

    it('should return first element of mixed array', () => {
        const mixed = [1, 'two', true, null];
        expect(getFirstElement(mixed)).toBe(1);
    });

    it('should return first element of object array', () => {
        const objects = [{ id: 1 }, { id: 2 }, { id: 3 }];
        expect(getFirstElement(objects)).toEqual({ id: 1 });
    });

    it('should return undefined for empty array', () => {
        const empty: any[] = [];
        expect(getFirstElement(empty)).toBeUndefined();
    });

    it('should return undefined for empty array of any type', () => {
        expect(getFirstElement([])).toBeUndefined();
        expect(getFirstElement<number>([])).toBeUndefined();
        expect(getFirstElement<string>([])).toBeUndefined();
    });

    it('should handle array with one element', () => {
        const singleNumber = [42];
        const singleString = ['hello'];
        
        expect(getFirstElement(singleNumber)).toBe(42);
        expect(getFirstElement(singleString)).toBe('hello');
    });

    it('should preserve type information', () => {
        const numbers = [1, 2, 3];
        const result = getFirstElement(numbers);
        
        // TypeScript should infer result as number | undefined
        if (result !== undefined) {
            expect(typeof result).toBe('number');
            expect(result.toFixed).toBeDefined(); // numbers have toFixed method
        }
    });

    it('should work with readonly arrays', () => {
        const readonlyArray: readonly number[] = [1, 2, 3];
        expect(getFirstElement(readonlyArray)).toBe(1);
    });
});