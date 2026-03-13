"use strict";
function createUser(id, name, isActive = true, email) {
    return {
        id,
        name,
        email,
        isActive
    };
}
// Пример использования
const user1 = createUser(1, "Иван Иванов");
const user2 = createUser(2, "Мария Петрова", true, "maria@example.com");
console.log(user1, user2);
function createBook(book) {
    return book;
}
// Пример использования
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
    // year опционально, поэтому его можно не указывать
});
console.log(book1, book2);
function calculateArea(shape, param) {
    if (shape === 'circle') {
        return Math.PI * param * param;
    }
    else {
        return param * param;
    }
}
// Пример использования
console.log(calculateArea('circle', 5)); // Площадь круга с радиусом 5
console.log(calculateArea('square', 4)); // Площадь квадрата со стороной 4
function getStatusColor(status) {
    switch (status) {
        case 'active':
            return 'green';
        case 'inactive':
            return 'gray';
        case 'new':
            return 'blue';
        default:
            // Этот случай никогда не должен произойти из-за TypeScript,
            // но добавляем для полноты
            const exhaustiveCheck = status;
            return exhaustiveCheck;
    }
}
// Пример использования
console.log(getStatusColor('active')); // green
console.log(getStatusColor('inactive')); // gray
console.log(getStatusColor('new')); // blue
const capitalizeFirst = (str) => {
    if (str.length === 0)
        return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
};
const trimAndTransform = (str, uppercase = false) => {
    const trimmed = str.trim();
    return uppercase ? trimmed.toUpperCase() : trimmed;
};
// Пример использования
console.log(capitalizeFirst("hello world")); // "Hello world"
console.log(trimAndTransform("  hello world  ")); // "hello world"
console.log(trimAndTransform("  hello world  ", true)); // "HELLO WORLD"
// ========== Задание 6 ==========
function getFirstElement(arr) {
    return arr.length > 0 ? arr[0] : undefined;
}
// Тестирование
const numbersArray = [10, 20, 30, 40];
const stringsArray = ["a", "b", "c"];
const emptyArray = [];
console.log(getFirstElement(numbersArray)); // 10
console.log(getFirstElement(stringsArray)); // "a"
console.log(getFirstElement(emptyArray)); // undefined
function findById(items, id) {
    return items.find(item => item.id === id);
}
const people = [
    { id: 1, name: "Иван" },
    { id: 2, name: "Мария" },
    { id: 3, name: "Петр" }
];
const products = [
    { id: 101, title: "Ноутбук", price: 1000 },
    { id: 102, title: "Мышь", price: 25 },
    { id: 103, title: "Клавиатура", price: 75 }
];
console.log(findById(people, 2)); // { id: 2, name: "Мария" }
console.log(findById(people, 5)); // undefined
console.log(findById(products, 103)); // { id: 103, title: "Клавиатура", price: 75 }
