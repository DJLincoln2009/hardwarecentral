import { describe, expect, it } from 'vitest';
import { buildMailtoUrl } from './mailto';

describe('buildMailtoUrl', () => {
  it('encode le destinataire, l’objet et le corps', () => {
    const url = buildMailtoUrl('contact@example.com', 'Demande de devis — Jean Dupont', [
      'Nom : Jean Dupont',
      'SKU : P24841-B21 × 2',
    ]);

    expect(url.startsWith('mailto:contact@example.com?')).toBe(true);
    const params = new URLSearchParams(url.slice(url.indexOf('?') + 1));
    expect(params.get('subject')).toBe('Demande de devis — Jean Dupont');
    expect(params.get('body')).toBe('Nom : Jean Dupont\r\nSKU : P24841-B21 × 2');
  });

  it('produit un corps multi-lignes valide', () => {
    const url = buildMailtoUrl('contact@example.com', 'Sujet', ['Ligne 1', '', 'Ligne 2']);
    const params = new URLSearchParams(url.slice(url.indexOf('?') + 1));
    expect(params.get('body')?.split('\r\n')).toEqual(['Ligne 1', '', 'Ligne 2']);
  });
});
