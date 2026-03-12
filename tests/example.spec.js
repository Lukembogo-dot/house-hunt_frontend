import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  await page.getByRole('heading', { name: 'Prime Land Opportunities' }).click();
  await page.getByRole('textbox', { name: 'Enter Location...' }).click();
  await page.getByRole('button', { name: 'Rent Property' }).click();
  await page.getByRole('button', { name: 'Intel' }).click();
  await page.getByRole('button', { name: 'Filters' }).click();
  await page.getByRole('heading', { name: 'Land, Apartments & Rentals in' }).click();
  await page.locator('.relative.bg-white\\/80').first().click();
  await page.getByText('Live StatsReal-time activity trackingTotal2495Fulfilled2445Join the').click();
  // Fill the form BEFORE clicking Submit Request - use locators for native select elements
  // The form has Unit Type and Budget dropdowns that are native <select> elements
  await page.locator('select').first().selectOption('1 Bedroom'); // Unit Type
  await page.locator('select').nth(1).selectOption('Below 10k'); // Budget
  await page.getByRole('textbox', { name: 'e.g Kilimani, Westlands,' }).click();
  await page.getByRole('textbox', { name: 'e.g Kilimani, Westlands,' }).fill('nyeri');
  await page.getByRole('textbox', { name: 'e.g Kilimani, Westlands,' }).click();
  await page.getByRole('textbox', { name: 'e.g Kilimani, Westlands,' }).dblclick();
  await page.locator('.overflow-hidden.px-4 > div > div:nth-child(3)').click();
  await page.getByText('Grand View EstateKamanguFor saleKsh 1,500,000AMCCO PROPERTIES0.').click();
  await page.getByRole('heading', { name: 'Hand-Picked Homes We Love' }).click();
});
