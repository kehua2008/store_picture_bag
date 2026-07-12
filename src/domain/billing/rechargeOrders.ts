import { mkdir, readFile, rename, writeFile } from "fs/promises";
import path from "path";
import { creditRechargePlanById, creditRechargePlans, defaultCreditRechargePlan, type CreditPlanId, type CreditRechargePlan } from "./creditPlans";
import { persistentDataDir, persistentUploadSubdir } from "../../server/storagePaths";

export type RechargeOrderStatus = "pending" | "approved" | "rejected";
export type RechargePaymentMethod = "wechat" | "alipay";

export interface RechargeAccount {
  customerId: string;
  balanceCredits: number;
  frozenCredits: number;
  updatedAt: string;
}

export type CreditLedgerEntryType =
  | "recharge_credit"
  | "generation_reserve"
  | "generation_debit"
  | "generation_release"
  | "style_analysis_debit"
  | "usage_debit"
  | "admin_adjustment";

export interface CreditLedgerEntry {
  id: string;
  customerId: string;
  actorId?: string;
  actorName?: string;
  type: CreditLedgerEntryType;
  deltaBalanceCredits: number;
  deltaFrozenCredits: number;
  balanceCreditsAfter: number;
  frozenCreditsAfter: number;
  rechargeOrderId?: string;
  generationJobId?: string;
  styleSampleId?: string;
  reason: string;
  operatorId?: string;
  createdAt: string;
}

export interface RechargeOrder {
  id: string;
  customerId: string;
  planId: CreditPlanId;
  planLabel: string;
  credits: number;
  priceCny: number;
  paymentMethod: RechargePaymentMethod;
  proofFilename: string;
  proofImageUrl: string;
  status: RechargeOrderStatus;
  rejectReason?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface RechargeOrderData {
  accounts: RechargeAccount[];
  orders: RechargeOrder[];
  ledgerEntries: CreditLedgerEntry[];
}

interface CreateRechargeOrderInput {
  customerId: string;
  planId: CreditPlanId;
  paymentMethod: RechargePaymentMethod;
  proof: File;
}

const dataDir = persistentDataDir();
const proofDir = persistentUploadSubdir("recharge-proofs");
const dataFile = path.join(dataDir, "recharge-orders.json");
const defaultBalanceCredits = 0;

export class FileRechargeOrderRepository {
  private mutationQueue: Promise<void> = Promise.resolve();

  async all(customerId?: string): Promise<RechargeOrderData> {
    const data = await this.readData();
    return {
      accounts: customerId ? data.accounts.filter((account) => account.customerId === customerId) : data.accounts,
      orders: customerId ? data.orders.filter((order) => order.customerId === customerId) : data.orders,
      ledgerEntries: customerId ? data.ledgerEntries.filter((entry) => entry.customerId === customerId) : data.ledgerEntries
    };
  }

  async account(customerId: string): Promise<RechargeAccount> {
    return this.runExclusive(async () => {
      const data = await this.readData();
      const now = new Date().toISOString();
      const account = findOrCreateAccount(data, customerId, now);
      await this.writeData(data);
      return account;
    });
  }

  async pricingPlanForCustomer(customerId: string): Promise<CreditRechargePlan> {
    const data = await this.readData();
    const approvedOrders = data.orders.filter((order) => order.customerId === customerId && order.status === "approved");
    const highestOrder = approvedOrders.sort((left, right) => right.priceCny - left.priceCny)[0];
    return highestOrder ? creditRechargePlanById(highestOrder.planId) : defaultCreditRechargePlan();
  }

  async create(input: CreateRechargeOrderInput): Promise<{ account: RechargeAccount; order: RechargeOrder }> {
    return this.runExclusive(async () => {
      const data = await this.readData();
      const plan = creditRechargePlans.find((item) => item.id === input.planId);
      if (!plan) throw new Error("unknown_credit_plan");

      const now = new Date().toISOString();
      const account = findOrCreateAccount(data, input.customerId, now);
      await mkdir(proofDir, { recursive: true });
      const id = `recharge-${crypto.randomUUID()}`;
      const proofFilename = safeFilename(input.proof.name || `${id}.jpg`);
      const storedName = `${id}-${proofFilename}`;
      const bytes = Buffer.from(await input.proof.arrayBuffer());
      await writeFile(path.join(proofDir, storedName), bytes);

      const order: RechargeOrder = {
        id,
        customerId: input.customerId,
        planId: plan.id,
        planLabel: plan.label,
        credits: plan.credits,
        priceCny: plan.priceCny,
        paymentMethod: input.paymentMethod,
        proofFilename,
        proofImageUrl: `/recharge-proofs/${storedName}`,
        status: "pending",
        createdAt: now,
        updatedAt: now
      };

      data.orders = [order, ...data.orders];
      await this.writeData(data);
      return { account, order };
    });
  }

