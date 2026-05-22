export interface CellData {
    id: string;
    entValue: string;
    dispValue: string;
}

export interface CellCoords {
    row: number;
    col: number;
}

export interface SelectedRange {
    start: CellCoords;
    end: CellCoords;
}