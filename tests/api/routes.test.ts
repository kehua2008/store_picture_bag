import { describe, expect, it } from "vitest";
import { DELETE as deleteCustomModel, GET as listCustomModels, PATCH as renameCustomModel, POST as createCustomModel } from "../../app/api/custom-models/route";
import { GET as getCustomModelImage } from "../../app/api/custom-models/[id]/image/route";
import { GET as getGenerationJob, PATCH as updateGenerationJob } from "../../app/api/generation-jobs/[id]/route";
import { GET as listGenerationJobs, POST as createGenerationJob } from "../../app/api/generation-jobs/route";
import { POST as createVideoJob } from "../../app/api/video-jobs/route";
import { POST as qualityCheck } from "../../app/api/quality-check/route";
import { POST as registerUser } from "../../app/api/auth/register/route";
import { GET as getCurrentUser } from "../../app/api/auth/me/route";
import { GET as listAdminMembers, PATCH as updateAdminMember } from "../../app/api/admin/members/route";
import { GET as listAdminBilling } from "../../app/api/admin/billing/route";
import { GET as listRechargeOrders, PATCH as reviewRechargeOrder } from "../../app/api/recharge-orders/route";
import { GET as listFeedbackReports, PATCH as reviewFeedbackReport, POST as createFeedbackReport } from "../../app/api/feedback-reports/route";
import { authSessionCookieName } from "../../src/server/auth";
import { generationJobRetentionMs } from "../../src/domain/jobs/generationJobService";
import { feedbackReportRepository, generationJobService, rechargeOrderRepository, userRepository } from "../../src/server/services";

