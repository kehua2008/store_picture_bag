"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { describeNetworkFailure, describeRequestFailure, readJsonRecord, redirectToAdminLogin } from "@/client/httpStatus";
import { AdminHeader } from "./AdminNav";

type BillingSummary = {
  totalBalanceCredits: number;
  totalFrozenCredits: number;
  totalRechargeCredits: number;
  totalConsumedCredits: number;
  todayRechargeCredits: number;
  todayConsumedCredits: number;
};

type RechargeOrder = {
  id: string;
  customerId: string;
  planLabel: string;
  credits: number;
  priceCny: number;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  updatedAt: string;
};

type Member = {
  user: { id: string; phone: string; displayName?: string; status: "active" | "suspended" };
  account: { balanceCredits: number; frozenCredits: number };
  totalRechargeCredits: number;
  totalConsumedCredits: number;
};

const adminCards = [
  { title: "客户管理", desc: "查看会员、停用/恢复账号、人工调账", href: "/admin/members" },
  { title: "充值审核", desc: "核对付款截图，通过到账或驳回通知", href: "/admin/recharge-orders" },
  { title: "财务管理", desc: "查看积分流水、收支汇总、导出 CSV", href: "/admin/billing" },
  { title: "反馈收件箱", desc: "审核用户报错、建议和处理备注", href: "/admin/feedback-reports" },
  { title: "风格库后台", desc: "导入样本、管理风格板和发布状态", href: "/admin/style-library" }
];

function formatNumber(value: number): string {
  return new Intl.NumberFormat("zh-CN").format(value);
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("zh-CN", { style: "currency", currency: "CNY", maximumFractionDigits: 0 }).format(value);
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

export default function AdminDashboardPage() {
  const [summary, setSummary] = useState<BillingSummary>();
  const [orders, setOrders] = useState<RechargeOrder[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    void refresh();
  }, []);

  async function refresh() {
    setLoadError("");
    try {
      const [billingResponse, rechargeResponse, membersResponse] = await Promise.all([
        fetch("/api/admin/billing"),
        fetch("/api/recharge-orders"),
        fetch("/api/admin/members")
      ]);
      const [billing, recharge, memberData] = await Promise.all([
        readJsonRecord(billingResponse),
        readJsonRecord(rechargeResponse),
        readJsonRecord(membersResponse)
      ]);
      const failed = [
        ["后台汇总读取失败", billingResponse, billing] as const,
        ["充值订单读取失败", rechargeResponse, recharge] as const,
        ["会员列表读取失败", membersResponse, memberData] as const
      ].find(([, response]) => !response.ok);
      if (failed) {
        const [prefix, response, body] = failed;
        const message = describeRequestFailure(prefix, response, body);
        setLoadError(message);
        if (response.status === 401 || response.status === 403) redirectToAdminLogin("/admin");
        return;
      }
      setSummary(billing.summary as BillingSummary | undefined);
      setOrders(Array.isArray(recharge.orders) ? recharge.orders as RechargeOrder[] : []);
      setMembers(Array.isArray(memberData.members) ? memberData.members as Member[] : []);
    } catch (error) {
      setLoadError(describeNetworkFailure("后台工作台读取失败", error));
    }
  }

  const pendingOrders = useMemo(() => orders.filter((order) => order.status === "pending"), [orders]);
  const todayApprovedAmount = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return orders
      .filter((order) => order.status === "approved" && new Date(order.updatedAt) >= today)
      .reduce((sum, order) => sum + order.priceCny, 0);
  }, [orders]);
  const highValueMembers = useMemo(() => [...members].sort((left, right) => right.account.balanceCredits - left.account.balanceCredits).slice(0, 5), [members]);

  return (
    <main className="adminShell">
      <AdminHeader active="dashboard" kicker="Admin Console" title="后台工作台" />
      {loadError ? <p className="adminStatusLine">{loadError}</p> : null}

      <section className="adminStatsGrid billingStatsGrid">
        <article><span>待审核充值</span><strong>{pendingOrders.length}</strong><em>需要处理</em></article>
        <article><span>今日到账</span><strong>{formatNumber(summary?.todayRechargeCredits ?? 0)}</strong><em>算力点</em></article>
        <article><span>今日收款</span><strong>{formatCurrency(todayApprovedAmount)}</strong><em>已审核订单</em></article>
        <article><span>会员数</span><strong>{members.length}</strong><em>注册账号</em></article>
        <article><span>账户总余额</span><strong>{formatNumber(summary?.totalBalanceCredits ?? 0)}</strong><em>可用积分</em></article>
        <article><span>累计消耗</span><strong>{formatNumber(summary?.totalConsumedCredits ?? 0)}</strong><em>扣费积分</em></article>
      </section>

      <section className="adminDashboardGrid">
        {adminCards.map((card) => (
          <Link className="adminDashboardCard" href={card.href} key={card.href}>
            <strong>{card.title}</strong>
            <span>{card.desc}</span>
          </Link>
        ))}
      </section>

      <section className="adminWorkflowGrid">
        <div className="adminPanel">
          <div className="adminPanelHeader"><span>01</span><strong>最近待审核充值</strong></div>
          <div className="adminMiniTable">
            {pendingOrders.slice(0, 6).map((order) => (
              <article key={order.id}>
                <strong>{order.planLabel}</strong>
                <span>{order.customerId}</span>
                <span>{formatCurrency(order.priceCny)} / {formatNumber(order.credits)} 点</span>
                <time>{formatDate(order.createdAt)}</time>
              </article>
            ))}
            {!pendingOrders.length && !loadError ? <em>暂无待审核充值。</em> : null}
          </div>
          <div className="adminActionRow">
            <Link className="adminSecondaryAction" href="/admin/recharge-orders">进入充值审核</Link>
          </div>
        </div>

        <div className="adminPanel">
          <div className="adminPanelHeader"><span>02</span><strong>余额靠前会员</strong></div>
          <div className="adminMiniTable">
            {highValueMembers.map((member) => (
              <article key={member.user.id}>
                <strong>{member.user.displayName || member.user.phone}</strong>
                <span>{member.user.id}</span>
                <span>余额 {formatNumber(member.account.balanceCredits)} / 冻结 {formatNumber(member.account.frozenCredits)}</span>
                <span>累计充值 {formatNumber(member.totalRechargeCredits)}</span>
              </article>
            ))}
            {!highValueMembers.length && !loadError ? <em>暂无会员数据。</em> : null}
          </div>
          <div className="adminActionRow">
            <Link className="adminSecondaryAction" href="/admin/members">进入客户管理</Link>
            <Link className="adminSecondaryAction" href="/admin/billing">查看财务流水</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
