export function getFirstElement<T>(arr: readonly T[]): T | undefined {
    return arr.length > 0 ? arr[0] : undefined;
}