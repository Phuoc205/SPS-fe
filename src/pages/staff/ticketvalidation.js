import React, { useState, useEffect } from 'react';
import { Ticket, Car, Search, CheckCircle, XCircle, AlertTriangle, Loader2 } from 'lucide-react';
import './css/TicketValidation.css';

const api_url = process.env.REACT_APP_API_URL;

const TicketValidation = () => {
    // Auth State
    const [user, setUser] = useState(null);
    const [isAuthLoading, setIsAuthLoading] = useState(true); 
    
    // Form State
    const [ticketCode, setTicketCode] = useState("");
    const [licensePlate, setLicensePlate] = useState("");
    
    // Result State
    const [status, setStatus] = useState(null); // 'success' | 'error' | null
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const BACKEND_PORT = 5000; 
    const API_URL = `${api_url}/tickets/validate`;

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setIsAuthLoading(false);
    }, []);

    const handleInputChange = (e, setter) => {
        setter(e.target.value);
        if (status !== null) setStatus(null); 
        if (errorMessage) setErrorMessage("");
    };

    const handleValidate = async (e) => {
        e.preventDefault();

        if (!ticketCode.trim() || !licensePlate.trim()) {
            setStatus('error');
            setErrorMessage("Vui lòng nhập đầy đủ mã vé và biển số xe.");
            return;
        }

        setLoading(true);
        setStatus(null);
        setErrorMessage("");

        try {
            // Lấy token nếu có bảo mật
            const token = user?.token; 
            const headers = {
                "Content-Type": "application/json",
                ...(token && { "Authorization": `Bearer ${token}` })
            };

            const payload = {
                ticketCode: ticketCode.trim(),
                licensePlate: licensePlate.trim()
            };

            const res = await fetch(API_URL, {
                method: "POST",
                headers: headers,
                body: JSON.stringify(payload),
            });

            // Nếu server trả về 200 OK -> Vé hợp lệ
            if (res.ok) {
                setStatus('success');
            } else {
                // Nếu server trả về 400, 404... -> Vé không hợp lệ
                const errorData = await res.text();
                setStatus('error');
                setErrorMessage(errorData || "Vé không hợp lệ hoặc thông tin không khớp!");
            }
        } catch (err) {
            setStatus('error');
            setErrorMessage("Không thể kết nối đến máy chủ xác thực.");
        } finally {
            setLoading(false);
        }
    };

    // --- Màn hình Loading Auth ---
    if (isAuthLoading) {
        return (
            <div className="tv-loading-screen">
                <Loader2 className="tv-spinner" size={40} />
                <p>Đang kiểm tra quyền truy cập...</p>
            </div>
        );
    }

    // --- Kiểm tra quyền (Chỉ ADMIN và STAFF) ---
    const canAccess = user && (user.role === "ADMIN" || user.role === "STAFF");
    if (!canAccess) {
        return (
            <div className="tv-page">
                <div className="tv-denied-card">
                    <AlertTriangle size={60} color="#ef4444" />
                    <h2>Truy cập bị từ chối</h2>
                    <p>Bạn cần quyền <strong>Nhân viên (Staff)</strong> hoặc <strong>Quản trị viên (Admin)</strong> để sử dụng máy quét vé.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="tv-page">
            <div className="tv-container">
                {/* Header */}
                <div className="tv-header">
                    <h2>Hệ thống Soát vé</h2>
                    <p>Nhập mã vé và biển số xe để xác thực quyền ra/vào</p>
                </div>

                {/* Form Nhập Liệu */}
                <div className="tv-card">
                    <form onSubmit={handleValidate} className="tv-form">
                        <div className="tv-input-group">
                            <label>Mã số vé</label>
                            <div className="tv-input-wrapper">
                                <Ticket className="tv-icon" size={20} />
                                <input 
                                    type="text" 
                                    placeholder="VD: TK-202405..."
                                    value={ticketCode}
                                    onChange={(e) => handleInputChange(e, setTicketCode)} 
                                />
                            </div>
                        </div>

                        <div className="tv-input-group">
                            <label>Biển số xe</label>
                            <div className="tv-input-wrapper">
                                <Car className="tv-icon" size={20} />
                                <input 
                                    type="text" 
                                    placeholder="VD: 29A-123.45"
                                    value={licensePlate}
                                    onChange={(e) => handleInputChange(e, setLicensePlate)} 
                                />
                            </div>
                        </div>

                        <button className="tv-submit-btn" type="submit" disabled={loading}>
                            {loading ? (
                                <><Loader2 className="tv-spinner" size={20} /> Đang xử lý...</>
                            ) : (
                                <><Search size={20} /> Xác thực vé</>
                            )}
                        </button>
                    </form>
                </div>

                {/* Kết quả trả về */}
                {status && (
                    <div className={`tv-result-card ${status === 'success' ? 'result-valid' : 'result-invalid'}`}>
                        <div className="result-icon">
                            {status === 'success' ? <CheckCircle size={64} /> : <XCircle size={64} />}
                        </div>
                        <h2>{status === 'success' ? "VÉ HỢP LỆ" : "VÉ KHÔNG HỢP LỆ"}</h2>
                        
                        {status === 'success' ? (
                            <div className="result-details">
                                <p>Cổng tự động có thể mở khóa.</p>
                                <p className="match-info">Mã: <strong>{ticketCode}</strong> | Biển số: <strong>{licensePlate}</strong></p>
                            </div>
                        ) : (
                            <div className="result-details">
                                <p>{errorMessage}</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TicketValidation;