  async review(input: { id: string; status: "approved" | "rejected"; rejectReason?: string }): Promise<{ account: RechargeAccount; order: RechargeOrder } | undefined> {
    return this.runExclusive(async () => {
      const data = await this.readData();
      const target = data.orders.find((order) => order.id === input.id);
      if (!target) return undefined;

      const now = new Date().toISOString();
      const account = findOrCreateAccount(data, target.customerId, now);
      if (target.status !== "pending") return { account, order: target };

      const updated: RechargeOrder = {
        ...target,
        status: input.status,
        rejectReason: input.status === "rejected" ? input.rejectReason?.trim() || "付款信息无法核验，请联系客服补充截图或流水。" : undefined,
        reviewedAt: now,
        updatedAt: now
      };

      if (input.status === "approved") {
        appendLedgerEntry(data, account, {
          type: "recharge_credit",
          deltaBalanceCredits: target.credits,
          deltaFrozenCredits: 0,
          rechargeOrderId: target.id,
          reason: `充值审核通过：${target.planLabel}`,
          operatorId: "admin"
        }, now);
      }

      data.accounts = data.accounts.map((item) => item.customerId === account.customerId ? account : item);
      data.orders = data.orders.map((order) => order.id === input.id ? updated : order);
      await this.writeData(data);
      return { account, order: updated };
    });
  }

  async reserveGenerationCredits(input: { customerId: string; generationJobId: string; credits: number; reason?: string; actorId?: string; actorName?: string }): Promise<{ account: RechargeAccount; ledgerEntry: CreditLedgerEntry }> {
    if (!Number.isInteger(input.credits) || input.credits <= 0) throw new Error("invalid_credit_amount");
    return this.runExclusive(async () => {
      const data = await this.readData();
      const now = new Date().toISOString();
      const account = findOrCreateAccount(data, input.customerId, now);
      if (account.balanceCredits < input.credits) throw new Error("insufficient_credits");

      const ledgerEntry = appendLedgerEntry(data, account, {
        type: "generation_reserve",
        deltaBalanceCredits: -input.credits,
        deltaFrozenCredits: input.credits,
        generationJobId: input.generationJobId,
        actorId: input.actorId,
        actorName: input.actorName,
        reason: input.reason ?? "创建生图任务冻结积分"
      }, now);
      data.accounts = data.accounts.map((item) => item.customerId === account.customerId ? account : item);
      await this.writeData(data);
      return { account, ledgerEntry };
    });
  }

  async debitReservedGenerationCredits(input: { customerId: string; generationJobId: string; credits: number; reason?: string; actorId?: string; actorName?: string }): Promise<{ account: RechargeAccount; ledgerEntry: CreditLedgerEntry } | undefined> {
    if (!Number.isInteger(input.credits) || input.credits <= 0) throw new Error("invalid_credit_amount");
    return this.runExclusive(async () => {
      const data = await this.readData();
      if (data.ledgerEntries.some((entry) => entry.generationJobId === input.generationJobId && entry.type === "generation_debit")) return undefined;
      const now = new Date().toISOString();
      const account = findOrCreateAccount(data, input.customerId, now);
      const credits = Math.min(input.credits, reservedCreditsRemainingForJob(data, input.generationJobId), account.frozenCredits);
      if (credits <= 0) return undefined;

      const ledgerEntry = appendLedgerEntry(data, account, {
        type: "generation_debit",
        deltaBalanceCredits: 0,
        deltaFrozenCredits: -credits,
        generationJobId: input.generationJobId,
        actorId: input.actorId,
        actorName: input.actorName,
        reason: input.reason ?? "生图任务成功扣除冻结积分"
      }, now);
      data.accounts = data.accounts.map((item) => item.customerId === account.customerId ? account : item);
      await this.writeData(data);
      return { account, ledgerEntry };
    });
  }

