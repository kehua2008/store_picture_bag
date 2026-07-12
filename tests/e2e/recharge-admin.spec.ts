import { expect, test } from "@playwright/test";

const pendingOrder = {
  id: "recharge-test-1",
  customerId: "bags-demo-user",
  planId: "credits-9990",
  planLabel: "9990 积分",
  credits: 9990,
  priceCny: 999,
  paymentMethod: "wechat",
  proofFilename: "proof.jpg",
  proofImageUrl: "/brand-logo.svg",
  status: "pending",
  createdAt: "2026-06-06T02:00:00.000Z",
  updatedAt: "2026-06-06T02:00:00.000Z"
};

test("recharge page submits proof into pending review state", async ({ page }) => {
  await page.route("**/api/recharge-orders?customerId=bags-demo-user", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        accounts: [{ customerId: "bags-demo-user", balanceCredits: 2680, updatedAt: "2026-06-06T02:00:00.000Z" }],
        orders: []
      })
    });
  });
  await page.route("**/api/recharge-orders", async (route) => {
    if (route.request().method() !== "POST") return route.fallback();
    await route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify({
        account: { customerId: "bags-demo-user", balanceCredits: 2680, updatedAt: "2026-06-06T02:00:00.000Z" },
        order: pendingOrder
      })
    });
  });

  await page.goto("/recharge");
  await expect(page.getByRole("heading", { name: "按生成量充值，用多少扣多少" })).toBeVisible();
  await expect(page.locator(".rechargeLogo img")).toHaveCSS("object-fit", "contain");
  const logoBox = await page.locator(".rechargeLogo img").boundingBox();
  expect(logoBox?.width).toBeGreaterThan(120);

  await page.locator('.paymentProofUpload input[type="file"]').setInputFiles({
    name: "proof.jpg",
    mimeType: "image/jpeg",
    buffer: Buffer.from("fake-proof")
  });
  await page.getByRole("button", { name: "提交付款截图" }).click();
  await expect(page.getByRole("button", { name: "已提交，等待审核" })).toBeDisabled();
  await expect(page.getByText("9990 积分 · ¥999 已提交，等待管理员审核")).toBeVisible();
});

test("admin recharge review can reject with a user-visible reason", async ({ page }) => {
  let patchPayload: unknown;
  await page.route("**/api/recharge-orders", async (route) => {
    const method = route.request().method();
    if (method === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          accounts: [{ customerId: "bags-demo-user", balanceCredits: 2680, updatedAt: "2026-06-06T02:00:00.000Z" }],
          orders: [pendingOrder]
        })
      });
      return;
    }
    if (method === "PATCH") {
      patchPayload = route.request().postDataJSON();
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          account: { customerId: "bags-demo-user", balanceCredits: 2680, updatedAt: "2026-06-06T02:10:00.000Z" },
          order: { ...pendingOrder, status: "rejected", rejectReason: "截图不清晰，请重新上传付款凭证", reviewedAt: "2026-06-06T02:10:00.000Z" }
        })
      });
    }
  });

  await page.goto("/admin/recharge-orders");
  await expect(page.getByRole("heading", { name: "充值审核后台" })).toBeVisible();
  await expect(page.getByText("待审核充值", { exact: true })).toBeVisible();
  await page.getByPlaceholder("未通过时填写驳回理由").fill("截图不清晰，请重新上传付款凭证");
  await page.getByRole("button", { name: "驳回并通知" }).click();
  await expect(page.getByText("已驳回，理由已通知用户")).toBeVisible();
  expect(patchPayload).toEqual({
    id: "recharge-test-1",
    status: "rejected",
    rejectReason: "截图不清晰，请重新上传付款凭证"
  });
});
