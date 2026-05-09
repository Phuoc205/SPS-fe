import React, { useState } from "react";
import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
import { 
    LayoutDashboard, 
    Users, 
    Cpu, 
    CircleDollarSign, 
    Warehouse, 
    CarFront, 
    LineChart,
    LogOut,
    Menu
} from "lucide-react";

import "./css/AdminLayout.css";

const AdminLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const menuItems = [
        { name: "Người dùng", path: "/admin/users", icon: <Users size={20} /> },
        { name: "Thiết bị IOT", path: "/admin/iot", icon: <Cpu size={20} /> },
        { name: "Cấu hình giá", path: "/admin/price", icon: <CircleDollarSign size={20} /> },
        { name: "Bãi đỗ xe", path: "/admin/lot", icon: <Warehouse size={20} /> },
        { name: "Vị trí đỗ (Slots)", path: "/admin/slot", icon: <CarFront size={20} /> },
        { name: "Báo cáo doanh thu", path: "/admin/report", icon: <LineChart size={20} /> },
    ];

    const handleLogout = () => {
        localStorage.removeItem("user");
        navigate("/login");
    };

    const currentTitle = menuItems.find(item => item.path === location.pathname)?.name || "Bảng điều khiển";

    return (
        <div className="admin-layout">
            {/* Sidebar */}
            <aside className={`sidebar ${isSidebarOpen ? "open" : "closed"}`}>
                <div className="sidebar-logo">
                    <span className={`logo-text ${!isSidebarOpen ? "hidden-text" : ""}`}>
                        PARKING ADMIN
                    </span>
                    {!isSidebarOpen && <Warehouse size={24} color="#60a5fa" />}
                </div>

                <nav className="sidebar-nav">
                    <ul className="nav-list">
                        {menuItems.map((item) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <li key={item.path}>
                                    <Link
                                        to={item.path}
                                        className={`nav-link ${isActive ? "active" : ""}`}
                                    >
                                        {item.icon}
                                        <span className={`nav-text ${!isSidebarOpen ? "hidden-text" : ""}`}>
                                            {item.name}
                                        </span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                <div className="sidebar-footer">
                    <button className="logout-btn" onClick={handleLogout}>
                        <LogOut size={20} />
                        <span className={`nav-text ${!isSidebarOpen ? "hidden-text" : ""}`}>
                            Đăng xuất
                        </span>
                    </button>
                </div>
            </aside>

            {/* Main Content Wrapper */}
            <div className="main-wrapper">
                {/* Topbar */}
                <header className="topbar">
                    <div className="topbar-left">
                        <button 
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="menu-toggle"
                        >
                            <Menu size={24} />
                        </button>
                        <h1 className="page-title">{currentTitle}</h1>
                    </div>
                    
                    <div className="topbar-right">
                        <div className="user-profile">
                            <div className="avatar">AD</div>
                            <div className="user-info">
                                <p className="user-name">Admin User</p>
                                <p className="user-role">Quản trị viên</p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Content Area */}
                <main className="content-area">
                    <div className="content-card">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;