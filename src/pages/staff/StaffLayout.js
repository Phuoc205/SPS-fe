import React from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import "./css/stafflayout.css";

const StaffLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const userStr = localStorage.getItem("user");
    const user = userStr
        ? JSON.parse(userStr)
        : { name: "Nhân viên", role: "STAFF" };

    const handleLogout = () => {
        localStorage.removeItem("user");
        localStorage.removeItem("userToken"); // Xóa thêm token nếu có
        navigate("/login");
    };

    const menuItems = [
        { path: "/staff/ticketvalidation", label: "Kiểm tra vé xe", icon: "🎫" },
        { path: "/staff/manualgatecontrol", label: "Điều khiển Barie", icon: "🚧" },
        { path: "/staff/slot", label: "Giám sát ô đỗ", icon: "🅿️" },
    ];

    return (
        <div className="staff-container">
            {/* SIDEBAR */}
            <aside className="staff-sidebar">
                <div className="staff-brand">
                    <div className="brand-icon">🅿️</div>
                    <h2>SPS Staff</h2>
                </div>

                <nav className="staff-nav">
                    <div className="nav-section-title">Menu Điều Hành</div>
                    {menuItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`staff-nav-item ${
                                location.pathname.includes(item.path) ? "active" : ""
                            }`}
                        >
                            <span className="staff-nav-icon">{item.icon}</span>
                            <span className="staff-nav-label">{item.label}</span>
                        </Link>
                    ))}
                </nav>
            </aside>

            {/* MAIN */}
            <main className="staff-main">
                <header className="staff-header">
                    <div className="staff-title">
                        <h3>Trạm kiểm soát bãi đỗ</h3>
                        <span className="live-status">🟢 Đang hoạt động</span>
                    </div>

                    <div className="staff-user">
                        <div className="user-info">
                            <div className="user-avatar">
                                {user?.name?.charAt(0)?.toUpperCase() || "S"}
                            </div>
                            <div className="user-details">
                                <span className="user-name">{user?.name || "Nhân viên"}</span>
                            </div>
                        </div>
                        <button onClick={handleLogout} className="staff-logout">
                            <span>Đăng xuất</span>
                            <span className="logout-icon">🚪</span>
                        </button>
                    </div>
                </header>

                <div className="staff-content">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default StaffLayout;