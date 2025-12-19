import { test } from '@playwright/test';

test('debug time intervals - check modelId parameter', async ({ page }) => {
  let timeIntervalCalls: any[] = [];

  // Monitor console logs from the browser
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('fetchTimeInterval') || text.includes('time-interval')) {
      console.log(`🔍 Browser console: ${text}`);
    }
  });

  // Monitor API calls
  page.on('request', request => {
    const url = request.url();
    if (url.includes('time-interval')) {
      console.log(`\n📤 REQUEST: ${url}`);
      timeIntervalCalls.push({ url, method: request.method() });
    }
  });

  page.on('response', async (response) => {
    const url = response.url();
    if (url.includes('time-interval')) {
      console.log(`📥 RESPONSE: ${url}`);
      console.log(`   Status: ${response.status()}`);

      try {
        const data = await response.json();
        console.log(`   Data:`, JSON.stringify(data, null, 2));
      } catch (e) {
        const text = await response.text();
        console.log(`   Response:`, text);
      }
    }
  });

  console.log('\n🌐 Step 1: Navigate to page');
  await page.goto('http://localhost:3000/group6/');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  console.log('\n🎯 Step 2: Select models');
  const modelButton = page.locator('button[role="combobox"]').first();
  const modelButtonText = await modelButton.textContent();
  console.log(`   Model button text: "${modelButtonText}"`);

  await modelButton.click();
  await page.waitForTimeout(1000);

  // Select models
  const modelDivs = page.locator('div.flex.items-center.gap-2.p-2.rounded.cursor-pointer');
  const modelCount = await modelDivs.count();
  console.log(`   Found ${modelCount} model options`);

  if (modelCount >= 2) {
    console.log('   Selecting first model...');
    const firstModelText = await modelDivs.nth(0).textContent();
    console.log(`   First model: ${firstModelText}`);
    await modelDivs.nth(0).click();
    await page.waitForTimeout(500);

    console.log('   Selecting second model...');
    const secondModelText = await modelDivs.nth(1).textContent();
    console.log(`   Second model: ${secondModelText}`);
    await modelDivs.nth(1).click();
    await page.waitForTimeout(500);

    // Close dropdown
    await page.click('body', { position: { x: 10, y: 10 } });
    console.log('   ✅ Models selected, dropdown closed');
  }

  await page.screenshot({ path: 'test-results/debug-ti-step2.png', fullPage: true });

  console.log('\n⏳ Step 3: Wait for roads API');
  await page.waitForTimeout(3000);

  console.log('\n🎯 Step 4: Select a road');
  const roadButton = page.locator('button[role="combobox"]').nth(1);
  const roadButtonVisible = await roadButton.isVisible().catch(() => false);

  if (roadButtonVisible) {
    const roadButtonText = await roadButton.textContent();
    console.log(`   Road button text: "${roadButtonText}"`);

    await roadButton.click();
    await page.waitForTimeout(1000);

    const roadDivs = page.locator('div.flex.items-center.gap-2.p-2.rounded.cursor-pointer');
    const roadCount = await roadDivs.count();
    console.log(`   Found ${roadCount} road options`);

    if (roadCount > 0) {
      const firstRoadText = await roadDivs.nth(0).textContent();
      console.log(`   Selecting first road: ${firstRoadText}`);
      await roadDivs.nth(0).click();
      await page.waitForTimeout(1000);
      console.log('   ✅ Road selected');

      await page.screenshot({ path: 'test-results/debug-ti-step4.png', fullPage: true });

      console.log('\n⏳ Step 5: Waiting for time interval API calls...');
      await page.waitForTimeout(5000);
    } else {
      console.log('   ❌ No road options found');
    }
  } else {
    console.log('   ❌ Road selector not visible');
  }

  // Final analysis
  console.log('\n📊 ANALYSIS:');
  console.log(`   Total time-interval API calls: ${timeIntervalCalls.length}`);

  if (timeIntervalCalls.length > 0) {
    timeIntervalCalls.forEach((call, i) => {
      console.log(`\n   Call ${i + 1}:`);
      console.log(`   URL: ${call.url}`);

      // Parse URL to extract modelId and roadId
      const urlParts = call.url.split('/');
      const timeIntervalIndex = urlParts.indexOf('time-interval');
      if (timeIntervalIndex >= 0 && urlParts.length > timeIntervalIndex + 2) {
        const modelId = urlParts[timeIntervalIndex + 1];
        const roadId = urlParts[timeIntervalIndex + 2];
        console.log(`   Parsed modelId: ${modelId}`);
        console.log(`   Parsed roadId: ${roadId}`);

        if (modelId === 'undefined' || !modelId) {
          console.log('   ❌ ERROR: modelId is undefined!');
        }
        if (roadId === 'undefined' || !roadId) {
          console.log('   ❌ ERROR: roadId is undefined!');
        }
      }
    });
  } else {
    console.log('   ❌ No time-interval API calls were made!');
    console.log('   Possible reasons:');
    console.log('   1. Models were not selected properly');
    console.log('   2. Road was not selected properly');
    console.log('   3. useEffect is not triggering');
  }

  await page.screenshot({ path: 'test-results/debug-ti-final.png', fullPage: true });
});
