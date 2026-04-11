import { describe, it, expect, afterEach } from 'vitest';
import { formatCSVFileToJSONFile } from '../src/lab3';
import * as fs from 'fs';

describe('formatCSVFileToJSONFile с ручными заглушками', () => {

    const originalReadFile = fs.promises.readFile;
    const originalWriteFile = fs.promises.writeFile;

    let readFileCalled = false;
    let writeFileCalled = false;
    let readFilePath = '';
    let writeFilePath = '';
    let writeFileContent = '';
    let writeFileEncoding = '';

    afterEach(() => {
        fs.promises.readFile = originalReadFile;
        fs.promises.writeFile = originalWriteFile;
        
        readFileCalled = false;
        writeFileCalled = false;
        readFilePath = '';
        writeFilePath = '';
        writeFileContent = '';
        writeFileEncoding = '';
    });

    const mockReadFile = async (path: string, encoding: string) => {
        readFileCalled = true;
        readFilePath = path;
        return 'name,age,city\nDmitriy,20,Novosibirsk\nNataliya,22,Leningrad\nAlexander,15,Moscow';
    };

    const mockWriteFile = async (path: string, content: string, encoding: string) => {
        writeFileCalled = true;
        writeFilePath = path;
        writeFileContent = content;
        writeFileEncoding = encoding;
    };

    it('должен вызвать readFile и writeFile с правильными параметрами', async () => {

        fs.promises.readFile = mockReadFile as any;
        fs.promises.writeFile = mockWriteFile as any;


        await formatCSVFileToJSONFile('../code/data.csv', '../code/output.json', ',');

        expect(readFileCalled).toBe(true);
        expect(readFilePath).toBe('../code/data.csv');

        expect(writeFileCalled).toBe(true);
        expect(writeFilePath).toBe('../code/output.json');
        expect(writeFileEncoding).toBe('utf-8');

        const parsed = JSON.parse(writeFileContent);
        expect(parsed).toHaveLength(3);
        expect(parsed).toEqual([
            { name: 'Dmitriy', age: 20, city: 'Novosibirsk' },
            { name: 'Nataliya', age: 22, city: 'Leningrad' },
            { name: 'Alexander', age: 15, city: 'Moscow' }
        ]);
    });

    it('должен работать с реальными данными из ../code/data.csv (все 3 строки)', async () => {
        fs.promises.readFile = mockReadFile as any;
        fs.promises.writeFile = mockWriteFile as any;

        await formatCSVFileToJSONFile('../code/data.csv', '../code/output.json', ',');

        const parsed = JSON.parse(writeFileContent);
        
        expect(parsed).toHaveLength(3);
        expect(parsed[0].name).toBe('Dmitriy');
        expect(parsed[1].name).toBe('Nataliya');
        expect(parsed[2].name).toBe('Alexander');
    });

    it('должен вызывать writeFile ТОЛЬКО после успешного readFile', async () => {
        // Сброс флагов уже в afterEach, но можно и здесь
        readFileCalled = false;
        writeFileCalled = false;

        // Заглушка readFile с ошибкой
        const mockReadFileWithError = async (path: string, encoding: string) => {
            readFileCalled = true;
            throw new Error('Файл не найден');
        };

        fs.promises.readFile = mockReadFileWithError as any;
        fs.promises.writeFile = mockWriteFile as any;

        try {
            await formatCSVFileToJSONFile('../code/data.csv', '../code/output.json', ',');
        } catch (error) {
            expect((error as Error).message).toContain('Файл не найден');
        }

        expect(readFileCalled).toBe(true);
        expect(writeFileCalled).toBe(false);
    });

    it('должен правильно определять типы данных (числа/строки)', async () => {
        fs.promises.readFile = mockReadFile as any;
        fs.promises.writeFile = mockWriteFile as any;

        await formatCSVFileToJSONFile('../code/data.csv', '../code/output.json', ',');
        const parsed = JSON.parse(writeFileContent);
        
        expect(typeof parsed[0].age).toBe('number');
        expect(typeof parsed[1].age).toBe('number');
        expect(typeof parsed[2].age).toBe('number');
        expect(typeof parsed[0].name).toBe('string');
        expect(typeof parsed[2].city).toBe('string');
    });
});