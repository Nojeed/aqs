import { expect, test, type Page } from "@playwright/test";

const PASSWORD = "e2e-test-password";

// Runs after 1-public.spec.ts (files run in name order), which creates the registration checked below.
async function signIn(page: Page, username = "admin", password = PASSWORD, expectSuccess = true) {
  await page.goto("/admin/login");
  await page.getByLabel("Username", { exact: true }).fill(username);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
  if (expectSuccess) await page.waitForURL(/\/admin$/);
}

test.describe("admin", () => {
  test("wrong password is refused, right one signs in", async ({ page }) => {
    await signIn(page, "admin", "not-the-password", false);
    await expect(page.getByText("Incorrect username or password.")).toBeVisible();
    await signIn(page);
    await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();
  });

  test("registrations from the site show up with a badge", async ({ page }) => {
    await signIn(page);
    await page.goto("/admin/registrations");
    await expect(page.getByRole("link", { name: "E2E Individual" })).toBeVisible();
    await expect(page.getByRole("link", { name: /Registrations\s*\d+/ })).toBeVisible();
  });

  test("create a never-expiring certificate and verify it publicly", async ({ page }) => {
    await signIn(page);
    await page.goto("/admin/certificates/new");
    const number = (await page.getByRole("heading", { level: 1 }).textContent())?.match(/AQS-\d{4}-\d{4}/)?.[0];
    expect(number).toBeTruthy();
    await page.getByLabel("Status").click();
    await page.getByRole("option", { name: "Valid – never expires" }).click();
    await page.getByLabel("Trainee name (English)").fill("E2E Trainee");
    await page.getByRole("button", { name: "Save" }).click();
    await expect(page.getByText(`Created certificate ${number}`)).toBeVisible();

    await page.goto(`/en/verify?id=${number}`);
    await expect(page.getByRole("heading", { name: "Valid certificate" })).toBeVisible();
    await expect(page.getByText("Does not expire")).toBeVisible();
  });

  test("publish toggle confirms with a toast", async ({ page }) => {
    await signIn(page);
    await page.goto("/admin/services");
    const toggle = page.locator("tbody tr").first().getByRole("button", { name: /Published|Draft/ });
    await toggle.click();
    await expect(page.getByText("Hidden from the website.")).toBeVisible();
    await page.locator("tbody tr").first().getByRole("button", { name: "Draft" }).click();
    await expect(page.getByText("Published on the website.")).toBeVisible();
  });

  test("owner adds a staff user who can sign in but not manage users", async ({ page }) => {
    await signIn(page);
    await page.goto("/admin/users");
    await page.getByLabel("Name", { exact: true }).fill("E2E Staff");
    await page.getByLabel("Username", { exact: true }).fill("e2e.staff");
    await page.getByLabel("First password").fill("staff-password-123");
    await page.getByRole("button", { name: "Add user" }).click();
    await expect(page.getByText("E2E Staff can now sign in")).toBeVisible();

    await page.context().clearCookies();
    await signIn(page, "e2e.staff", "staff-password-123");
    await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Users" })).toHaveCount(0);
    await page.goto("/admin/users");
    await expect(page).toHaveURL(/\/admin$/);
  });

  test("activity log records changes", async ({ page }) => {
    await signIn(page);
    await page.goto("/admin/activity");
    await expect(page.getByText("Created certificate").first()).toBeVisible();
    await expect(page.getByText("Added user").first()).toBeVisible();
  });

  test("course dates: seats left, overbooking refused, full dates closed", async ({ page }) => {
    await signIn(page);
    await page.goto("/admin/courses/crs-iso-la");
    await page.getByRole("button", { name: "Add date" }).click();
    const future = new Date(Date.now() + 20 * 86_400_000).toISOString().slice(0, 10);
    await page.locator("#f-sessions-0-date").fill(future);
    await page.locator("#f-sessions-0-location-en").fill("Cairo");
    await page.locator("#f-sessions-0-seats").fill("1");
    await page.getByRole("button", { name: "Save" }).click();
    await expect(page.getByText("Saved.")).toBeVisible();

    await page.goto("/en/courses/iso-22000-lead-auditor#register");
    const form = page.locator("#register form");
    await form.getByRole("combobox", { name: "Date" }).click();
    await page.getByRole("option", { name: /Cairo\s*1 seats left/ }).click();

    // A company booking 3 trainees doesn't fit in 1 seat.
    await form.getByText("Company", { exact: true }).click();
    await form.getByLabel("Company name").fill("Big Co");
    await form.getByLabel("Number of trainees").fill("3");
    await form.getByLabel("Contact person").fill("Over Booker");
    await form.getByLabel("Phone", { exact: true }).fill("+20 100 000 0002");
    await form.getByLabel("Email", { exact: true }).fill("over@example.com");
    await form.getByRole("button", { name: "Send registration" }).click();
    await expect(page.getByText("Not enough seats left on this date")).toBeVisible();

    // One person takes the last seat; the date is then closed.
    await form.getByText("Individual", { exact: true }).click();
    await form.getByLabel("Full name").fill("Last Seat");
    await form.getByRole("button", { name: "Send registration" }).click();
    await expect(page.getByText("Registration received")).toBeVisible();
    await page.reload();
    await expect(page.getByText("All dates for this course are full")).toBeVisible();
  });

  test("switching a filter off in Site content hides it on the site", async ({ page }) => {
    await signIn(page);
    await page.goto("/admin/site");
    await page.getByText("Blog: search box").click();
    await page.getByRole("button", { name: "Save" }).click();
    await expect(page.getByText("Site content saved.")).toBeVisible();
    await page.goto("/en/blog");
    await expect(page.getByLabel("Topic")).toBeVisible();
    await expect(page.getByLabel("Search articles")).toHaveCount(0);

    // Switch it back on so the setting is left as it was.
    await page.goto("/admin/site");
    await page.getByText("Blog: search box").click();
    await page.getByRole("button", { name: "Save" }).click();
    await expect(page.getByText("Site content saved.")).toBeVisible();
  });
});
