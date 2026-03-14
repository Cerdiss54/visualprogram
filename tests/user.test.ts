import { describe, it, expect } from 'vitest';
import { createUser } from '../src/functions/user';

describe('createUser', () => {
    it('should create user with required fields only', () => {
        const user = createUser(1, 'Иван Иванов');
        
        expect(user).toEqual({
            id: 1,
            name: 'Иван Иванов',
            isActive: true
        });
        expect(user.email).toBeUndefined();
    });

    it('should create user with all fields', () => {
        const user = createUser(2, 'Мария Петрова', true, 'maria@example.com');
        
        expect(user).toEqual({
            id: 2,
            name: 'Мария Петрова',
            email: 'maria@example.com',
            isActive: true
        });
    });

    it('should create inactive user', () => {
        const user = createUser(3, 'Петр Сидоров', false);
        
        expect(user.isActive).toBe(false);
        expect(user.email).toBeUndefined();
    });

    it('should handle email as optional parameter', () => {
        const userWithoutEmail = createUser(4, 'Анна Иванова');
        const userWithEmail = createUser(5, 'Анна Иванова', true, 'anna@example.com');
        
        expect(userWithoutEmail.email).toBeUndefined();
        expect(userWithEmail.email).toBe('anna@example.com');
    });

    it('should preserve all fields correctly', () => {
        const user = createUser(6, 'Тест Тестов', false, 'test@example.com');
        
        expect(user.id).toBe(6);
        expect(user.name).toBe('Тест Тестов');
        expect(user.isActive).toBe(false);
        expect(user.email).toBe('test@example.com');
    });
});