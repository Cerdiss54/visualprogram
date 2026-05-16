import React, { useState } from 'react';
import './BookCard.css';

interface BookCardProps {
    title: string;
    authors: string[];
    coverImage?: string | null;
}

const BookCard: React.FC<BookCardProps> = ({ title, authors, coverImage }) => {
    // Добавляем состояние, которое будет отслеживать ошибку загрузки картинки
    const [hasError, setHasError] = useState(false);

    return (
        <div className="book-card">
            <div className="book-cover">
                {coverImage && !hasError ? (
                    <img 
                        src={coverImage} 
                        alt={title} 
                        onError={() => setHasError(true)} // Если картинка битая, переключаем на заглушку
                    />
                ) : (
                    <div className="no-cover">Нет обложки</div>
                )}
            </div>
            <h3 className="book-title">{title}</h3>
            <p className="book-authors">{authors.join(', ')}</p>
        </div>
    );
};

export default BookCard;