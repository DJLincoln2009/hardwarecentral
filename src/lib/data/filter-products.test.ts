import { describe, it, expect } from 'vitest';
import { filterProducts } from './filter-products';

describe('filterProducts', () => {
  it('returns all products with default params', () => {
    const result = filterProducts({});
    expect(result.total).toBeGreaterThan(0);
    expect(result.page).toBe(1);
    expect(result.totalPages).toBeGreaterThan(0);
    expect(result.results.length).toBeLessThanOrEqual(12);
  });

  it('filters by category', () => {
    const result = filterProducts({ categorie: 'networking' });
    expect(result.results.every((p) => p.category === 'networking')).toBe(true);
  });

  it('filters by brand', () => {
    const result = filterProducts({ marque: 'HPE' });
    expect(result.results.every((p) => p.brand === 'HPE')).toBe(true);
  });

  it('filters by multiple brands', () => {
    const result = filterProducts({ marque: 'HPE,CISCO' });
    expect(result.results.every((p) => p.brand === 'HPE' || p.brand === 'CISCO')).toBe(true);
  });

  it('filters by chassis format', () => {
    const result = filterProducts({ format: '2U' });
    expect(result.results.every((p) => p.attributes.chassisFormat === '2U')).toBe(true);
  });

  it('filters by search query (name)', () => {
    const result = filterProducts({ q: 'ProLiant' });
    expect(result.results.every((p) => p.name.toLowerCase().includes('proliant'))).toBe(true);
  });

  it('filters by search query (SKU)', () => {
    const result = filterProducts({ q: 'P12345' });
    expect(result.results.every((p) => p.sku.toLowerCase().includes('p12345'))).toBe(true);
  });

  it('returns empty results for unmatched query', () => {
    const result = filterProducts({ q: 'XYZZYXNOTFOUND' });
    expect(result.total).toBe(0);
    expect(result.results).toHaveLength(0);
  });

  it('sorts by name ascending', () => {
    const result = filterProducts({ tri: 'name-asc', pageSize: 100 });
    const names = result.results.map((p) => p.name);
    const sorted = [...names].sort((a, b) => a.localeCompare(b));
    expect(names).toEqual(sorted);
  });

  it('sorts by availability', () => {
    const result = filterProducts({ tri: 'availability', pageSize: 100 });
    const statuses = result.results.map((p) => p.availability.status);
    const order = ['available', 'limited', 'on-order', 'discontinued'];
    for (let i = 1; i < statuses.length; i++) {
      expect(order.indexOf(statuses[i - 1])).toBeLessThanOrEqual(order.indexOf(statuses[i]));
    }
  });

  it('paginates correctly', () => {
    const page1 = filterProducts({ page: 1, pageSize: 10 });
    const page2 = filterProducts({ page: 2, pageSize: 10 });
    expect(page1.results).toHaveLength(10);
    expect(page2.results).toHaveLength(10);
    const ids1 = new Set(page1.results.map((p) => p.id));
    const ids2 = new Set(page2.results.map((p) => p.id));
    for (const id of ids1) {
      expect(ids2.has(id)).toBe(false);
    }
  });

  it('handles combined filters', () => {
    const result = filterProducts({ categorie: 'server-storage', marque: 'HPE', format: '2U' });
    expect(result.results.every((p) => p.category === 'server-storage' && p.brand === 'HPE' && p.attributes.chassisFormat === '2U')).toBe(true);
  });
});
