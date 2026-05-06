/* Duc Huy - Updated with Add Slot Functionality */
import React, { useState, useEffect } from 'react';
import "./css/usermanagement.css"; 

const api_url = process.env.REACT_APP_API_URL;

const SlotManagement = () => {
    const [user, setUser] = useState(null);
    const [slots, setSlots] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    // State cho form thêm ô mới
    const [showAddForm, setShowAddForm] = useState(false);
    const [newSlotName, setNewSlotName] = useState("");
    const [parkingLotId, setParkingLotId] = useState(1);

    const BACKEND_URL = "http://localhost:5000/api/slots";

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        fetchSlots();
    }, []);

    const fetchSlots = async () => {
        try {
            setLoading(true);
            const response = await fetch(BACKEND_URL);
            if (!response.ok) throw new Error("Không thể tải dữ liệu.");
            const data = await response.json();
            setSlots(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // --- CHỨC NĂNG MỚI: THÊM Ô ĐỖ (POST /api/slots) ---
    const handleAddSlot = async (e) => {
        e.preventDefault();
        if (!newSlotName) return alert("Vui lòng nhập tên ô!");

        try {
            const response = await fetch(BACKEND_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: newSlotName,
                    parkinglot: { id: parseInt(parkingLotId) } // Theo cấu trúc [Source 2]
                })
            });

            if (!response.ok) throw new Error("Thêm ô đỗ thất bại.");

            const addedSlot = await response.json();
            
            // Cập nhật state để hiển thị ngay ô mới
            setSlots(prev => [...prev, addedSlot]);
            setMessage(`Đã thêm ô ${addedSlot.name} thành công!`);
            
            // Reset form
            setNewSlotName("");
            setShowAddForm(false);
            setTimeout(() => setMessage(""), 3000);
        } catch (err) {
            alert("Lỗi: " + err.message);
        }
    };

    const handleUpdateStatus = async (id, currentStatus) => {
        const nextStatus = currentStatus === 'AVAILABLE' ? 'OCCUPIED' : 'AVAILABLE';
        try {
            const response = await fetch(`${BACKEND_URL}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: nextStatus })
            });
            if (!response.ok) throw new Error("Cập nhật thất bại.");
            setSlots(prev => prev.map(s => s.id === id ? { ...s, status: nextStatus } : s));
            setMessage(`Đã cập nhật ô đỗ thành ${nextStatus}`);
            setTimeout(() => setMessage(""), 3000);
        } catch (err) {
            alert("Lỗi: " + err.message);
        }
    };

    const handleDeleteSlot = async (id) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa?")) return;
        try {
            const response = await fetch(`${BACKEND_URL}/${id}`, { method: 'DELETE' });
            if (!response.ok) throw new Error("Xóa thất bại.");
            setSlots(prev => prev.filter(s => s.id !== id));
            setMessage("Đã xóa ô đỗ thành công.");
            setTimeout(() => setMessage(""), 3000);
        } catch (err) {
            alert(err.message);
        }
    };
    console.log("Current User:", user);
    const canEdit = user && (user.role === "ADMIN" || user.role === "PARKING_STAFF" || user.role === "USER");

    return (
        <div className="um-page">

            <div className="um-container">
                <div className="um-header">
                    <h2>{canEdit ? "Quản lý ô đỗ xe (CRUD)" : "Trạng thái bãi xe"}</h2>
                    <p>Quyền: {user?.role || "Khách"}</p>
                    
                    {/* Nút hiển thị form thêm ô */}
                    {canEdit && (
                        <button 
                            onClick={() => setShowAddForm(!showAddForm)}
                            style={{ padding: '10px 20px', backgroundColor: '#2196F3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                        >
                            {showAddForm ? "Hủy" : "+ Thêm ô đỗ mới"}
                        </button>
                    )}
                </div>

                {/* Form thêm ô mới */}
                {showAddForm && (
                    <div style={{ backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #ddd' }}>
                        <h3>Thêm ô đỗ mới</h3>
                        <form onSubmit={handleAddSlot} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <input 
                                type="text" 
                                placeholder="Tên ô (VD: B1)" 
                                value={newSlotName}
                                onChange={(e) => setNewSlotName(e.target.value)}
                                style={{ padding: '8px' }}
                            />
                            <input 
                                type="number" 
                                placeholder="ID Bãi xe" 
                                value={parkingLotId}
                                onChange={(e) => setParkingLotId(e.target.value)}
                                style={{ padding: '8px', width: '100px' }}
                            />
                            <button type="submit" style={{ padding: '8px 15px', backgroundColor: '#4caf50', color: 'white', border: 'none', cursor: 'pointer' }}>
                                Xác nhận thêm
                            </button>
                        </form>
                    </div>
                )}

                {error && <div style={{ color: 'red', marginBottom: '15px' }}>⚠️ {error}</div>}
                {message && <div className="parkinglot-message" style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#e8f5e9' }}>{message}</div>}

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '50px' }}>Đang tải...</div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '20px' }}>
                        {slots.map(slot => (
                            <div key={slot.id} className="card" style={{ 
                                textAlign: 'center', 
                                padding: '20px',
                                borderTop: `5px solid ${slot.status === 'AVAILABLE' ? '#4caf50' : '#f44336'}`,
                                boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                            }}>
                                <h3 style={{ margin: '0 0 10px 0' }}>{slot.name}</h3>
                                <span className={`role-badge ${slot.status === 'AVAILABLE' ? 'staff' : 'visitor'}`}>
                                    {slot.status === 'AVAILABLE' ? 'TRỐNG' : 'ĐÃ CHIẾM'}
                                </span>
                                <p style={{ fontSize: '12px', color: '#999' }}>ID bãi: {slot.parkingLotId || slot.parkinglot?.id}</p>
                                
                                {canEdit && (
                                    <div style={{ marginTop: '15px', display: 'flex', gap: '5px', flexDirection: 'column' }}>
                                        <button onClick={() => handleUpdateStatus(slot.id, slot.status)}>Đổi trạng thái</button>
                                        <button onClick={() => handleDeleteSlot(slot.id)} style={{ color: 'red' }}>Xóa ô</button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SlotManagement;  