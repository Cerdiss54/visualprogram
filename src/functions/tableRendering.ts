import { SpreadsheetData } from '../types/spreadsheet';

export const createEmptyData = (rows: number, cols: number, alphabet: string[]): SpreadsheetData => {
  const empty: SpreadsheetData = {};

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < Math.min(cols, alphabet.length); j++) {
      const id = alphabet[j] + (i + 1);
      empty[id] = { id: id, entValue: '', dispValue: '' };
    }
  }

  return empty;
};
