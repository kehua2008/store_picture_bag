"use client";

import { useEffect, useMemo, useState } from "react";
import { describeNetworkFailure, describeRequestFailure, readJsonRecord, redirectToAdminLogin } from "@/client/httpStatus";
import { AdminHeader } from "../AdminNav";

type Member = {
  user: {
    id: string;
    phone: string;
    displayName?: string;
    companyName?: string;
    status: "active" | "suspended";
    createdAt: string;
  };
  account: {
    balanceCredits: number;
    frozenCredits: number;
  };
  totalRechargeCredits: number;
  totalConsumedCredits: number;
  rechargeOrderCount: number;
  taskCount: number;
  outputCount: number;
  recentOrders: Array<{
    id: string;
    planLabel: string;
    credits: number;
    priceCny: number;
    status: "pending" | "approved" | "rejected";
    createdAt: string;
  }>;
  recentLedgerEntries: Array<{
    id: string;
    type: string;
    deltaBalanceCredits: number;
    deltaFrozenCredits: number;
    reason: string;
    createdAt: string;
  }>;
};

function formatNumber(value: number): string {
  return new Intl.NumberFormat("zh-CN").format(value);
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

export default function MembersAdminPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [adjustCredits, setAdjustCredits] = useState("100");
  const [adjustReason, setAdjustReason] = useState("");
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [status, setStatus] = useState("客户资料与积分账户");
  const [loadError, setLoadError] = useState("");
  const filteredMembers = useMemo(() => members.filter((member) => {
    const keywordMatched = !keyword.trim() || [
      member.user.id,
      member.user.phone,
      member.user.displayName,
      member.user.companyName
    ].some((value) => value?.toLowerCase().includes(keyword.trim().toLowerCase()));
    const statusMatched = !statusFilter || member.user.status === statusFilter;
    return keywordMatched && statusMatched;
  }), [members, keyword, statusFilter]);
  const selectedMember = useMemo(() => filteredMembers.find((member) => member.user.id === selectedMemberId) ?? filteredMembers[0], [filteredMembers, selectedMemberId]);

  useEffect(() => {
    void refresh();
  }, []);

  async function refresh() {
    setLoadError("");
    try {
      const response = await fetch("/api/admin/members");
      const body = await readJsonRecord(response);
      if (!response.ok) {
        const message = describeRequestFailure("会员列表读取失败", response, body);
        setLoadError(message);
        setStatus(message);
        if (response.status === 401 || response.status === 403) redirectToAdminLogin();
        return;
      }
      setMembers(Array.isArray(body.members) ? body.members as Member[] : []);
    } catch (error) {
      const message = describeNetworkFailure("会员列表读取失败", error);
      setLoadError(message);
      setStatus(message);
    }
  }

  async function updateMember(action: "activate" | "suspend") {
    if (!selectedMember) return;
    const response = await fetch("/api/admin/members", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: selectedMember.user.id, action })
    });
    const body = await readJsonRecord(response);
    if (!response.ok) {
      setStatus(describeRequestFailure("操作失败", response, body));
      if (response.status === 401 || response.status === 403) redirectToAdminLogin();
      return;
    }
    setStatus(action === "activate" ? "账号已恢复" : "账号已停用");
    await refresh();
  }

  async function submitAdjustment() {
    if (!selectedMember) return;
    const response = await fetch("/api/admin/members", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: selectedMember.user.id,
        action: "adjust",
        deltaCredits: Number(adjustCredits),
        reason: adjustReason
      })
    });
    const body = await readJsonRecord(response);
    if (!response.ok) {
      setStatus(describeRequestFailure("调账失败", response, body));
      if (response.status === 401 || response.status === 403) redirectToAdminLogin();
      return;
    }
    const account = body.account as Member["account"] | undefined;
    setStatus(`调账完成，余额 ${formatNumber(account?.balanceCredits ?? 0)} 点`);
    setAdjustReason("");
    await refresh();
  }

  return (
    <main className="adminShell">
      <AdminHeader active="members" kicker="Admin Members" title="客户管理" />

      <section className="adminStatsGrid">
        <article><span>注册会员</span><strong>{members.length}</strong><em>全部账号</em></article>
        <article><span>启用会员</span><strong>{members.filter((item) => item.user.status === "active").length}</strong><em>可登录账号</em></article>
        <article><span>总余额</span><strong>{formatNumber(members.reduce((sum, item) => sum + item.account.balanceCredits, 0))}</strong><em>可用积分</em></article>
        <article><span>总冻结</span><strong>{formatNumber(members.reduce((sum, item) => sum + item.account.frozenCredits, 0))}</strong><em>任务占用</em></article>
      </section>

      <section className="adminWorkflowGrid">
        <div className="adminPanel">
          <div className="adminPanelHeader"><span>01</span><strong>会员列表</strong></div>
          <div className="adminFormGrid">
            <label>搜索会员<input value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="手机号 / 昵称 / user-id / 公司" /></label>
            <label>账号状态<select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              <option value="">全部状态</option>
              <option value="active">启用</option>
              <option value="suspended">停用</option>
            </select></label>
          </div>
          <div className="memberTable">
            {loadError ? <em className="adminStatusLine">{loadError}</em> : null}
            {filteredMembers.map((member) => (
              <button className={member.user.id === selectedMember?.user.id ? "active" : ""} key={member.user.id} type="button" onClick={() => setSelectedMemberId(member.user.id)}>
                <strong>{member.user.displayName || member.user.phone}</strong>
                <span>{member.user.phone}</span>
                <span>{member.user.status === "active" ? "启用" : "停用"}</span>
                <span>{formatNumber(member.account.balanceCredits)} / 冻结 {formatNumber(member.account.frozenCredits)}</span>
                <span>充值 {formatNumber(member.totalRechargeCredits)} · 消耗 {formatNumber(member.totalConsumedCredits)}</span>
              </button>
            ))}
            {!filteredMembers.length && !loadError ? <em>暂无匹配会员。</em> : null}
          </div>
        </div>

        <div className="adminPanel">
          <div className="adminPanelHeader"><span>02</span><strong>会员详情与调账</strong></div>
          {selectedMember ? (
            <>
              <div className="memberDetailGrid">
                <article><span>手机号</span><strong>{selectedMember.user.phone}</strong></article>
                <article><span>账号状态</span><strong>{selectedMember.user.status === "active" ? "启用" : "停用"}</strong></article>
                <article><span>注册时间</span><strong>{formatDate(selectedMember.user.createdAt)}</strong></article>
                <article><span>任务 / 出图</span><strong>{selectedMember.taskCount} / {selectedMember.outputCount}</strong></article>
                <article><span>充值订单</span><strong>{selectedMember.rechargeOrderCount}</strong></article>
                <article><span>累计消耗</span><strong>{formatNumber(selectedMember.totalConsumedCredits)}</strong></article>
              </div>
              <div className="adminActionRow">
                <button type="button" onClick={() => void updateMember(selectedMember.user.status === "active" ? "suspend" : "activate")}>
                  {selectedMember.user.status === "active" ? "停用账号" : "恢复账号"}
                </button>
              </div>
              <div className="adminFormGrid">
                <label>调账积分<input value={adjustCredits} onChange={(event) => setAdjustCredits(event.target.value)} /></label>
                <label>调账原因<input placeholder="必须填写，写入财务流水" value={adjustReason} onChange={(event) => setAdjustReason(event.target.value)} /></label>
              </div>
              <div className="adminActionRow">
                <button type="button" onClick={() => void submitAdjustment()}>提交人工调账</button>
                <a className="adminSecondaryAction" href={`/admin/billing?customerId=${encodeURIComponent(selectedMember.user.id)}`}>查看该会员流水</a>
              </div>
              <div className="adminSplitTables">
                <section>
                  <strong>最近充值</strong>
                  <div className="adminMiniTable">
                    {selectedMember.recentOrders.map((order) => (
                      <article key={order.id}>
                        <strong>{order.planLabel}</strong>
                        <span>{formatNumber(order.credits)} 点 / ¥{order.priceCny}</span>
                        <span>{rechargeStatusLabel(order.status)}</span>
                        <time>{formatDate(order.createdAt)}</time>
                      </article>
                    ))}
                    {!selectedMember.recentOrders.length ? <em>暂无充值记录。</em> : null}
                  </div>
                </section>
                <section>
                  <strong>最近流水</strong>
                  <div className="adminMiniTable">
                    {selectedMember.recentLedgerEntries.map((entry) => (
                      <article key={entry.id}>
                        <strong>{entry.type}</strong>
                        <span>余额 {signed(entry.deltaBalanceCredits)} / 冻结 {signed(entry.deltaFrozenCredits)}</span>
                        <span>{entry.reason}</span>
                        <time>{formatDate(entry.createdAt)}</time>
                      </article>
                    ))}
                    {!selectedMember.recentLedgerEntries.length ? <em>暂无积分流水。</em> : null}
                  </div>
                </section>
              </div>
            </>
          ) : <em className="adminStatusLine">请选择会员。</em>}
          <p className="adminStatusLine">{status}</p>
        </div>
      </section>
    </main>
  );
}

function signed(value: number): string {
  return `${value > 0 ? "+" : ""}${formatNumber(value)}`;
}

function rechargeStatusLabel(status: "pending" | "approved" | "rejected"): string {
  if (status === "approved") return "已通过";
  if (status === "rejected") return "已驳回";
  return "待审核";
}
