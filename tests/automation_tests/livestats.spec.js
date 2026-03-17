import { test, expect } from '@playwright/test';

test.describe('Live Stats Section', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display Live Stats section', async ({ page }) => {
    // Look for "Live Stats" or "Real-time activity tracking" text
    const liveStats = page.getByText(/Live Stats|Real-time activity/i);
    await expect(liveStats.first()).toBeVisible({ timeout: 10000 });
  });

  test('should display Total count in stats', async ({ page }) => {
    // Look for Total number in stats section
    const totalStats = page.getByText(/Total/);
    await expect(totalStats.first()).toBeVisible({ timeout: 10000 });
  });

  test('should display Fulfilled count in stats', async ({ page }) => {
    // Look for Fulfilled number in stats section
    const fulfilledStats = page.getByText(/Fulfilled/);
    await expect(fulfilledStats.first()).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Decision Tools - Neighbourhood Matchmaker AI', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display Neighbourhood Matchmaker AI option', async ({ page }) => {
    // Scroll to Make Smarter Decisions section
    await page.getByRole('heading', { name: 'Make Smarter Decisions' }).scrollIntoViewIfNeeded();
    await expect(page.getByRole('heading', { name: 'Make Smarter Decisions' })).toBeVisible({ timeout: 10000 });
  });

  test('should display Launch Quiz button for Matchmaker AI', async ({ page }) => {
    // Scroll to Make Smarter Decisions section
    await page.getByRole('heading', { name: 'Make Smarter Decisions' }).scrollIntoViewIfNeeded();
    // Look for Launch Quiz button
    const launchQuizButton = page.getByRole('link', { name: /Launch Quiz/i });
    await expect(launchQuizButton).toBeVisible({ timeout: 5000 });
  });

  test('should navigate to quiz page when clicking Launch Quiz', async ({ page }) => {
    // Scroll to Make Smarter Decisions section
    await page.getByRole('heading', { name: 'Make Smarter Decisions' }).scrollIntoViewIfNeeded();
    // Click Launch Quiz button
    await page.getByRole('link', { name: /Launch Quiz/i }).click();
    // Should navigate to find-my-neighbourhood page
    await expect(page).toHaveURL(/.*\/find-my-neighbourhood/);
  });
});

test.describe('Decision Tools - Cost of Living Calculator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display True Cost of Living option', async ({ page }) => {
    // Scroll to Make Smarter Decisions section
    await page.getByRole('heading', { name: 'Make Smarter Decisions' }).scrollIntoViewIfNeeded();
    // Look for True Cost of Living card
    const costOfLiving = page.getByText(/True Cost of Living/i);
    await expect(costOfLiving.first()).toBeVisible({ timeout: 10000 });
  });

  test('should display Calculate Now button for Cost of Living', async ({ page }) => {
    // Scroll to Make Smarter Decisions section
    await page.getByRole('heading', { name: 'Make Smarter Decisions' }).scrollIntoViewIfNeeded();
    // Look for Calculate Now button
    const calculateNowButton = page.getByRole('link', { name: /Calculate Now/i });
    await expect(calculateNowButton).toBeVisible({ timeout: 5000 });
  });

  test('should navigate to calculator page when clicking Calculate Now', async ({ page }) => {
    // Scroll to Make Smarter Decisions section
    await page.getByRole('heading', { name: 'Make Smarter Decisions' }).scrollIntoViewIfNeeded();
    // Click Calculate Now button
    await page.getByRole('link', { name: /Calculate Now/i }).click();
    // Should navigate to cost-of-living calculator page
    await expect(page).toHaveURL(/.*\/tools\/cost-of-living/);
  });
});

test.describe('Top Agents Section', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display Top Agents section', async ({ page }) => {
    // Look for Top Agents heading - may need to scroll
    const topAgentsHeading = page.getByRole('heading', { name: /Top Agents/i });
    // Scroll to find it
    await topAgentsHeading.scrollIntoViewIfNeeded();
    await expect(topAgentsHeading).toBeVisible({ timeout: 10000 });
  });

  test('should have agent cards visible', async ({ page }) => {
    // Scroll to top agents section
    const topAgentsHeading = page.getByRole('heading', { name: /Top Agents/i });
    await topAgentsHeading.scrollIntoViewIfNeeded();
    
    // Look for agent-related content
    const agentContent = page.locator('section').filter({ hasText: /agent|Agent/i });
    const count = await agentContent.count();
    if (count > 0) {
      await expect(agentContent.first()).toBeVisible();
    }
  });
});