  async releaseReservedGenerationCredits(input: { customerId: string; generationJobId: string; credits: number; reason?: string; actorId?: string; actorName?: string }): Promise<{ account: RechargeAccount; ledgerEntry: CreditLedgerEntry } | undefined> {
    if (!Number.isInteger(input.credits) || input.credits <= 0) throw new Error("invalid_credit_amount");
    return this.runExclusive(async () => {
      const data = await this.readData();
      if (data.ledgerEntries.some((entry) => entry.generationJobId === input.generationJobId && entry.type === "generation_release")) return undefined;
      const now = new Date().toISOString();
      const account = findOrCreateAccount(data, input.customerId, now);
      const credits = Math.min(input.credits, reservedCreditsRemainingForJob(data, input.generationJobId), account.frozenCredits);
      if (credits <= 0) return undefined;

      const ledgerEntry = appendLedgerEntry(data, account, {
        type: "generation_release",
        deltaBalanceCredits: credits,
        deltaFrozenCredits: -credits,
        generationJobId: input.generationJobId,
        actorId: input.actorId,
        actorName: input.actorName,
        reason: input.reason ?? "生图任务失败或取消释放冻结积分"
      }, now);
      data.accounts = data.accounts.map((item) => item.customerId === account.customerId ? account : item);
      await this.writeData(data);
      return { account, ledgerEntry };
    });
  }

  async debitStyleAnalysisCredits(input: { customerId: string; credits: number; styleSampleId?: string; reason?: string; actorId?: string; actorName?: string }): Promise<{ account: RechargeAccount; ledgerEntry: CreditLedgerEntry }> {
    if (!Number.isInteger(input.credits) || input.credits <= 0) throw new Error("invalid_credit_amount");
    return this.runExclusive(async () => {
      const data = await this.readData();
      const now = new Date().toISOString();
      const account = findOrCreateAccount(data, input.customerId, now);
      if (account.balanceCredits < input.credits) throw new Error("insufficient_credits");

      const ledgerEntry = appendLedgerEntry(data, account, {
        type: "style_analysis_debit",
        deltaBalanceCredits: -input.credits,
        deltaFrozenCredits: 0,
        styleSampleId: input.styleSampleId,
        actorId: input.actorId,
        actorName: input.actorName,
        reason: input.reason ?? "参考风格解析扣除积分"
      }, now);
      data.accounts = data.accounts.map((item) => item.customerId === account.customerId ? account : item);
      await this.writeData(data);
      return { account, ledgerEntry };
    });
  }

  async debitUsageCredits(input: { customerId: string; credits: number; generationJobId?: string; reason: string; actorId?: string; actorName?: string }): Promise<{ account: RechargeAccount; ledgerEntry: CreditLedgerEntry }> {
    if (!Number.isInteger(input.credits) || input.credits <= 0) throw new Error("invalid_credit_amount");
    return this.runExclusive(async () => {
      const data = await this.readData();
      const now = new Date().toISOString();
      const account = findOrCreateAccount(data, input.customerId, now);
      if (account.balanceCredits < input.credits) throw new Error("insufficient_credits");

      const ledgerEntry = appendLedgerEntry(data, account, {
        type: "usage_debit",
        deltaBalanceCredits: -input.credits,
        deltaFrozenCredits: 0,
        generationJobId: input.generationJobId,
        actorId: input.actorId,
        actorName: input.actorName,
        reason: input.reason
      }, now);
      data.accounts = data.accounts.map((item) => item.customerId === account.customerId ? account : item);
      await this.writeData(data);
      return { account, ledgerEntry };
    });
  }

  async adjustCredits(input: { customerId: string; deltaCredits: number; reason: string; operatorId?: string }): Promise<{ account: RechargeAccount; ledgerEntry: CreditLedgerEntry }> {
    const deltaCredits = Math.trunc(input.deltaCredits);
    if (deltaCredits === 0) throw new Error("invalid_credit_amount");
    if (!input.reason.trim()) throw new Error("missing_adjustment_reason");

    return this.runExclusive(async () => {
      const data = await this.readData();
      const now = new Date().toISOString();
      const account = findOrCreateAccount(data, input.customerId, now);
      if (account.balanceCredits + deltaCredits < 0) throw new Error("insufficient_credits");

      const ledgerEntry = appendLedgerEntry(data, account, {
        type: "admin_adjustment",
        deltaBalanceCredits: deltaCredits,
        deltaFrozenCredits: 0,
        reason: input.reason.trim(),
        operatorId: input.operatorId ?? "admin"
      }, now);
      data.accounts = data.accounts.map((item) => item.customerId === account.customerId ? account : item);
      await this.writeData(data);
      return { account, ledgerEntry };
    });
  }

