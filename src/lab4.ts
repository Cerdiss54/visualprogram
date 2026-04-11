export type Transform<T> = (data: T[]) => T[];

export type Where<T> = <K extends keyof T>(
  key: K,
  value: T[K]
) => Transform<T>;

export type Sort<T> = <K extends keyof T>(
  key: K
) => Transform<T>;

export type Group<T, K extends keyof T> = {
  key: T[K];
  items: T[];
};

export type GroupBy<T> = <K extends keyof T>(
  key: K
) => Transform<Group<T, K>>;

export type Having<T> = <K extends keyof T>(
  predicate: (group: Group<T, K>) => boolean
) => Transform<Group<T, K>>;



export const where = (key: string, value: any) => {
  return (data: any[]) => {
    return data.filter((item: any) => item[key] === value);
  };
};

export const sort = (key: string) => {
  return (data: any[]) => {
    return [...data].sort((a: any, b: any) => {
      if (a[key] < b[key]) return -1;
      if (a[key] > b[key]) return 1;
      return 0;
    });
  };
};

export const groupBy = (key: string) => {
  return (data: any[]) => {
    const groups: Record<string, any[]> = {};
    
    data.forEach((item: any) => {
      const groupKey = String(item[key]);
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(item);
    });
    
    return Object.keys(groups).map(k => ({
      key: k,
      items: groups[k]
    }));
  };
};

export const having = (predicate: (group: any) => boolean) => {
  return (groups: any[]) => {
    return groups.filter(predicate);
  };
};

export const query = (...steps: any[]) => {
  return (initialData: any[]) => {
    return steps.reduce((data, step) => step(data), initialData);
  };
};

export type User = {
  id: number;
  name: string;
  surname: string;
  age: number;
  city: string;
};