describe("API routes", () => {
  it("rejects invalid video job requests", async () => {
    const auth = await authenticatedSession();
    const response = await createVideoJob(new Request("http://test.local/api/video-jobs", {
      method: "POST",
      headers: { cookie: auth.cookie },
      body: JSON.stringify({ prompt: "" })
    }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("invalid_video_job_request");
  });

  it("rejects private audio urls before creating video jobs", async () => {
    const auth = await authenticatedSession();
    const response = await createVideoJob(new Request("http://test.local/api/video-jobs", {
      method: "POST",
      headers: { cookie: auth.cookie },
      body: JSON.stringify({
        prompt: "Create a product video with music.",
        metadata: {
          referenceSourceType: "none",
          referenceAudioLink: "http://localhost:3000/audio.mp3"
        }
      })
    }));
    const body = await response.json();

    expect(response.status).toBe(422);
    expect(body.error).toBe("reference_audio_public_url_required");
  });

  it("registers users with zero credits and exposes the current session", async () => {
    const response = await registerUser(new Request("http://test.local/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ phone: uniquePhone(), password: "password123" })
    }));
    const body = await response.json();
    const cookie = response.headers.get("set-cookie") ?? "";

    expect(response.status).toBe(201);
    expect(body.user.status).toBe("active");
    expect(body.account.balanceCredits).toBe(0);
    expect(body.account.frozenCredits).toBe(0);

    const me = await getCurrentUser(new Request("http://test.local/api/auth/me", {
      headers: { cookie }
    }));
    const meBody = await me.json();
    expect(me.status).toBe(200);
    expect(meBody.user.phone).toBe(body.user.phone);
  });

  it("protects admin member and billing APIs behind the admin allowlist", async () => {
    const target = await authenticatedSession();
    const ordinary = await authenticatedSession();
    const admin = await authenticatedSession();

    const anonymousMembers = await listAdminMembers(new Request("http://test.local/api/admin/members"));
    expect(anonymousMembers.status).toBe(401);

    const forbiddenMembers = await listAdminMembers(new Request("http://test.local/api/admin/members", {
      headers: { cookie: ordinary.cookie }
    }));
    expect(forbiddenMembers.status).toBe(403);

    const forbiddenAdjustment = await updateAdminMember(new Request("http://test.local/api/admin/members", {
      method: "PATCH",
      headers: {
        cookie: ordinary.cookie,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ userId: target.user.id, action: "adjust", deltaCredits: 50, reason: "blocked" })
    }));
    expect(forbiddenAdjustment.status).toBe(403);

    await withAdminUser(admin.user.id, async () => {
      const billing = await listAdminBilling(new Request("http://test.local/api/admin/billing", {
        headers: { cookie: admin.cookie }
      }));
      expect(billing.status).toBe(200);

      const adjusted = await updateAdminMember(new Request("http://test.local/api/admin/members", {
        method: "PATCH",
        headers: {
          cookie: admin.cookie,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ userId: target.user.id, action: "adjust", deltaCredits: 50, reason: "allowed" })
      }));
      const adjustedBody = await adjusted.json();
      expect(adjusted.status).toBe(200);
      expect(adjustedBody.account.balanceCredits).toBe(100050);

      const ledger = await rechargeOrderRepository.all(target.user.id);
      expect(ledger.ledgerEntries[0]).toEqual(expect.objectContaining({
        type: "admin_adjustment",
        operatorId: admin.user.id
      }));
    });
  });

  it("protects full recharge review APIs behind the admin allowlist", async () => {
    const customer = await authenticatedSession();
    const ordinary = await authenticatedSession();
    const admin = await authenticatedSession();
    const { order } = await rechargeOrderRepository.create({
      customerId: customer.user.id,
      planId: "credits-990",
      paymentMethod: "wechat",
      proof: testImageFile("proof.jpg")
    });

    const publicOwnList = await listRechargeOrders(new Request(`http://test.local/api/recharge-orders?customerId=${customer.user.id}`));
    expect(publicOwnList.status).toBe(401);

    const ownList = await listRechargeOrders(new Request(`http://test.local/api/recharge-orders?customerId=${customer.user.id}`, {
      headers: { cookie: customer.cookie }
    }));
    expect(ownList.status).toBe(200);

    const anonymousFullList = await listRechargeOrders(new Request("http://test.local/api/recharge-orders"));
    expect(anonymousFullList.status).toBe(401);

    const forbiddenReview = await reviewRechargeOrder(new Request("http://test.local/api/recharge-orders", {
      method: "PATCH",
      headers: {
        cookie: ordinary.cookie,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ id: order.id, status: "approved" })
    }));
    expect(forbiddenReview.status).toBe(403);

    await withAdminUser(admin.user.id, async () => {
      const fullList = await listRechargeOrders(new Request("http://test.local/api/recharge-orders", {
        headers: { cookie: admin.cookie }
      }));
      expect(fullList.status).toBe(200);

      const approved = await reviewRechargeOrder(new Request("http://test.local/api/recharge-orders", {
        method: "PATCH",
        headers: {
          cookie: admin.cookie,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ id: order.id, status: "approved" })
      }));
      const approvedBody = await approved.json();
      expect(approved.status).toBe(200);
      expect(approvedBody.order.status).toBe("approved");
      expect(approvedBody.account.balanceCredits).toBe(100990);
    });
  });

  it("keeps feedback reports user-scoped and admin-reviewable", async () => {
    const customer = await authenticatedSession("运营A");
    const ordinary = await authenticatedSession("运营B");
    const admin = await authenticatedSession();

    const formData = new FormData();
    formData.set("title", "充值页截图上传后没有反馈");
    formData.set("description", "上传付款截图后按钮状态没有变化，需要后台看一下。");
    formData.set("contact", "wechat-test");
    formData.append("screenshots", testImageFile("feedback.png"));

    const created = await createFeedbackReport(new Request("http://test.local/api/feedback-reports", {
      method: "POST",
      headers: { cookie: customer.cookie },
      body: formData
    }));
    const createdBody = await created.json();
    expect(created.status).toBe(201);
    expect(createdBody.report).toEqual(expect.objectContaining({
      customerId: customer.user.id,
      customerPhone: customer.user.phone,
      actorName: "运营A",
      status: "pending"
    }));

    const ownList = await listFeedbackReports(new Request("http://test.local/api/feedback-reports", {
      headers: { cookie: customer.cookie }
    }));
    const ownBody = await ownList.json();
    expect(ownList.status).toBe(200);
    expect(ownBody.reports.some((report: { id: string }) => report.id === createdBody.report.id)).toBe(true);

    const ordinaryList = await listFeedbackReports(new Request("http://test.local/api/feedback-reports", {
      headers: { cookie: ordinary.cookie }
    }));
    const ordinaryBody = await ordinaryList.json();
    expect(ordinaryList.status).toBe(200);
    expect(ordinaryBody.reports.some((report: { id: string }) => report.id === createdBody.report.id)).toBe(false);

    const forbiddenReview = await reviewFeedbackReport(new Request("http://test.local/api/feedback-reports", {
      method: "PATCH",
      headers: {
        cookie: ordinary.cookie,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ id: createdBody.report.id, status: "valid" })
    }));
    expect(forbiddenReview.status).toBe(403);

    await withAdminUser(admin.user.id, async () => {
      const adminList = await listFeedbackReports(new Request("http://test.local/api/feedback-reports", {
        headers: { cookie: admin.cookie }
      }));
      const adminListBody = await adminList.json();
      expect(adminList.status).toBe(200);
      expect(adminListBody.reports.some((report: { id: string }) => report.id === createdBody.report.id)).toBe(true);

      const reviewed = await reviewFeedbackReport(new Request("http://test.local/api/feedback-reports", {
        method: "PATCH",
        headers: {
          cookie: admin.cookie,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ id: createdBody.report.id, status: "resolved", adminNote: "已处理" })
      }));
      const reviewedBody = await reviewed.json();
      expect(reviewed.status).toBe(200);
      expect(reviewedBody.report).toEqual(expect.objectContaining({
        status: "resolved",
        adminNote: "已处理"
      }));
    });

    const feedback = await feedbackReportRepository.all(customer.user.id);
    expect(feedback.reports[0].status).toBe("resolved");
  });

  it("requires login and available credits before creating generation jobs", async () => {
    const unauthenticatedRequest = new Request("http://test.local/api/generation-jobs", { method: "POST" }) as Request & { formData: () => Promise<FormData> };
    Object.defineProperty(unauthenticatedRequest, "formData", { value: async () => baseGenerationForm() });
    const unauthenticated = await createGenerationJob(unauthenticatedRequest);
    expect(unauthenticated.status).toBe(401);

    const user = await userRepository.register({ phone: uniquePhone(), password: "password123" });
    const session = await userRepository.createSession(user.id);
    const insufficientRequest = new Request("http://test.local/api/generation-jobs", {
      method: "POST",
      headers: { cookie: `${authSessionCookieName}=${session.id}` }
    }) as Request & { formData: () => Promise<FormData> };
    Object.defineProperty(insufficientRequest, "formData", { value: async () => baseGenerationForm() });
    const insufficient = await createGenerationJob(insufficientRequest);
    expect(insufficient.status).toBe(402);
  });

  it("creates a multipart generation job", async () => {
    const form = new FormData();
    form.append("platform", "vipshop");
    form.append("category", "women");
    form.append("scene", "studio");
    form.append("sceneVariant", "minimal_solid");
    form.append("size", "portrait");
    form.append("modelProfile", "asian_female");
    form.append("modelMode", "model");
    form.append("specId", "vipshop-main-portrait");
    form.append("imageTypeId", "studio_main");
    form.append("imageTypeIds", "studio_main");
    form.append("productGroupingMode", "per_image");
    form.append("targetWidth", "1340");
    form.append("targetHeight", "1785");
    form.append("photoMetadataMode", "simulated");
    form.append("count", "1");
    form.append("images", new File(["image"], "knit.jpg", { type: "image/jpeg" }));

    const request = await authenticatedGenerationRequest(form);
    const response = await createGenerationJob(request);

    const body = await response.json();
    expect(response.status).toBe(202);
    expect(body.job.status).toBe("running");
    expect(body.job.mode).toBe("image_edit");
    expect(body.job.sourceImages).toEqual([
      expect.objectContaining({ filename: "knit.jpg", mimeType: "image/jpeg" })
    ]);
    expect(body.job.sourceImageGroups).toEqual([
      expect.objectContaining({
        id: "product-1",
        images: [expect.objectContaining({ filename: "knit.jpg", mimeType: "image/jpeg" })]
      })
    ]);
    expect(body.job.sourceImages[0].file).toBeUndefined();
    expect(body.job.prompt.body).toContain("Do not add text");
    expect(body.job.options.modelProfile).toBe("asian_female");
    expect(body.job.options.specId).toBe("vipshop-main-portrait");
    expect(body.job.options.imageTypeId).toBe("studio_main");
    expect(body.job.options.imageTypeIds).toEqual(["studio_main"]);
    expect(body.job.options.targetWidth).toBe(1340);
    expect(body.job.options.photoMetadataMode).toBe("simulated");

    const poll = await getGenerationJob(new Request(`http://test.local/api/generation-jobs/${body.job.id}`, {
      headers: { cookie: request.headers.get("cookie") ?? "" }
    }), {
      params: Promise.resolve({ id: body.job.id })
    });
    expect(poll.status).toBe(200);
  });

  it("rejects generation jobs with too many uploaded images", async () => {
    const form = baseGenerationForm();
    for (let index = 0; index < 13; index += 1) {
      form.append("images", new File(["image"], `bag-${index}.jpg`, { type: "image/jpeg" }));
    }

    const response = await createGenerationJob(await authenticatedGenerationRequest(form));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("too_many_images");
    expect(body.max).toBe(12);
  });

  it("rejects generation jobs with oversized uploaded images", async () => {
    const form = baseGenerationForm();
    form.append("images", new File([new Uint8Array(8 * 1024 * 1024 + 1)], "too-large.jpg", { type: "image/jpeg" }));

    const response = await createGenerationJob(await authenticatedGenerationRequest(form));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("image_file_too_large");
    expect(body.filename).toBe("too-large.jpg");
  });

  it("rejects generation jobs that would create too many outputs", async () => {
    const form = baseGenerationForm();
    form.set("imageTypeCounts", JSON.stringify({ studio_main: 13 }));
    form.delete("images");
    form.append("images", new File(["image"], "shirt.jpg", { type: "image/jpeg" }));

    const response = await createGenerationJob(await authenticatedGenerationRequest(form));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("too_many_generation_outputs");
    expect(body.planned).toBe(13);
    expect(body.max).toBe(12);
  });

  it("cancels a running generation job", async () => {
    const auth = await authenticatedSession();
    const job = generationJobService.createJob({
      customerId: auth.user.id,
      reservedCredits: 12,
      options: {
        platform: "vipshop",
        category: "women",
        scene: "studio",
        sceneVariant: "minimal_solid",
        size: "portrait",
        modelProfile: "asian_female",
        modelMode: "model",
        count: 1,
        specId: "vipshop-main-portrait",
        imageTypeId: "studio_main",
        imageTypeIds: ["studio_main"],
        productGroupingMode: "per_image",
        targetWidth: 1340,
        targetHeight: 1785
      },
      sourceImages: [{ id: "src-cancel", filename: "printed-knit.jpg", mimeType: "image/jpeg", file: new Blob(["image"], { type: "image/jpeg" }) }]
    });
    await rechargeOrderRepository.reserveGenerationCredits({
      customerId: auth.user.id,
      generationJobId: job.id,
      credits: 12,
      reason: "测试冻结积分"
    });

    const canceled = await updateGenerationJob(new Request(`http://test.local/api/generation-jobs/${job.id}`, {
      method: "PATCH",
      headers: { cookie: auth.cookie },
      body: JSON.stringify({ action: "cancel" })
    }), {
      params: Promise.resolve({ id: job.id })
    });
    const canceledBody = await canceled.json();

    expect(canceled.status).toBe(200);
    expect(canceledBody.job.status).toBe("canceled");

    const me = await getCurrentUser(new Request("http://test.local/api/auth/me", {
      headers: { cookie: auth.cookie }
    }));
    const meBody = await me.json();
    const ledger = await rechargeOrderRepository.all(auth.user.id);
    expect(meBody.account.frozenCredits).toBe(0);
    expect(ledger.ledgerEntries.some((entry) => entry.type === "generation_release" && entry.generationJobId === job.id)).toBe(true);
  });

  it("does not return expired generation jobs from API lists or detail", async () => {
    const auth = await authenticatedSession();
    const expiredJob = generationJobService.createJob({
      customerId: auth.user.id,
      reservedCredits: 12,
      options: baseJobOptions(),
      sourceImages: [{ id: "src-expired-api", filename: "expired.jpg", mimeType: "image/jpeg", file: new Blob(["image"], { type: "image/jpeg" }) }]
    });
    const expiredAt = new Date(Date.now() - generationJobRetentionMs - 1000).toISOString();
    expiredJob.createdAt = expiredAt;
    expiredJob.updatedAt = expiredAt;
    const recentJob = generationJobService.createJob({
      customerId: auth.user.id,
      options: baseJobOptions(),
      sourceImages: [{ id: "src-recent-api", filename: "recent.jpg", mimeType: "image/jpeg", file: new Blob(["image"], { type: "image/jpeg" }) }]
    });

    const list = await listGenerationJobs(new Request("http://test.local/api/generation-jobs", {
      headers: { cookie: auth.cookie }
    }));
    const listBody = await list.json();
    expect(listBody.jobs.map((item: { id: string }) => item.id)).not.toContain(expiredJob.id);
    expect(listBody.jobs.map((item: { id: string }) => item.id)).toContain(recentJob.id);

    const detail = await getGenerationJob(new Request(`http://test.local/api/generation-jobs/${expiredJob.id}`, {
      headers: { cookie: auth.cookie }
    }), {
      params: Promise.resolve({ id: expiredJob.id })
    });
    expect(detail.status).toBe(404);
  });

  it("lists only the signed-in user's generation jobs and hides other users' jobs", async () => {
    const first = await authenticatedSession();
    const second = await authenticatedSession();
    const ownJob = generationJobService.createJob({
      customerId: first.user.id,
      reservedCredits: 12,
      options: baseJobOptions(),
      sourceImages: [{ id: "src-own", filename: "own.jpg", mimeType: "image/jpeg", file: new Blob(["image"], { type: "image/jpeg" }) }]
    });
    const otherJob = generationJobService.createJob({
      customerId: second.user.id,
      options: baseJobOptions(),
      sourceImages: [{ id: "src-other", filename: "other.jpg", mimeType: "image/jpeg", file: new Blob(["image"], { type: "image/jpeg" }) }]
    });

    const anonymousList = await listGenerationJobs(new Request("http://test.local/api/generation-jobs"));
    expect(anonymousList.status).toBe(401);

    const list = await listGenerationJobs(new Request("http://test.local/api/generation-jobs", {
      headers: { cookie: first.cookie }
    }));
    const listBody = await list.json();
    expect(list.status).toBe(200);
    expect(listBody.jobs.map((item: { id: string }) => item.id)).toContain(ownJob.id);
    expect(listBody.jobs.map((item: { id: string }) => item.id)).not.toContain(otherJob.id);
    expect(listBody.jobs[0]).toEqual(expect.objectContaining({
      customerId: first.user.id,
      reservedCredits: 12,
      createdAt: expect.any(String),
      updatedAt: expect.any(String)
    }));

    const hiddenDetail = await getGenerationJob(new Request(`http://test.local/api/generation-jobs/${otherJob.id}`, {
      headers: { cookie: first.cookie }
    }), {
      params: Promise.resolve({ id: otherJob.id })
    });
    expect(hiddenDetail.status).toBe(404);

    const hiddenCancel = await updateGenerationJob(new Request(`http://test.local/api/generation-jobs/${otherJob.id}`, {
      method: "PATCH",
      headers: { cookie: first.cookie },
      body: JSON.stringify({ action: "cancel" })
    }), {
      params: Promise.resolve({ id: otherJob.id })
    });
    expect(hiddenCancel.status).toBe(404);
    expect(generationJobService.getJob(otherJob.id)?.status).toBe("running");
  });

  it("isolates same-account generation jobs by current actor while sharing the account", async () => {
    const auth = await authenticatedSession("同事A");
    const secondSession = await userRepository.createSession(auth.user.id, "同事B");
    const secondCookie = `${authSessionCookieName}=${secondSession.id}`;
    const firstJob = generationJobService.createJob({
      customerId: auth.user.id,
      createdByActorId: auth.session.actorId,
      createdByActorName: auth.session.actorName,
      options: baseJobOptions(),
      sourceImages: [{ id: "src-actor-a", filename: "actor-a.jpg", mimeType: "image/jpeg", file: new Blob(["image"], { type: "image/jpeg" }) }]
    });
    const secondJob = generationJobService.createJob({
      customerId: auth.user.id,
      createdByActorId: secondSession.actorId,
      createdByActorName: secondSession.actorName,
      options: baseJobOptions(),
      sourceImages: [{ id: "src-actor-b", filename: "actor-b.jpg", mimeType: "image/jpeg", file: new Blob(["image"], { type: "image/jpeg" }) }]
    });

    const mine = await listGenerationJobs(new Request("http://test.local/api/generation-jobs", {
      headers: { cookie: auth.cookie }
    }));
    const mineBody = await mine.json();
    expect(mineBody.jobs.map((item: { id: string }) => item.id)).toContain(firstJob.id);
    expect(mineBody.jobs.map((item: { id: string }) => item.id)).not.toContain(secondJob.id);

    const all = await listGenerationJobs(new Request("http://test.local/api/generation-jobs?scope=all", {
      headers: { cookie: auth.cookie }
    }));
    const allBody = await all.json();
    expect(allBody.jobs.map((item: { id: string }) => item.id)).toEqual(expect.arrayContaining([firstJob.id, secondJob.id]));

    const blockedCancel = await updateGenerationJob(new Request(`http://test.local/api/generation-jobs/${firstJob.id}`, {
      method: "PATCH",
      headers: { cookie: secondCookie },
      body: JSON.stringify({ action: "cancel" })
    }), {
      params: Promise.resolve({ id: firstJob.id })
    });
    expect(blockedCancel.status).toBe(403);
    expect(generationJobService.getJob(firstJob.id)?.status).toBe("running");
  });

  it("maps no-model jobs to product_only", async () => {
    const form = new FormData();
    form.append("platform", "taobao");
    form.append("category", "men");
    form.append("scene", "white");
    form.append("sceneVariant", "pure_white");
    form.append("size", "square");
    form.append("modelProfile", "asian_female");
    form.append("modelMode", "no_model");
    form.append("specId", "taobao-main-square");
    form.append("imageTypeId", "white_main");
    form.append("count", "1");
    form.append("images", new File(["image"], "shirt.jpg", { type: "image/jpeg" }));

    const response = await createGenerationJob(await authenticatedGenerationRequest(form));
    const body = await response.json();

    expect(response.status).toBe(202);
    expect(body.job.options.modelProfile).toBe("product_only");
    expect(body.job.prompt.body).toContain("no human model");
  });

  it("accepts a temporary model reference image without saving a custom model", async () => {
    const form = baseGenerationForm();
    form.append("modelReferenceImage", new File(["model"], "temp-model.jpg", { type: "image/jpeg" }));

    const response = await createGenerationJob(await authenticatedGenerationRequest(form));
    const body = await response.json();

    expect(response.status).toBe(202);
    expect(body.job.modelReferenceImage).toEqual(
      expect.objectContaining({ filename: "temp-model.jpg", mimeType: "image/jpeg" })
    );
    expect(body.job.options.customModelId).toBe("uploaded-model-reference");
    expect(body.job.options.customModelName).toBe("temp-model.jpg");
    expect(body.job.prompt.body).toContain("Custom model reference selected");
  });

  it("creates a batch generation job for multiple image types", async () => {
    const form = new FormData();
    form.append("platform", "taobao");
    form.append("category", "women");
    form.append("scene", "studio");
    form.append("sceneVariant", "modern_studio");
    form.append("size", "square");
    form.append("modelProfile", "asian_female");
    form.append("modelMode", "model");
    form.append("specId", "taobao-main-square");
    form.append("imageTypeIds", "white_main");
    form.append("imageTypeIds", "studio_main");
    form.append("productGroupingMode", "single_product_multi_angle");
    form.append("count", "1");
    form.append("images", new File(["image"], "knit-side.jpg", { type: "image/jpeg" }));
    form.append("images", new File(["image"], "knit-back.jpg", { type: "image/jpeg" }));

    const response = await createGenerationJob(await authenticatedGenerationRequest(form));
    const body = await response.json();

    expect(response.status).toBe(202);
    expect(body.job.options.imageTypeId).toBe("white_main");
    expect(body.job.options.imageTypeIds).toEqual(["white_main", "studio_main"]);
    expect(body.job.options.productGroupingMode).toBe("single_product_multi_angle");
    expect(body.job.sourceImageGroups[0].images).toHaveLength(2);
    expect(body.job.progress.total).toBe(2);
  });

  it("accepts saved custom style prompts and reference images without blocking the task", async () => {
    const form = baseGenerationForm();
    const longStylePrompt = [
      "Saved custom style \"自定义风格1\":",
      "Reverse-engineer the reference image color palette, lighting mood, camera angle, background material, composition rhythm, commercial polish and post-production texture.",
      "Apply only the style language to the new product image, never copy unrelated objects, logos, text, props, people, or product identity.",
      "Keep the uploaded product silhouette, material, print, structure and color blocking unchanged while borrowing the reference styling direction.",
      "Preserve the same premium ecommerce retouching, lens compression, shadow softness, background restraint, palette hierarchy, and merchant-grade finish from the saved style reference."
    ].join(" ");
    expect(longStylePrompt.length).toBeGreaterThan(500);
    form.append("customStyleIds", "custom-style-1");
    form.append("customStyleLabels", "自定义风格1");
    form.append("customStylePrompts", longStylePrompt);
    form.append("styleReferenceImages", new File(["style"], "saved-style.jpg", { type: "image/jpeg" }));

    const response = await createGenerationJob(await authenticatedGenerationRequest(form));
    const body = await response.json();

    expect(response.status).toBe(202);
    expect(body.job.options.customStyleIds).toEqual(["custom-style-1"]);
    expect(body.job.options.customStyleLabels).toEqual(["自定义风格1"]);
    expect(body.job.options.customStylePrompts).toEqual([longStylePrompt]);
    expect(body.job.styleReferenceImages).toEqual([
      expect.objectContaining({ filename: "saved-style.jpg", mimeType: "image/jpeg" })
    ]);
    expect(body.job.styleReferenceImages[0].file).toBeUndefined();
    expect(body.job.sourceImages).toHaveLength(1);
    expect(body.job.prompt.body).toContain("Custom reference style reconstruction");
    expect(body.job.prompt.body).toContain("自定义风格1");
  });

  it("accepts uploaded reference style prompts when the original filename is very long", async () => {
    const form = baseGenerationForm();
    const longFilename = "taobao-page-head-poster-vipshop_hero_wool_cardigan_mist_gray-1-3-final-reference-style-image-with-extra-campaign-copy.png";
    const analyzedPrompt = [
      `Uploaded reference style "${longFilename}":`,
      "Reference style controls only background, lighting, tone, lens and composition.",
      "Highest priority: preserve uploaded product logo, material, texture, pattern, silhouette, shape and color blocking."
    ].join(" ");
    form.append("customStyleIds", "uploaded-style-ref-test");
    form.append("customStyleLabels", "参考图风格：淘宝页头海报");
    form.append("customStylePrompts", analyzedPrompt);

    const response = await createGenerationJob(await authenticatedGenerationRequest(form));
    const body = await response.json();

    expect(response.status).toBe(202);
    expect(body.job.options.customStyleIds).toEqual(["uploaded-style-ref-test"]);
    expect(body.job.options.customStyleLabels).toEqual(["参考图风格：淘宝页头海报"]);
    expect(body.job.options.customStylePrompts).toEqual([analyzedPrompt]);
  });

  it("accepts analyzed reference style prompts up to 2048 characters", async () => {
    const form = baseGenerationForm();
    const longAnalyzedPrompt = "p".repeat(2048);
    form.append("customStyleIds", "uploaded-style-ref-long-prompt");
    form.append("customStyleLabels", "参考图风格");
    form.append("customStylePrompts", longAnalyzedPrompt);

    const response = await createGenerationJob(await authenticatedGenerationRequest(form));
    const body = await response.json();

    expect(response.status).toBe(202);
    expect(body.job.options.customStylePrompts[0]).toBe(longAnalyzedPrompt);
  });

  it("rejects analyzed reference style prompts beyond 2048 characters", async () => {
    const form = baseGenerationForm();
    form.append("customStyleIds", "uploaded-style-ref-too-long-prompt");
    form.append("customStyleLabels", "参考图风格");
    form.append("customStylePrompts", "p".repeat(2049));

    const response = await createGenerationJob(await authenticatedGenerationRequest(form));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("invalid_generation_job_request");
    expect(JSON.stringify(body.issues)).toContain("customStylePrompts");
  });

  it("accepts poster copy fields for detail header poster jobs", async () => {
    const form = new FormData();
    form.append("platform", "taobao");
    form.append("category", "women");
    form.append("scene", "catalog");
    form.append("sceneVariant", "magazine_cover");
    form.append("size", "portrait");
    form.append("modelProfile", "asian_female");
    form.append("modelMode", "model");
    form.append("specId", "taobao-detail-mobile");
    form.append("imageTypeId", "detail_header_poster");
    form.append("imageTypeIds", "detail_header_poster");
    form.append("posterTitle", "通勤挺括感");
    form.append("posterSubtitle", "轻盈容量 通勤可背");
    form.append("posterBullets", "包型利落");
    form.append("posterBullets", "分区有序");
    form.append("posterTemplateId", "bottom-card");
    form.append("count", "1");
    form.append("images", new File(["image"], "tote.jpg", { type: "image/jpeg" }));

    const response = await createGenerationJob(await authenticatedGenerationRequest(form));
    const body = await response.json();

    expect(response.status).toBe(202);
    expect(body.job.options.posterTitle).toBe("通勤挺括感");
    expect(body.job.options.posterSubtitle).toBe("轻盈容量 通勤可背");
    expect(body.job.options.posterBullets).toEqual(["包型利落", "分区有序"]);
    expect(body.job.options.posterTemplateId).toBe("bottom-card");
    expect(body.job.prompt.body).toContain("Generated poster typography requirement");
    expect(body.job.prompt.body).toContain("通勤挺括感");
    expect(body.job.prompt.body).toContain("place generated typography");
  });

  it("accepts merchant info graphics as a separate source from product images", async () => {
    const form = new FormData();
    form.append("platform", "taobao");
    form.append("category", "women");
    form.append("scene", "studio");
    form.append("sceneVariant", "modern_studio");
    form.append("size", "portrait");
    form.append("modelProfile", "asian_female");
    form.append("modelMode", "model");
    form.append("specId", "taobao-detail-mobile");
    form.append("imageTypeId", "detail_model_fit");
    form.append("imageTypeIds", "detail_model_fit");
    form.append("imageTypeIds", "detail_merchant_info_graphic");
    form.append("count", "1");
    form.append("images", new File(["image"], "tote.jpg", { type: "image/jpeg" }));
    form.append("merchantInfoImage", new File(["chart"], "size-chart.jpg", { type: "image/jpeg" }));

    const response = await createGenerationJob(await authenticatedGenerationRequest(form));
    const body = await response.json();

    expect(response.status).toBe(202);
    expect(body.job.progress.total).toBe(2);
    expect(body.job.sourceImages).toEqual([expect.objectContaining({ filename: "tote.jpg" })]);
    expect(body.job.merchantInfoImage).toEqual(expect.objectContaining({ filename: "size-chart.jpg", mimeType: "image/jpeg" }));
    expect(body.job.options.imageTypeIds).toEqual(["detail_model_fit", "detail_merchant_info_graphic"]);
  });

  it("allows merchant info graphic jobs without product images", async () => {
    const form = new FormData();
    form.append("platform", "taobao");
    form.append("category", "women");
    form.append("scene", "catalog");
    form.append("sceneVariant", "minimal_art");
    form.append("size", "portrait");
    form.append("modelProfile", "asian_female");
    form.append("modelMode", "model");
    form.append("specId", "taobao-detail-mobile");
    form.append("imageTypeId", "detail_merchant_info_graphic");
    form.append("imageTypeIds", "detail_merchant_info_graphic");
    form.append("count", "1");
    form.append("merchantInfoImage", new File(["chart"], "size-chart.jpg", { type: "image/jpeg" }));

    const response = await createGenerationJob(await authenticatedGenerationRequest(form));
    const body = await response.json();

    expect(response.status).toBe(202);
    expect(body.job.progress.total).toBe(1);
    expect(body.job.sourceImages).toEqual([]);
    expect(body.job.merchantInfoImage.filename).toBe("size-chart.jpg");
  });

  it("creates suite generation jobs from suite presets", async () => {
    const form = new FormData();
    form.append("platform", "taobao");
    form.append("category", "women");
    form.append("scene", "studio");
    form.append("sceneVariant", "modern_studio");
    form.append("size", "square");
    form.append("modelProfile", "asian_female");
    form.append("modelMode", "model");
    form.append("specId", "taobao-main-square");
    form.append("topSellerStyleId", "street_trend");
    form.append("topSellerStyleIds", "street_trend");
    form.append("topSellerStyleIds", "old_money");
    form.append("userPrompt", "更强街拍感，背景保持干净");
    form.append("generationMode", "suite");
    form.append("suitePresetId", "basic-5");
    form.append("count", "1");
    form.append("images", new File(["image"], "tote.jpg", { type: "image/jpeg" }));

    const response = await createGenerationJob(await authenticatedGenerationRequest(form));
    const body = await response.json();

    expect(response.status).toBe(202);
    expect(body.job.options.generationMode).toBe("suite");
    expect(body.job.options.suitePresetId).toBe("basic-5");
    expect(body.job.options.topSellerStyleId).toBe("street_trend");
    expect(body.job.options.topSellerStyleIds).toEqual(["street_trend", "old_money"]);
    expect(body.job.options.userPrompt).toBe("更强街拍感，背景保持干净");
    expect(body.job.options.suiteItems).toHaveLength(5);
    expect(body.job.suiteCreativePlan.items).toHaveLength(5);
    expect(body.job.suiteCreativePlan.items[0].imagePrompt).toContain("Product understanding");
    expect(body.job.suiteCreativePlan.items[0].textLayout.blocks.length).toBeGreaterThan(0);
    expect(body.job.suiteCreativePlan.items[0].references.some((item: { kind: string }) => item.kind === "source_product")).toBe(true);
    expect(body.job.suiteCreativePlan.items[0].masks.some((item: { kind: string }) => item.kind === "text_safe_area")).toBe(true);
    expect(body.job.options.imageTypeIds).toEqual(["white_main", "scene_main", "studio_main", "mobile_long_main", "detail_model_fit"]);
    expect(body.job.progress.total).toBe(10);
    expect(body.job.prompt.body).toContain("Suite platform tone");
    expect(body.job.prompt.body).toContain("high-street bag trend");
    expect(body.job.prompt.body).toContain("更强街拍感");
  });

  it("creates detail suite jobs with detail-page modules only", async () => {
    const form = new FormData();
    form.append("platform", "taobao");
    form.append("category", "women");
    form.append("scene", "studio");
    form.append("sceneVariant", "modern_studio");
    form.append("size", "portrait");
    form.append("modelProfile", "asian_female");
    form.append("modelMode", "model");
    form.append("specId", "taobao-detail-mobile");
    form.append("generationMode", "suite");
    form.append("suitePresetId", "basic-5");
    form.append("suiteSurface", "detail");
    form.append("count", "1");
    form.append("images", new File(["image"], "tote.jpg", { type: "image/jpeg" }));

    const response = await createGenerationJob(await authenticatedGenerationRequest(form));
    const body = await response.json();

    expect(response.status).toBe(202);
    expect(body.job.options.imageTypeIds).toEqual(["detail_header_poster", "detail_white_product", "detail_texture", "detail_model_fit"]);
    expect(body.job.options.imageTypeIds).not.toContain("detail_craft");
    expect(body.job.options.suiteItems.map((item: { targetWidth: number }) => item.targetWidth)).toEqual([790, 790, 790, 790]);
  });

  it("accepts duplicated detail suite modules through base module ids", async () => {
    const baseItemId = "detail-basic-conversion-3-model_fit";
    const copiedItemId = `${baseItemId}__copy_2`;
    const form = new FormData();
    form.append("platform", "taobao");
    form.append("category", "women");
    form.append("scene", "studio");
    form.append("sceneVariant", "modern_studio");
    form.append("size", "portrait");
    form.append("modelProfile", "asian_female");
    form.append("modelMode", "model");
    form.append("specId", "taobao-detail-mobile");
    form.append("generationMode", "suite");
    form.append("suitePresetId", "detail-basic-conversion");
    form.append("suiteSurface", "detail");
    form.append("suiteItemIds", baseItemId);
    form.append("suiteItemIds", copiedItemId);
    form.append("suiteModuleConfigs", JSON.stringify({
      suiteItemId: baseItemId,
      baseSuiteItemId: baseItemId,
      label: "持包场景1",
      enabled: true,
      outputCount: 1
    }));
    form.append("suiteModuleConfigs", JSON.stringify({
      suiteItemId: copiedItemId,
      baseSuiteItemId: baseItemId,
      label: "持包场景2",
      enabled: true,
      outputCount: 1,
      selectedColorGroupIds: ["black"]
    }));
    form.append("count", "1");
    form.append("images", new File(["image"], "black-tote.jpg", { type: "image/jpeg" }));
    form.append("productColorGroupIds", "black");
    form.append("productColorGroupLabels", "黑色");

    const response = await createGenerationJob(await authenticatedGenerationRequest(form));
    const body = await response.json();

    expect(response.status).toBe(202);
    expect(body.job.options.suiteItems).toEqual([
      expect.objectContaining({ id: baseItemId, label: "持包场景" }),
      expect.objectContaining({ id: copiedItemId, label: "持包场景2" })
    ]);
    expect(body.job.options.suiteModuleConfigs[1]).toEqual(expect.objectContaining({
      suiteItemId: copiedItemId,
      baseSuiteItemId: baseItemId,
      selectedColorGroupIds: ["black"]
    }));
  });

  it("accepts custom specs and preserves target dimensions", async () => {
    const form = new FormData();
    form.append("platform", "douyin");
    form.append("category", "women");
    form.append("scene", "catalog");
    form.append("sceneVariant", "magazine_cover");
    form.append("size", "tall");
    form.append("modelProfile", "no_face");
    form.append("modelMode", "model");
    form.append("specId", "custom");
    form.append("imageTypeId", "feed_card");
    form.append("targetWidth", "1080");
    form.append("targetHeight", "1920");
    form.append("customSpecName", "直播间竖封面");
    form.append("count", "1");
    form.append("images", new File(["image"], "tote.jpg", { type: "image/jpeg" }));

    const response = await createGenerationJob(await authenticatedGenerationRequest(form));
    const body = await response.json();

    expect(response.status).toBe(202);
    expect(body.job.options.targetWidth).toBe(1080);
    expect(body.job.options.targetHeight).toBe(1920);
    expect(body.job.prompt.providerSize).toBe("2160x3840");
  });

  it("rejects missing specs, invalid custom dimensions, and unknown custom models", async () => {
    const missingSpec = baseGenerationForm();
    missingSpec.delete("specId");
    let response = await createGenerationJob(await authenticatedGenerationRequest(missingSpec));
    expect(response.status).toBe(400);

    const badCustom = baseGenerationForm();
    badCustom.set("specId", "custom");
    badCustom.set("imageTypeId", "scene_main");
    badCustom.set("targetWidth", "20");
    badCustom.set("targetHeight", "20");
    response = await createGenerationJob(await authenticatedGenerationRequest(badCustom));
    expect(response.status).toBe(400);

    const unknownModel = baseGenerationForm();
    unknownModel.set("customModelId", "model-missing");
    response = await createGenerationJob(await authenticatedGenerationRequest(unknownModel));
    const body = await response.json();
    expect(response.status).toBe(400);
    expect(body.error).toBe("custom_model_not_found");
    expect(JSON.stringify(body)).not.toContain("image");
  });

  it("uploads a custom model and submits its id", async () => {
    const auth = await authenticatedSession();
    const modelForm = new FormData();
    modelForm.append("name", "Lookbook model");
    modelForm.append("modelImage", new File(["model"], "model.jpg", { type: "image/jpeg" }));
    modelForm.append("modelGender", "female");
    modelForm.append("modelAgeRange", "young_adult");
    modelForm.append("modelSkinTone", "east_asian");
    modelForm.append("modelHairStyle", "medium");
    const anonymousUploadRequest = new Request("http://test.local/api/custom-models", { method: "POST" }) as Request & { formData: () => Promise<FormData> };
    Object.defineProperty(anonymousUploadRequest, "formData", { value: async () => modelForm });
    const anonymousUpload = await createCustomModel(anonymousUploadRequest);
    expect(anonymousUpload.status).toBe(401);

    const upload = await createCustomModel(new Request("http://test.local/api/custom-models", {
      method: "POST",
      headers: { cookie: auth.cookie },
      body: modelForm
    }));
    const uploadBody = await upload.json();
    if (upload.status === 400 && uploadBody.error === "custom_model_limit_reached") {
      expect(uploadBody.max).toBe(5);
      return;
    }
    expect(upload.status).toBe(201);
    expect(uploadBody.model.file).toBeUndefined();
    expect(uploadBody.model.imageUrl).toBe(`/api/custom-models/${uploadBody.model.id}/image`);
    expect(uploadBody.model).toEqual(expect.objectContaining({
      modelGender: "female",
      modelAgeRange: "young_adult",
      modelSkinTone: "east_asian",
      modelHairStyle: "medium"
    }));

    const rename = await renameCustomModel(new Request("http://test.local/api/custom-models", {
      method: "PATCH",
      headers: { cookie: auth.cookie },
      body: JSON.stringify({ id: uploadBody.model.id, name: "专属模特一" })
    }));
    const renameBody = await rename.json();
    expect(rename.status).toBe(200);
    expect(renameBody.model.name).toBe("专属模特一");

    const list = await listCustomModels(new Request("http://test.local/api/custom-models", {
      headers: { cookie: auth.cookie }
    }));
    const listBody = await list.json();
    expect(listBody.models[0].imageUrl).toContain("/api/custom-models/");
    expect(listBody.models[0].file).toBeUndefined();
    expect(listBody.models[0].name).toBe("专属模特一");

    const image = await getCustomModelImage(new Request(`http://test.local${uploadBody.model.imageUrl}`), {
      params: Promise.resolve({ id: uploadBody.model.id })
    });
    expect(image.status).toBe(401);

    const authenticatedImage = await getCustomModelImage(new Request(`http://test.local${uploadBody.model.imageUrl}`, {
      headers: { cookie: auth.cookie }
    }), {
      params: Promise.resolve({ id: uploadBody.model.id })
    });
    expect(authenticatedImage.status).toBe(200);
    expect(authenticatedImage.headers.get("content-type")).toBe("image/jpeg");

    const generationForm = baseGenerationForm();
    generationForm.set("customModelId", uploadBody.model.id);
    const generationRequest = new Request("http://test.local/api/generation-jobs", {
      method: "POST",
      headers: { cookie: auth.cookie }
    }) as Request & { formData: () => Promise<FormData> };
    Object.defineProperty(generationRequest, "formData", { value: async () => generationForm });
    const response = await createGenerationJob(generationRequest);
    const body = await response.json();
    expect(response.status).toBe(202);
    expect(body.job.options.customModelId).toBe(uploadBody.model.id);
    expect(body.job.modelReferenceImage).toEqual(
      expect.objectContaining({ id: uploadBody.model.id, filename: uploadBody.model.filename, mimeType: "image/jpeg" })
    );
    expect(body.job.modelReferenceImage.file).toBeUndefined();

    const deleted = await deleteCustomModel(new Request("http://test.local/api/custom-models", {
      method: "DELETE",
      headers: { cookie: auth.cookie },
      body: JSON.stringify({ id: uploadBody.model.id })
    }));
    expect(deleted.status).toBe(200);
    const afterDelete = await listCustomModels(new Request("http://test.local/api/custom-models", {
      headers: { cookie: auth.cookie }
    }));
    const afterDeleteBody = await afterDelete.json();
    expect(afterDeleteBody.models.some((item: { id: string }) => item.id === uploadBody.model.id)).toBe(false);
  });

  it("returns a quality report", async () => {
    const response = await qualityCheck(
      new Request("http://test.local/api/quality-check", {
        method: "POST",
        body: JSON.stringify({
          category: "shoes",
          assetType: "sku_color",
          metadata: {
            width: 1200,
            height: 1200,
            mimeType: "image/jpeg",
            fileSizeBytes: 300000,
            colorMode: "rgb",
            whitePixelRatio: 0.99,
            subjectOccupancy: 0.75
          }
        })
      })
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.report.usable).toBe(true);
  });
});

