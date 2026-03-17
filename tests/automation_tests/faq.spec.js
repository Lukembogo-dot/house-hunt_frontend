import { test, expect } from '@playwright/test';

test.describe('FAQ Section', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/about');
    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');
  });

  test('should display FAQ section on about page', async ({ page }) => {
    // Scroll to FAQ section
    await page.getByRole('heading', { name: 'Frequently Asked Questions' }).scrollIntoViewIfNeeded();
    await expect(page.getByRole('heading', { name: 'Frequently Asked Questions' })).toBeVisible({ timeout: 10000 });
    // Check for the subtext paragraph (not a heading)
    await expect(page.getByText('Everything you need to know about HouseHunt Kenya')).toBeVisible();
  });

  test('should have FAQ questions visible', async ({ page }) => {
    // Wait for the heading to be available first
    const heading = page.getByRole('heading', { name: 'Frequently Asked Questions' });
    await heading.waitFor({ state: 'visible', timeout: 10000 });
    await heading.scrollIntoViewIfNeeded();
    
    // Check for FAQ details/summary elements - the FAQs use <details> elements
    const faqItems = page.locator('details');
    // Check if any FAQ element is visible
    const count = await faqItems.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should be able to expand FAQ question', async ({ page }) => {
    // Wait for the heading to be available first
    const heading = page.getByRole('heading', { name: 'Frequently Asked Questions' });
    await heading.waitFor({ state: 'visible', timeout: 10000 });
    await heading.scrollIntoViewIfNeeded();
    
    // Click on the first FAQ <details> element to expand it
    const firstFaq = page.locator('details').first();
    await firstFaq.click();
    
    // Verify the answer is visible (the <p> inside the expanded details)
    await expect(firstFaq.locator('p')).toBeVisible();
  });
});
