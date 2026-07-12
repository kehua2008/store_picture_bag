"use client";

import { useEffect, useMemo, useState } from "react";
import { describeNetworkFailure, describeRequestFailure, readJsonRecord, redirectToAdminLogin } from "@/client/httpStatus";
import { AdminHeader } from "../AdminNav";

type LedgerEntry = {
  id: string;
  customerId: string;
  actorId?: string;
  actorName?: string;
  type: string;
  deltaBalanceCredits: number;
  deltaFrozenCredits: number;
  balanceCreditsAfter: number;
  frozenCreditsAfter: number;
  rechargeOrderId?: string;
  generationJobId?: string;
  reason: string;
  operatorId?: string;
  createdAt: string;
};

type BillingSummary = {
  totalBalanceCredits: number;
  totalFrozenCredits: number;
  totalRechargeCredits: number;
  totalConsumedCredits: number;
  todayRechargeCredits: number;
  todayConsumedCredits: number;
};

const ledgerTypes = ["", "recharge_credit", "generation_reserve", "generation_debit", "generation_release", "style_analysis_debit", "usage_debit", "admin_adjustment"];

function formatNumber(value: number): string {
  return new Intl.NumberFormat("zh-CN").format(value);
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

export default function BillingAdminPage() {
  const [summary, setSummary] = useState<BillingSummary>();
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>([]);
  const [customerId, setCustomerId] = useState(() => initialQueryValue("customerId"));
  const [type, setType] = useState(() => initialQueryValue("type"));
  const [keyword, setKeyword] = useState(() => initialQueryValue("keyword"));
  const [from, setFrom] = useState(() => initialQueryValue("from"));
  const [to, setTo] = useState(() => initialQueryValue("to"));
  const [loadError, setLoadError] = useState("");
  const query = useMemo(() => new URLSearchParams(Object.entries({ customerId, type, keyword, from, to }).filter(([, value]) => value)), [customerId, type, keyword, from, to]);

  useEffect(() => {
    void refresh();
  }, [query.toString()]);

  async function refresh() {
    setLoadError("");
    try {
      const response = await fetch(`/api/admin/billing?${query.toString()}`);
      const body = await readJsonRecord(response);
      if (!response.ok) {
        const message = describeRequestFailure("财务流水读取失败", response, body);
        setLoadError(message);
        if (response.status === 401 || response.status === 403) redirectToAdminLogin();
        return;
      }
      setSummary(body.summary as BillingSummary | undefined);
      setLedgerEntries(Array.isArray(body.ledgerEntries) ? body.ledgerEntries as LedgerEntry[] : []);
    } catch (error) {
      setLoadError(describeNetworkFailure("财务流水读取失败", error));
    }
  }

  return (
    <main className="adminShell">
      <AdminHeader active="billing" kicker="Admin Finance" title="财务管理" />

      <section className="adminStatsGrid billingStatsGrid">
        <article><span>总余额</span><strong>{formatNumber(summary?.totalBalanceCredits ?? 0)}</strong><em>可用积分</em></article>
        <article><span>总冻结</span><strong>{formatNumber(summary?.totalFrozenCredits ?? 0)}</strong><em>任务占用</em></article>
        <article><span>累计充值</span><strong>{formatNumber(summary?.totalRechargeCredits ?? 0)}</strong><em>审核到账</em></article>
        <article><span>累计扣费</span><strong>{formatNumber(summary?.totalConsumedCredits ?? 0)}</strong><em>生图成功</em></article>
        <article><span>今日充值</span><strong>{formatNumber(summary?.todayRechargeCredits ?? 0)}</strong><em>自然日</em></article>
        <article><span>今日消耗</span><strong>{formatNumber(summary?.todayConsumedCredits ?? 0)}</strong><em>自然日</em></article>
      </section>

      <section className="adminPanel">
        <div className="adminPanelHeader"><span>01</span><strong>积分流水</strong></div>
        <div className="adminFormGrid billingFilterGrid">
          <label>用户 ID<input value={customerId} onChange={(event) => setCustomerId(event.target.value)} placeholder="user-..." /></label>
          <label>流水类型<select value={type} onChange={(event) => setType(event.target.value)}>
            {ledgerTypes.map((item) => <option key={item || "all"} value={item}>{item || "全部类型"}</option>)}
          </select></label>
          <label>关键词<input value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="原因 / 订单 / 任务 / 操作员" /></label>
          <label>开始日期<input type="date" value={from} onChange={(event) => setFrom(event.target.value)} /></label>
          <label>结束日期<input type="date" value={to} onChange={(event) => setTo(event.target.value)} /></label>
        </div>
        <div className="adminActionRow">
          <button type="button" onClick={() => { setCustomerId(""); setType(""); setKeyword(""); setFrom(""); setTo(""); }}>清空筛选</button>
          <a className="adminSecondaryAction" href={`/api/admin/billing?${query.toString()}&export=csv`}>导出当前筛选 CSV</a>
        </div>
        <div className="ledgerTable">
          {loadError ? <em className="adminStatusLine">{loadError}</em> : null}
          {ledgerEntries.map((entry) => (
            <article key={entry.id}>
              <strong>{entry.type}</strong>
              <span>{entry.customerId}</span>
              <span>{entry.actorName ?? "未标记成员"}</span>
              <span>余额 {signed(entry.deltaBalanceCredits)} / 冻结 {signed(entry.deltaFrozenCredits)}</span>
              <span>变更后 {formatNumber(entry.balanceCreditsAfter)} / {formatNumber(entry.frozenCreditsAfter)}</span>
              <span>{entry.reason}</span>
              <span>{entry.rechargeOrderId ?? entry.generationJobId ?? "-"}</span>
              <span>{entry.operatorId ?? "-"}</span>
              <time>{formatDate(entry.createdAt)}</time>
            </article>
          ))}
          {!ledgerEntries.length && !loadError ? <em className="adminStatusLine">暂无匹配流水。</em> : null}
        </div>
      </section>
    </main>
  );
}

function signed(value: number): string {
  return `${value > 0 ? "+" : ""}${formatNumber(value)}`;
}

function initialQueryValue(key: string): string {
  if (typeof window === "undefined") return "";
  return new URLSearchParams(window.location.search).get(key) ?? "";
}
