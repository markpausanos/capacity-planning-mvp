import { test, expect } from '@playwright/test';

test.describe('Critical User Journey Smoke Test', () => {
  
  test('login → dashboard → create allocation', async ({ page }) => {
    
    // Step 1: Login with seeded user
    await test.step('Login with seeded user', async () => {
      await page.goto('/login');
      await expect(page.locator('h1')).toContainText('Sign In');
      
      // Use the seeded user credentials
      await page.fill('[data-testid="email-input"]', 'insiders@grida.co');
      await page.fill('[data-testid="password-input"]', 'password');
      await page.press('[data-testid="password-input"]', 'Enter');
      
      await expect(page).toHaveURL('/dashboard', { timeout: 10000 });
    });

    // Step 2: Verify dashboard loads
    await test.step('Verify dashboard renders', async () => {
      await expect(page.locator('h1')).toContainText('Capacity Planning');
      await expect(page.locator('text=12 Week Horizon')).toBeVisible();
    });

    // Step 3: Navigate to consultants to create test data
    await test.step('Navigate to consultants', async () => {
      await page.click('text=Data Manager');
      await expect(page).toHaveURL('/data-manager/consultants');
    });

    // Step 4: Create test consultant
    await test.step('Create test consultant', async () => {
      await page.click('button:has-text("Add Consultant")');
      
      // Wait for dialog to open - target the dialog title specifically
      await expect(page.locator('h2:has-text("Add Consultant")')).toBeVisible();
      
      // Fill consultant form (matching actual form fields)
      await page.fill('[placeholder="Enter consultant name"]', 'John Doe');
      await page.fill('[placeholder="75"]', '120');
      await page.fill('[placeholder="150"]', '180');
      await page.fill('[placeholder="40"]', '40');
      
      await page.click('button[type="submit"]');
      
      // Verify success and consultant appears
      await expect(page.locator('text=John Doe')).toBeVisible();
    });

    // Step 5: Create test client and project
    await test.step('Create test client and project', async () => {
      await page.click('text=Clients & Projects');
      
      // Add client
      await page.click('button:has-text("Add Client")');
      await expect(page.locator('h2:has-text("Add Client")')).toBeVisible();
      await page.fill('[placeholder="Enter client name"]', 'Acme Corp');
      await page.click('button[type="submit"]');
      
      // Wait a moment for client to be created
      await page.waitForTimeout(1000);
      
      // Add project
      await page.click('button:has-text("Add Project")');
      await expect(page.locator('h2:has-text("Add Project")')).toBeVisible();
      await page.fill('[placeholder="Enter project name"]', 'Website Redesign');
      
      // Wait for clients to load, then select client
      await page.waitForTimeout(1000);
      await page.click('text="Select a client"');
      // Wait for dropdown to open and select within the SelectContent
      await page.locator('[role="listbox"]').waitFor();
      await page.locator('[role="listbox"] >> text="Acme Corp"').click();
      
      // Select billing model
      await page.click('text="Select billing model"');
      await page.locator('[role="listbox"]').waitFor();
      await page.locator('[role="listbox"] >> text="Hourly"').click();
      
      await page.click('button[type="submit"]');
      
      await expect(page.locator('text=Website Redesign')).toBeVisible();
    });

    // Step 6: Create allocation
    await test.step('Create allocation', async () => {
      await page.click('text=Allocations');
      await expect(page).toHaveURL('/data-manager/allocations');
      
      await page.click('button:has-text("Add Allocation")');
      await expect(page.locator('h2:has-text("Add Allocation")')).toBeVisible();
      
      // Fill allocation form - wait for data to load
      await page.waitForTimeout(1000);
      await page.click('[data-testid="consultant-select"]');
      await page.locator('[role="listbox"]').waitFor();
      await page.locator('[role="listbox"] >> text="John Doe"').click();
      
      await page.click('[data-testid="project-select"]');
      await page.locator('[role="listbox"]').waitFor();
      await page.locator('[role="listbox"] >> text="Website Redesign (Acme Corp)"').click();
      
      // Fill date inputs and hours per week
      const today = new Date().toISOString().split('T')[0];
      const futureDate = new Date(Date.now() + 12 * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      // Use getByLabel for more reliable targeting
      await page.getByLabel('Start Date').fill(today);
      await page.getByLabel('End Date').fill(futureDate);
      await page.getByLabel('Hours/Week').fill('30');
      
      await page.click('button[type="submit"]');
      
      await expect(page.locator('text=Allocation added successfully')).toBeVisible();
    });

    // Step 7: Verify dashboard chart has data
    await test.step('Verify dashboard chart has data', async () => {
      await page.click('text=Dashboard');
      await expect(page.locator('h1')).toContainText('Capacity Planning');
      await expect(page.locator('text=12 Week Horizon')).toBeVisible();
      
      // Wait for chart to load and verify it has data (not showing empty state)
      await expect(page.locator('text=No consultant data available')).not.toBeVisible();
      await expect(page.locator('text=No valid chart data available')).not.toBeVisible();
      
      // Verify the chart container and bars are present
      await expect(page.locator('.recharts-wrapper')).toBeVisible();
      await expect(page.locator('.recharts-bar-rectangle').first()).toBeVisible();
      
      // Verify utilization legend is present
      await expect(page.locator('text=≤100%').first()).toBeVisible();
      await expect(page.locator('text=101-120%').first()).toBeVisible();
      await expect(page.locator('text=>120%').first()).toBeVisible();
    });
  });
});