function baseGenerationForm(): FormData {
  const form = new FormData();
  form.append("platform", "taobao");
  form.append("category", "women");
  form.append("scene", "studio");
  form.append("sceneVariant", "modern_studio");
  form.append("size", "square");
  form.append("modelProfile", "asian_female");
  form.append("modelMode", "model");
  form.append("specId", "taobao-main-square");
  form.append("imageTypeId", "studio_main");
  form.append("imageTypeIds", "studio_main");
  form.append("productGroupingMode", "per_image");
  form.append("count", "1");
  form.append("images", new File(["image"], "knit.jpg", { type: "image/jpeg" }));
  return form;
}

let phoneSeed = Date.now() % 1000000000;

function uniquePhone(): string {
  phoneSeed += 1;
  return `13${String(phoneSeed).padStart(9, "0").slice(-9)}`;
}

function baseJobOptions() {
  return {
    platform: "vipshop" as const,
    category: "women" as const,
    scene: "studio" as const,
    sceneVariant: "minimal_solid" as const,
    size: "portrait" as const,
    modelProfile: "asian_female" as const,
    modelMode: "model" as const,
    count: 1,
    specId: "vipshop-main-portrait",
    imageTypeId: "studio_main",
    imageTypeIds: ["studio_main"],
    productGroupingMode: "per_image" as const,
    targetWidth: 1340,
    targetHeight: 1785
  };
}

