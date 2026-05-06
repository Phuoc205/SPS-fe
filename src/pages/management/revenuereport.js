import React, { useEffect, useMemo, useState } from "react";
import "./css/revenuereport.css";

const api_url = process.env.REACT_APP_API_URL;
const API_BASE = process.env.REACT_APP_API_URL;

function formatCurrency(value) {
  const amount = Number(value || 0);
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
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
  } catch (error) {
    return Number(text);
  }
}

export default function RevenueReport() {
  const [revenue, setRevenue] = useState(0);
  const [usage, setUsage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState("");

  const averageRevenuePerUsage = useMemo(() => {
    if (!usage) return 0;
    return revenue / usage;
  }, [revenue, usage]);

  const headers = useMemo(() => {
    const token = localStorage.getItem("token");

    return token
      ? {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        }
      : {
          "Content-Type": "application/json",
        };
  }, []);

  const fetchReport = async () => {
    setLoading(true);
    setError("");

    try {
      const [revenueRes, usageRes] = await Promise.all([
        fetch(`${API_BASE}/api/reports/revenue`, {
          method: "GET",
          headers,
        }),
        fetch(`${API_BASE}/api/reports/usage`, {
          method: "GET",
          headers,
        }),
      ]);

      if (!revenueRes.ok) {
        throw new Error("Không lấy được dữ liệu doanh thu từ /api/reports/revenue");
      }

      if (!usageRes.ok) {
        throw new Error("Không lấy được dữ liệu lượt sử dụng từ /api/reports/usage");
      }

      const revenueValue = await parseNumberResponse(revenueRes);
      const usageValue = await parseNumberResponse(usageRes);

      setRevenue(Number(revenueValue || 0));
      setUsage(Number(usageValue || 0));
      setLastUpdated(new Date().toLocaleString("vi-VN"));
    } catch (err) {
      console.error("Revenue report error:", err);
      setError(
        "Không thể tải báo cáo doanh thu. Hãy kiểm tra backend, token đăng nhập hoặc địa chỉ API_BASE."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="revenue-report-page">
      <div className="revenue-report-container">
        <div className="revenue-report-header">
          <div>
            <h1 className="revenue-report-title">Revenue Report</h1>
            <p className="revenue-report-subtitle">
              Báo cáo tổng hợp doanh thu của hệ thống quản lý bãi đỗ xe
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
          <div className="revenue-report-alert revenue-report-alert-error">
            {error}
          </div>
        )}

        <div className="revenue-report-grid">
          <div className="revenue-report-card">
            <div className="revenue-report-card-label">Tổng doanh thu</div>
            <div className="revenue-report-card-value">{formatCurrency(revenue)}</div>
            <div className="revenue-report-card-subtext">
              Lấy từ API: /api/reports/revenue
            </div>
          </div>

          <div className="revenue-report-card">
            <div className="revenue-report-card-label">Tổng lượt sử dụng</div>
            <div className="revenue-report-card-value">{formatNumber(usage)}</div>
            <div className="revenue-report-card-subtext">
              Lấy từ API: /api/reports/usage
            </div>
          </div>

          <div className="revenue-report-card">
            <div className="revenue-report-card-label">Doanh thu trung bình / lượt</div>
            <div className="revenue-report-card-value">
              {formatCurrency(averageRevenuePerUsage)}
            </div>
            <div className="revenue-report-card-subtext">
              Frontend tự tính = tổng doanh thu / tổng lượt sử dụng
            </div>
          </div>
        </div>

        <div className="revenue-report-panel">
          <h2 className="revenue-report-panel-title">Tóm tắt báo cáo</h2>
          <p className="revenue-report-panel-text">
            Tổng doanh thu hiện tại của hệ thống là <strong>{formatCurrency(revenue)}</strong>.
          </p>
          <p className="revenue-report-panel-text">
            Tổng số lượt sử dụng bãi xe đã ghi nhận là <strong>{formatNumber(usage)}</strong>.
          </p>
          <p className="revenue-report-panel-text">
            Doanh thu trung bình trên mỗi lượt sử dụng là <strong>{formatCurrency(averageRevenuePerUsage)}</strong>.
          </p>

          <div className="revenue-report-note">
            Theo file API bạn gửi, endpoint báo cáo doanh thu hiện chỉ trả về giá trị tổng doanh thu,
            không trả về danh sách chi tiết theo ngày hoặc theo từng giao dịch.
          </div>
        </div>

        <div className="revenue-report-panel">
          <h2 className="revenue-report-panel-title">Dữ liệu đang sử dụng</h2>
          <ul className="revenue-report-list">
            <li>Tổng doanh thu lấy trực tiếp từ endpoint <strong>/api/reports/revenue</strong>.</li>
            <li>Tổng lượt sử dụng lấy trực tiếp từ endpoint <strong>/api/reports/usage</strong>.</li>
            <li>Doanh thu trung bình / lượt được frontend tự tính từ 2 API trên.</li>
            <li>
              Nếu muốn hiện bảng chi tiết theo ngày, theo tháng hoặc theo payment thì backend cần thêm API chi tiết.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
