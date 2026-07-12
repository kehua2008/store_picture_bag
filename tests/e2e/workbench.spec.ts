import { expect, test } from "@playwright/test";

test("workbench shows short video generation workspace", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: "视频生成" }).click();
  await expect(page.getByText("选择视频生成方式，开始你的创作")).toBeVisible();
  await expect(page.getByText("上传参考视频生成视频")).toBeVisible();
  await page.getByRole("button", { name: /选择此方式/ }).first().click();
  await expect(page.getByText("视频任务状态")).toBeVisible();
  await expect(page.getByText("视频生成结果")).toBeVisible();
  await expect(page.getByText("视频生成记录")).toBeVisible();
  await expect(page.getByText("上传商品素材").first()).toBeVisible();
  await expect(page.getByText("上传参考视频").first()).toBeVisible();
  await expect(page.getByText("想改什么")).toBeVisible();
  await expect(page.getByText("上传商品素材").first()).toBeVisible();
  await expect(page.getByRole("button", { name: "请先上传商品素材" })).toBeDisabled();
  await expect(page.getByLabel("短视频生成开发中")).toHaveCount(0);
  await expect(page.getByText("云雾")).toHaveCount(0);
  await expect(page.getByText(/任务 ID/)).toHaveCount(0);
});

test("workbench creates image generation jobs", async ({ page }) => {
  let savedCustomModel: Record<string, unknown> | undefined;
  await page.route("**/api/custom-models", async (route) => {
    const method = route.request().method();
    if (method === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ models: savedCustomModel ? [savedCustomModel] : [] })
      });
      return;
    }
    if (method === "POST") {
      savedCustomModel = {
        id: "model-e2e",
        name: "专属模特1",
        filename: "model.jpg",
        mimeType: "image/jpeg",
        imageUrl: "/api/custom-models/model-e2e/image",
        modelGender: "boy",
        modelAgeRange: "child_11_14",
        modelSkinTone: "latino_hispanic",
        modelHairStyle: "short",
        createdAt: "2026-06-07T08:00:00.000Z"
      };
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({ model: savedCustomModel })
      });
      return;
    }
    await route.continue();
  });
  await page.route("**/api/custom-models/*/image", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "image/png",
      body: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=", "base64")
    });
  });
  await page.route("**/api/generation-jobs", async (route) => {
    if (route.request().method() !== "POST") {
      await route.continue();
      return;
    }
    await route.fulfill({
      status: 202,
      contentType: "application/json",
      body: JSON.stringify({
        job: {
          id: "job-e2e-generated",
          mode: "image_edit",
          customerId: "user-e2e",
          reservedCredits: 24,
          chargedCredits: 0,
          createdAt: "2026-06-07T08:00:00.000Z",
          updatedAt: "2026-06-07T08:00:00.000Z",
          options: {
            platform: "douyin",
            category: "men",
            productCategoryLabel: "T恤",
            sceneVariant: "minimal_solid",
            size: "portrait",
            modelProfile: "asian_male",
            count: 1,
            specId: "douyin-feed-portrait",
            imageTypeId: "feed_card",
            imageTypeIds: ["feed_card"],
            productGroupingMode: "per_image",
            targetWidth: 1080,
            targetHeight: 1920,
            modelMode: "model"
          },
          sourceImages: [{ id: "src-e2e", filename: "tote-a.jpg", mimeType: "image/jpeg" }],
          sourceImageGroups: [{ id: "product-1", images: [{ id: "src-e2e", filename: "tote-a.jpg", mimeType: "image/jpeg" }] }],
          status: "running",
          progress: { completed: 0, total: 1 },
          prompt: { summary: "抖音主图", body: "prompt", negativePrompt: "" },
          results: []
        }
      })
    });
  });
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "箱包AI创作平台" })).toBeVisible();
  await expect(page.getByRole("button", { name: /箱包/ })).toBeVisible();
  await page.getByRole("button", { name: "抖音" }).click();
  await expect(page.getByText("当前任务 · 快捷修改")).toBeVisible();
  await expect(page.getByRole("button", { name: "默认单图" })).toHaveClass(/active/);
  await page.getByRole("button", { name: /宝贝详情.*套图/ }).click();
  await page.getByRole("button", { name: /主图.*单张.*批量/ }).click();
  await expect(page.getByRole("button", { name: "默认单图" })).toHaveClass(/active/);
  await expect(page.locator(".samplePreview")).toHaveCount(0);
  await expect(page.getByText(/抖音/).first()).toBeVisible();
  await expect(page.getByRole("button", { name: "套图生成" })).toHaveCount(0);
  await expect(page.getByLabel("图片规格板块")).toHaveCount(0);
  await expect(page.getByRole("button", { name: /默认规格790宽/ })).toHaveCount(0);
  await expect(page.getByRole("button", { name: /其他图片/ })).toHaveCount(0);
  await expect(page.getByRole("button", { name: /自定义尺寸/ })).toBeVisible();
  await expect(page.getByRole("button", { name: "套图生成" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: /详情模块菜单/ })).toHaveCount(0);
  await expect(page.getByLabel("AI套图策略")).toHaveCount(0);
  await expect(page.getByRole("button", { name: /短视频封面 1080x1920/ })).toBeVisible();
  await page.getByRole("button", { name: /短视频封面 1080x1920/ }).click();
  await page.getByRole("button", { name: /主图生成类型/ }).click();
  await expect(page.getByRole("button", { name: "信息流 更强首屏冲击力" })).toBeVisible();
  await page.getByRole("button", { name: "全选" }).first().click();
  await expect(page.getByRole("button", { name: /主图生成类型 2\/2 类/ })).toBeVisible();
  await page.getByRole("button", { name: "信息流 更强首屏冲击力" }).click();
  await expect(page.getByRole("button", { name: /主图生成类型 1\/2 类/ })).toBeVisible();
  await page.getByRole("button", { name: "不需要模特", exact: true }).click();
  await expect(page.getByText("模特预设")).toHaveCount(0);
  await page.getByRole("button", { name: "需要模特", exact: true }).click();
  await expect(page.getByText("模特人物类型")).toBeVisible();
  await page.getByRole("button", { name: /模特人物类型/ }).click();
  await page.getByRole("button", { name: /男童/ }).click();
  await page.getByLabel("年龄").selectOption("child_11_14");
  await page.getByLabel("人种风格").selectOption("latino_hispanic");
  await page.getByLabel("发型").selectOption("short");
  await expect(page.getByText(/男童 · 11-14岁 · 拉丁\/西语裔 · 短发/)).toBeVisible();
  await expect(page.getByRole("heading", { name: "图片风格" })).toBeVisible();
  await expect(page.getByText("经典电商风格")).toBeVisible();
  await expect(page.getByText("爆款风格复刻")).toBeVisible();
  await page.getByRole("button", { name: /高街潮流/ }).click();
  await expect(page.getByRole("heading", { name: "提示词补充" })).toBeVisible();
  await page.getByLabel("提示词补充").fill("背景更干净，模特姿势自然");
  await expect(page.getByText("已填写")).toBeVisible();
  await page.getByRole("button", { name: "个性化定制模特" }).click();
  await page.locator('input[type="file"]:not([multiple])').first().setInputFiles({
    name: "model.jpg",
    mimeType: "image/jpeg",
    buffer: Buffer.from("fake-model")
  });
  await expect(page.getByText("已上传模特参考图")).toBeVisible();
  await page.getByRole("button", { name: "保存为专属模特" }).click();
  await expect(page.getByText(/已保存为专属模特/)).toBeVisible();
  await expect(page.getByRole("button", { name: /点击或拖拽上传图片/ })).toBeVisible();
  await page.getByRole("button", { name: /点击或拖拽上传/ }).click();
  await page.locator('input[type="file"][multiple]').setInputFiles([
    {
      name: "tote-a.jpg",
      mimeType: "image/jpeg",
      buffer: Buffer.from("fake-image-a")
    },
    {
      name: "tote-b.jpg",
      mimeType: "image/jpeg",
      buffer: Buffer.from("fake-image-b")
    }
  ]);
  await expect(page.getByLabel("当前任务配置摘要").locator(".summaryHeader strong")).toHaveCount(0);
  await expect(page.getByText("已应用专属模特，人物属性按保存时配置锁定。")).toBeVisible();
  const centerLayout = await page.evaluate(() => {
    const stage = document.querySelector(".mainStage")?.getBoundingClientRect();
    const summary = document.querySelector(".taskSummary")?.getBoundingClientRect();
    const upload = document.querySelector(".uploadSurface")?.getBoundingClientRect();
    const action = document.querySelector(".actionRow")?.getBoundingClientRect();
    if (!stage || !summary || !upload || !action) return undefined;
    return {
      summaryInside: summary.left >= stage.left && summary.right <= stage.right,
      uploadInside: upload.left >= stage.left && upload.right <= stage.right,
      actionInside: action.left >= stage.left && action.right <= stage.right,
      verticalOrder: summary.top < upload.top && upload.bottom < action.bottom
    };
  });
  expect(centerLayout).toEqual({
    summaryInside: true,
    uploadInside: true,
    actionInside: true,
    verticalOrder: true
  });
  await expect(page.locator(".uploadThumbItem")).toHaveCount(2);
  await page.getByRole("button", { name: "一键生图" }).click();
  await expect(page.getByText(/job-/)).toBeVisible();
  await expect(page.getByText(/生成中|生成失败|生成完成/).first()).toBeVisible();
  await expect(page.getByText("图片生成结果")).toBeVisible();
  await expect(page.getByText("图片生成记录")).toBeVisible();
  await expect(page.getByText("下载选中")).toHaveCount(0);
  await expect(page.getByText("参考素材")).toHaveCount(0);
  await expect(page.locator(".referencePanel")).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "图片类型选择" })).toHaveCount(0);
  await expect(page.getByText("固化提示词")).toHaveCount(0);
  await expect(page.getByText("negativePrompt")).toHaveCount(0);
});

