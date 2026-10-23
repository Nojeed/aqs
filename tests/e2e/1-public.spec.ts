import { expect, test } from "@playwright/test";

test.describe("public site", () => {
  test("home loads in both languages and the language switch keeps the page", async ({ page }) => {
    await page.goto("/en/courses");
    await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
    await page.getByRole("link", { name: "العربية" }).first().click();
    await expect(page).toHaveURL(/\/ar\/courses$/);
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  });

  test("course filters narrow the list and are saved in the URL", async ({ page }) => {
    await page.goto("/en/courses");
    const cards = page.locator("main ul > li");
    const all = await cards.count();
    expect(all).toBeGreaterThan(2);
    await page.getByLabel("Search courses").fill("haccp");
    await expect(page).toHaveURL(/q=haccp/);
    await expect(cards).not.toHaveCount(all);
    await expect(page.getByRole("heading", { name: /HACCP/ }).first()).toBeVisible();
    await page.getByRole("button", { name: "Clear filters" }).click();
    await expect(cards).toHaveCount(all);
  });

  test("blog filters narrow the list and are saved in the URL", async ({ page }) => {
    await page.goto("/en/blog");
    const counter = page.getByText(/Articles:/);
    await expect(counter).toBeVisible();
    const total = Number((await counter.textContent())?.match(/\/\s*(\d+)/)?.[1]);
    await page.getByLabel("Search articles").fill("haccp");
    await expect(page).toHaveURL(/q=haccp/);
    await expect(counter).not.toHaveText(new RegExp(`:\s*${total}\s*/`));
    await page.getByRole("button", { name: "Clear filters" }).click();
    await expect(page).not.toHaveURL(/q=/);
  });

  test("certificate verification: valid, typed loosely, and not found", async ({ page }) => {
    await page.goto("/en/verify?id=AQS-2026-0001");
    await expect(page.getByRole("heading", { name: "Valid certificate" })).toBeVisible();
    await page.goto(`/en/verify?id=${encodeURIComponent("aqs 2026 0001")}`);
    await expect(page.getByRole("heading", { name: "Valid certificate" })).toBeVisible();
    await page.goto("/en/verify?id=AQS-1999-0000");
    await expect(page.getByText("Certificate not found").first()).toBeVisible();
  });

  test("registration on a course page succeeds", async ({ page }) => {
    await page.goto("/en/courses/haccp-level-3#register");
    const form = page.locator("#register form");
    await form.getByLabel("Full name").fill("E2E Individual");
    await form.getByLabel("Phone", { exact: true }).fill("+20 100 000 0001");
    await form.getByLabel("Email", { exact: true }).fill("e2e-individual@example.com");
    await form.getByRole("button", { name: "Send registration" }).click();
    await expect(page.getByText("Registration received")).toBeVisible();
  });

  test("Arabic contact form shows Arabic errors and focuses the first one", async ({ page }) => {
    await page.goto("/ar/contact");
    await page.getByRole("button", { name: "إرسال الرسالة" }).click();
    await expect(page.getByText("هذا الحقل مطلوب.").first()).toBeVisible();
    await expect(page.locator("#msg-name")).toBeFocused();
  });

  test("consultation links prefill the message, and typing early is never lost", async ({ page }) => {
    await page.goto("/en/contact?subject=HACCP%20training");
    await page.getByLabel("Name", { exact: true }).fill("Typed Right Away");
    await expect(page.getByLabel("Message", { exact: true })).toHaveValue(/HACCP training/);
    await expect(page.getByLabel("Name", { exact: true })).toHaveValue("Typed Right Away");
  });

  test("contact message is sent", async ({ page }) => {
    await page.goto("/en/contact");
    await page.getByLabel("Name", { exact: true }).fill("E2E Sender");
    await page.getByLabel("Your email").fill("e2e-sender@example.com");
    await page.getByLabel("Message", { exact: true }).fill("Hello from the end-to-end tests.");
    await page.getByRole("button", { name: "Send message" }).click();
    await expect(page.getByText("Message sent")).toBeVisible();
  });
});
