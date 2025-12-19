import { test } from '@playwright/test';

test('debug backend roads API response', async ({ page }) => {
  let roadsApiCalls: any[] = [];

  // Monitor all network responses
  page.on('response', async (response) => {
    const url = response.url();

    if (url.includes('/roads/')) {
      console.log(`\n🔍 ROADS API CALL:`);
      console.log(`   URL: ${url}`);
      console.log(`   Status: ${response.status()}`);
      console.log(`   Headers:`, response.headers());

      try {
        const text = await response.text();
        console.log(`   Response Body (raw):`, text);

        try {
          const json = JSON.parse(text);
          console.log(`   Response Body (JSON):`, JSON.stringify(json, null, 2));
          roadsApiCalls.push({ url, status: response.status(), data: json });
        } catch (e) {
          console.log(`   Could not parse as JSON`);
        }
      } catch (e) {
        console.log(`   Could not read response body`);
      }
    }
  });

  console.log('\n🌐 Navigating to /group6/');
  await page.goto('http://localhost:3000/group6/');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  console.log('\n🎯 Selecting models...');

  // Open model dropdown
  const modelButton = page.locator('button[role="combobox"]').first();
  await modelButton.click();
  await page.waitForTimeout(1000);

  // Click first two models
  const modelDivs = page.locator('div.flex.items-center.gap-2.p-2.rounded.cursor-pointer');
  const count = await modelDivs.count();

  if (count >= 1) {
    await modelDivs.nth(0).click();
    await page.waitForTimeout(1000);

    console.log('\n⏳ Waiting for roads API call...');
    await page.waitForTimeout(5000);
  }

  console.log(`\n📊 SUMMARY:`);
  console.log(`   Total roads API calls: ${roadsApiCalls.length}`);

  if (roadsApiCalls.length === 0) {
    console.log(`\n❌ No roads API calls were made!`);
    console.log(`   This means:`);
    console.log(`   - Either the model selection didn't trigger the useEffect`);
    console.log(`   - Or there's a JavaScript error preventing the API call`);
  } else {
    roadsApiCalls.forEach((call, i) => {
      console.log(`\n   Call ${i + 1}:`);
      console.log(`   Status: ${call.status}`);
      console.log(`   Data:`, call.data);
    });
  }

  await page.screenshot({ path: 'test-results/debug-roads.png', fullPage: true });
});
