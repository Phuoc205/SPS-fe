/* Duc Huy - Chức năng: Manual Gate Control (Demo) */

import React, { useState, useEffect } from 'react';
import "../management/css/usermanagement.css"; 

const ManualGateControl = () => {
    const [user, setUser] = useState(null);
    const [gates, setGates] = useState([
        { id: 1, name: "Cổng VÀO (Lý Thường Kiệt)", status: "CLOSED" },
        { id: 2, name: "Cổng RA (Lý Thường Kiệt)", status: "CLOSED" },
        { id: 3, name: "Cổng VÀO (Tạ Quang Bửu)", status: "OPEN" },
    ]);
    const [bigMessage, setBigMessage] = useState({ text: "", type: "" });

    useEffect(() => {
        // Kiểm tra quyền giống các trang khác
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    // Phân quyền: Chỉ Staff hoặc Admin mới được bấm nút điều khiển
    const canControl = user && (user.role === "ADMIN" || user.role === "PARKING_STAFF");

    const handleGateToggle = (id) => {
        setGates(prev => prev.map(gate => {
            if (gate.id === id) {
                const newStatus = gate.status === "OPEN" ? "CLOSED" : "OPEN";
                
                // Hiệu ứng "hiện chữ to đùng" như yêu cầu trong tài liệu 
                setBigMessage({ 
                    text: `HỆ THỐNG ĐÃ ${newStatus === "OPEN" ? "MỞ" : "ĐÓNG"} ${gate.name.toUpperCase()}`, 
                    type: newStatus 
                });

                // Tự động ẩn thông báo to sau 3 giây
                setTimeout(() => setBigMessage({ text: "", type: "" }), 3000);

                return { ...gate, status: newStatus };
            }
            return gate;
        }));
    };

    return (
        <div className="um-page">
            
            <div className="um-container">
                <div className="um-header" style={{ textAlign: 'center' }}>
                    <h2 style={{ fontSize: '2.5rem', color: '#032b5f' }}>
                        {canControl ? "Bảng Điều Khiển Cổng Thủ Công" : "Trạng Thái Cổng Ra Vào"}
                    </h2>
                    <p style={{ color: '#666' }}>Port Frontend: 8080 | Chế độ: {canControl ? "Quản trị viên" : "Công cộng (Chỉ xem)"} </p>
                </div>

                {/* THÔNG BÁO TO ĐÙNG KHI BẤM NÚT  */}
                {bigMessage.text && (
                    <div style={{
                        position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                        backgroundColor: bigMessage.type === "OPEN" ? "#4caf50" : "#f44336",
                        color: 'white', padding: '50px 100px', borderRadius: '20px',
                        fontSize: '3rem', fontWeight: 'bold', textAlign: 'center',
                        boxShadow: '0 0 100px rgba(0,0,0,0.5)', zIndex: 1000,
                        animation: 'zoomIn 0.3s ease'
                    }}>
                        {bigMessage.text}
                    </div>
                )}

                <div className="table-wrapper">
                    <table className="um-table">
                        <thead>
                            <tr>
                                <th>Mã Cổng</th>
                                <th>Vị Trí Cổng</th>
                                <th>Trạng Thái Hiện Tại</th>
                                {canControl && <th>Thao Tác</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {gates.map(gate => (
                                <tr key={gate.id}>
                                    <td>{gate.id}</td>
                                    <td><strong>{gate.name}</strong></td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{
                                                width: '15px', height: '15px', borderRadius: '50%',
                                                backgroundColor: gate.status === "OPEN" ? "#4caf50" : "#f44336",
                                                boxShadow: `0 0 10px ${gate.status === "OPEN" ? "#4caf50" : "#f44336"}`
                                            }}></div>
                                            <span style={{ fontWeight: 'bold', color: gate.status === "OPEN" ? "#2e7d32" : "#c62828" }}>
                                                {gate.status === "OPEN" ? "ĐANG MỞ" : "ĐANG ĐÓNG"}
                                            </span>
                                        </div>
                                    </td>
                                    {canControl && (
                                        <td className="actions">
                                            <button 
                                                className={gate.status === "OPEN" ? "btn-delete" : "btn-save"}
                                                onClick={() => handleGateToggle(gate.id)}
                                                style={{ width: '120px', padding: '10px' }}
                                            >
                                                {gate.status === "OPEN" ? "Đóng Cổng" : "Mở Cổng"}
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div style={{ marginTop: '30px', padding: '20px', background: '#fff3e0', borderLeft: '5px solid #ff9800', borderRadius: '8px' }}>
                    <h4 style={{ margin: '0 0 10px 0', color: '#e65100' }}>⚠️ Hướng dẫn vận hành</h4>
                    <p style={{ margin: 0, fontSize: '0.9rem' }}>
                        {canControl 
                            ? "Đây là bảng điều khiển khẩn cấp. Mọi hành động đóng/mở thủ công sẽ được ghi lại vào hệ thống giám sát của nhân viên trực." 
                            : "Bạn đang xem trạng thái cổng thời gian thực. Nếu cổng không mở khi có thẻ hợp lệ, vui lòng liên hệ nhân viên bãi xe."}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ManualGateControl;