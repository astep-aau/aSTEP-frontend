import { test } from '@playwright/test';

test('debug TimeIntervalSelector visibility', async ({ page }) => {
  const apiCalls: any[] = [];

  // Monitor API calls
  page.on('response', async (response) => {
    const url = response.url();

    if (url.includes('imputation') || url.includes('time-interval')) {
      console.log(`\n📡 ${response.status()} ${url}`);

      if (url.includes('time-interval')) {
        try {
          const data = await response.json();
          console.log('   Time Interval Response:', JSON.stringify(data, null, 2));
          apiCalls.push({ url, status: response.status(), data });
        } catch (e) {
          const text = await response.text();
          console.log('   Response:', text);
          apiCalls.push({ url, status: response.status(), error: text });
        }
      }
    }
  });

  console.log('\n🌐 Navigating to /group6/');
  await page.goto('http://localhost:3000/group6/');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  console.log('\n🎯 Step 1: Open model dropdown and select models...');
  const modelButton = page.locator('button[role="combobox"]').first();
  await modelButton.click();
  await page.waitForTimeout(1000);

  const modelDivs = page.locator('div.flex.items-center.gap-2.p-2.rounded.cursor-pointer');
  const modelCount = await modelDivs.count();
  console.log(`   Found ${modelCount} models`);

  if (modelCount >= 1) {
    console.log('   Selecting first model...');
    await modelDivs.nth(0).click();
    await page.waitForTimeout(500);

    console.log('   Selecting second model...');
    if (modelCount >= 2) {
      await modelDivs.nth(1).click();
      await page.waitForTimeout(500);
    }

    // Close dropdown
    await page.click('body', { position: { x: 10, y: 10 } });
    console.log('   ✅ Models selected');
  }

  await page.screenshot({ path: 'test-results/step1-models-selected.png', fullPage: true });

  console.log('\n⏳ Waiting for roads API...');
  await page.waitForTimeout(3000);

  // Check if roads selector is visible
  const roadButton = page.locator('button[role="combobox"]').nth(1);
  const roadButtonVisible = await roadButton.isVisible().catch(() => false);
  console.log(`   Road selector visible: ${roadButtonVisible}`);

  if (roadButtonVisible) {
    console.log('\n🎯 Step 2: Selecting a road...');
    await roadButton.click();
    await page.waitForTimeout(1000);

    // Find road options
    const roadDivs = page.locator('div.flex.items-center.gap-2.p-2.rounded.cursor-pointer');
    const roadCount = await roadDivs.count();
    console.log(`   Found ${roadCount} roads`);

    if (roadCount > 0) {
      console.log('   Selecting first road...');
      await roadDivs.nth(0).click();
      await page.waitForTimeout(1000);
      console.log('   ✅ Road selected');

      await page.screenshot({ path: 'test-results/step2-road-selected.png', fullPage: true });

      console.log('\n⏳ Waiting for time interval API...');
      await page.waitForTimeout(5000);
    }
  } else {
    console.log('   ❌ Road selector not visible - skipping road selection');
  }

  // Check for TimeIntervalSelector
  console.log('\n🔍 Checking for TimeIntervalSelector...');

  // Look for time interval related elements
  const timeIntervalLabel = page.getByText(/time interval|time range/i);
  const hasTimeIntervalLabel = await timeIntervalLabel.isVisible().catch(() => false);
  console.log(`   Time interval label visible: ${hasTimeIntervalLabel}`);

  // Check for any date pickers or time selectors
  const datePickers = page.locator('input[type="date"], input[type="datetime-local"]');
  const datePickerCount = await datePickers.count();
  console.log(`   Date picker inputs found: ${datePickerCount}`);

  // Take final screenshot
  await page.screenshot({ path: 'test-results/step3-final.png', fullPage: true });

  // Analyze API calls
  console.log('\n📊 SUMMARY:');
  console.log(`   Total time-interval API calls: ${apiCalls.length}`);

  if (apiCalls.length > 0) {
    apiCalls.forEach((call, i) => {
      console.log(`\n   Call ${i + 1}:`);
      console.log(`   URL: ${call.url}`);
      console.log(`   Status: ${call.status}`);
      if (call.data) {
        console.log(`   Data:`, call.data);
      }
      if (call.error) {
        console.log(`   Error:`, call.error);
      }
    });
  } else {
    console.log('\n   ❌ No time-interval API calls made!');
    console.log('   This could mean:');
    console.log('   1. No models were selected');
    console.log('   2. No road was selected');
    console.log('   3. The useEffect for time intervals is not triggering');
  }

  console.log(`\n   TimeIntervalSelector visible: ${hasTimeIntervalLabel}`);
});
