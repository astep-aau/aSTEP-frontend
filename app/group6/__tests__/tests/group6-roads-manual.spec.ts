import { test, expect } from '@playwright/test';

test('manually trigger model selection and check roads API', async ({ page }) => {
  const apiCalls: any[] = [];

  // Monitor API calls
  page.on('response', async (response) => {
    const url = response.url();
    apiCalls.push({ url, status: response.status() });

    if (url.includes('roads') || url.includes('imputation')) {
      console.log(`\n📡 ${response.status()} ${url}`);

      if (url.includes('roads')) {
        try {
          const data = await response.json();
          console.log('   Roads data:', JSON.stringify(data, null, 2));
        } catch (e) {
          console.log('   Could not parse roads response');
        }
      }
    }
  });

  console.log('\n🌐 Navigating to /group6/');
  await page.goto('http://localhost:3000/group6/');
  await page.waitForLoadState('networkidle');

  // Wait for models to load
  await page.waitForTimeout(2000);

  console.log('\n🎯 Attempting to select models programmatically...');

  // Use page.evaluate to directly interact with React state
  await page.evaluate(() => {
    // Find all clickable model items in the DOM
    const modelItems = document.querySelectorAll('.flex.items-center.gap-2.p-2.rounded');
    console.log('Found model items:', modelItems.length);

    // Click the first two model items
    if (modelItems.length >= 2) {
      (modelItems[0] as HTMLElement).click();
      setTimeout(() => {
        (modelItems[1] as HTMLElement).click();
      }, 100);
    }
  });

  console.log('\n⏳ Waiting for roads API calls...');
  await page.waitForTimeout(5000);

  // Check for roads API calls
  const roadsApiCalls = apiCalls.filter(call => call.url.includes('/roads/'));
  console.log(`\n📊 Total API calls: ${apiCalls.length}`);
  console.log(`📊 Roads API calls: ${roadsApiCalls.length}`);

  if (roadsApiCalls.length > 0) {
    console.log('\n✅ Roads API was called!');
    roadsApiCalls.forEach(call => {
      console.log(`   - ${call.status} ${call.url}`);
    });
  } else {
    console.log('\n❌ Roads API was NOT called');
    console.log('\nAll API calls:');
    apiCalls.forEach(call => {
      console.log(`   - ${call.url}`);
    });
  }

  await page.screenshot({ path: 'test-results/manual-selection.png', fullPage: true });
});

test('use browser console to trigger selection', async ({ page }) => {
  const apiCalls: string[] = [];

  page.on('response', (response) => {
    const url = response.url();
    if (url.includes('imputation')) {
      apiCalls.push(url);
      console.log(`API: ${url}`);
    }
  });

  await page.goto('http://localhost:3000/group6/');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  console.log('\n🔍 Finding model button...');

  // Click the model selector button first
  const modelButton = page.locator('button[role="combobox"]').first();
  await modelButton.click();
  console.log('✅ Clicked model button');

  await page.waitForTimeout(1000);

  // Take screenshot of dropdown
  await page.screenshot({ path: 'test-results/dropdown-open.png', fullPage: true });

  // Find and click model items using the specific structure
  const modelDivs = page.locator('div.flex.items-center.gap-2.p-2.rounded.cursor-pointer');
  const count = await modelDivs.count();
  console.log(`\n📊 Found ${count} clickable model divs`);

  if (count >= 2) {
    console.log('🎯 Clicking first model...');
    await modelDivs.nth(0).click();
    await page.waitForTimeout(500);

    console.log('🎯 Clicking second model...');
    await modelDivs.nth(1).click();
    await page.waitForTimeout(1000);

    console.log('✅ Models selected');

    // Click outside to close dropdown
    await page.click('body', { position: { x: 10, y: 10 } });
    console.log('✅ Dropdown closed');

    // Wait for roads API
    await page.waitForTimeout(3000);

    await page.screenshot({ path: 'test-results/after-selection.png', fullPage: true });
  }

  const roadsAPICalls = apiCalls.filter(url => url.includes('/roads/'));
  console.log(`\n📊 RESULTS:`);
  console.log(`   Total imputation API calls: ${apiCalls.length}`);
  console.log(`   Roads API calls: ${roadsAPICalls.length}`);

  if (roadsAPICalls.length > 0) {
    console.log('\n✅ SUCCESS - Roads API was called:');
    roadsAPICalls.forEach(url => console.log(`   ${url}`));
  } else {
    console.log('\n❌ FAILED - Roads API was not called');
  }
});
