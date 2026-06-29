import { chromium } from "playwright";

const URL = "http://localhost:3000/login";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

try {
  await page.goto(URL, { waitUntil: "networkidle" });

  const passwordInput = page.locator('input[placeholder="••••••••"]');
  await passwordInput.waitFor({ state: "visible" });
  await passwordInput.fill("TestPass123");

  const initialType = await passwordInput.getAttribute("type");
  if (initialType !== "password") {
    throw new Error(`Expected type="password", got "${initialType}"`);
  }

  await page.getByRole("button", { name: "Show password" }).click();
  const showType = await passwordInput.getAttribute("type");
  if (showType !== "text") {
    throw new Error(`After show: expected type="text", got "${showType}"`);
  }

  const visibleValue = await passwordInput.inputValue();
  if (visibleValue !== "TestPass123") {
    throw new Error(`Password value mismatch after show: "${visibleValue}"`);
  }

  await page.getByRole("button", { name: "Hide password" }).click();
  const hideType = await passwordInput.getAttribute("type");
  if (hideType !== "password") {
    throw new Error(`After hide: expected type="password", got "${hideType}"`);
  }

  console.log("PASS: Password show/hide toggle works correctly");
  console.log("  - Initial: type=password");
  console.log("  - After Show password click: type=text, value visible");
  console.log("  - After Hide password click: type=password");
} catch (err) {
  console.error("FAIL:", err.message);
  process.exitCode = 1;
} finally {
  await browser.close();
}