function testImageFile(name: string): File {
  return {
    name,
    type: "image/jpeg",
    arrayBuffer: async () => new TextEncoder().encode("proof").buffer
  } as File;
}

async function authenticatedSession(actorName?: string) {
  const user = await userRepository.register({ phone: uniquePhone(), password: "password123" });
  await rechargeOrderRepository.adjustCredits({
    customerId: user.id,
    deltaCredits: 100000,
    reason: "测试预置积分",
    operatorId: "test"
  });
  const session = await userRepository.createSession(user.id, actorName);
  return { user, session, cookie: `${authSessionCookieName}=${session.id}` };
}

async function authenticatedGenerationRequest(form: FormData): Promise<Request> {
  const auth = await authenticatedSession();
  const request = new Request("http://test.local/api/generation-jobs", {
    method: "POST",
    headers: { cookie: auth.cookie }
  }) as Request & { formData: () => Promise<FormData> };
  Object.defineProperty(request, "formData", { value: async () => form });
  return request;
}

async function withAdminUser<T>(userId: string, action: () => Promise<T>): Promise<T> {
  const previous = process.env.ADMIN_USER_IDS;
  process.env.ADMIN_USER_IDS = previous ? `${previous},${userId}` : userId;
  try {
    return await action();
  } finally {
    if (previous === undefined) delete process.env.ADMIN_USER_IDS;
    else process.env.ADMIN_USER_IDS = previous;
  }
}
