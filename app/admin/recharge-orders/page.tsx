"use client";

import { useEffect, useMemo, useState } from "react";
import { describeNetworkFailure, describeRequestFailure, readJsonRecord, redirectToAdminLogin } from "@/client/httpStatus";
import { AdminHeader } from "../AdminNav";

type RechargeOrderStatus = "pending" | "approved" | "rejected";
type PaymentMethod = "wechat" | "alipay";

type RechargeAccount = {
  customerId: string;
  balanceCredits: number;
  frozenCredits: number;
  updatedAt: string;
};

type RechargeOrder = {
  id: string;
  customerId: string;
  planLabel: string;
  credits: number;
  priceCny: number;
  paymentMethod: PaymentMethod;
  proofFilename: string;
  proofImageUrl: string;
  status: RechargeOrderStatus;
  rejectReason?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("zh-CN", { style: "currency", currency: "CNY", maximumFractionDigits: 0 }).format(value);
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("zh-CN").format(value);
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

export default function RechargeOrdersAdminPage() {
  const [orders, setOrders] = useState<RechargeOrder[]>([]);
  const [accounts, setAccounts] = useState<RechargeAccount[]>([]);
  const [rejectReasons, setRejectReasons] = useState<Record<string, string>>({});
  const [customerId, setCustomerId] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [status, setStatus] = useState("等待审核充值申请");
  const [loadError, setLoadError] = useState("");
  const pendingOrders = useMemo(() => orders.filter((order) => order.status === "pending"), [orders]);
  const reviewedOrders = useMemo(() => orders.filter((order) => order.status !== "pending"), [orders]);
  const totalPendingAmount = pendingOrders.reduce((sum, order) => sum + order.priceCny, 0);
  const query = useMemo(() => new URLSearchParams(Object.entries({
    customerId,
    status: statusFilter,
    paymentMethod: paymentMethodFilter,
    from,
    to
  }).filter(([, value]) => value)), [customerId, statusFilter, paymentMethodFilter, from, to]);

  useEffect(() => {
    void refresh();
  }, [query.toString()]);

  async function refresh() {
    setLoadError("");
    try {
      const response = await fetch(`/api/recharge-orders?${query.toString()}`);
      const body = await readJsonRecord(response);
      if (!response.ok) {
        const message = describeRequestFailure("充值订单读取失败", response, body);
        setLoadError(message);
        setStatus(message);
        if (response.status === 401 || response.status === 403) redirectToAdminLogin();
        return;
      }
      setOrders(Array.isArray(body.orders) ? body.orders as RechargeOrder[] : []);
      setAccounts(Array.isArray(body.accounts) ? body.accounts as RechargeAccount[] : []);
    } catch (error) {
      const message = describeNetworkFailure("充值订单读取失败", error);
      setLoadError(message);
      setStatus(message);
    }
  }

  async function reviewOrder(id: string, nextStatus: "approved" | "rejected") {
    const rejectReason = rejectReasons[id]?.trim();
    if (nextStatus === "rejected" && !rejectReason) {
      setStatus("驳回前请填写驳回理由，用户会在充值页看到这条通知");
      return;
    }

    setStatus(nextStatus === "approved" ? "正在确认到账..." : "正在提交驳回通知...");
    const response = await fetch("/api/recharge-orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: nextStatus, rejectReason })
    });
    const body = await readJsonRecord(response);
    if (!response.ok) {
      setStatus(describeRequestFailure("审核失败", response, body));
      if (response.status === 401 || response.status === 403) redirectToAdminLogin();
      return;
    }
    const account = body.account as RechargeAccount;
    const order = body.order as RechargeOrder;
    setStatus(nextStatus === "approved" ? `已通过，账户余额更新为 ${formatNumber(account.balanceCredits)} 点` : "已驳回，理由已通知用户");
    setOrders((current) => current.map((item) => item.id === id ? order : item));
    setAccounts((current) => {
      return [account, ...current.filter((item) => item.customerId !== account.customerId)];
    });
  }

  return (
    <main className="adminShell">
      <AdminHeader active="recharge" kicker="Admin Billing Desk" title="充值审核后台" />

      <section className="adminStatsGrid">
        <article>
          <span>待审核</span>
          <strong>{pendingOrders.length}</strong>
          <em>笔充值申请</em>
        </article>
        <article>
          <span>待核验金额</span>
          <strong>{formatCurrency(totalPendingAmount)}</strong>
          <em>人工收款</em>
        </article>
        <article>
          <span>账户数</span>
          <strong>{accounts.length}</strong>
          <em>有充值记录用户</em>
        </article>
        <article>
          <span>已通过</span>
          <strong>{orders.filter((order) => order.status === "approved").length}</strong>
          <em>当前筛选</em>
        </article>
        <article>
          <span>已驳回</span>
          <strong>{orders.filter((order) => order.status === "rejected").length}</strong>
          <em>当前筛选</em>
        </article>
      </section>

      <section className="adminPanel">
        <div className="adminPanelHeader"><span>00</span><strong>审核筛选</strong></div>
        <div className="adminFormGrid billingFilterGrid">
          <label>用户 ID<input value={customerId} onChange={(event) => setCustomerId(event.target.value)} placeholder="user-..." /></label>
          <label>订单状态<select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="">全部状态</option>
            <option value="pending">待审核</option>
            <option value="approved">已通过</option>
            <option value="rejected">已驳回</option>
          </select></label>
          <label>付款方式<select value={paymentMethodFilter} onChange={(event) => setPaymentMethodFilter(event.target.value)}>
            <option value="">全部方式</option>
            <option value="wechat">微信</option>
            <option value="alipay">支付宝</option>
          </select></label>
          <label>开始日期<input type="date" value={from} onChange={(event) => setFrom(event.target.value)} /></label>
          <label>结束日期<input type="date" value={to} onChange={(event) => setTo(event.target.value)} /></label>
        </div>
        <div className="adminActionRow">
          <button type="button" onClick={() => { setCustomerId(""); setStatusFilter(""); setPaymentMethodFilter(""); setFrom(""); setTo(""); }}>清空筛选</button>
        </div>
      </section>

      <section className="adminPanel">
        <div className="adminPanelHeader">
          <span>01</span>
          <strong>待审核充值</strong>
        </div>
        <div className="adminExplainBox">
          <strong>审核规则</strong>
          <span>核对金额、付款方式和截图；通过后立即给用户账户加算力点，驳回时必须填写理由并显示到用户充值页。</span>
        </div>
        <div className="rechargeOrderList">
          {loadError ? <em className="adminStatusLine">{loadError}</em> : null}
          {pendingOrders.map((order) => (
            <article className="rechargeOrderCard pending" key={order.id}>
              <a href={order.proofImageUrl} target="_blank" rel="noreferrer">
                <img alt={order.proofFilename} src={order.proofImageUrl} />
              </a>
              <div className="rechargeOrderBody">
                <header>
                  <div>
                    <strong>{order.planLabel}</strong>
                    <span>{order.customerId} · {paymentMethodLabel(order.paymentMethod)} · {formatDate(order.createdAt)}</span>
                  </div>
                  <b>{formatCurrency(order.priceCny)}</b>
                </header>
                <div className="rechargeOrderMeta">
                  <span>到账 {formatNumber(order.credits)} 点</span>
                  <span>状态：待审核</span>
                  <span>截图：{order.proofFilename}</span>
                </div>
                <textarea
                  placeholder="未通过时填写驳回理由，例如：付款金额与套餐不一致 / 截图不清晰 / 未查询到对应流水"
                  rows={3}
                  value={rejectReasons[order.id] ?? ""}
                  onChange={(event) => setRejectReasons((current) => ({ ...current, [order.id]: event.target.value }))}
                />
                <div className="adminActionRow">
                  <button type="button" onClick={() => void reviewOrder(order.id, "approved")}>通过并到账</button>
                  <button type="button" onClick={() => void reviewOrder(order.id, "rejected")}>驳回并通知</button>
                </div>
              </div>
            </article>
          ))}
          {!pendingOrders.length && !loadError ? <em>暂无待审核充值申请。</em> : null}
        </div>
        <p className="adminStatusLine">{status}</p>
      </section>

      <section className="adminPanel">
        <div className="adminPanelHeader">
          <span>02</span>
          <strong>已审核记录</strong>
        </div>
        <div className="rechargeHistoryTable">
          {reviewedOrders.map((order) => (
            <article key={order.id} className={order.status}>
              <strong>{order.planLabel}</strong>
              <span>{order.customerId}</span>
              <span>{formatCurrency(order.priceCny)} / {formatNumber(order.credits)} 点</span>
              <span>{paymentMethodLabel(order.paymentMethod)}</span>
              <span>{order.status === "approved" ? "已通过" : `已驳回：${order.rejectReason}`}</span>
              <time>{formatDate(order.reviewedAt ?? order.updatedAt)}</time>
            </article>
          ))}
          {!reviewedOrders.length && !loadError ? <em>暂无已审核记录。</em> : null}
        </div>
      </section>
    </main>
  );
}

function paymentMethodLabel(method: PaymentMethod): string {
  return method === "alipay" ? "支付宝" : "微信";
}
