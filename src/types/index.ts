export interface User {
    id: number;
    name: string;
    email?: string;
    isActive: boolean;
}

export interface Book {
    title: string;
    author: string;
    year?: number;
    genre: 'fiction' | 'non-fiction';
}

export type Status = 'active' | 'inactive' | 'new';

export type StringFormatter = (str: string, uppercase?: boolean) => string;

export interface HasId {
    id: number;
}