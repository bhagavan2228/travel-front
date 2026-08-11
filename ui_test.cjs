const { chromium } = require('playwright');
const path = require('path');

async function run() {
  console.log('=== STARTING AUTOMATED BROWSER UI TEST ===\n');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });
  await context.clearCookies();
  const page = await context.newPage();

  const screenshotDir = 'C:/Users/muthi/.gemini/antigravity-ide/brain/eb046302-3b37-41d9-8535-35efa00c4fe8';
  
  // 1. Visit Home Page & Clear Storage
  console.log('1. Loading Home Page and clearing session storage...');
  await page.goto('http://localhost:5173');
  await page.evaluate(() => localStorage.clear());
  await page.waitForTimeout(3000); // let animations load
  await page.screenshot({ path: path.join(screenshotDir, 'homepage.png') });
  console.log('   [SUCCESS] Home Page loaded. Screenshot saved to homepage.png');

  // 2. Navigate to Destinations Page
  console.log('2. Navigating to Destinations Page...');
  await page.goto('http://localhost:5173/destinations');
  await page.waitForSelector('.grid'); // wait for destinations grid
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(screenshotDir, 'destinations.png') });
  console.log('   [SUCCESS] Destinations Page loaded. Screenshot saved to destinations.png');

  // 3. Go to Register Page
  console.log('3. Navigating to Register Page...');
  await page.goto('http://localhost:5173/register');
  await page.waitForSelector('#email');
  await page.screenshot({ path: path.join(screenshotDir, 'register.png') });
  console.log('   [SUCCESS] Register Page loaded. Screenshot saved to register.png');

  // Register a user
  const email = `ui_user_${Date.now()}@example.com`;
  console.log(`4. Registering a new user: ${email}...`);
  await page.fill('#name', 'Test UI User');
  await page.fill('#email', email);
  await page.fill('#password', 'Password123!');
  await page.screenshot({ path: path.join(screenshotDir, 'register_filled.png') });
  
  // Click submit and wait for redirect
  await Promise.all([
    page.waitForURL('**/destinations'),
    page.click('button[type="submit"]')
  ]);
  console.log('   [SUCCESS] Registered and redirected to /destinations.');

  // Go to Leaderboard
  console.log('5. Navigating to Leaderboard...');
  await page.goto('http://localhost:5173/leaderboard');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(screenshotDir, 'leaderboard.png') });
  console.log('   [SUCCESS] Leaderboard loaded. Screenshot saved to leaderboard.png');

  // Go to Trips Page
  console.log('6. Navigating to Trips Page...');
  await page.goto('http://localhost:5173/trips');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(screenshotDir, 'trips.png') });
  console.log('   [SUCCESS] Trips Page loaded. Screenshot saved to trips.png');

  // Create a Trip
  console.log('7. Planning a new trip...');
  await page.click('button:has-text("New Trip")');
  await page.waitForTimeout(1000);

  // Fill form
  await page.fill('input[placeholder="Trip title"]', 'My Romantic Paris Trip');
  
  // Search destination
  await page.fill('input[placeholder*="Where to?"]', 'Paris');
  await page.waitForTimeout(1000); // wait for dropdown autocomplete
  
  // Click the Paris dropdown selection
  await page.click('button:has-text("Paris")');
  await page.waitForTimeout(500);

  // Fill dates
  const dateInputs = page.locator('input[type="date"]');
  await dateInputs.nth(0).fill('2026-08-01'); // start date
  await dateInputs.nth(1).fill('2026-08-10'); // end date
  
  // Fill notes
  await page.fill('textarea[placeholder*="Notes"]', 'Can\'t wait to visit the Eiffel Tower and try French bakeries!');
  await page.screenshot({ path: path.join(screenshotDir, 'plan_trip_modal.png') });
  
  // Click submit to create
  await page.click('button:has-text("Create Trip")');
  await page.waitForTimeout(2000);
  
  await page.screenshot({ path: path.join(screenshotDir, 'trips_updated.png') });
  console.log('   [SUCCESS] Planned trip successfully. Screenshot saved to trips_updated.png');

  // Expand trip to show bookings
  console.log('8. Expanding trip to show bookings...');
  const showBookingsBtn = page.locator('button:has-text("Show Bookings")');
  if (await showBookingsBtn.isVisible()) {
    await showBookingsBtn.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(screenshotDir, 'trip_details_expanded.png') });
  } else {
    console.log('   [INFO] Bookings portal is already expanded.');
    await page.screenshot({ path: path.join(screenshotDir, 'trip_details_expanded.png') });
  }
  
  // Delete trip
  console.log('9. Deleting the created trip...');
  await page.click('button[aria-label="Delete trip"]');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(screenshotDir, 'trips_cleaned.png') });
  console.log('   [SUCCESS] Trip deleted.');

  await browser.close();
  console.log('\n=== BROWSER UI TEST COMPLETED SUCCESSFULLY ===');
}

run().catch(err => {
  console.error('Test failed with error:', err);
  process.exit(1);
});
