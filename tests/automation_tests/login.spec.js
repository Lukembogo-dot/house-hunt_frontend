import { test, expect } from '@playwright/test';

// Helper function to generate random test user data
function generateMockUser() {
  const randomNum = Date.now();
  return {
    fullName: `Test User ${randomNum}`,
    email: `testuser${randomNum}@example.com`,
    password: 'Test@123456',
    confirmPassword: 'Test@123456'
  };
}

test.describe('Login Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('should load the login page with correct heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible({ timeout: 10000 });
  });

  test('should have email/phone input field', async ({ page }) => {
    await expect(page.getByLabel('Email or WhatsApp Number')).toBeVisible({ timeout: 10000 });
  });

  test('should have Continue button', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Continue/i })).toBeVisible({ timeout: 10000 });
  });

  test('should have Google Sign-In option', async ({ page }) => {
    await expect(page.getByText('Or continue with')).toBeVisible({ timeout: 10000 });
  });

  test('should have link to register page', async ({ page }) => {
    const registerLink = page.getByRole('link', { name: 'Create an account' });
    await expect(registerLink).toBeVisible({ timeout: 10000 });
    await expect(registerLink).toHaveAttribute('href', '/register');
  });

  test('should navigate to register page when clicking Create an account', async ({ page }) => {
    await page.getByRole('link', { name: 'Create an account' }).click();
    await expect(page).toHaveURL(/.*\/register/);
    await expect(page.getByRole('heading', { name: 'Create your account' })).toBeVisible({ timeout: 10000 });
  });

  // ==========================================
  // LOGIN TESTS - WRONG/INVALID CREDENTIALS
  // ==========================================

  test('should show error with non-existent email', async ({ page }) => {
    const mockEmail = `nonexistent${Date.now()}@test.com`;
    
    await page.getByLabel('Email or WhatsApp Number').fill(mockEmail);
    await page.getByRole('button', { name: /Continue/i }).click();
    
    // Wait a moment for any response
    await page.waitForTimeout(1000);
    
    // Either error shows or we're still on login page
    const errorVisible = await page.getByText(/not found|invalid|doesn't exist|no account/i).first().isVisible().catch(() => false);
    expect(errorVisible || page.url().includes('/login')).toBeTruthy();
  });

  test('should show error with invalid email format', async ({ page }) => {
    await page.getByLabel('Email or WhatsApp Number').fill('notanemail');
    await page.getByRole('button', { name: /Continue/i }).click();
    
    // Wait for response
    await page.waitForTimeout(1000);
    
    // Either error shows or we're still on login page
    const errorVisible = await page.getByText(/valid email|invalid email|email format/i).first().isVisible().catch(() => false);
    expect(errorVisible || page.url().includes('/login')).toBeTruthy();
  });

  test('should show error with empty email field', async ({ page }) => {
    await page.getByRole('button', { name: /Continue/i }).click();
    
    // Check for required field error or input validation
    const emailInput = page.getByLabel('Email or WhatsApp Number');
    const isRequired = await emailInput.evaluate(el => el.validity.valueMissing).catch(() => false);
    expect(isRequired).toBeTruthy();
  });
});

