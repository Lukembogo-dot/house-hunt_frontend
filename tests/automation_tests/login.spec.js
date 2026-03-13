import { test, expect } from '@playwright/test';

test.describe('Login Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/login');
  });

  test('should load the login page with correct heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible();
  });

  test('should have email/phone input field', async ({ page }) => {
    await expect(page.getByLabel('Email or WhatsApp Number')).toBeVisible();
  });

  test('should have Continue button', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Continue/i })).toBeVisible();
  });

  test('should have Google Sign-In option', async ({ page }) => {
    // Check for Google login button container
    await expect(page.getByText('Or continue with')).toBeVisible();
  });

  test('should have link to register page', async ({ page }) => {
    const registerLink = page.getByRole('link', { name: 'Create an account' });
    await expect(registerLink).toBeVisible();
    await expect(registerLink).toHaveAttribute('href', '/register');
  });

  test('should navigate to register page when clicking Create an account', async ({ page }) => {
    await page.getByRole('link', { name: 'Create an account' }).click();
    await expect(page).toHaveURL(/.*\/register/);
    await expect(page.getByRole('heading', { name: 'Create your account' })).toBeVisible();
  });
});

test.describe('Registration Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/register');
  });

  test('should load the registration page with correct heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Create your account' })).toBeVisible();
  });

  test('should have all required form fields', async ({ page }) => {
    await expect(page.getByLabel('Full Name')).toBeVisible();
    await expect(page.getByLabel('Email address')).toBeVisible();
    // Use getByRole with exact name to distinguish between Password and Confirm Password
    await expect(page.getByRole('textbox', { name: 'Password', exact: true })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Confirm Password' })).toBeVisible();
  });

  test('should have terms checkbox', async ({ page }) => {
    await expect(page.getByLabel(/I accept the/)).toBeVisible();
  });

  test('should have Sign up button', async ({ page }) => {
    // Use exact match to avoid matching Google Sign up button
    await expect(page.getByRole('button', { name: 'Sign up', exact: true })).toBeVisible();
  });

  test('should have Google Sign-Up option', async ({ page }) => {
    await expect(page.getByText('Or sign up with')).toBeVisible();
  });

  test('should have link to login page', async ({ page }) => {
    const loginLink = page.getByRole('link', { name: 'Already have an account? Sign in' });
    await expect(loginLink).toBeVisible();
    await expect(loginLink).toHaveAttribute('href', '/login');
  });

  test('should show error when passwords do not match', async ({ page }) => {
    await page.getByLabel('Full Name').fill('Test User');
    await page.getByLabel('Email address').fill('test@example.com');
    // Use getByRole with exact name for password fields
    await page.getByRole('textbox', { name: 'Password', exact: true }).fill('password123');
    await page.getByRole('textbox', { name: 'Confirm Password' }).fill('differentpassword');
    await page.getByLabel(/I accept the/).check();
    await page.getByRole('button', { name: 'Sign up', exact: true }).click();
    // Check for error message - the page should show the error
    await expect(page.getByText('Passwords do not match.')).toBeVisible();
  });

  test('should navigate to login page when clicking sign in link', async ({ page }) => {
    await page.getByRole('link', { name: 'Already have an account? Sign in' }).click();
    await expect(page).toHaveURL(/.*\/login/);
    await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible();
  });
});
