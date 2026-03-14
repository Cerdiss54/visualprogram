import { describe, it, expect } from 'vitest';
import { capitalizeFirst, trimAndTransform } from '../src/functions/formatter';

describe('StringFormatter functions', () => {
    describe('capitalizeFirst', () => {
        it('should capitalize first letter of lowercase string', () => {
            expect(capitalizeFirst('hello')).toBe('Hello');
            expect(capitalizeFirst('world')).toBe('World');
            expect(capitalizeFirst('test')).toBe('Test');
        });

        it('should handle empty string', () => {
            expect(capitalizeFirst('')).toBe('');
        });

        it('should handle single character', () => {
            expect(capitalizeFirst('a')).toBe('A');
            expect(capitalizeFirst('z')).toBe('Z');
        });

        it('should not change already capitalized string', () => {
            expect(capitalizeFirst('Hello')).toBe('Hello');
            expect(capitalizeFirst('World')).toBe('World');
        });

        it('should handle strings with multiple words', () => {
            expect(capitalizeFirst('hello world')).toBe('Hello world');
            expect(capitalizeFirst('the quick brown fox')).toBe('The quick brown fox');
        });

        it('should handle strings with numbers and symbols', () => {
            expect(capitalizeFirst('123abc')).toBe('123abc');
            expect(capitalizeFirst('!hello')).toBe('!hello');
        });

        it('should handle strings with leading/trailing spaces', () => {
            expect(capitalizeFirst('  hello')).toBe('  hello');
            expect(capitalizeFirst('hello  ')).toBe('Hello  ');
        });
    });

    describe('trimAndTransform', () => {
        it('should trim whitespace from both ends', () => {
            expect(trimAndTransform('  hello  ')).toBe('hello');
            expect(trimAndTransform('\n\tworld\n')).toBe('world');
            expect(trimAndTransform('  test  ')).toBe('test');
        });

        it('should not change string without whitespace', () => {
            expect(trimAndTransform('hello')).toBe('hello');
            expect(trimAndTransform('world')).toBe('world');
        });

        it('should convert to uppercase when uppercase parameter is true', () => {
            expect(trimAndTransform('  hello  ', true)).toBe('HELLO');
            expect(trimAndTransform('world', true)).toBe('WORLD');
            expect(trimAndTransform('  test string  ', true)).toBe('TEST STRING');
        });

        it('should handle empty string', () => {
            expect(trimAndTransform('')).toBe('');
            expect(trimAndTransform('', true)).toBe('');
        });

        it('should handle string with only spaces', () => {
            expect(trimAndTransform('   ')).toBe('');
            expect(trimAndTransform('   ', true)).toBe('');
        });

        it('should handle string with tabs and newlines', () => {
            expect(trimAndTransform('\n\thello\t\n')).toBe('hello');
            expect(trimAndTransform('\n\thello\t\n', true)).toBe('HELLO');
        });

        it('should preserve internal spaces when trimming', () => {
            expect(trimAndTransform('  hello world  ')).toBe('hello world');
            expect(trimAndTransform('  hello world  ', true)).toBe('HELLO WORLD');
        });

        it('should handle uppercase parameter default value (false)', () => {
            const result1 = trimAndTransform('test');
            const result2 = trimAndTransform('test', false);
            
            expect(result1).toBe('test');
            expect(result2).toBe('test');
            expect(result1).toBe(result2);
        });
    });
});