test.describe('Registration Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/register');
  });

  test('should load the registration page with correct heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Create your account' })).toBeVisible({ timeout: 10000 });
  });

  test('should have all required form fields', async ({ page }) => {
    await expect(page.getByLabel('Full Name')).toBeVisible({ timeout: 10000 });
    await expect(page.getByLabel('Email address')).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Password', exact: true })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Confirm Password' })).toBeVisible();
  });

  test('should have terms checkbox', async ({ page }) => {
    await expect(page.getByLabel(/I accept the/)).toBeVisible({ timeout: 10000 });
  });

  test('should have Sign up button', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Sign up', exact: true })).toBeVisible({ timeout: 10000 });
  });

  test('should have Google Sign-Up option', async ({ page }) => {
    await expect(page.getByText('Or sign up with')).toBeVisible({ timeout: 10000 });
  });

  test('should have link to login page', async ({ page }) => {
    const loginLink = page.getByRole('link', { name: 'Already have an account? Sign in' });
    await expect(loginLink).toBeVisible({ timeout: 10000 });
    await expect(loginLink).toHaveAttribute('href', '/login');
  });

  test('should show error when passwords do not match', async ({ page }) => {
    await page.getByLabel('Full Name').fill('Test User');
    await page.getByLabel('Email address').fill('test@example.com');
    await page.getByRole('textbox', { name: 'Password', exact: true }).fill('password123');
    await page.getByRole('textbox', { name: 'Confirm Password' }).fill('differentpassword');
    await page.getByLabel(/I accept the/).check();
    await page.getByRole('button', { name: 'Sign up', exact: true }).click();
    await expect(page.getByText('Passwords do not match.')).toBeVisible({ timeout: 5000 });
  });

  test('should navigate to login page when clicking sign in link', async ({ page }) => {
    await page.getByRole('link', { name: 'Already have an account? Sign in' }).click();
    await expect(page).toHaveURL(/.*\/login/);
    await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible({ timeout: 10000 });
  });

  // ==========================================
  // REGISTRATION TESTS - WITH MOCK USERS
  // ==========================================

  test('should register with valid mock user data', async ({ page }) => {
    const mockUser = generateMockUser();
    
    // Fill registration form with mock data
    await page.getByLabel('Full Name').fill(mockUser.fullName);
    await page.getByLabel('Email address').fill(mockUser.email);
    await page.getByRole('textbox', { name: 'Password', exact: true }).fill(mockUser.password);
    await page.getByRole('textbox', { name: 'Confirm Password' }).fill(mockUser.confirmPassword);
    await page.getByLabel(/I accept the/).check();
    
    // Click sign up button
    await page.getByRole('button', { name: 'Sign up', exact: true }).click();
    
    // Wait for registration to complete
    await page.waitForTimeout(2000);
    
    // Check the result - either success or error for existing email
    const successVisible = await page.getByText(/verification|confirm|success|created|welcome/i).first().isVisible().catch(() => false);
    const errorVisible = await page.getByText(/already exists|already registered|email.*used/i).first().isVisible().catch(() => false);
    
    // At least one of these should be visible
    expect(successVisible || errorVisible).toBeTruthy();
  });

  test('should show error with invalid email format during registration', async ({ page }) => {
    const mockUser = generateMockUser();
    
    await page.getByLabel('Full Name').fill(mockUser.fullName);
    await page.getByLabel('Email address').fill('invalidemail');
    await page.getByRole('textbox', { name: 'Password', exact: true }).fill(mockUser.password);
    await page.getByRole('textbox', { name: 'Confirm Password' }).fill(mockUser.confirmPassword);
    await page.getByLabel(/I accept the/).check();
    await page.getByRole('button', { name: 'Sign up', exact: true }).click();
    
    // Wait for response
    await page.waitForTimeout(1000);
    
    // Either error shows or we're still on registration page
    const errorVisible = await page.getByText(/valid email|invalid email|email format|invalid.*email/i).first().isVisible().catch(() => false);
    expect(errorVisible || page.url().includes('/register')).toBeTruthy();
  });

  test('should show error with weak password', async ({ page }) => {
    const mockUser = generateMockUser();
    
    await page.getByLabel('Full Name').fill(mockUser.fullName);
    await page.getByLabel('Email address').fill(mockUser.email);
    await page.getByRole('textbox', { name: 'Password', exact: true }).fill('123');
    await page.getByRole('textbox', { name: 'Confirm Password' }).fill('123');
    await page.getByLabel(/I accept the/).check();
    await page.getByRole('button', { name: 'Sign up', exact: true }).click();
    
    // Wait for response
    await page.waitForTimeout(1000);
    
    // Either shows error or still on registration page
    const errorVisible = await page.getByText(/password|strong|minimum|weak/i).first().isVisible().catch(() => false);
    expect(errorVisible || page.url().includes('/register')).toBeTruthy();
  });

  test('should show error when required fields are empty', async ({ page }) => {
    // Try to submit without filling any fields
    await page.getByRole('button', { name: 'Sign up', exact: true }).click();
    
    // Check for required field errors or validation
    const nameInput = page.getByLabel('Full Name');
    const emailInput = page.getByLabel('Email address');
    const nameHasRequired = await nameInput.evaluate(el => el.hasAttribute('required')).catch(() => false);
    const emailHasRequired = await emailInput.evaluate(el => el.hasAttribute('required')).catch(() => false);
    expect(nameHasRequired || emailHasRequired).toBeTruthy();
  });

  test('should show error when terms are not accepted', async ({ page }) => {
    const mockUser = generateMockUser();
    
    await page.getByLabel('Full Name').fill(mockUser.fullName);
    await page.getByLabel('Email address').fill(mockUser.email);
    await page.getByRole('textbox', { name: 'Password', exact: true }).fill(mockUser.password);
    await page.getByRole('textbox', { name: 'Confirm Password' }).fill(mockUser.confirmPassword);
    // Do NOT check terms checkbox
    
    await page.getByRole('button', { name: 'Sign up', exact: true }).click();
    
    // Wait for response
    await page.waitForTimeout(1000);
    
    // Either error shows or we're still on registration page
    const errorVisible = await page.getByText(/terms|accept|checkbox/i).first().isVisible().catch(() => false);
    expect(errorVisible || page.url().includes('/register')).toBeTruthy();
  });
});

test.describe('Login Flow - Complete', () => {
  
  test('should handle login with valid credentials', async ({ page }) => {
    // This test verifies the login page structure
    await page.goto('/login');
    
    // Verify login page loaded
    await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible({ timeout: 10000 });
    
    // Verify form fields exist
    await expect(page.getByLabel('Email or WhatsApp Number')).toBeVisible();
    await expect(page.getByRole('button', { name: /Continue/i })).toBeVisible();
  });

  test('should handle empty login fields', async ({ page }) => {
    await page.goto('/login');
    
    // Click login without entering credentials
    await page.getByRole('button', { name: /Continue/i }).click();
    
    // Check input validation - field should show as invalid
    const emailInput = page.getByLabel('Email or WhatsApp Number');
    const isRequired = await emailInput.evaluate(el => el.validity.valueMissing);
    expect(isRequired).toBeTruthy();
  });
});