  private async runExclusive<T>(operation: () => Promise<T>): Promise<T> {
    const previous = this.mutationQueue;
    let release: () => void = () => undefined;
    this.mutationQueue = new Promise<void>((resolve) => {
      release = resolve;
    });
    await previous;
    try {
      return await operation();
    } finally {
      release();
    }
  }

  private async readData(): Promise<RechargeOrderData> {
    try {
      const raw = await readFile(dataFile, "utf8");
      const parsed = JSON.parse(raw) as Partial<RechargeOrderData>;
      return {
        accounts: Array.isArray(parsed.accounts) ? parsed.accounts.map(normalizeAccount) : [],
        orders: Array.isArray(parsed.orders) ? parsed.orders : [],
        ledgerEntries: Array.isArray(parsed.ledgerEntries) ? parsed.ledgerEntries : []
      };
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
      return { accounts: [], orders: [], ledgerEntries: [] };
    }
  }

  private async writeData(data: RechargeOrderData): Promise<void> {
    await mkdir(dataDir, { recursive: true });
    const tempFile = `${dataFile}.${process.pid}.${Date.now()}.tmp`;
    await writeFile(tempFile, JSON.stringify(data, null, 2));
    await rename(tempFile, dataFile);
  }
}

export function normalizeRechargePaymentMethod(input: unknown): RechargePaymentMethod {
  return input === "alipay" ? "alipay" : "wechat";
}

export function normalizeCreditPlanId(input: unknown): CreditPlanId | undefined {
  return typeof input === "string" && creditRechargePlans.some((plan) => plan.id === input) ? input as CreditPlanId : undefined;
}

function findOrCreateAccount(data: RechargeOrderData, customerId: string, now: string): RechargeAccount {
  const existing = data.accounts.find((account) => account.customerId === customerId);
  if (existing) return normalizeAccount(existing);
  const account = { customerId, balanceCredits: defaultBalanceCredits, frozenCredits: 0, updatedAt: now };
  data.accounts = [account, ...data.accounts];
  return account;
}

function appendLedgerEntry(
  data: RechargeOrderData,
  account: RechargeAccount,
  input: Omit<CreditLedgerEntry, "id" | "customerId" | "balanceCreditsAfter" | "frozenCreditsAfter" | "createdAt">,
  now: string
): CreditLedgerEntry {
  account.balanceCredits += input.deltaBalanceCredits;
  account.frozenCredits += input.deltaFrozenCredits;
  account.updatedAt = now;
  if (account.balanceCredits < 0 || account.frozenCredits < 0) throw new Error("negative_credit_account");

  const entry: CreditLedgerEntry = {
    id: `ledger-${crypto.randomUUID()}`,
    customerId: account.customerId,
    ...input,
    balanceCreditsAfter: account.balanceCredits,
    frozenCreditsAfter: account.frozenCredits,
    createdAt: now
  };
  data.ledgerEntries = [entry, ...data.ledgerEntries];
  return entry;
}

function reservedCreditsRemainingForJob(data: RechargeOrderData, generationJobId: string): number {
  return data.ledgerEntries
    .filter((entry) => entry.generationJobId === generationJobId)
    .reduce((sum, entry) => {
      if (entry.type === "generation_reserve") return sum + entry.deltaFrozenCredits;
      if (entry.type === "generation_debit" || entry.type === "generation_release") return sum + entry.deltaFrozenCredits;
      return sum;
    }, 0);
}

function normalizeAccount(account: RechargeAccount): RechargeAccount {
  return {
    customerId: account.customerId,
    balanceCredits: Number.isFinite(account.balanceCredits) ? account.balanceCredits : defaultBalanceCredits,
    frozenCredits: Number.isFinite(account.frozenCredits) ? account.frozenCredits : 0,
    updatedAt: account.updatedAt
  };
}

function safeFilename(filename: string): string {
  return filename.replace(/[^\w.-]+/g, "-").replace(/-+/g, "-").slice(0, 120) || "payment-proof.jpg";
}
