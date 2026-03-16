import { test, expect } from '@playwright/test';

test.describe('Home Page - Hero Section', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load the home page with correct title heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Prime Land Opportunities' })).toBeVisible({ timeout: 10000 });
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
