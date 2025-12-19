import { test, expect } from '@playwright/test';

test.describe('Group6 Road Selector', () => {
  test('should display roads after selecting models', async ({ page }) => {
    const apiCalls: any[] = [];

    // Monitor all API calls
    page.on('response', async (response) => {
      const url = response.url();
      if (url.includes('roads') || url.includes('model') || url.includes('imputation')) {
        console.log(`\n📡 API Response: ${url}`);
        console.log(`   Status: ${response.status()}`);

        try {
          const contentType = response.headers()['content-type'];
          if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            console.log(`   Data:`, JSON.stringify(data, null, 2).substring(0, 500));
            apiCalls.push({ url, status: response.status(), data });
          }
        } catch (e) {
          console.log(`   Could not parse response as JSON`);
        }
      }
    });

    // Navigate to the page
    console.log('\n🌐 Navigating to /group6/');
    await page.goto('http://localhost:3000/group6/');
    await page.waitForLoadState('networkidle');

    // Take initial screenshot
    await page.screenshot({ path: 'test-results/step1-initial-load.png', fullPage: true });

    // Wait for the model selector button
    console.log('\n🔍 Looking for model selector...');
    const modelButton = page.getByRole('combobox').filter({ hasText: /Choose models|selected/ });
    await expect(modelButton).toBeVisible({ timeout: 10000 });
    console.log('✅ Model selector found');

    // Click to open the model dropdown
    console.log('\n👆 Clicking model selector...');
    await modelButton.click();
    await page.waitForTimeout(1000);

    // Take screenshot of opened dropdown
    await page.screenshot({ path: 'test-results/step2-models-dropdown.png', fullPage: true });

    // Find and click the first two models
    console.log('\n🎯 Selecting first two models...');
    const modelCheckboxes = page.locator('input[type="checkbox"]').locator('visible=true');
    const checkboxCount = await modelCheckboxes.count();
    console.log(`   Found ${checkboxCount} checkboxes`);

    if (checkboxCount > 0) {
      // Select first model
      await modelCheckboxes.nth(0).click();
      console.log('   ✅ Selected model 1');
      await page.waitForTimeout(500);

      // Select second model
      if (checkboxCount > 1) {
        await modelCheckboxes.nth(1).click();
        console.log('   ✅ Selected model 2');
        await page.waitForTimeout(500);
      }
    } else {
      console.log('   ❌ No checkboxes found!');
    }

    // Close the dropdown by clicking outside
    console.log('\n👆 Closing model dropdown...');
    await page.click('body', { position: { x: 10, y: 10 } });
    await page.waitForTimeout(1000);

    // Take screenshot after selection
    await page.screenshot({ path: 'test-results/step3-models-selected.png', fullPage: true });

    // Wait for potential roads API call
    console.log('\n⏳ Waiting for roads API call...');
    await page.waitForTimeout(3000);

    // Check if roads API was called
    const roadsApiCalls = apiCalls.filter(call => call.url.includes('roads'));
    console.log(`\n📊 Roads API calls: ${roadsApiCalls.length}`);

    if (roadsApiCalls.length > 0) {
      roadsApiCalls.forEach((call, index) => {
        console.log(`\n   Roads API Call ${index + 1}:`);
        console.log(`   URL: ${call.url}`);
        console.log(`   Status: ${call.status}`);
        console.log(`   Data:`, call.data);
      });
    } else {
      console.log('   ❌ No roads API calls detected!');
    }

    // Check for road selector in the UI
    console.log('\n🔍 Looking for road selector...');

    // Try different selectors for the road selector
    const roadSelectorLabel = page.getByText('Select Road Segment', { exact: false });
    const roadSelectorButton = page.getByRole('combobox').nth(1); // Second combobox should be roads

    const hasRoadLabel = await roadSelectorLabel.isVisible().catch(() => false);
    const hasRoadButton = await roadSelectorButton.isVisible().catch(() => false);

    console.log(`   Road label visible: ${hasRoadLabel}`);
    console.log(`   Road button visible: ${hasRoadButton}`);

    if (hasRoadButton) {
      console.log('\n👆 Clicking road selector to check for options...');
      await roadSelectorButton.click();
      await page.waitForTimeout(1000);

      // Take screenshot of road dropdown
      await page.screenshot({ path: 'test-results/step4-roads-dropdown.png', fullPage: true });

      // Count road options
      const roadOptions = page.locator('[role="option"]').or(page.locator('.flex.items-center.gap-2.p-2.rounded'));
      const roadCount = await roadOptions.count();
      console.log(`   Found ${roadCount} road options`);

      if (roadCount > 0) {
        console.log('\n✅ Roads are present in the dropdown!');
        for (let i = 0; i < Math.min(roadCount, 5); i++) {
          const text = await roadOptions.nth(i).textContent();
          console.log(`   Road ${i + 1}: ${text}`);
        }
      } else {
        console.log('\n❌ No roads found in the dropdown!');

        // Check page content for debugging
        const bodyText = await page.locator('body').textContent();
        console.log('\n📄 Page content sample:', bodyText?.substring(0, 1000));
      }
    } else {
      console.log('\n❌ Road selector button not found!');
    }

    // Final screenshot
    await page.screenshot({ path: 'test-results/step5-final.png', fullPage: true });

    // Summary
    console.log('\n📊 SUMMARY:');
    console.log(`   Total API calls: ${apiCalls.length}`);
    console.log(`   Roads API calls: ${roadsApiCalls.length}`);
    console.log(`   Road selector visible: ${hasRoadButton}`);
  });

  test('should check component state and props', async ({ page }) => {
    await page.goto('http://localhost:3000/group6/');
    await page.waitForLoadState('networkidle');

    // Check if there are any error messages
    const errorText = page.getByText(/error|Error|failed|Failed/i);
    const hasError = await errorText.isVisible().catch(() => false);

    if (hasError) {
      const errorContent = await errorText.textContent();
      console.log('⚠️ Error found on page:', errorContent);
    } else {
      console.log('✅ No visible errors on page');
    }

    // Check console logs
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('🔴 Browser console error:', msg.text());
      } else if (msg.type() === 'warn') {
        console.log('🟡 Browser console warning:', msg.text());
      }
    });
  });
});
