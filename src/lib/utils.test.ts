import { describe, it, expect } from 'vitest';
import { getAvailabilityDisplay } from './utils';

describe('getAvailabilityDisplay', () => {
  it('returns label and variant for available', () => {
    const result = getAvailabilityDisplay('available');
    expect(result).toEqual({ label: 'Disponible', variant: 'success' });
  });

  it('returns label and variant for limited', () => {
    const result = getAvailabilityDisplay('limited');
    expect(result).toEqual({ label: 'Stock limité', variant: 'warning' });
  });

  it('returns label and variant for on-order', () => {
    const result = getAvailabilityDisplay('on-order');
    expect(result).toEqual({ label: 'Sur commande', variant: 'neutral' });
  });

  it('returns label and variant for discontinued', () => {
    const result = getAvailabilityDisplay('discontinued');
    expect(result).toEqual({ label: 'Fin de commercialisation', variant: 'danger' });
  });
});
