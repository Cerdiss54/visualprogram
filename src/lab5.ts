export type Transform<T> = (data: T[]) => T[];

export type Where<T> = <K extends keyof T>(key: K, value: T[K]) => Transform<T>;
export type Sort<T>   = <K extends keyof T>(key: K) => Transform<T>;

export type Group<T, K extends keyof T> = {
  key: T[K];
  items: T[];
};

export type GroupBy<T> = <K extends keyof T>(key: K) => Transform<Group<T, K>>;
export type Having<T>  = <K extends keyof T>(predicate: (group: Group<T, K>) => boolean) => Transform<Group<T, K>>;

export const STAGE = {
  WHERE   : 'where' as const,
  GROUP_BY: 'groupBy' as const,
  HAVING  : 'having' as const,
  SORT    : 'sort' as const,
};

export type WhereStep   = { _stage: typeof STAGE.WHERE }    & ((...args: any[]) => any);
export type GroupByStep = { _stage: typeof STAGE.GROUP_BY } & ((...args: any[]) => any);
export type HavingStep  = { _stage: typeof STAGE.HAVING }   & ((...args: any[]) => any);
export type SortStep    = { _stage: typeof STAGE.SORT }     & ((...args: any[]) => any);

//перегрузки со строгим порядком
export function query(s1: WhereStep, s2: WhereStep, s3: GroupByStep, s4: HavingStep, s5: SortStep): Transform<any>;
export function query(s1: WhereStep, s2: GroupByStep, s3: HavingStep, s4: SortStep): Transform<any>;
export function query(s1: WhereStep, s2: GroupByStep, s3: HavingStep): Transform<any>;
export function query(s1: WhereStep, s2: GroupByStep): Transform<any>;
export function query(s1: WhereStep, s2: WhereStep, s3: SortStep): Transform<any>;
export function query(s1: WhereStep, s2: SortStep): Transform<any>;
export function query(s1: WhereStep, s2: WhereStep): Transform<any>;
export function query(s1: WhereStep): Transform<any>;
export function query(): Transform<any>;

export function query(...steps: any[]): Transform<any> {
  return (initialData: any[]) => steps.reduce((data, step) => step(data), initialData);
}

export const where = (key: string, value: any): WhereStep => {
  const fn = (data: any[]) => data.filter(item => item[key] === value);
  return Object.assign(fn, { _stage: STAGE.WHERE });
};

export const sort = (key: string): SortStep => {
  const fn = (data: any[]) =>
    [...data].sort((a, b) => (a[key] < b[key] ? -1 : a[key] > b[key] ? 1 : 0));
  return Object.assign(fn, { _stage: STAGE.SORT });
};

export const groupBy = (key: string): GroupByStep => {
  const fn = (data: any[]): Group<any, any>[] => {
    const groups = new Map<any, any[]>();
    data.forEach(item => {
      const k = item[key];
      if (!groups.has(k)) groups.set(k, []);
      groups.get(k)!.push(item);
    });
    return Array.from(groups.entries()).map(([k, v]) => ({ key: k, items: v }));
  };
  return Object.assign(fn, { _stage: STAGE.GROUP_BY });
};

export const having = (predicate: (group: any) => boolean): HavingStep => {
  const fn = (groups: any[]) => groups.filter(predicate);
  return Object.assign(fn, { _stage: STAGE.HAVING });
};

//тип дл тестов
export type User = {
  id: number;
  name: string;
  surname: string;
  age: number;
  city: string;
};