test("workbench creates full product detail suite jobs", async ({ page }) => {
  let submittedBody = "";
  await page.route("**/api/generation-jobs", async (route) => {
    if (route.request().method() !== "POST") {
      await route.continue();
      return;
    }
    submittedBody = route.request().postDataBuffer()?.toString("utf8") ?? "";
    await route.fulfill({
      status: 202,
      contentType: "application/json",
      body: JSON.stringify({
        job: {
          id: "job-detail-suite-e2e",
          mode: "image_edit",
          customerId: "user-e2e",
          reservedCredits: 108,
          chargedCredits: 0,
          createdAt: "2026-06-07T08:00:00.000Z",
          updatedAt: "2026-06-07T08:00:00.000Z",
          options: {
            platform: "taobao",
            category: "women",
            productCategoryLabel: "T恤",
            sceneVariant: "premium_catalog",
            size: "portrait",
            modelProfile: "asian_female",
            count: 1,
            specId: "taobao-detail-790",
            imageTypeId: "detail_header_poster",
            imageTypeIds: ["detail_header_poster", "detail_color_sku", "detail_model_fit", "detail_design_points", "detail_texture"],
            productGroupingMode: "single_product_multi_angle",
            generationMode: "suite",
            suitePresetId: "detail-basic-conversion",
            suiteSurface: "detail",
            targetWidth: 790,
            targetHeight: 1200,
            modelMode: "model"
          },
          sourceImages: [
            { id: "src-black", filename: "black-shirt.jpg", mimeType: "image/jpeg" },
            { id: "src-white", filename: "white-shirt.jpg", mimeType: "image/jpeg" }
          ],
          sourceImageGroups: [{
            id: "product-1",
            images: [
              { id: "src-black", filename: "black-shirt.jpg", mimeType: "image/jpeg" },
              { id: "src-white", filename: "white-shirt.jpg", mimeType: "image/jpeg" }
            ]
          }],
          status: "succeeded",
          progress: { completed: 2, total: 8 },
          prompt: { summary: "完整详情", body: "prompt", negativePrompt: "" },
          results: [
            {
              id: "result-suite-2",
              base64: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=",
              mimeType: "image/png",
              sourceFilename: "black-shirt.jpg + white-shirt.jpg",
              imageTypeId: "detail_color_sku",
              imageTypeLabel: "多色SKU总览",
              suiteItemId: "detail-basic-conversion-2-sku_color",
              suiteOrder: 2,
              suiteLabel: "多色SKU总览"
            },
            {
              id: "result-suite-1",
              base64: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=",
              mimeType: "image/png",
              sourceFilename: "black-shirt.jpg + white-shirt.jpg",
              imageTypeId: "detail_header_poster",
              imageTypeLabel: "详情首屏海报",
              suiteItemId: "detail-basic-conversion-1-detail_header",
              suiteOrder: 1,
              suiteLabel: "首屏海报"
            }
          ]
        }
      })
    });
  });

  await page.goto("/");
  await page.getByRole("button", { name: /宝贝详情.*套图/ }).click();
  await expect(page.getByRole("heading", { name: "详情图规格" })).toBeVisible();
  await expect(page.getByText("平台与详情规格")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "天猫/淘宝" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "跨境平台" })).toHaveCount(0);
  const detailSizeSwitch = page.getByRole("group", { name: "宝贝详情尺寸" });
  await expect(detailSizeSwitch.getByRole("button", { name: /默认规格790宽/ })).toBeVisible();
  await page.getByRole("button", { name: /自定义详情图尺寸/ }).first().click();
  await expect(page.getByLabel("自定义图片目标尺寸")).toBeVisible();
  await detailSizeSwitch.getByRole("button", { name: /默认规格790宽/ }).click();
  await expect(page.getByLabel("自定义图片目标尺寸")).toHaveCount(0);
  await expect(page.getByLabel("详情结构大纲")).toBeVisible();
  await expect(page.getByLabel("详情页生成大纲")).toBeVisible();
  await expect(page.getByLabel("详情页生成大纲").getByText("天猫/淘宝")).toHaveCount(0);
  await expect(page.getByLabel("详情模块编辑")).toHaveCount(0);
  await expect(page.locator(".detailSuiteModulePanel")).toHaveCount(0);
  await expect(page.getByLabel("完整详情长图预览")).toBeVisible();
  await expect(page.getByLabel("详情结构大纲").getByText("白底商品展示")).toHaveCount(0);
  await page.getByLabel("详情结构大纲").getByRole("button", { name: /首屏海报/ }).click();
  await expect(page.getByLabel("首屏海报模块输入")).toBeVisible();
  await expect(page.getByLabel("首屏海报模块输入").getByText("本模块素材")).toBeVisible();
  await expect(page.getByLabel("首屏海报模块输入").getByText("生成张数")).toHaveCount(0);
  await page.getByLabel("详情结构大纲").getByRole("button", { name: "增加该模块" }).first().click();
  await expect(page.getByLabel("首屏海报2模块输入")).toBeVisible();
  await expect(page.getByLabel("详情结构大纲").getByText("首屏海报1")).toBeVisible();
  await expect(page.getByLabel("详情结构大纲").getByText("首屏海报2")).toBeVisible();
  await page.getByLabel("详情结构大纲").getByRole("button", { name: /首屏海报2/ }).click();
  await expect(page.locator(".detailSuiteModulePanel")).toHaveCount(0);

  await page.locator('input[type="file"][multiple]').setInputFiles([
    { name: "black-shirt.jpg", mimeType: "image/jpeg", buffer: Buffer.from("fake-black") },
    { name: "white-shirt.jpg", mimeType: "image/jpeg", buffer: Buffer.from("fake-white") }
  ]);
  await expect(page.getByLabel("颜色分组")).toBeVisible();
  await expect(page.locator(".detailColorGroup input").nth(0)).toHaveValue("黑色");
  await expect(page.locator(".detailColorGroup input").nth(1)).toHaveValue("白色");
  await page.getByLabel("详情结构大纲").getByRole("button", { name: /模特全身场景/ }).click();
  await expect(page.getByLabel("模特全身场景模块输入").getByText("本模块素材")).toBeVisible();
  const firstModelModule = page.getByLabel("模特全身场景模块输入");
  await expect(firstModelModule.getByRole("button", { name: /黑色/ })).toHaveAttribute("aria-pressed", "false");
  await expect(firstModelModule.getByRole("button", { name: /白色/ })).toHaveAttribute("aria-pressed", "false");
  await firstModelModule.getByRole("button", { name: /黑色/ }).click();
  await expect(firstModelModule.getByRole("button", { name: /黑色/ })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByLabel("模特全身场景模块输入").getByText("模特图张数")).toHaveCount(0);
  await page.locator(".detailSuiteModuleItem").filter({ hasText: "模特全身场景" }).first().getByRole("button", { name: "增加该模块" }).click();
  await expect(page.getByLabel("模特全身场景2模块输入")).toBeVisible();
  const secondModelModule = page.getByLabel("模特全身场景2模块素材");
  await expect(secondModelModule.getByRole("button", { name: /白色/ })).toHaveAttribute("aria-pressed", "false");
  await secondModelModule.getByRole("button", { name: /白色/ }).click();
  await expect(secondModelModule.getByRole("button", { name: /白色/ })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("button", { name: "请先上传尺码表" })).toBeDisabled();
  await page.locator(".hiddenFileInput").setInputFiles({
    name: "size-chart.jpg",
    mimeType: "image/jpeg",
    buffer: Buffer.from("fake-size-chart")
  });
  await page.getByLabel("详情结构大纲").getByRole("button", { name: /尺码说明/ }).click();
  await expect(page.getByLabel("尺码说明模块输入").getByText("size-chart.jpg")).toBeVisible();

  await page.getByRole("button", { name: "生成完整详情" }).click();
  expect(submittedBody).toContain('name="generationMode"');
  expect(submittedBody).toContain("suite");
  expect(submittedBody).toContain('name="platform"');
  expect(submittedBody).toContain("taobao");
  expect(submittedBody).toContain('name="specId"');
  expect(submittedBody).toContain("taobao-detail-790");
  expect(submittedBody).toContain('name="targetWidth"');
  expect(submittedBody).toContain("790");
  expect(submittedBody).toContain('name="targetHeight"');
  expect(submittedBody).toContain("1200");
  expect(submittedBody).toContain('name="suiteSurface"');
  expect(submittedBody).toContain("detail");
  expect(submittedBody).toContain('name="suitePresetId"');
  expect(submittedBody).toContain("detail-basic-conversion");
  expect(submittedBody).toContain('name="productGroupingMode"');
  expect(submittedBody).toContain("single_product_multi_angle");
  expect(submittedBody).toContain('name="suiteItemIds"');
  expect(submittedBody).toContain("__copy_");
  expect(submittedBody).toContain('name="suiteModuleConfigs"');
  expect(submittedBody).toContain("baseSuiteItemId");
  expect(submittedBody).toContain("selectedColorGroupIds");
  expect(submittedBody).toContain("black");
  expect(submittedBody).toContain("white");
  expect(submittedBody).not.toContain("colorShotRequests");
  expect(submittedBody).not.toContain('name="moduleCopies"');
  expect(submittedBody).toContain('name="merchantInfoImage"');
  expect(submittedBody).toContain('name="productAnalysis"');

  await expect(page.getByText("完整详情长图预览")).toBeVisible();
  const previewLabels = page.locator(".detailPreviewModule header strong");
  await expect(previewLabels.nth(0)).toContainText("首屏海报");
  await expect(previewLabels.nth(1)).toContainText("多色SKU总览");
  await expect(page.getByRole("button", { name: "导出套图" })).toBeVisible();
  await expect(page.getByRole("button", { name: "套图生成" })).toHaveCount(0);
});

