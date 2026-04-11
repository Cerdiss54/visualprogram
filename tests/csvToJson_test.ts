import { describe, it, expect } from 'vitest';
import { csvToJSON } from '../src/lab3';

describe('csvToJSON', () => {
    // Тесты на корректных входных данных
    describe('корректные входные данные', () => {
        it('должен преобразовывать CSV в массив объектов с числами', () => {
            const input = ["p1;p2;p3;p4", "1;A;b;c", "2;B;v;d"];
            const result = csvToJSON(input, ';');
            
            expect(result).toEqual([
                { p1: 1, p2: 'A', p3: 'b', p4: 'c' },
                { p1: 2, p2: 'B', p3: 'v', p4: 'd' }
            ]);
        });

        it('должен работать с разными разделителями', () => {
            const input = ["p1,p2,p3", "1,A,b", "2,B,v"];
            const result = csvToJSON(input, ',');
            
            expect(result).toEqual([
                { p1: 1, p2: 'A', p3: 'b' },
                { p1: 2, p2: 'B', p3: 'v' }
            ]);
        });

        it('должен обрабатывать смешанные типы данных', () => {
            const input = ["id;name;age;score", "1;John;25;95.5", "2;Jane;30;87.3"];
            const result = csvToJSON(input, ';');
            
            expect(result).toEqual([
                { id: 1, name: 'John', age: 25, score: 95.5 },
                { id: 2, name: 'Jane', age: 30, score: 87.3 }
            ]);
        });

        it('должен обрезать пробелы в заголовках и значениях', () => {
            const input = [" p1 ; p2 ; p3 ", " 1 ; A ; b ", " 2 ; B ; v "];
            const result = csvToJSON(input, ';');
            
            expect(result).toEqual([
                { p1: 1, p2: 'A', p3: 'b' },
                { p1: 2, p2: 'B', p3: 'v' }
            ]);
        });

        it('должен сохранять строки, которые не преобразуются в числа', () => {
            const input = ["p1;p2;p3", "1;ABC;b", "2;DEF;v"];
            const result = csvToJSON(input, ';');
            
            expect(result).toEqual([
                { p1: 1, p2: 'ABC', p3: 'b' },
                { p1: 2, p2: 'DEF', p3: 'v' }
            ]);
        });

        it('должен работать с несколькими строками данных', () => {
            const input = ["p1;p2", "1;A", "2;B", "3;C", "4;D"];
            const result = csvToJSON(input, ';');
            
            expect(result).toEqual([
                { p1: 1, p2: 'A' },
                { p1: 2, p2: 'B' },
                { p1: 3, p2: 'C' },
                { p1: 4, p2: 'D' }
            ]);
        });
    });

    // Тесты на некорректных входных данных
    describe('некорректные входные данные', () => {
        it('должен выбрасывать ошибку при пустом входном массиве', () => {
            expect(() => csvToJSON([], ';')).toThrow("Входной массив пуст");
            expect(() => csvToJSON(null as any, ';')).toThrow("Входной массив пуст");
            expect(() => csvToJSON(undefined as any, ';')).toThrow("Входной массив пуст");
        });

        it('должен выбрасывать ошибку при отсутствии строк с данными', () => {
            const input = ["p1;p2;p3"];
            expect(() => csvToJSON(input, ';')).toThrow("Нет строк с данными");
        });

        it('должен выбрасывать ошибку при неверных заголовках', () => {
            const input1 = ["", "1;A;b", "2;B;v"];
            expect(() => csvToJSON(input1, ';')).toThrow("Неверные заголовки");
            
            const input2 = [" ; ; ", "1;A;b", "2;B;v"];
            expect(() => csvToJSON(input2, ';')).toThrow("Неверные заголовки");
            
            const input3 = ["p1;;p3", "1;A;b", "2;B;v"];
            expect(() => csvToJSON(input3, ';')).toThrow("Неверные заголовки");
        });

        it('должен выбрасывать ошибку при несовпадении количества параметров', () => {
            const input1 = ["p1;p2;p3", "1;A;b;c", "2;B;v;d"];
            expect(() => csvToJSON(input1, ';')).toThrow("Строка 2: количество значений не соответствует количеству заголовков");
            
            const input2 = ["p1;p2;p3;p4", "1;A;b", "2;B;v;d"];
            expect(() => csvToJSON(input2, ';')).toThrow("Строка 2: количество значений не соответствует количеству заголовков");
        });

        it('должен выбрасывать ошибку при пустых значениях в данных', () => {
            const input = ["p1;p2;p3", "1;;b", "2;B;v"];
            expect(() => csvToJSON(input, ';')).not.toThrow(); // Пустые значения допустимы
            
            const result = csvToJSON(input, ';');
            expect(result).toEqual([
                { p1: 1, p2: '', p3: 'b' },
                { p1: 2, p2: 'B', p3: 'v' }
            ]);
        });

        it('должен обрабатывать специальные символы в данных', () => {
            const input = ["p1;p2", "1;Hello, World!", "2;Test@#$%"];
            const result = csvToJSON(input, ';');
            
            expect(result).toEqual([
                { p1: 1, p2: 'Hello, World!' },
                { p1: 2, p2: 'Test@#$%' }
            ]);
        });

        it('должен правильно обрабатывать числа с ведущими нулями', () => {
            const input = ["p1;p2", "01;A", "02;B"];
            const result = csvToJSON(input, ';');
            
            expect(result).toEqual([
                { p1: 1, p2: 'A' },
                { p1: 2, p2: 'B' }
            ]);
        });
    });
});