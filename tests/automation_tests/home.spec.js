import { test, expect } from '@playwright/test';

test.describe('Home Page - Hero Section', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load the home page with hero heading', async ({ page }) => {
    // The hero has a rotating slider with two possible headings
    // Either "Land, Apartments & Rentals in Kenya" or "Prime Land Opportunities"
    const heroHeading1 = page.getByRole('heading', { name: 'Land, Apartments & Rentals in Kenya' });
    const heroHeading2 = page.getByRole('heading', { name: 'Prime Land Opportunities' });
    
    // Wait for at least one of the headings to be visible
    await expect(heroHeading1.or(heroHeading2)).toBeVisible({ timeout: 10000 });
  });

  test('should have location search textbox', async ({ page }) => {
    await expect(page.getByRole('textbox', { name: 'Enter Location...' })).toBeVisible({ timeout: 10000 });
  });

  test('should have Rent Property button', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Rent Property' })).toBeVisible({ timeout: 10000 });
  });

  test('should have Filters button', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Filters' })).toBeVisible({ timeout: 10000 });
  });

  test('should navigate to search results when clicking Rent Property', async ({ page }) => {
    await page.getByRole('button', { name: 'Rent Property' }).click();
    await expect(page.getByRole('heading', { name: 'Land, Apartments & Rentals in' })).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Home Page - Featured Properties', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display Hand-Picked Homes section', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Hand-Picked Homes We Love' })).toBeVisible({ timeout: 10000 });
  });
});