test("workbench restores image draft after reload", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => {
    localStorage.removeItem("ds-bags.imageWorkbenchDraft.v1");
  });

  await page.getByRole("button", { name: /宝贝详情.*套图/ }).click();
  await page.locator('input[type="file"][multiple]').setInputFiles([
    { name: "black-shirt.jpg", mimeType: "image/jpeg", buffer: Buffer.from("fake-black") },
    { name: "white-shirt.jpg", mimeType: "image/jpeg", buffer: Buffer.from("fake-white") }
  ]);
  await page.getByLabel("详情结构大纲").getByRole("button", { name: /首屏海报/ }).click();
  await expect(page.getByLabel("首屏海报模块输入")).toBeVisible();

  await page.waitForFunction(() => localStorage.getItem("ds-bags.imageWorkbenchDraft.v1")?.includes("black-shirt.jpg"));
  await page.reload();

  await expect(page.getByRole("button", { name: /宝贝详情.*套图/ })).toHaveClass(/active/);
  await expect(page.getByLabel("详情结构大纲")).toBeVisible();
  await expect(page.getByLabel("颜色分组")).toBeVisible();
  await expect(page.getByText("black-shirt.jpg")).toBeVisible();
  await expect(page.getByText("white-shirt.jpg")).toBeVisible();
  await expect(page.getByLabel("首屏海报模块输入")).toBeVisible();
});

