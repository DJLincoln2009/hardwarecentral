import { describe, it, expect } from 'vitest';
import { getAvailabilityDisplay, stripBrandPrefix } from './utils';

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
    expect(result).toEqual({ label: 'Sur commande', variant: 'on-order' });
  });

  it('returns label and variant for discontinued', () => {
    const result = getAvailabilityDisplay('discontinued');
    expect(result).toEqual({ label: 'Fin de commercialisation', variant: 'danger' });
  });
});

describe('stripBrandPrefix', () => {
  it('removes the brand prefix from the product name', () => {
    expect(
      stripBrandPrefix('HIKVISION DeepinView Camera iDS-2CD7A26G0/P-IZHS(Y)', 'HIKVISION'),
    ).toBe('DeepinView Camera iDS-2CD7A26G0/P-IZHS(Y)');
  });

  it('leaves the name untouched when brand does not prefix it', () => {
    expect(stripBrandPrefix('ProLiant DL380 Gen10 Plus', 'HPE')).toBe('ProLiant DL380 Gen10 Plus');
  });

  it('does not strip a partial match (HP vs HPE)', () => {
    expect(stripBrandPrefix('HPE Synergy 480 Gen10', 'HP')).toBe('HPE Synergy 480 Gen10');
  });
});
