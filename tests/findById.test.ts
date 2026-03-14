import { describe, it, expect } from 'vitest';
import { findById } from '../src/functions/findById';

describe('findById', () => {
    // Тестовые данные
    interface Person {
        id: number;
        name: string;
    }

    interface Product {
        id: number;
        title: string;
        price: number;
    }

    const people: Person[] = [
        { id: 1, name: 'Иван' },
        { id: 2, name: 'Мария' },
        { id: 3, name: 'Петр' }
    ];

    const products: Product[] = [
        { id: 101, title: 'Ноутбук', price: 1000 },
        { id: 102, title: 'Мышь', price: 25 },
        { id: 103, title: 'Клавиатура', price: 75 }
    ];

    const emptyArray: Person[] = [];

    describe('with person array', () => {
        it('should find existing person by id', () => {
            const result = findById(people, 2);
            expect(result).toEqual({ id: 2, name: 'Мария' });
        });

        it('should return undefined for non-existent id', () => {
            const result = findById(people, 999);
            expect(result).toBeUndefined();
        });

        it('should find first person when searching by id 1', () => {
            const result = findById(people, 1);
            expect(result).toEqual({ id: 1, name: 'Иван' });
        });

        it('should find last person when searching by id 3', () => {
            const result = findById(people, 3);
            expect(result).toEqual({ id: 3, name: 'Петр' });
        });
    });

    describe('with product array', () => {
        it('should find existing product by id', () => {
            const result = findById(products, 103);
            expect(result).toEqual({ id: 103, title: 'Клавиатура', price: 75 });
        });

        it('should return undefined for non-existent id', () => {
            const result = findById(products, 999);
            expect(result).toBeUndefined();
        });

        it('should find product with id 101', () => {
            const result = findById(products, 101);
            expect(result).toEqual({ id: 101, title: 'Ноутбук', price: 1000 });
        });
    });

    describe('edge cases', () => {
        it('should handle empty array', () => {
            expect(findById(emptyArray, 1)).toBeUndefined();
        });

        it('should handle array with single element', () => {
            const singleItem: Person[] = [{ id: 42, name: 'Один элемент' }];
            
            expect(findById(singleItem, 42)).toEqual({ id: 42, name: 'Один элемент' });
            expect(findById(singleItem, 43)).toBeUndefined();
        });

        it('should work with different object types', () => {
            const customObjects = [
                { id: 1, value: 'test', active: true },
                { id: 2, value: 'example', active: false }
            ];

            const result = findById(customObjects, 1);
            expect(result).toEqual({ id: 1, value: 'test', active: true });
        });

        it('should handle negative ids', () => {
            const itemsWithNegativeIds = [
                { id: -1, name: 'Отрицательный' },
                { id: -2, name: 'Еще отрицательный' }
            ];

            expect(findById(itemsWithNegativeIds, -1)).toEqual({ id: -1, name: 'Отрицательный' });
            expect(findById(itemsWithNegativeIds, -3)).toBeUndefined();
        });

        it('should handle zero id', () => {
            const itemsWithZero = [{ id: 0, name: 'Ноль' }];
            
            expect(findById(itemsWithZero, 0)).toEqual({ id: 0, name: 'Ноль' });
        });
    });

    describe('type safety', () => {
        it('should preserve the type of found item', () => {
            const person = findById(people, 1);
            if (person) {
                expect(person.name).toBeDefined();
                // Проверяем, что у person нет свойства price
                expect('price' in person).toBe(false);
            }

            const product = findById(products, 101);
            if (product) {
                expect(product.price).toBeDefined();
                // Проверяем, что у product нет свойства name
                expect('name' in product).toBe(false);
            }
        });

        it('should work with interface extending HasId', () => {
            interface CustomItem extends HasId {
                data: string;
            }

            const items: CustomItem[] = [
                { id: 1, data: 'some data' },
                { id: 2, data: 'other data' }
            ];

            const result = findById(items, 2);
            expect(result).toEqual({ id: 2, data: 'other data' });
        });
    });
});

// Импортируем HasId для последнего теста
import { HasId } from '../src/types';