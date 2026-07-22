import { test, expect, type Page } from "@playwright/test";

/**
 * Full guest-career happy path, exercised against a real running dev server:
 * create athlete -> pick school -> freshman intro -> hub -> weekly planner
 * action -> play a game -> advance week -> reload persistence.
 *
 * Kept as a single sequential test (rather than split across `test()` blocks)
 * because guest state lives in this page's localStorage/Zustand store, and
 * each step depends on the previous one's state.
 */
test.describe.configure({ mode: "serial" });

test("guest career: create, play a week, and survive a reload", async ({
  page,
}) => {
  await gotoAndCreateAthlete(page);
  await pickSchoolAndEnterHub(page);
  await verifyHub(page);
  await confirmOneWeeklyAction(page);
  await playScheduledGame(page);
  await verifyReloadPersists(page);
});

async function gotoAndCreateAthlete(page: Page) {
  await page.goto("/");
  await page.getByRole("link", { name: "Start Career" }).first().click();
  await expect(page).toHaveURL(/\/new-career/);

  await page.getByLabel(/first name/i).fill("Riley");
  await page.getByLabel(/last name/i).fill("Storm");
  await page.getByLabel(/hometown/i).fill("Cedar Falls, IA");
  await page
    .getByRole("button", { name: /continue to school selection/i })
    .click();
}

async function pickSchoolAndEnterHub(page: Page) {
  // Pick the first school offer, then accept it.
  await page.locator("button[aria-pressed]").first().click();
  await page.getByRole("button", { name: /accept offer/i }).click();

  // Freshman intro screen.
  await expect(page.getByText(/welcome to campus, riley/i)).toBeVisible();
  await page.getByRole("button", { name: /enter the career hub/i }).click();
  await expect(page).toHaveURL(/\/career$/);
}

async function verifyHub(page: Page) {
  await expect(page.getByText(/riley storm/i)).toBeVisible();
  await expect(page.getByText(/season 1/i)).toBeVisible();
}

async function confirmOneWeeklyAction(page: Page) {
  await page.getByRole("link", { name: "Go to Weekly Planner" }).click();
  await expect(page).toHaveURL(/\/career\/planner/);
  await expect(page.getByText("4 AP left")).toBeVisible();

  await page.getByRole("button", { name: "Confirm" }).first().click();
  await expect(page.getByText("3 AP left")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Done this week" }).first(),
  ).toBeVisible();
}

async function playScheduledGame(page: Page) {
  await page.goto("/career/schedule");
  await page.getByRole("link", { name: /play game/i }).click();
  await expect(page).toHaveURL(/\/career\/game/);

  await page.getByRole("button", { name: /kickoff/i }).click();

  // Two game-day decisions are offered, each with two options — select the
  // first option for each decision.
  const optionButtons = page.locator("button[aria-pressed]");
  await expect(optionButtons).toHaveCount(4);
  await optionButtons.nth(0).click();
  await optionButtons.nth(2).click();

  await page.getByRole("button", { name: /simulate game/i }).click();

  // Recap screen: a "W-L"-style score and win/loss headline are shown.
  await expect(page.getByText(/victory|defeat/i)).toBeVisible();
  await expect(page.locator("p.scoreboard")).toHaveText(/^\d+-\d+$/);

  await page.getByRole("button", { name: /continue to planner/i }).click();
  await expect(page).toHaveURL(/\/career\/planner/);
  await expect(page.getByText(/week 2 planner/i)).toBeVisible();
}

async function verifyReloadPersists(page: Page) {
  await page.reload();
  await expect(page.getByText(/week 2 planner/i)).toBeVisible();
  await expect(page.getByText(/riley storm/i)).toBeVisible();
}
