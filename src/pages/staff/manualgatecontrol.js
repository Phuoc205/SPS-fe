import React, { useEffect, useState } from "react";
import axios from "axios";
import "./css/manualgatecontrol.css";
import { useAuth } from "../../context/AuthContext";

const API = "http://localhost:5000/api/gates";

const ManualGateControl = () => {
    const { user, token } = useAuth();
    const [gates, setGates] = useState([]);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedGate, setSelectedGate] = useState(null);
    const [reason, setReason] = useState("");

    const canControl = user?.role === "ADMIN" || user?.role === "STAFF";

    useEffect(() => {
        fetchGates();
        fetchLogs();
    }, []);

    const authHeader = {
        headers: { Authorization: `Bearer ${token}` },
    };

    const fetchGates = async () => {
        try {
            const res = await axios.get(API, authHeader);
            setGates(res.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const fetchLogs = async () => {
        try {
            const res = await axios.get(`${API}/logs`, authHeader);
            setLogs(res.data);
        } catch (e) {
            console.error(e);
        }
    };

    const handleAction = async (gate, action) => {
        if (!canControl) return;

        if (!reason.trim()) {
            alert("Vui lòng nhập lý do thao tác!");
            return;
        }

        try {
            await axios.post(
                `${API}/${gate.id}/${action.toLowerCase()}`,
                {
                    reason: reason // Body bây giờ chỉ gửi mỗi reason (khớp với DTO của bạn)
                },
                {
                    headers: { 
                        Authorization: `Bearer ${token}`,
                        staffId: user.id // Đẩy staffId lên Header ở đây
                    }
                }
            );

            await fetchGates();
            await fetchLogs();
            setReason("");
            setSelectedGate(null);
        } catch (e) {
            console.error(e);
            alert("Thao tác thất bại!");
        }
    };

    const getStatusClass = (status) => {
        if (!status) return "unknown";
        if (typeof status === "object") status = status.value;
        return String(status).toLowerCase();
    };

    const formatTime = (timeStr) => {
        if (!timeStr) return "";
        const date = new Date(timeStr);
        return date.toLocaleString('vi-VN', { 
            hour: '2-digit', minute: '2-digit', second: '2-digit', 
            day: '2-digit', month: '2-digit', year: 'numeric' 
        });
    };

    if (loading) return (
        <div className="gate-loading">
            <div className="spinner"></div>
            <p>Đang tải dữ liệu cổng...</p>
        </div>
    );

    return (
        <div className="gate-page-wrapper">
            <div className="gate-page-container">
                
                {/* HEADER */}
                <header className="mgc-header">
                    <div>
                        <h2 className="mgc-title">
                            <svg className="mgc-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                            Điều Khiển Cổng Thủ Công
                        </h2>
                        <p className="mgc-subtitle">Quản lý và giám sát trạng thái ra/vào theo thời gian thực</p>
                    </div>
                </header>

                {/* GATE GRID */}
                <div className="gate-grid">
                    {gates.map((g) => {
                        const statusStr = getStatusClass(g.status);
                        return (
                            <div key={g.id} className={`gate-card status-${statusStr}`}>
                                <div className="gate-card-header">
                                    <div className="gate-icon-wrapper">
                                        <svg fill="currentColor" viewBox="0 0 24 24"><path d="M19 19V4h-4V3H9v1H5v15H3v2h18v-2h-2zm-6 0H9V5h4v14z"/></svg>
                                    </div>
                                    <h3>{g.name}</h3>
                                </div>

                                <div className="gate-card-body">
                                    <span className={`status-badge badge-${statusStr}`}>
                                        {statusStr === "open" ? (
                                            <><span className="dot dot-green"></span> ĐANG MỞ</>
                                        ) : (
                                            <><span className="dot dot-red"></span> ĐANG ĐÓNG</>
                                        )}
                                    </span>
                                </div>

                                {canControl && (
                                    <div className="gate-card-footer">
                                        <button className="btn-primary" onClick={() => setSelectedGate(g)}>
                                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                            Điều khiển
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* CONTROL MODAL */}
                {selectedGate && (
                    <div className="gate-modal-overlay fade-in">
                        <div className="gate-modal-box slide-up">
                            <div className="modal-header">
                                <h3>Điều khiển: <span className="highlight">{selectedGate.name}</span></h3>
                                <button className="btn-close-icon" onClick={() => setSelectedGate(null)}>✕</button>
                            </div>
                            
                            <div className="modal-body">
                                <label>Lý do can thiệp (Bắt buộc):</label>
                                <textarea
                                    placeholder="Ví dụ: Lỗi hệ thống quẹt thẻ, xe ưu tiên..."
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                />
                            </div>

                            <div className="modal-actions">
                                <div className="action-buttons">
                                    <button className="btn-action btn-open" onClick={() => handleAction(selectedGate, "OPEN")}>
                                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18"/></svg>
                                        MỞ CỔNG
                                    </button>
                                    <button className="btn-action btn-close" onClick={() => handleAction(selectedGate, "CLOSE")}>
                                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"/></svg>
                                        ĐÓNG CỔNG
                                    </button>
                                </div>
                                <button className="btn-cancel" onClick={() => setSelectedGate(null)}>Hủy bỏ</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* LOGS TABLE */}
                <div className="log-section">
                    <div className="log-header">
                        <h3><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg> Lịch sử thao tác</h3>
                    </div>
                    <div className="table-responsive">
                        <table className="log-table">
                            <thead>
                                <tr>
                                    <th>Cổng</th>
                                    <th>Hành động</th>
                                    <th>Lý do</th>
                                    <th>Nhân viên</th>
                                    <th>Thời gian</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.length === 0 ? (
                                    <tr><td colSpan="5" className="text-center empty-log">Chưa có lịch sử thao tác nào.</td></tr>
                                ) : (
                                    logs.map((l) => (
                                        <tr key={l.id}>
                                            <td className="font-medium">{l.gateId}</td>
                                            <td>
                                                <span className={`log-badge ${l.action.toLowerCase() === 'open' ? 'badge-open' : 'badge-closed'}`}>
                                                    {l.action}
                                                </span>
                                            </td>
                                            <td className="reason-text">{l.reason}</td>
                                            <td>{l.staffId}</td>
                                            <td className="time-text">{formatTime(l.timestamp)}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ManualGateControl;