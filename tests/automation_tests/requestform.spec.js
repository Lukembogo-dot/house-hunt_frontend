import { test, expect } from '@playwright/test';

test.describe('House Hunt Request Form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should have Submit Request button on home page', async ({ page }) => {
    // Look for Submit Request button in the form
    const submitButton = page.getByRole('button', { name: /Submit Request/i });
    await expect(submitButton).toBeVisible({ timeout: 10000 });
  });

  test('should have Unit Type dropdown in the form', async ({ page }) => {
    // The form should have a Unit Type dropdown
    const unitTypeSelect = page.locator('select').first();
    await expect(unitTypeSelect).toBeVisible({ timeout: 10000 });
  });

  test('should have Budget dropdown in the form', async ({ page }) => {
    // The form should have a Budget dropdown (second select)
    const budgetSelect = page.locator('select').nth(1);
    await expect(budgetSelect).toBeVisible({ timeout: 10000 });
  });

  test('should have location text field in the form', async ({ page }) => {
    // Look for the location text field with placeholder
    const locationField = page.getByRole('textbox', { name: /e\.g.*Kilimani/i });
    await expect(locationField).toBeVisible({ timeout: 10000 });
  });

  test('should be able to fill the form with valid data', async ({ page }) => {
    // Fill in the form
    await page.locator('select').first().selectOption('1 Bedroom');
    await page.locator('select').nth(1).selectOption('Below 10k');
    await page.getByRole('textbox', { name: /e\.g.*Kilimani/i }).fill('nyeri');
    
    // Verify the form was filled correctly
    await expect(page.locator('select').first()).toHaveValue('1 Bedroom');
    await expect(page.locator('select').nth(1)).toHaveValue('Below 10k');
  });
});

test.describe('House Hunt Request - Wanted Page', () => {
  test('should navigate to /wanted/post page', async ({ page }) => {
    await page.goto('/wanted/post');
    
    // Check that the page loads
    await expect(page.getByRole('heading', { name: /Let Us Do the Hunting/i })).toBeVisible({ timeout: 10000 });
  });

  test('should have request form on /wanted/post page', async ({ page }) => {
    await page.goto('/wanted/post');
    
    // Check that the form is present
    const submitButton = page.getByRole('button', { name: /Submit Request/i });
    await expect(submitButton).toBeVisible({ timeout: 10000 });
  });
});
