/** Construit une URL mailto: pré-remplie (destinataire, objet, corps multi-lignes). */
export function buildMailtoUrl(to: string, subject: string, lines: string[]): string {
  const body = lines.join('\r\n');
  return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
