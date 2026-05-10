import React, { useCallback, useEffect, useMemo, useState } from "react";
import "./css/revenuereport.css";

const api_url = process.env.REACT_APP_API_URL;

const ROLE_LABELS = {
  USER: "Sinh viên",
  GUEST: "Khách vãng lai",
  LECTURER: "Giảng viên",
  STAFF: "Nhân viên",
  ADMIN: "Quản trị viên",
};

const ROLE_COLORS = {
  USER: "#2563eb",
  GUEST: "#16a34a",
  LECTURER: "#d97706",
  STAFF: "#7c3aed",
  ADMIN: "#dc2626",
};

function formatCurrency(value) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function formatNumber(value) {
  return new Intl.NumberFormat("vi-VN").format(Number(value || 0));
}

async function parseNumberResponse(response) {
  const text = await response.text();
  try {
    const parsed = JSON.parse(text);
    if (typeof parsed === "number") return parsed;
    if (typeof parsed === "string") return Number(parsed);
    if (parsed && typeof parsed.value === "number") return parsed.value;
    if (parsed && typeof parsed.total === "number") return parsed.total;
    if (parsed && typeof parsed.amount === "number") return parsed.amount;
    return 0;
  } catch {
    return Number(text);
  }
}

function calcSessionRevenue(session, avgRate) {
  if (!session.exitTime || !session.entryTime) return 0;
  const hours = Math.max(
    (new Date(session.exitTime) - new Date(session.entryTime)) / 3_600_000,
    0
  );
  return hours * avgRate;
}

function monthKey(dateStr) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(date) {
  return `Tháng ${date.getMonth() + 1}/${date.getFullYear()}`;
}

