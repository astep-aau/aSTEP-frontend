import { test, expect } from '@playwright/test';

test.describe('Group6 Model Dropdown', () => {
  test('should display models in the dropdown', async ({ page }) => {
    // Navigate to the Group6 page
    await page.goto('http://localhost:3000/group6/');

    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // Find the model selector button (it has role="combobox")
    const modelButton = page.getByRole('combobox').filter({ hasText: /Choose models|selected/ });

    // Check if the button is visible
    await expect(modelButton).toBeVisible({ timeout: 10000 });

    console.log('Model button found and visible');

    // Take a screenshot before opening
    await page.screenshot({ path: 'before-click.png', fullPage: true });

    // Click to open the dropdown
    await modelButton.click();

    // Wait a bit for the dropdown to open
    await page.waitForTimeout(1000);

    // Take a screenshot after opening
    await page.screenshot({ path: 'after-click.png', fullPage: true });

    // Check if the popover content is visible
    const popoverContent = page.locator('[role="dialog"]').or(page.locator('.p-2.space-y-1'));

    // Look for model items in the dropdown
    // They should have checkboxes and model type names
    const modelItems = page.locator('.flex.items-center.gap-2.p-2.rounded');

    // Count how many model items are visible
    const count = await modelItems.count();
    console.log(`Found ${count} model items in the dropdown`);

    // Check if any models are present
    if (count === 0) {
      console.log('❌ NO MODELS FOUND IN DROPDOWN');

      // Let's check what's actually in the popover
      const popoverText = await page.locator('body').textContent();
      console.log('Page content:', popoverText?.substring(0, 500));

      // Check if there's an error or loading state
      const loadingIndicator = page.getByText(/loading|Loading/i);
      const errorMessage = page.getByText(/error|Error/i);

      if (await loadingIndicator.isVisible().catch(() => false)) {
        console.log('⚠️ Loading indicator is visible');
      }

      if (await errorMessage.isVisible().catch(() => false)) {
        console.log('⚠️ Error message is visible');
      }
    } else {
      console.log(`✅ Found ${count} models in the dropdown`);

      // Log details of each model
      for (let i = 0; i < count; i++) {
        const modelItem = modelItems.nth(i);
        const text = await modelItem.textContent();
        console.log(`Model ${i + 1}:`, text);
      }
    }

    // Assert that at least one model is visible
    expect(count).toBeGreaterThan(0);
  });

  test('should show model details when dropdown is opened', async ({ page }) => {
    await page.goto('http://localhost:3000/group6/');
    await page.waitForLoadState('networkidle');

    const modelButton = page.getByRole('combobox').filter({ hasText: /Choose models|selected/ });
    await modelButton.click();
    await page.waitForTimeout(1000);

    // Check for model type names
    const modelTypeText = page.locator('.font-medium.text-sm');
    const modelTypeCount = await modelTypeText.count();

    console.log(`Found ${modelTypeCount} model type labels`);

    // Check for metrics
    const metricsText = page.locator('.text-xs.text-muted-foreground');
    const metricsCount = await metricsText.count();

    console.log(`Found ${metricsCount} metric labels`);

    expect(modelTypeCount).toBeGreaterThan(0);
  });

  test('should check API response for models', async ({ page }) => {
    // Listen for API calls
    const modelRequests: any[] = [];

    page.on('response', async (response) => {
      const url = response.url();
      if (url.includes('model') || url.includes('imputation')) {
        console.log(`API Response: ${url}`);
        console.log(`Status: ${response.status()}`);

        try {
          const data = await response.json();
          console.log('Response data:', JSON.stringify(data, null, 2));
          modelRequests.push({ url, status: response.status(), data });
        } catch (e) {
          console.log('Could not parse response as JSON');
        }
      }
    });

    await page.goto('http://localhost:3000/group6/');
    await page.waitForLoadState('networkidle');

    // Wait a bit more for any async API calls
    await page.waitForTimeout(3000);

    console.log(`\nTotal model-related API requests: ${modelRequests.length}`);

    if (modelRequests.length === 0) {
      console.log('⚠️ No model-related API requests detected!');
    }
  });
});