test("workbench restores custom video draft after reload", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => {
    localStorage.removeItem("ds-bags.imageWorkbenchDraft.v1");
    localStorage.removeItem("ds-bags.videoWorkbenchDraft.v1");
  });

  await page.getByRole("button", { name: "视频生成" }).click();
  await page.getByRole("button", { name: /说一句话，生成你想要的视频/ }).click();
  await page.locator(".customVideoBuilder input[type='file']").setInputFiles({
    name: "video-product.jpg",
    mimeType: "image/jpeg",
    buffer: Buffer.from("fake-video-product")
  });
  await page.getByPlaceholder(/简单描述想要什么样的视频/).fill("高级棚拍感，突出面料和版型");

  await page.waitForFunction(() => {
    const imageDraft = localStorage.getItem("ds-bags.imageWorkbenchDraft.v1") ?? "";
    const videoDraft = localStorage.getItem("ds-bags.videoWorkbenchDraft.v1") ?? "";
    return imageDraft.includes('"workspaceMode":"video"') && videoDraft.includes("video-product.jpg");
  });
  await page.reload();

  await expect(page.getByText("自定义生成视频")).toBeVisible();
  await expect(page.getByRole("img", { name: "video-product.jpg" })).toBeVisible();
  await expect(page.getByPlaceholder(/简单描述想要什么样的视频/)).toHaveValue("高级棚拍感，突出包身、底部与五金和容量感。");
});

