export function csvToJSON(input: string[], delimiter: string): object[] {
    if (!input || input.length === 0) {
        throw new Error("Входной массив пуст");
    }

    if (input.length < 2) {
        throw new Error("Нет строк с данными");
    }

    const headers = input[0].split(delimiter);
    
    if (headers.length === 0 || headers.some(h => h.trim() === '')) {
        throw new Error("Неверные заголовки");
    }

    const result: object[] = [];

    for (let i = 1; i < input.length; i++) {
        const values = input[i].split(delimiter);
        
        if (values.length !== headers.length) {
            throw new Error(`Строка ${i + 1}: количество значений не соответствует количеству заголовков`);
        }

        const obj: { [key: string]: string | number } = {};
        
        for (let j = 0; j < headers.length; j++) {
            const header = headers[j].trim();
            const value = values[j].trim();
            
            
            if (value === '') {
                obj[header] = '';
            } else {
                const numValue = Number(value);
                obj[header] = isNaN(numValue) ? value : numValue;
            }
        }
        
        result.push(obj);
    }

    return result;
}

let res = csvToJSON(["p1;p2;p3;p4", "1;A;b;c", "2;B;v;d"], ';');
console.log(res);


import { promises as fs } from 'fs';

export async function formatCSVFileToJSONFile(
    input: string, 
    output: string, 
    delimiter: string
): Promise<void> {
    try {
        const csvContent = await fs.readFile(input, 'utf-8');
        
        const lines = csvContent
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0);
        
        const jsonData = csvToJSON(lines, delimiter);
        
        await fs.writeFile(output, JSON.stringify(jsonData, null, 2), 'utf-8');
        
        console.log(`Файл успешно преобразован и сохранен в ${output}`);
    } catch (error) {
        throw new Error(`Ошибка при обработке файла: ${error instanceof Error ? error.message : String(error)}`);
    }
}

if (require.main === module) {
    formatCSVFileToJSONFile('data.csv', 'output.json', ';')
        .then(() => console.log('Готово!'))
        .catch(err => console.error('Ошибка: ', err.message));
}