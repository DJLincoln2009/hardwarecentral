import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const PRODUCT_SLUG = 'hpe-p24841-b21';
const PRODUCT_SKU = 'P24841-B21';

test.describe('Flow 17.1 — Découverte → Devis', () => {
  test('axe-core audit on homepage — no critical/serious violations', async ({ page }) => {
    await page.goto('/');
    const results = await new AxeBuilder({ page }).analyze();
    expect(
      results.violations.filter((v) => v.impact === 'critical' || v.impact === 'serious'),
    ).toHaveLength(0);
  });

  test('axe-core audit on product page — no critical/serious violations', async ({ page }) => {
    await page.goto(`/produit/${PRODUCT_SLUG}`);
    await page.waitForSelector('h1');
    const results = await new AxeBuilder({ page }).analyze();
    expect(
      results.violations.filter((v) => v.impact === 'critical' || v.impact === 'serious'),
    ).toHaveLength(0);
  });

  test('axe-core audit on catalogue page — no critical/serious violations', async ({ page }) => {
    await page.goto('/catalogue');
    await page.waitForSelector('[aria-label="Pagination"]');
    const results = await new AxeBuilder({ page }).analyze();
    expect(
      results.violations.filter((v) => v.impact === 'critical' || v.impact === 'serious'),
    ).toHaveLength(0);
  });

  test('axe-core audit on contact page — no critical/serious violations', async ({ page }) => {
    await page.goto('/contact');
    await page.waitForSelector('h1');
    const results = await new AxeBuilder({ page }).analyze();
    expect(
      results.violations.filter((v) => v.impact === 'critical' || v.impact === 'serious'),
    ).toHaveLength(0);
  });

  test('full flow: search → filter → product → add to quote → submit → confirmation', async ({
    page,
  }) => {
    // 1. Start at home
    await page.goto('/');
    await expect(page.locator('h1')).toBeVisible();

    // 2. Navigate to catalogue
    await page.goto('/catalogue');
    await page.waitForSelector('[aria-label="Pagination"]');

    // 3. Filter by brand HPE
    await page.goto('/catalogue?marque=HPE');
    await page.waitForSelector('[aria-label="Pagination"]');
    await expect(page.getByRole('checkbox', { name: 'HPE' })).toBeChecked();

    // 4. Open product detail
    await page.goto(`/produit/${PRODUCT_SLUG}`);
    await page.waitForSelector('h1');

    // 5. Add to quote
    await page.getByText('Ajouter au devis').first().click();
    await expect(page.getByText('Ajouté à la liste de devis')).toBeVisible();

    // 6. Go to quote list
    await page.goto('/devis');
    await page.waitForSelector('h1');
    await expect(page.getByText(PRODUCT_SKU).first()).toBeVisible();

    // 7. Submit quote request
    await page.getByRole('button', { name: /Demander un devis pour/ }).click();
    await page.waitForSelector('[role="dialog"]');
    await expect(page.getByRole('heading', { name: 'Demander un devis' })).toBeVisible();

    // Fill form
    const dialog = page.getByRole('dialog');
    await dialog.getByLabel('Nom complet *').fill('Jean Dupont');
    await dialog.getByLabel('E-mail professionnel *').fill('jean.dupont@example.com');
    await dialog.getByLabel('Téléphone').fill('+237612345678');
    await dialog.getByLabel('Société').fill('ACME SARL');
    await dialog.getByLabel('Message *').fill('Bonjour, merci de me faire une offre.');

    // Submit — le formulaire ouvre un e-mail pré-rempli via mailto:
    await page.getByText('Envoyer la demande').click();

    // 8. Verify confirmation (le client mail s'ouvre, aucune requête réseau)
    await expect(page.getByText('Demande transmise !')).toBeVisible({ timeout: 5000 });
    await expect(dialog.getByText('contact@hardware-central.com')).toBeVisible();
  });
});

test.describe('Keyboard navigation', () => {
  test('tab navigation through mega menu', async ({ page }) => {
    await page.goto('/');
    const shopButton = page.getByRole('button', { name: 'Catégories' });
    await shopButton.focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('menu')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('menu')).not.toBeVisible();
  });

  test('tab navigation through modal', async ({ page }) => {
    await page.goto(`/produit/${PRODUCT_SLUG}`);
    await page.getByText('Ajouter au devis').first().click();
    // Go to devis page
    await page.goto('/devis');
    await page.getByRole('button', { name: /Demander un devis pour/ }).click();
    await page.waitForSelector('[role="dialog"]');
    // Focus trap: Tab through form
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    // Close with Escape
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });
});
