/* Long Thanh */
<<<<<<< HEAD:FE-SPS/src/routes/configprice.js
=======
/* Xay dung dashboard cho du an */
>>>>>>> main:FE-SPS/src/routes/dashboard.js

import React, { useState, useEffect } from 'react';
import Header from '../components/header';
import Footer from '../components/footer';
import '../css/dashboard.css';

<<<<<<< HEAD:FE-SPS/src/routes/configprice.js
const ConfigPrice = () => {
    // Code here
    return (
        <div>ConfigPrice</div>
    )
};

export default ConfigPrice
=======
const Dashboard = () => {
    const [stats, setStats] = useState({
        totalSlots: 0, 
        occupiedSlots: 0,
        availableSlots: 0,
        totalUsers: 0,
        activeSessions: 0,
        totalSessionsToday: 0
    });

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/parking/stats');
            const data = await response.json();
            setStats(data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    return (
        <div>
            <Header />
            <div className="dashboard-container">
                <h1>Dashboard</h1>
                <div className="stats-grid">
                    <div className="stat-card">
                        <h2>{stats.totalSlots}</h2>
                        <p>Tổng chỗ đỗ</p>
                    </div>
                    <div className="stat-card">
                        <h2>{stats.occupiedSlots}</h2>
                        <p>Chỗ đã chiếm</p>
                    </div>
                    <div className="stat-card">
                        <h2>{stats.availableSlots}</h2>
                        <p>Chỗ trống</p>
                    </div>
                    <div className="stat-card">
                        <h2>{stats.totalUsers}</h2>
                        <p>Tổng người dùng</p>
                    </div>
                    <div className="stat-card">
                        <h2>{stats.activeSessions}</h2>
                        <p>Phiên đang hoạt động</p>
                    </div>
                    <div className="stat-card">
                        <h2>{stats.totalSessionsToday}</h2>
                        <p>Lượt xe hôm nay</p>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Dashboard;
>>>>>>> main:FE-SPS/src/routes/dashboard.js
