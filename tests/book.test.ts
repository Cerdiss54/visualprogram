import { describe, it, expect } from 'vitest';
import { createBook } from '../src/functions/book';

describe('createBook', () => {
    it('should create fiction book with all fields', () => {
        const book = createBook({
            title: 'Война и мир',
            author: 'Лев Толстой',
            year: 1869,
            genre: 'fiction'
        });

        expect(book).toEqual({
            title: 'Война и мир',
            author: 'Лев Толстой',
            year: 1869,
            genre: 'fiction'
        });
    });

    it('should create non-fiction book without year', () => {
        const book = createBook({
            title: 'Краткая история времени',
            author: 'Стивен Хокинг',
            genre: 'non-fiction'
        });

        expect(book).toEqual({
            title: 'Краткая история времени',
            author: 'Стивен Хокинг',
            genre: 'non-fiction'
        });
        expect(book.year).toBeUndefined();
    });

    it('should handle fiction genre correctly', () => {
        const book = createBook({
            title: '1984',
            author: 'Джордж Оруэлл',
            genre: 'fiction'
        });

        expect(book.genre).toBe('fiction');
        expect(book.genre).not.toBe('non-fiction');
    });

    it('should handle non-fiction genre correctly', () => {
        const book = createBook({
            title: 'Сапиенс',
            author: 'Юваль Харари',
            genre: 'non-fiction'
        });

        expect(book.genre).toBe('non-fiction');
        expect(book.genre).not.toBe('fiction');
    });

    it('should accept year as optional field', () => {
        const bookWithYear = createBook({
            title: 'Книга с годом',
            author: 'Автор',
            year: 2020,
            genre: 'fiction'
        });

        const bookWithoutYear = createBook({
            title: 'Книга без года',
            author: 'Автор',
            genre: 'non-fiction'
        });

        expect(bookWithYear.year).toBe(2020);
        expect(bookWithoutYear.year).toBeUndefined();
    });
});