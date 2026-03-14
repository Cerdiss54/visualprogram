import { StringFormatter } from '../types';

export const capitalizeFirst: StringFormatter = (str: string): string => {
    if (str.length === 0) return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
};

export const trimAndTransform: StringFormatter = (str: string, uppercase: boolean = false): string => {
    const trimmed = str.trim();
    return uppercase ? trimmed.toUpperCase() : trimmed;
};
