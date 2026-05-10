import React, { useEffect, useState } from 'react'
import '../css/componentcss/header.css'
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
        { name: "Homepage", path: "/" },
        { name: "Parking", path: "/parkingaction" },
        { name: "News", path: "/news" }
    ];

    const userNav = [
        { name: "Homepage", path: "/" },
        { name: "Parking", path: "/parkingaction" },
        { name: "Parking History", path: "/history" },
        { name: "Payment", path: "/payment" },
    ];

    const staffNav = [
        { name: "Homepage", path: "/" },
        { name: "Ticket Validation", path: "/ticketvalidation" },
        { name: "Slot Management", path: "/slotmanagement" },
        { name: "Slot Monitor", path: "/slotmonitor" },
        { name: "Manual Gate Control", path: "/manualgatecontrol" }
    ];

    const adminNav = [
        { name: "Homepage", path: "/" },
        { name: "Config Price", path: "/admin/price" },
        { name: "User Management", path: "/usermanagement" },
        { name: "Parking Lot Management", path: "/parkinglotmanagement" },
        { name: "Revenue Report", path: "/revenuereport" }
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
        <header className="header">
            <div className="header-container">

                {/* LOGO */}
                <div className="header-logo-container">
                    <img src={logo} className="header-logo" />
                    <span className="brand">SmartPark</span>
                </div>

                {/* MENU */}
                <nav className="header-menubar">
                    {navItems.map((item, index) => (
                        <Link key={index} to={item.path} className="header-menubar-item">
                            {item.name}
                        </Link>
                    ))}
                </nav>

                {/* RIGHT SIDE */}
                <div className="header-login">
                    {user ? (
                        <>
                            <span className="welcome">Hi, {user.name}</span>
                            <button className="logout" onClick={handleLogout}>
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="signin">
                                Sign In
                            </Link>
                            <Link to="/" className="getstarted">
                                Get Started
                            </Link>
                        </>
                    )}
                </div>

            </div>
        </header>
    )
}

export default Header;