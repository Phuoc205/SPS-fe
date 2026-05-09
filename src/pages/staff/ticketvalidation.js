/* Duc Huy - Chức năng: Ticket Validation (Fixed Flicker & Sync Bugs) */
import React, { useState, useEffect } from 'react';
import "../management/css/usermanagement.css"; 
import { AuthProvider } from '../../context/AuthContext';
import { useAuth } from "../../context/AuthContext";

const TicketValidation = () => {
    // Thêm state isAuthLoading để tránh lỗi chớp màn hình
    const [user, setUser] = useState(null);
    const [isAuthLoading, setIsAuthLoading] = useState(true); 
    
    const [ticketId, setTicketId] = useState("");
    const [isValid, setIsValid] = useState(null); 
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const BACKEND_PORT = 5000; 
    const API_URL = `http://localhost:${BACKEND_PORT}/api/tickets/validate`;

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setIsAuthLoading(false);
    }, []);

    const handleInputChange = (e) => {
        setTicketId(e.target.value);
        if (isValid !== null) setIsValid(null); 
        if (error) setError("");
    };

    const handleSearch = async (e) => {
        e.preventDefault();

        if (!ticketId.trim()) {
            setError("Vui lòng nhập mã vé.");
            return;
        }

        try {
            const res = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ ticketId }),
            });

            const data = await res.json();
            setIsValid(data);
        } catch (err) {
            setError("Không thể kết nối server");
        }
    };

    if (isAuthLoading) {
        return <div style={{ textAlign: 'center', padding: '100px' }}>Đang xác thực...</div>;
    }

    const canAccess = user && (user.role === "ADMIN" || user.role === "STAFF");

    if (!canAccess) {
        return (
            <div className="um-page">
                <div className="um-container" style={{ textAlign: 'center', padding: '100px 0' }}>
                    <h2 style={{ color: '#d32f2f' }}>🚫 Truy cập bị từ chối</h2>
                    <p>Bạn cần quyền <strong>Staff</strong> hoặc <strong>Admin</strong> để sử dụng tính năng này.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="um-page">
            <div className="um-container">
                <div className="um-header" style={{ textAlign: 'center' }}>
                    <h2>Ticket Validation</h2>
                    <p>Nhập mã vé để kiểm tra tính hợp lệ</p>
                </div>

                <div className="card" style={{ padding: '30px', marginBottom: '30px' }}>
                    <form onSubmit={handleSearch} style={{ display: 'flex', gap: '15px' }}>
                        <input 
                            type="text" 
                            placeholder="Ví dụ: 2021001..."
                            value={ticketId}
                            onChange={handleInputChange} // Dùng hàm mới để sửa lỗi Sync
                            style={{ flex: 1, padding: '15px', borderRadius: '10px', border: '1px solid #ddd' }}
                        />
                        <button className="btn-add" type="submit" disabled={loading}>
                            {loading ? "Đang check..." : "Kiểm tra"}
                        </button>
                    </form>
                    {error && <p style={{ color: '#d32f2f', marginTop: '15px' }}>{error}</p>}
                </div>

                {isValid !== null && (
                    <div style={{ 
                        textAlign: 'center', padding: '50px', borderRadius: '16px', 
                        background: isValid ? '#e8f5e9' : '#ffebee',
                        border: `2px solid ${isValid ? '#4caf50' : '#f44336'}`
                    }}>
                        <div style={{ fontSize: '70px' }}>{isValid ? "✅" : "❌"}</div>
                        <h2 style={{ color: isValid ? '#2e7d32' : '#c62828' }}>
                            {isValid ? "VÉ HỢP LỆ" : "VÉ KHÔNG TỒN TẠI"}
                        </h2>
                        <p>Mã vé: <strong>{ticketId}</strong></p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TicketValidation;