import { describe, it, expect, expectTypeOf } from 'vitest';
import { where, sort, groupBy, having, query } from '../src/lab5';

describe('строгий порядок операций', () => {
  const users: any[] = [
    { id: 1, name: "John", surname: "Doe", age: 34, city: "NY" },
    { id: 2, name: "John", surname: "Doe", age: 33, city: "NY" },
    { id: 3, name: "John", surname: "Doe", age: 35, city: "LA" },
    { id: 4, name: "Mike", surname: "Doe", age: 35, city: "LA" },
  ];

  it('where + sort', () => {
    const pipeline = query(where("name", "John"), sort("age"));
    expectTypeOf(pipeline).toBeFunction();
    const result = pipeline(users);
    expectTypeOf(result).toBeArray();
    expect(result.length).toBe(3);
    expect(result[0].age).toBe(33);
  });

  it('where + groupBy + having', () => {
    const pipeline = query(
      where("surname", "Doe"),
      groupBy("city"),
      having(g => g.items.length > 1)
    );
    expectTypeOf(pipeline).toBeFunction();
    const result = pipeline(users);
    expectTypeOf(result).toBeArray();
    expect(result.length).toBe(2);
  });

  it('where + groupBy + having + sort', () => {
    const pipeline = query(
      where("surname", "Doe"),
      groupBy("city"),
      having(g => g.items.length > 1),
      sort("key")
    );
    expectTypeOf(pipeline).toBeFunction();
    const result = pipeline(users);
    expectTypeOf(result).toBeArray();
    expect(result.length).toBe(2);
  });

  it(' where + sort', () => {
    const pipeline = query(
      where("name", "John"),
      where("surname", "Doe"),
      sort("age")
    );
    expectTypeOf(pipeline).toBeFunction();
    const result = pipeline(users);
    expectTypeOf(result).toBeArray();
    expect(result).toEqual([
      { id: 2, name: "John", surname: "Doe", age: 33, city: "NY" },
      { id: 1, name: "John", surname: "Doe", age: 34, city: "NY" },
      { id: 3, name: "John", surname: "Doe", age: 35, city: "LA" },
    ]);
  });

  it('пустой query', () => {
    const pipeline = query();
    expectTypeOf(pipeline).toBeFunction();
    const result = pipeline(users);
    expectTypeOf(result).toBeArray();
    expect(result).toEqual(users);
  });

  it('sort перед where', () => {
    // @ts-expect-error
    query(sort("age"), where("name", "John"));
  });

  it('groupBy перед where', () => {
    // @ts-expect-error
    query(groupBy("city"), where("name", "John"));
  });

  it('having перед groupBy', () => {
    // @ts-expect-error
    query(having(g => g.items.length > 1), groupBy("city"));
  });

  it('sort между where и groupBy', () => {
    // @ts-expect-error
    query(where("name", "John"), sort("age"), groupBy("city"));
  });

  it('where после groupBy', () => {
    // @ts-expect-error
    query(groupBy("city"), where("name", "John"));
  });

  it('Фильтрация и сортировка', () => {
    const search = query(
      where("name", "John"),
      where("surname", "Doe"),
      sort("age")
    );
    expectTypeOf(search).toBeFunction();
    const result = search(users);
    expectTypeOf(result).toBeArray();
    expect(result).toEqual([
      { id: 2, name: "John", surname: "Doe", age: 33, city: "NY" },
      { id: 1, name: "John", surname: "Doe", age: 34, city: "NY" },
      { id: 3, name: "John", surname: "Doe", age: 35, city: "LA" },
    ]);
  });

  it('Комбинированный конвейер', () => {
    const pipeline = query(
      where("surname", "Doe"),
      groupBy("city"),
      having(g => g.items.some((u: any) => u.age > 34))
    );
    expectTypeOf(pipeline).toBeFunction();
    const result = pipeline(users);
    expectTypeOf(result).toBeArray();
    expect(result.length).toBe(1);
    expect(result[0].key).toBe("LA");
  });
});