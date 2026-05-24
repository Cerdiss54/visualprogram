/// <reference types="vitest" />
import { describe, it, expect, vi } from 'vitest';
import reducer, { updateCellData, undo, redo, setMatrix } from './spreadsheetSlice';
import { SpreadsheetData } from '@/types/spreadsheet';

// Мокаем внешнюю функцию recalculateTable, чтобы тестировать только логику редюсера
vi.mock('@/functions/formulaParser', () => ({
  recalculateTable: (data: any) => data,
}));

describe('spreadsheetSlice reducers', () => {
  const initialState = {
    matrixData: {},
    activeCellId: null,
    selectedRange: null,
    lastClickedCell: null,
    past: [],
    future: [],
  };

  it('должен возвращать initial state по умолчанию', () => {
    expect(reducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('должен обрабатывать updateCellData и сохранять историю (past)', () => {
    const action = updateCellData({ cellId: 'A1', entValue: '123' });
    const state = reducer(initialState, action);

    // Проверяем, что значение обновилось
    expect(state.matrixData['A1'].entValue).toBe('123');
    
    // Проверяем, что предыдущее состояние сохранилось в past
    expect(state.past.length).toBe(1);
    expect(state.past[0]).toEqual({}); // До обновления матрица была пустой
  });

  it('должен корректно отрабатывать undo (Ctrl+Z)', () => {
    // 1. Делаем изменение
    let state = reducer(initialState, updateCellData({ cellId: 'A1', entValue: '123' }));
    // 2. Делаем второе изменение
    state = reducer(state, updateCellData({ cellId: 'A1', entValue: '456' }));
    
    // До undo значение 456
    expect(state.matrixData['A1'].entValue).toBe('456');

    // 3. Вызываем undo
    state = reducer(state, undo());
    
    // Значение вернулось к 123
    expect(state.matrixData['A1'].entValue).toBe('123');
    // Отмененное действие попало в future
    expect(state.future.length).toBe(1);
    expect(state.future[0]['A1'].entValue).toBe('456');
  });

  it('должен корректно отрабатывать redo (Ctrl+Y)', () => {
    let state = reducer(initialState, updateCellData({ cellId: 'B2', entValue: 'Test' }));
    
    // Отменяем действие
    state = reducer(state, undo());
    expect(state.matrixData['B2']).toBeUndefined(); // Ячейка снова пустая

    // Повторяем действие
    state = reducer(state, redo());
    expect(state.matrixData['B2'].entValue).toBe('Test');
    expect(state.future.length).toBe(0); // Очередь future очистилась
  });

  it('должен устанавливать матрицу (setMatrix) и очищать историю', () => {
    const dummyData: SpreadsheetData = { 'C3': { id: 'C3', entValue: '5', dispValue: '5' } };
    // Допустим, у нас была какая-то история
    const stateWithHistory = { ...initialState, past: [{}], future: [{}] };
    
    const state = reducer(stateWithHistory, setMatrix(dummyData));
    expect(state.matrixData).toEqual(dummyData);
    expect(state.past.length).toBe(0);
    expect(state.future.length).toBe(0);
  });
});