test("workbench supports category search and inline custom specs", async ({ page }) => {
  await page.goto("/");

  await page.getByLabel("搜索具体类目").fill("托特");
  await expect(page.getByLabel("类目搜索结果").getByRole("button", { name: /托特包/ })).toBeVisible();
  await page.getByLabel("类目搜索结果").getByRole("button", { name: /托特包/ }).click();
  await expect(page.getByText(/当前：.*托特包/)).toBeVisible();

  await page.getByLabel("搜索具体类目").fill("未录入测试类目");
  await page.getByLabel("类目搜索结果").getByRole("button", { name: /箱包/ }).click();
  await expect(page.getByText(/当前：.*箱包/)).toBeVisible();

  await expect(page.getByText("自定义规格区")).toHaveCount(0);
  await expect(page.getByText("自定义图片")).toHaveCount(0);
  await expect(page.getByRole("button", { name: /自定义尺寸/ })).toBeVisible();
  await page.getByRole("button", { name: /自定义尺寸/ }).click();
  await page.getByLabel("自定义图片目标宽").click();
  await expect(page.getByRole("button", { name: /主图生成类型/ })).toBeVisible();
  await expect(page.getByRole("button", { name: /默认规格790宽/ })).toHaveCount(0);
  await expect(page.getByRole("button", { name: /详情模块菜单/ })).toHaveCount(0);
});

