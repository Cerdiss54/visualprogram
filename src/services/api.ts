import { Book, GoogleBookResponse } from '../types/book';

const BOOKS_API = 'https://fakeapi.extendsclass.com/books';
const GOOGLE_BOOKS_API = 'https://www.googleapis.com/books/v1/volumes';

export async function fetchBooks(): Promise<Book[]> {
    return [
        {
            id: 1,
            title: "Гарри Поттер и философский камень",
            isbn: "9785389107033",
            pageCount: 432,
            authors: ["Дж. К. Роулинг"]
        },
        {
            id: 2,
            title: "Дюна",
            isbn: "9785170997184",
            pageCount: 704,
            authors: ["Фрэнк Герберт"]
        },
        {
            id: 3,
            title: "1984",
            isbn: "9785170997535",
            pageCount: 320,
            authors: ["Джордж Оруэлл"]
        }
    ];
}

export async function fetchBookCover(isbn: string, title: string): Promise<string | null> {
    const mockCovers: Record<string, string> = {
        "9785389107033": "https://covers.openlibrary.org/b/isbn/9780590353427-L.jpg", // Гарри Поттер
        "9785170997184": "https://covers.openlibrary.org/b/isbn/9780441172719-L.jpg", // Дюна
        "9785170997535": "https://covers.openlibrary.org/b/isbn/9780451524935-L.jpg"  // 1984
    };

    if (mockCovers[isbn]) {
        return mockCovers[isbn];
    }

    try {
        let response = await fetch(`${GOOGLE_BOOKS_API}?q=${encodeURIComponent(title)}`);
        let data: GoogleBookResponse = await response.json();

        let bookWithCover = data.items?.find((item: any) => item.volumeInfo?.imageLinks?.thumbnail);

        const imageUrl = bookWithCover?.volumeInfo?.imageLinks?.thumbnail?.replace('http:', 'https:');
        
        console.log(`Обложка для "${title}":`, imageUrl || 'Не найдена, ставим заглушку');
        
        return imageUrl || `https://placehold.co/128x192/EEE/31343C?text=No+Cover`;
    } catch (e) {
        console.error(e);
        return `https://placehold.co/128x192/EEE/31343C?text=Error`;
    }
}