export default function RevenueReport() {
  const [revenue, setRevenue] = useState(0);
  const [usage, setUsage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState("");

  const [revenueByRole, setRevenueByRole] = useState({});
  const [currentMonthRev, setCurrentMonthRev] = useState(0);
  const [prevMonthRev, setPrevMonthRev] = useState(0);
  const [currentLabel, setCurrentLabel] = useState("");
  const [prevLabel, setPrevLabel] = useState("");

  const avgPerUsage = useMemo(() => {
    return usage ? revenue / usage : 0;
  }, [revenue, usage]);

  const monthChange = useMemo(() => {
    if (!prevMonthRev) return null;
    return ((currentMonthRev - prevMonthRev) / prevMonthRev) * 100;
  }, [currentMonthRev, prevMonthRev]);

  const headers = useMemo(() => {
    const token = localStorage.getItem("token");
    return token
      ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
      : { "Content-Type": "application/json" };
  }, []);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [revenueRes, usageRes, usersRes, priceRes] = await Promise.all([
        fetch(`${api_url}/reports/revenue`, { headers }),
        fetch(`${api_url}/reports/usage`, { headers }),
        fetch(`${api_url}/users`, { headers }),
        fetch(`${api_url}/config-price`, { headers }),
      ]);

      if (!revenueRes.ok) throw new Error("Không lấy được dữ liệu doanh thu từ /api/reports/revenue");
      if (!usageRes.ok) throw new Error("Không lấy được lượt sử dụng từ /api/reports/usage");

      const revenueValue = await parseNumberResponse(revenueRes);
      const usageValue = await parseNumberResponse(usageRes);
      setRevenue(Number(revenueValue || 0));
      setUsage(Number(usageValue || 0));
      setLastUpdated(new Date().toLocaleString("vi-VN"));

      let users = [];
      let avgRate = 10000;

      if (usersRes.ok) {
        users = await usersRes.json();
      }

      if (priceRes.ok) {
        const prices = await priceRes.json();
        if (Array.isArray(prices) && prices.length > 0) {
          avgRate = prices.reduce((s, p) => s + p.hourlyRate, 0) / prices.length;
        }
      }

      const historyResults = await Promise.allSettled(
        users.map((u) =>
          fetch(`${api_url}/history/user/${u.id}`, { headers })
            .then((r) => (r.ok ? r.json() : []))
            .then((sessions) => ({ user: u, sessions }))
        )
      );

      const now = new Date();
      const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const thisKey = monthKey(now.toISOString());
      const prevKey = monthKey(prevMonth.toISOString());

      setCurrentLabel(monthLabel(now));
      setPrevLabel(monthLabel(prevMonth));

      const roleMap = {};
      const monthMap = {};

      for (const result of historyResults) {
        if (result.status !== "fulfilled") continue;
        const { user, sessions } = result.value;
        const role = user.role || "USER";

        for (const session of sessions) {
          if (session.status !== "FINISHED" || !session.exitTime) continue;
          const rev = calcSessionRevenue(session, avgRate);
          roleMap[role] = (roleMap[role] || 0) + rev;
          const mk = monthKey(session.entryTime);
          monthMap[mk] = (monthMap[mk] || 0) + rev;
        }
      }

      setRevenueByRole(roleMap);
      setCurrentMonthRev(monthMap[thisKey] || 0);
      setPrevMonthRev(monthMap[prevKey] || 0);
    } catch (err) {
      console.error("Revenue report error:", err);
      setError("Không thể tải báo cáo. Hãy kiểm tra backend hoặc token đăng nhập.");
    } finally {
      setLoading(false);
    }
  }, [headers]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const totalRoleRevenue = Object.values(revenueByRole).reduce((a, b) => a + b, 0);

  return (
    <div className="revenue-report-page">
      <div className="revenue-report-container">

        {/* ── Header ── */}
        <div className="revenue-report-header">
          <div>
            <h1 className="revenue-report-title">Báo cáo Doanh Thu</h1>
            <p className="revenue-report-subtitle">
              Tổng hợp doanh thu hệ thống quản lý bãi đỗ xe
            </p>
          </div>
          <button
            className="revenue-report-refresh-btn"
            onClick={fetchReport}
            disabled={loading}
          >
            {loading ? "Đang tải..." : "Tải lại dữ liệu"}
          </button>
        </div>

        {/* ── Alerts ── */}
        {loading && (
          <div className="revenue-report-alert revenue-report-alert-info">
            Đang tải dữ liệu báo cáo...
          </div>
        )}
        {!loading && !error && (
          <div className="revenue-report-alert revenue-report-alert-success">
            Tải dữ liệu thành công
            {lastUpdated ? ` • Cập nhật lúc ${lastUpdated}` : ""}
          </div>
        )}
        {!loading && error && (
          <div className="revenue-report-alert revenue-report-alert-error">{error}</div>
        )}

        {/* ── Summary cards ── */}
        <div className="revenue-report-grid">
          <div className="revenue-report-card">
            <div className="revenue-report-card-label">Tổng doanh thu</div>
            <div className="revenue-report-card-value">{formatCurrency(revenue)}</div>
          </div>

          <div className="revenue-report-card">
            <div className="revenue-report-card-label">Tổng lượt đỗ xe</div>
            <div className="revenue-report-card-value">{formatNumber(usage)}</div>
          </div>

          <div className="revenue-report-card">
            <div className="revenue-report-card-label">Doanh thu TB / lượt</div>
            <div className="revenue-report-card-value">{formatCurrency(avgPerUsage)}</div>
          </div>
        </div>

        {/* ── Monthly comparison ── */}
        <div className="revenue-report-panel">
          <h2 className="revenue-report-panel-title">So sánh doanh thu theo tháng</h2>

          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div className="revenue-monthly-card revenue-monthly-card--prev" style={{ flex: 1 }}>
              <div className="revenue-monthly-badge revenue-monthly-badge--prev">
                Tháng trước — {prevLabel}
              </div>
              <div className="revenue-monthly-value">{formatCurrency(prevMonthRev)}</div>
            </div>

            <div className="revenue-monthly-arrow">
              {monthChange !== null ? (
                <div
                  className={`revenue-change-badge ${
                    monthChange >= 0 ? "revenue-change-badge--up" : "revenue-change-badge--down"
                  }`}
                >
                  <span className="revenue-change-icon">
                    {monthChange >= 0 ? "▲" : "▼"}
                  </span>
                  {Math.abs(monthChange).toFixed(1)}%
                </div>
              ) : (
                <div className="revenue-change-badge revenue-change-badge--neutral">
                  Chưa có<br />dữ liệu
                </div>
              )}
            </div>

            <div className="revenue-monthly-card revenue-monthly-card--current" style={{ flex: 1 }}>
              <div className="revenue-monthly-badge revenue-monthly-badge--current">
                Tháng hiện tại — {currentLabel}
              </div>
              <div className="revenue-monthly-value">{formatCurrency(currentMonthRev)}</div>
            </div>
          </div>

        </div>

        {/* ── Revenue by role ── */}
        <div className="revenue-report-panel">
          <h2 className="revenue-report-panel-title">Doanh thu theo đối tượng</h2>

          {Object.keys(revenueByRole).length === 0 && !loading ? (
            <p className="revenue-report-panel-text">
              Chưa có dữ liệu lịch sử để phân tích theo đối tượng.
            </p>
          ) : (
            <>
              <div className="revenue-role-list">
                {Object.entries(revenueByRole)
                  .sort((a, b) => b[1] - a[1])
                  .map(([role, amount]) => {
                    const pct = totalRoleRevenue > 0 ? (amount / totalRoleRevenue) * 100 : 0;
                    const color = ROLE_COLORS[role] || "#64748b";
                    return (
                      <div key={role} className="revenue-role-row">
                        <div className="revenue-role-info">
                          <span
                            className="revenue-role-dot"
                            style={{ background: color }}
                          />
                          <span className="revenue-role-name">
                            {ROLE_LABELS[role] || role}
                          </span>
                        </div>
                        <div className="revenue-role-bar-wrap">
                          <div
                            className="revenue-role-bar"
                            style={{ width: `${pct}%`, background: color }}
                          />
                        </div>
                        <div className="revenue-role-amount">{formatCurrency(amount)}</div>
                        <div className="revenue-role-pct">{pct.toFixed(1)}%</div>
                      </div>
                    );
                  })}

                <div className="revenue-role-total">
                  <span>Tổng doanh thu (tính từ lịch sử)</span>
                  <span>{formatCurrency(totalRoleRevenue)}</span>
                </div>
              </div>

              <p className="revenue-report-note" style={{ marginTop: 16 }}>
                Doanh thu theo đối tượng được ước tính từ lịch sử phiên đỗ xe của từng tài khoản
                và bảng giá hiện hành. Có thể có chênh lệch nhỏ so với tổng doanh thu chính thức.
              </p>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
