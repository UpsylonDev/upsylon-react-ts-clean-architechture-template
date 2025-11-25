import { test, expect } from "@playwright/test"

test.describe("Posts", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/")
  })

  test("Add and Delete posts", async ({ page }) => {
    // Fill in the form
    await page.locator(".post-form input[name=Title]").fill("Test Title")
    await page.locator(".post-form input[name=Content]").fill("Test Content")

    // Click the create button
    await page.locator(".post-form button[name=Create]").click()

    // Verify that a new post was added (should have 2 posts now)
    const postList = page.locator(".post-list li")
    await expect(postList).toHaveCount(2)

    // Delete the second post
    await page
      .locator(".post-list li")
      .nth(1)
      .locator("button[name=Delete]")
      .click()

    // Verify that the post was deleted (should have 1 post now)
    await expect(postList).toHaveCount(1)
  })
})
