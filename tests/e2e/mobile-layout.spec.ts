import { expect, test } from "@playwright/test";

test.describe("mobile layout", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("keeps the login entry visible and usable on the mobile workbench", async ({ page }) => {
    await page.goto("/");

    const loginButton = page.getByRole("button", { name: "登录" });
    await expect(loginButton).toBeVisible();
    await expect(loginButton).toHaveCSS("display", /flex|inline-flex/);

    const loginBox = await loginButton.boundingBox();
    expect(loginBox?.width ?? 0).toBeGreaterThan(44);
    expect(loginBox?.height ?? 0).toBeGreaterThanOrEqual(32);

    await loginButton.click();
    await expect(page.getByRole("dialog", { name: "用户中心" })).toBeVisible();
    await expect(page.getByPlaceholder("手机号")).toBeVisible();
    await expect(page.getByPlaceholder("密码，至少 8 位")).toBeVisible();
    await expect(page.getByRole("button", { name: "登录账号" })).toBeVisible();

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    expect(overflow).toBe(false);
  });

  test("keeps full detail suite mode usable on the mobile workbench", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("button", { name: /宝贝详情.*套图/ }).click();
    await expect(page.getByRole("heading", { name: "详情图规格" })).toBeVisible();
    await expect(page.getByRole("button", { name: "跨境平台" })).toHaveCount(0);
    await expect(page.getByRole("group", { name: "宝贝详情尺寸" }).getByRole("button", { name: /默认规格790宽/ })).toBeVisible();
    await expect(page.getByLabel("详情结构大纲")).toBeVisible();
    await page.locator('input[type="file"][multiple]').setInputFiles([
      { name: "black-shirt.jpg", mimeType: "image/jpeg", buffer: Buffer.from("fake-black") },
      { name: "white-shirt.jpg", mimeType: "image/jpeg", buffer: Buffer.from("fake-white") }
    ]);
    await expect(page.getByLabel("颜色分组")).toBeVisible();
    await expect(page.getByLabel("完整详情长图预览")).toBeVisible();

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    expect(overflow).toBe(false);
  });

  test("keeps custom video generation rails inside the mobile viewport", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("button", { name: "视频生成" }).click();
    await page.getByRole("button", { name: /说一句话，生成你想要的视频/ }).click();
    await expect(page.getByText("AI帮你写视频提示词")).toBeVisible();
    await expect(page.getByText("视频任务状态")).toBeVisible();

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    expect(overflow).toBe(false);
  });

  test("keeps generation records usable on mobile", async ({ page }) => {
    await page.route("**/api/auth/me", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          user: { id: "user-mobile", phone: "13800138000", status: "active", createdAt: "2026-06-07T07:00:00.000Z", updatedAt: "2026-06-07T07:00:00.000Z" },
          account: { customerId: "user-mobile", balanceCredits: 2680, frozenCredits: 0, updatedAt: "2026-06-07T08:01:00.000Z" }
        })
      });
    });
    await page.route("**/api/generation-jobs", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ jobs: [] })
      });
    });

    await page.goto("/generation-records");
    await expect(page.getByRole("heading", { name: "生成记录" })).toBeVisible();
    await expect(page.getByText("图片和视频生成记录仅保留 24 小时，请及时下载。")).toBeVisible();

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    expect(overflow).toBe(false);
  });

  for (const path of ["/admin/members", "/admin/billing", "/admin/recharge-orders", "/admin/style-library"]) {
    test(`keeps the admin brand and fixed nav usable on mobile at ${path}`, async ({ page }) => {
      await page.goto(path);

      await expect(page.getByText("DS电商AI视觉创作")).toBeVisible();
      await expect(page.locator(".adminBrandLockup img")).toHaveCSS("object-fit", "contain");
      await expect(page.locator(".adminHeaderNav a")).toHaveCount(5);
      await expect(page.getByRole("link", { name: "客户管理" })).toBeVisible();
      await expect(page.getByRole("link", { name: "财务管理" })).toBeVisible();
      await expect(page.getByRole("link", { name: "充值审核" })).toBeVisible();
      await expect(page.getByRole("link", { name: "风格库后台" })).toBeVisible();

      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
      expect(overflow).toBe(false);
    });
  }
});
