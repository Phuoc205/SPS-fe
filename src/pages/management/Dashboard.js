import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { 
    Users, 
    Cpu, 
    CircleDollarSign, 
    CarFront, 
    TrendingUp, 
    TrendingDown,
    Clock,
    CheckCircle2,
    XCircle,
    Loader2
} from "lucide-react";
import "./css/Dashboard.css";

const api_url = process.env.REACT_APP_API_URL;
const Dashboard = () => {
    const { token } = useAuth();
    const [summary, setSummary] = useState(null);
    const [activities, setActivities] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Format tiền tệ VNĐ
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
    };

    // Format thời gian
    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    };

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const authHeaders = {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                };

                const [summaryRes, activitiesRes] = await Promise.all([
                    fetch(`${api_url}/dashboard/summary`, { headers: authHeaders }),
                    fetch(`${api_url}/dashboard/recent-activities`, { headers: authHeaders })
                ]);

                if (!summaryRes.ok || !activitiesRes.ok) {
                    throw new Error("Không thể tải dữ liệu từ máy chủ");
                }

                const summaryData = await summaryRes.json();
                const activitiesData = await activitiesRes.json();

                setSummary(summaryData);
                setActivities(activitiesData);
            } catch (err) {
                console.error("Lỗi Fetch Dashboard:", err);
                setError("Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại sau.");
            } finally {
                setIsLoading(false);
            }
        };

        if (token) {
            fetchDashboardData();
        }
    }, [token]);

    // Màn hình Loading
    if (isLoading) {
        return (
            <div className="dashboard-loading">
                <Loader2 className="spinner" size={40} />
                <p>Đang đồng bộ dữ liệu hệ thống...</p>
            </div>
        );
    }

    // Màn hình Lỗi
    if (error) {
        return (
            <div className="dashboard-error">
                <XCircle color="#ef4444" size={48} />
                <p>{error}</p>
                <button onClick={() => window.location.reload()}>Tải lại trang</button>
            </div>
        );
    }

    // Cấu hình mảng thẻ hiển thị dựa trên dữ liệu thật
    const statCards = [
        {
            title: "Trạng thái bãi đỗ",
            value: `${summary.slots.occupied} / ${summary.slots.total}`,
            subtitle: `Đang lấp đầy (${summary.slots.fillPercentage}%)`,
            icon: <CarFront size={24} />,
            color: "blue",
            trend: `${summary.slots.available} chỗ trống`,
            trendUp: summary.slots.fillPercentage > 80 // Hiện cảnh báo nếu quá 80%
        },
        {
            title: "Doanh thu hôm nay",
            value: formatCurrency(summary.revenue.today),
            subtitle: `${summary.revenue.totalVehiclesToday} lượt xe ra vào`,
            icon: <CircleDollarSign size={24} />,
            color: "green",
            trend: `${summary.revenue.vsYesterdayPercent >= 0 ? '+' : ''}${summary.revenue.vsYesterdayPercent}% so với hôm qua`,
            trendUp: summary.revenue.vsYesterdayPercent >= 0
        },
        {
            title: "Thiết bị IoT",
            value: `${summary.devices.active} / ${summary.devices.total}`,
            subtitle: summary.devices.offline > 0 ? `${summary.devices.offline} thiết bị mất kết nối` : "Tất cả hoạt động tốt",
            icon: <Cpu size={24} />,
            color: summary.devices.offline > 0 ? "orange" : "blue",
            trend: summary.devices.offline > 0 ? "Cần kiểm tra ngay" : "Hệ thống ổn định",
            trendUp: summary.devices.offline === 0
        },
        {
            title: "Khách hàng mới",
            value: summary.users.newToday,
            subtitle: `Tổng KH: ${summary.users.totalActive}`,
            icon: <Users size={24} />,
            color: "purple",
            trend: "Trong ngày hôm nay",
            trendUp: true
        }
    ];

    return (
        <div className="dashboard-container">
            {/* Header */}
            <div className="dashboard-header">
                <div>
                    <h2>Tổng quan hệ thống</h2>
                    <p>Theo dõi tình trạng bãi đỗ xe và doanh thu theo thời gian thực.</p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
                {statCards.map((stat, index) => (
                    <div className={`stat-card stat-${stat.color}`} key={index}>
                        <div className="stat-card-header">
                            <div className="stat-info">
                                <h3>{stat.title}</h3>
                                <p className="stat-value">{stat.value}</p>
                                <span className="stat-subtitle">{stat.subtitle}</span>
                            </div>
                            <div className="stat-icon-wrapper">
                                {stat.icon}
                            </div>
                        </div>
                        <div className={`stat-card-footer ${stat.trendUp ? 'trend-good' : 'trend-bad'}`}>
                            {stat.trendUp ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                            <span>{stat.trend}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Bottom Section */}
            <div className="dashboard-bottom">
                {/* Biểu đồ */}
                <div className="chart-section panel-card">
                    <div className="panel-header">
                        <h3>Biểu đồ lưu lượng xe (Tuần)</h3>
                    </div>
                    <div className="panel-body chart-placeholder">
                        <div className="placeholder-text">
                            <p>Khu vực tích hợp biểu đồ (Recharts / Chart.js)</p>
                            <p className="hint">Sử dụng API: /api/reports/usage</p>
                            <div className="mock-bars">
                                <div className="bar" style={{height: "40%"}}></div>
                                <div className="bar" style={{height: "60%"}}></div>
                                <div className="bar" style={{height: "30%"}}></div>
                                <div className="bar" style={{height: "80%"}}></div>
                                <div className="bar" style={{height: "50%"}}></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Hoạt động gần đây */}
                <div className="activities-section panel-card">
                    <div className="panel-header">
                        <h3>Hoạt động gần đây</h3>
                    </div>
                    <div className="panel-body">
                        {activities.length === 0 ? (
                            <div className="empty-state">Chưa có hoạt động nào.</div>
                        ) : (
                            <ul className="activity-list">
                                {activities.map((activity) => (
                                    <li className="activity-item" key={activity.id}>
                                        <div className="activity-icon">
                                            {activity.status.toUpperCase() === 'SUCCESS' ? 
                                                <CheckCircle2 color="#22c55e" size={20}/> : 
                                                <XCircle color="#ef4444" size={20}/>
                                            }
                                        </div>
                                        <div className="activity-details">
                                            <div className="activity-title">
                                                <span className="plate">{activity.licensePlate || "Không rõ biển số"}</span>
                                                <span className="action">
                                                    {activity.action === "CHECK_IN" ? "Vào" : "Ra"} - {activity.gateName}
                                                </span>
                                            </div>
                                            <div className="activity-meta">
                                                <Clock size={14} />
                                                <span>{formatTime(activity.time)}</span>
                                                {activity.fee > 0 && (
                                                    <span className="fee">• {formatCurrency(activity.fee)}</span>
                                                )}
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;