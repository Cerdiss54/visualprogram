import { User } from '../types';

export function createUser(id: number, name: string, isActive: boolean = true, email?: string): User {
    return {
        id,
        name,
        email,
        isActive
    };
}