export interface CellData {
  id: string;
  entValue: string;
  dispValue: string;
}

export interface SpreadsheetData {
  [cellId: string]: CellData;
}

export interface CellCoords {
  row: number;
  col: number;
}

export interface SelectedRange {
  start: CellCoords;
  end: CellCoords;
}

export interface DocumentItem {
  id: string;
  title: string;
  rows: number;
  cols: number;
  createdAt: string;
  updatedAt: string;
  matrixData: SpreadsheetData;
  userId?: string;
}
