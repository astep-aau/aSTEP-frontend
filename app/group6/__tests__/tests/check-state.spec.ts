import { test } from '@playwright/test';

test('check actual component state', async ({ page }) => {
  // Enable verbose console logging
  page.on('console', msg => {
    console.log(`Browser: ${msg.text()}`);
  });

  await page.goto('http://localhost:3000/group6/');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);

  // Check what models are actually loaded
  const state = await page.evaluate(() => {
    // Try to find React component state
    const buttons = Array.from(document.querySelectorAll('button[role="combobox"]'));
    return {
      modelButton: buttons[0]?.textContent,
      roadButton: buttons[1]?.textContent,
      bodyText: document.body.textContent?.substring(0, 500)
    };
  });

  console.log('\n📊 Component State:');
  console.log('  Model button:', state.modelButton);
  console.log('  Road button:', state.roadButton);
  console.log('  Page text sample:', state.bodyText);

  // Check browser console for any errors
  const errors: string[] = [];
  page.on('pageerror', error => {
    errors.push(error.message);
    console.log(`❌ Page error: ${error.message}`);
  });

  await page.waitForTimeout(2000);

  if (errors.length > 0) {
    console.log('\n❌ JavaScript Errors Found:');
    errors.forEach(err => console.log(`  - ${err}`));
  } else {
    console.log('\n✅ No JavaScript errors');
  }

  // Try to manually trigger model selection
  console.log('\n🧪 Testing manual model selection...');

  await page.evaluate(() => {
    console.log('[Test] Checking for model data...');

    // Look for all checkboxes
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    console.log(`[Test] Found ${checkboxes.length} checkboxes`);

    // Look for model items
    const modelItems = document.querySelectorAll('[role="option"], .cursor-pointer');
    console.log(`[Test] Found ${modelItems.length} clickable items`);

    return {
      checkboxCount: checkboxes.length,
      clickableCount: modelItems.length
    };
  });

  await page.waitForTimeout(2000);
});
