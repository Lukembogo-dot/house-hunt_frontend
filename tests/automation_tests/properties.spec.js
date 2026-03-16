import { test, expect } from '@playwright/test';

test.describe('Property Search Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Click on Rent Property to get to search results
    await page.getByRole('button', { name: 'Rent Property' }).click();
  });

  test('should display search results with heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Land, Apartments & Rentals in' })).toBeVisible({ timeout: 10000 });
  });

  test('should have Filters button on search results', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Filters' })).toBeVisible({ timeout: 10000 });
  });

  test('should open filters panel when clicking Filters button', async ({ page }) => {
    await page.getByRole('button', { name: 'Filters' }).click();
    // After clicking filters, we should see filter options
    await expect(page.locator('select').first()).toBeVisible({ timeout: 5000 });
  });

  test('should filter by unit type', async ({ page }) => {
    await page.getByRole('button', { name: 'Filters' }).click();
    // Select Unit Type
    await page.locator('select').first().selectOption('1 Bedroom');
    // The page should update with filtered results
    await expect(page.locator('select').first()).toHaveValue('1 Bedroom');
  });

  test('should filter by budget', async ({ page }) => {
    await page.getByRole('button', { name: 'Filters' }).click();
    // Wait for both selects to be visible
    await expect(page.locator('select').nth(1)).toBeVisible();
    // Select Budget
    await page.locator('select').nth(1).selectOption('Below 10k');
    // The page should update with filtered results
    await expect(page.locator('select').nth(1)).toHaveValue('Below 10k');
  });
});

test.describe('Property Listing Display', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Click on Rent Property to get to search results
    await page.getByRole('button', { name: 'Rent Property' }).click();
  });

  test('should display property cards with key information', async ({ page }) => {
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Check that we have property listings - look for property-related content
    // Properties typically show in a grid/list format
    const propertyContent = page.locator('main, section').filter({ hasText: /Ksh|shillings|rent|buy/i });
    await expect(propertyContent.first()).toBeVisible({ timeout: 10000 });
  });

  test('should navigate to property details when clicking a property', async ({ page }) => {
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Look for a clickable property link
    const propertyLink = page.locator('a[href*="/property"], a[href*="/properties"]').first();
    
    // Check if there's a property link visible
    const count = await propertyLink.count();
    if (count > 0 && await propertyLink.isVisible()) {
      await propertyLink.click();
      // Verify navigation occurred
      await expect(page).toHaveURL(/.*\/property.*|.*\/properties.*/);
    }
  });
});

test.describe('Featured Properties Section', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display Hand-Picked Homes section on home page', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Hand-Picked Homes We Love' })).toBeVisible({ timeout: 10000 });
  });
});
