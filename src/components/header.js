import React, { useEffect, useState } from 'react'
import '../css/header.css'
import { Link } from "react-router-dom"
import logo from "/public/images/logo-sps.png";

const Header = () => {

    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("user");
        setUser(null);
        window.location.reload();
    };

    const publicNav = [
        { name: "Trang chủ", path: "/" },
        { name: "Bãi đỗ xe", path: "/parkinglot" },
        { name: "Tin tức", path: "/news" }
    ];

    const userNav = [
        { name: "Trang chủ", path: "/" },
        { name: "Parking Actions", path: "/parking-actions" },
        { name: "Lịch sử gửi xe", path: "/parkinghistory" },
        { name: "Thanh toán", path: "/payment" },
        { name: "Bãi đỗ xe", path: "/parkinglot" }
    ];

    const staffNav = [
        { name: "Trang chủ", path: "/" },
        { name: "Ticket Validation", path: "/ticket-validation" },
        { name: "Slot Management", path: "/slot-management" },
        { name: "Slot Monitor", path: "/slot-monitor" },
        { name: "Manual Gate Control", path: "/gate-control" }
    ];

    const adminNav = [
        { name: "Trang chủ", path: "/" },
        { name: "Config Price", path: "/config-price" },
        { name: "User Management", path: "/user-management" },
        { name: "Parking Lot Management", path: "/parking-lot" },
        { name: "IoT / Sensor", path: "/iot" },
        { name: "Revenue Report", path: "/report" }
    ];

    const getNavItems = () => {
        if (!user) return publicNav;

        switch (user.role) {
            case "USER":
                return userNav;
            case "PARKING_STAFF":
                return staffNav;
            case "ADMIN":
                return adminNav;
            default:
                return publicNav;
        }
    };

    const navItems = getNavItems();

    return (
        <div className='header-container'>
            <div className='header-logo-container'>
                <img src={logo} className='header-logo' />
            </div>

            <div className='header-menubar'>
                {navItems.map((item, index) => (
                    <Link key={index} className="header-menubar-item" to={item.path}>
                        <h3>{item.name}</h3>
                    </Link>
                ))}
            </div>

            <div className='header-login'>
                {user ? (
                    <>
                        <span>Chào, {user.name}</span>
                        <button onClick={handleLogout}>Logout</button>
                    </>
                ) : (
                    <Link to="/login">Đăng nhập</Link>
                )}
            </div>
        </div>
    )
}

export default Header;

