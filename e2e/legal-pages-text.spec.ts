import { test, expect } from '@playwright/test';

const LEGAL_PAGES = ['/cgv', '/mentions-legales', '/confidentialite', '/a-propos', '/contact'];

const GLUE_REGEX = /[a-zà-ÿ]HardwareCentral\b|\bHardwareCentral[a-zà-ÿ]/i;

test.describe('Legal pages — no JSX text-concatenation regression', () => {
  for (const path of LEGAL_PAGES) {
    test(`visible text on ${path} has no letter glued to "HardwareCentral"`, async ({ page }) => {
      const response = await page.goto(path);
      expect(response?.ok()).toBeTruthy();

      const text = await page.locator('body').innerText();
      const match = text.match(GLUE_REGEX);
      expect(match, `Mot collé à "HardwareCentral" détecté : ${match?.[0] ?? ''}`).toBeNull();
    });
  }
});
