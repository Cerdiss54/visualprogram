import { describe, it, expect } from 'vitest';
import { where, sort, groupBy, having, query } from '../src/lab4';

describe('lab4', () => {
  const users = [
    { id: 1, name: "John", surname: "Doe", age: 34, city: "NY" },
    { id: 2, name: "John", surname: "Doe", age: 33, city: "NY" },
    { id: 3, name: "John", surname: "Doe", age: 35, city: "LA" },
    { id: 4, name: "Mike", surname: "Doe", age: 35, city: "LA" },
  ];

  it('where filter by name', () => {
    const result = where("name", "John")(users);
    expect(result.length).toBe(3);
    expect(result[0].name).toBe("John");
  });

  it('where filter by city', () => {
    const result = where("city", "NY")(users);
    expect(result.length).toBe(2);
    expect(result[0].city).toBe("NY");
  });

  it('where filter by age', () => {
    const result = where("age", 35)(users);
    expect(result.length).toBe(2);
    expect(result[0].age).toBe(35);
  });

  it('sort by age', () => {
    const result = sort("age")(users);
    expect(result[0].age).toBe(33);
    expect(result[1].age).toBe(34);
    expect(result[2].age).toBe(35);
    expect(result[3].age).toBe(35);
  });

  it('group by city', () => {
    const result = groupBy("city")(users);
    expect(result.length).toBe(2);
    
    const nyGroup = result.find(g => g.key === "NY");
    expect(nyGroup).toBeDefined();
    expect(nyGroup?.items.length).toBe(2);
    
    const laGroup = result.find(g => g.key === "LA");
    expect(laGroup).toBeDefined();
    expect(laGroup?.items.length).toBe(2);
  });

  it('having filter groups', () => {
    const groups = groupBy("city")(users);
    const result = having((g: any) => g.items.length > 1)(groups);
    expect(result.length).toBe(2);
  });

  it('query example 1 - filter and sort', () => {
    const pipeline = query(
      where("name", "John"),
      where("surname", "Doe"),
      sort("age")
    );
    
    const result = pipeline(users);
    expect(result.length).toBe(3);
    expect(result[0].age).toBe(33);
    expect(result[1].age).toBe(34);
    expect(result[2].age).toBe(35);
  });

  it('query example 2 - group and having', () => {
    const pipeline = query(
      groupBy("city"),
      having((g: any) => g.items.length > 1)
    );
    
    const result = pipeline(users);
    expect(result.length).toBe(2);
  });

  it('query example 3 - combined', () => {
    const pipeline = query(
      where("surname", "Doe"),
      groupBy("city"),
      having((g: any) => g.items.some((u: any) => u.age > 34))
    );
    
    const result = pipeline(users);
    expect(result.length).toBe(1);
    expect(result[0].key).toBe("LA");
  });
});