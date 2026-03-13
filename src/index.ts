interface User {
    id: number;
    name: string;
    email?: string;
    isActive: boolean;
}

function createUser(id: number, name: string, isActive: boolean = true, email?: string): User {
    return {
        id,
        name,
        email,
        isActive
    };
}


const user1 = createUser(1, "Иван Иванов");
const user2 = createUser(2, "Мария Петрова", true, "maria@example.com");
console.log(user1, user2);

interface Book {
    title: string;
    author: string;
    year?: number;
    genre: 'fiction' | 'non-fiction';
}

function createBook(book: Book): Book {
    return book;
}

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

console.log(book1, book2);

function calculateArea(shape: 'circle', radius: number): number;
function calculateArea(shape: 'square', side: number): number;
function calculateArea(shape: 'circle' | 'square', param: number): number {
    if (shape === 'circle') {
        return Math.PI * param * param;
    } else {
        return param * param;
    }
}

console.log(calculateArea('circle', 5)); 
console.log(calculateArea('square', 4)); 

type Status = 'active' | 'inactive' | 'new';

function getStatusColor(status: Status): string {
    switch(status) {
        case 'active':
            return 'green';
        case 'inactive':
            return 'gray';
        case 'new':
            return 'blue';
        default:
            const exhaustiveCheck: never = status;
            return exhaustiveCheck;
    }
}

console.log(getStatusColor('active'));   
console.log(getStatusColor('inactive')); 
console.log(getStatusColor('new'));     

type StringFormatter = (str: string, uppercase?: boolean) => string;

const capitalizeFirst: StringFormatter = (str: string): string => {
    if (str.length === 0) return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
};

const trimAndTransform: StringFormatter = (str: string, uppercase: boolean = false): string => {
    const trimmed = str.trim();
    return uppercase ? trimmed.toUpperCase() : trimmed;
};

console.log(capitalizeFirst("hello world"));        
console.log(trimAndTransform("  hello world  "));   
console.log(trimAndTransform("  hello world  ", true));

function getFirstElement<T>(arr: T[]): T | undefined {
    return arr.length > 0 ? arr[0] : undefined;
}

const numbersArray: number[] = [10, 20, 30, 40];
const stringsArray: string[] = ["a", "b", "c"];
const emptyArray: any[] = [];

console.log(getFirstElement(numbersArray)); 
console.log(getFirstElement(stringsArray)); 
console.log(getFirstElement(emptyArray));   

interface HasId {
    id: number;
}

function findById<T extends HasId>(items: T[], id: number): T | undefined {
    return items.find(item => item.id === id);
}

interface Person extends HasId {
    name: string;
}

const people: Person[] = [
    { id: 1, name: "Иван" },
    { id: 2, name: "Мария" },
    { id: 3, name: "Петр" }
];

interface Product extends HasId {
    title: string;
    price: number;
}

const products: Product[] = [
    { id: 101, title: "Ноутбук", price: 1000 },
    { id: 102, title: "Мышь", price: 25 },
    { id: 103, title: "Клавиатура", price: 75 }
];

console.log(findById(people, 2));    
console.log(findById(people, 5));    
console.log(findById(products, 103)); 