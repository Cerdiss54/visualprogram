import { SpreadsheetData } from '@/types/spreadsheet';

const getCellValueAsNumber = (cellId: string, data: SpreadsheetData): number => {
  const cell = data[cellId];
  if (!cell || !cell.dispValue) return 0;
  const num = Number(cell.dispValue);
  return isNaN(num) ? 0 : num;
};

export const evaluateCell = (entValue: string, data: SpreadsheetData): string => {
  if (!entValue.startsWith('=')) {
    return entValue;
  }

  try {
    const formula = entValue.toUpperCase().trim();

    if (formula.startsWith('=SUM(')) {
      const rangeStr = formula.replace('=SUM(', '').replace(')', '');
      const cells = parseRange(rangeStr);
      const sum = cells.reduce((acc, cellId) => acc + getCellValueAsNumber(cellId, data), 0);
      return String(sum);
    }

    if (formula.startsWith('=AVERAGE(')) {
      const rangeStr = formula.replace('=AVERAGE(', '').replace(')', '');
      const cells = parseRange(rangeStr);

      const numericValues = cells
        .map((cellId) => data[cellId]?.dispValue)
        .filter((val) => val !== undefined && val !== '' && !isNaN(Number(val)))
        .map((val) => Number(val));

      if (numericValues.length === 0) return '0';

      const sum = numericValues.reduce((acc, val) => acc + val, 0);
      return String(sum / numericValues.length);
    }

    const match = formula.match(/^=([A-Z]+\d+)\s*([\+\-\*\/])\s*([A-Z]+\d+|\d+)$/);
    if (match) {
      const [_, leftId, operator, rightPart] = match;
      const leftVal = getCellValueAsNumber(leftId, data);

      const isRightCell = /^[A-Z]+\d+$/.test(rightPart);
      const rightVal = isRightCell ? getCellValueAsNumber(rightPart, data) : Number(rightPart);

      switch (operator) {
        case '+':
          return String(leftVal + rightVal);
        case '-':
          return String(leftVal - rightVal);
        case '*':
          return String(leftVal * rightVal);
        case '/':
          return rightVal !== 0 ? String(leftVal / rightVal) : 'DIV/0!';
      }
    }

    return 'ERROR!';
  } catch (e) {
    return 'ERROR!';
  }
};

export const recalculateTable = (data: SpreadsheetData): SpreadsheetData => {
  const nextData = { ...data };
  Object.keys(nextData).forEach((cellId) => {
    nextData[cellId].dispValue = evaluateCell(nextData[cellId].entValue, nextData);
  });
  return nextData;
};

const parseRange = (rangeStr: string): string[] => {
  const [start, end] = rangeStr.split(':');
  if (!start || !end) return [];

  const startMatch = start.match(/^([A-Z]+)(\d+)$/);
  const endMatch = end.match(/^([A-Z]+)(\d+)$/);
  if (!startMatch || !endMatch) return [];

  const startColStr = startMatch[1];
  const startRow = Number(startMatch[2]);
  const endColStr = endMatch[1];
  const endRow = Number(endMatch[2]);

  const localAlphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const startColIdx = localAlphabet.indexOf(startColStr);
  const endColIdx = localAlphabet.indexOf(endColStr);

  const cellIds: string[] = [];

  for (let r = Math.min(startRow, endRow); r <= Math.max(startRow, endRow); r++) {
    for (let c = Math.min(startColIdx, endColIdx); c <= Math.max(startColIdx, endColIdx); c++) {
      cellIds.push(`${localAlphabet[c]}${r}`);
    }
  }

  return cellIds;
};