test("workbench supports expanded platform choices", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("button", { name: "天猫/淘宝", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "小红书" })).toBeVisible();
  await expect(page.getByRole("button", { name: "快手" })).toBeVisible();
  await expect(page.getByRole("button", { name: "视频号" })).toBeVisible();
  await expect(page.getByRole("button", { name: "其他", exact: true })).toBeVisible();

  await page.getByRole("button", { name: /跨境平台/ }).click();
  await page.getByLabel("跨境平台子品类").getByRole("button", { name: "Amazon" }).click();
  await expect(page.getByRole("button", { name: "主图 2000x2000 main · 2000x2000" })).toBeVisible();
  await page.getByRole("button", { name: /自定义尺寸/ }).click();
  await expect(page.getByLabel("自定义图片目标宽")).toBeVisible();
  await expect(page.getByRole("button", { name: /主图生成类型/ })).toBeVisible();
});

test("user center links to account and generation records pages", async ({ page }) => {
  const completedJob = {
    id: "job-user-center-1",
    mode: "image_edit",
    customerId: "user-e2e",
    reservedCredits: 12,
    chargedCredits: 12,
    createdAt: "2026-07-02T08:00:00.000Z",
    updatedAt: "2026-07-02T08:01:00.000Z",
    options: {
      platform: "taobao",
      category: "women",
      productCategoryLabel: "连衣裙",
      sceneVariant: "modern_studio",
      size: "square",
      modelProfile: "asian_female",
      count: 1,
      specId: "taobao-main-square",
      imageTypeId: "studio_main",
      imageTypeIds: ["studio_main"],
      targetWidth: 1024,
      targetHeight: 1024,
      modelMode: "model"
    },
    sourceImages: [{ id: "src-1", filename: "tote.jpg", mimeType: "image/jpeg" }],
    sourceImageGroups: [{ id: "product-1", images: [{ id: "src-1", filename: "tote.jpg", mimeType: "image/jpeg" }] }],
    status: "succeeded",
    progress: { completed: 1, total: 1 },
    prompt: { summary: "托特包棚拍", body: "prompt", negativePrompt: "" },
    results: [{
      id: "result-1",
      base64: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=",
      mimeType: "image/png",
      sourceFilename: "tote.jpg",
      imageTypeId: "studio_main",
      imageTypeLabel: "棚拍主图"
    }]
  };

  await page.route("**/api/auth/me", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        user: { id: "user-e2e", phone: "13800138000", status: "active", createdAt: "2026-07-02T07:00:00.000Z", updatedAt: "2026-07-02T07:00:00.000Z" },
        account: { customerId: "user-e2e", balanceCredits: 2680, frozenCredits: 12, updatedAt: "2026-07-02T08:01:00.000Z" }
      })
    });
  });
  await page.route("**/api/generation-jobs**", async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ jobs: [completedJob] })
      });
      return;
    }
    await route.continue();
  });
  await page.route("**/api/video-jobs**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ jobs: [] })
    });
  });

  await page.goto("/");
  await page.getByRole("button", { name: "我的" }).click();
  await expect(page.getByRole("dialog", { name: "用户中心" })).toBeVisible();

  await page.getByRole("link", { name: /账号资料/ }).click();
  await expect(page).toHaveURL(/\/account/);
  await expect(page.getByRole("heading", { name: "账号资料" })).toBeVisible();
  await expect(page.getByText("13800138000")).toBeVisible();
  await expect(page.locator(".accountInfoPanel").first().getByText("user-e2e")).toBeVisible();
  await expect(page.locator(".accountInfoPanel").nth(1).getByText("2,680")).toBeVisible();

  await page.getByRole("link", { name: "生成记录" }).click();
  await expect(page).toHaveURL(/\/generation-records/);
  await expect(page.getByRole("heading", { name: "生成记录" })).toBeVisible();
  await expect(page.getByText("图片和视频生成记录仅保留 24 小时，请及时下载。")).toBeVisible();
  await expect(page.getByLabel("生成作品图库").getByText("棚拍主图")).toBeVisible();
  await expect(page.getByLabel("生成作品图库").getByRole("button", { name: "下载", exact: true })).toBeVisible();
  await page.getByLabel("任务记录").getByRole("button", { name: /连衣裙/ }).click();
  await expect(page.getByRole("heading", { name: /连衣裙 的作品/ })).toBeVisible();
  await expect(page.getByText("生成完成")).toBeVisible();

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  expect(overflow).toBe(false);
});
