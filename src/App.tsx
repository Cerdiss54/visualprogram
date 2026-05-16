import { useState, useEffect } from 'react';
import BookCard from './components/BookCard';
import { fetchBooks, fetchBookCover } from './services/api';
import { Book } from './types/book';
import './App.css';

function App() {
    const [books, setBooks] = useState<Book[]>([]);
    const [covers, setCovers] = useState<Map<number, string>>(new Map());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                setError(null);
                let booksData = await fetchBooks();
                
                if (!Array.isArray(booksData)) {
                    throw new Error('Ожидался массив книг, но API вернул данные в другом формате.');
                }
                
                booksData = booksData.slice(0, 12);
                setBooks(booksData);
                
                const coverMap = new Map<number, string>();
                
                await Promise.all(booksData.map(async (book) => {
                    const coverUrl = await fetchBookCover(book.isbn, book.title);
                    if (coverUrl) {
                        coverMap.set(book.id, coverUrl);
                    }
                }));
                
                setCovers(coverMap);
            } catch (err: any) {
                console.error("Ошибка при загрузке данных:", err);
                setError(err.message || 'Ошибка сети или обработки данных');
            } finally {
                setLoading(false);
            }
        };
        
        loadData();
    }, []);

    if (loading) {
        return <div className="loading">Загрузка...</div>;
    }

    if (error) {
        return <div className="loading" style={{ color: 'red' }}>Ошибка: {error}</div>;
    }

    return (
        <div className="app">
            <h1>Каталог книг</h1>
            <div className="books-grid">
                {books.map(book => (
                    <BookCard
                        key={book.id}
                        title={book.title}
                        authors={book.authors}
                        coverImage={covers.get(book.id)}
                    />
                ))}
            </div>
        </div>
    );
}

export default App;