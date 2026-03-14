import { createUser } from './functions/user';
import { createBook } from './functions/book';
import { calculateArea } from './functions/area';
import { getStatusColor } from './functions/status';
import { capitalizeFirst, trimAndTransform } from './functions/formatter';
import { getFirstElement } from './functions/array';
import { findById } from './functions/findById';

console.log('=== Демонстрация функций ===\n');

const user1 = createUser(1, "Иван Иванов");
const user2 = createUser(2, "Мария Петрова", true, "maria@example.com");
console.log('Users:', user1, user2);

const book1 = createBook({
    title: "Война и мир",
    author: "Лев Толстой",
    year: 1869,
    genre: "fiction"
});
const book2 = createBook({
    title: "Краткая история времени",
    author: "Стивен Хокинг",
    genre: "non-fiction"
});
console.log('Books:', book1, book2);

console.log('Circle area (radius 5):', calculateArea('circle', 5));
console.log('Square area (side 4):', calculateArea('square', 4));

console.log('Status colors:', 
    getStatusColor('active'), 
    getStatusColor('inactive'), 
    getStatusColor('new')
);

console.log('Capitalize:', capitalizeFirst("hello world"));
console.log('Trim:', trimAndTransform("  hello world  "));
console.log('Trim and uppercase:', trimAndTransform("  hello world  ", true));

const numbersArray: number[] = [10, 20, 30, 40];
const stringsArray: string[] = ["a", "b", "c"];
const emptyArray: any[] = [];
console.log('First element (numbers):', getFirstElement(numbersArray));
console.log('First element (strings):', getFirstElement(stringsArray));
console.log('First element (empty):', getFirstElement(emptyArray));

interface Person {
    id: number;
    name: string;
}

const people: Person[] = [
    { id: 1, name: "Иван" },
    { id: 2, name: "Мария" },
    { id: 3, name: "Петр" }
];

interface Product {
    id: number;
    title: string;
    price: number;
}

const products: Product[] = [
    { id: 101, title: "Ноутбук", price: 1000 },
    { id: 102, title: "Мышь", price: 25 },
    { id: 103, title: "Клавиатура", price: 75 }
];

console.log('Find person by id 2:', findById(people, 2));
console.log('Find person by id 5:', findById(people, 5));
console.log('Find product by id 103:', findById(products, 103));