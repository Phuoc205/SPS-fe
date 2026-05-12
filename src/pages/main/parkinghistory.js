import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import Header from "../../components/header";
import Footer from "../../components/footer";

const ParkingHistory = () => {
    const API_URL = "http://localhost:5000";
    const { user, token } = useAuth();
    
    const [historyData, setHistoryData] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // States cho bộ lọc và tìm kiếm
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [sortOption, setSortOption] = useState("NEWEST"); // Mặc định: Mới nhất

    useEffect(() => {
        const fetchHistory = async () => {
            if (!user?.id) return;
            try {
                const response = await axios.get(`${API_URL}/api/history/user/${user.id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                // Chuẩn hóa dữ liệu trạng thái
                const processed = (response.data || []).map(item => ({
                    ...item,
                    status: (item.checkOutTime || item.check_out_time) ? 'FINISHED' : 'ACTIVE'
                }));
                
                setHistoryData(processed);
            } catch (err) {
                console.error("Lỗi tải lịch sử:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, [user, token]);

    // HÀM TÍNH THỜI LƯỢNG GỬI XE
    const calculateDuration = (checkIn, checkOut) => {
        if (!checkIn) return "--";
        const start = new Date(checkIn);
        // Nếu chưa check-out, lấy giờ hiện tại để tính thời lượng đã đỗ
        const end = checkOut ? new Date(checkOut) : new Date(); 
        
        const diffMs = end - start;
        if (diffMs < 0) return "--";
        
        const diffMins = Math.floor(diffMs / 60000);
        const hours = Math.floor(diffMins / 60);
        const mins = diffMins % 60;
        
        if (hours === 0) return `${mins} phút`;
        return `${hours} giờ ${mins} phút`;
    };

    // HÀM FORMAT THỜI GIAN
    const formatTime = (timeStr) => {
        if (!timeStr) return <span style={{ color: '#d97706', fontWeight: '600' }}>--:--</span>;
        return new Date(timeStr).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    // THỐNG KÊ NHANH
    const totalCount = historyData.length;
    const activeCount = historyData.filter(h => h.status === 'ACTIVE').length;
    const thisMonthCount = historyData.filter(h => {
        const d = new Date(h.checkInTime || h.check_in_time);
        return d.getMonth() === new Date().getMonth() && d.getFullYear() === new Date().getFullYear();
    }).length;

    // XỬ LÝ LỌC VÀ SẮP XẾP DỮ LIỆU
    let displayData = [...historyData];

    // 1. Lọc theo trạng thái và từ khóa
    displayData = displayData.filter(item => {
        const matchStatus = statusFilter === "ALL" || item.status === statusFilter;
        const matchSearch = (item.slotName || item.slot_name || "").toLowerCase().includes(searchTerm.toLowerCase());
        return matchStatus && matchSearch;
    });

    // 2. Sắp xếp theo giờ vào bãi (Check-in)
    displayData.sort((a, b) => {
        const timeInA = new Date(a.checkInTime || a.check_in_time).getTime();
        const timeInB = new Date(b.checkInTime || b.check_in_time).getTime();

        if (sortOption === "NEWEST") return timeInB - timeInA; // Mới nhất lên đầu
        if (sortOption === "OLDEST") return timeInA - timeInB; // Cũ nhất lên đầu
        return timeInB - timeInA;
    });

    return (
        <div style={{ backgroundColor: '#f4f7fb', minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: "'Inter', sans-serif" }}>
            <Header />
            
            <div style={{ flex: 1, padding: '40px 20px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
                <div style={{ marginBottom: '30px' }}>
                    <h2 style={{ fontSize: '32px', fontWeight: '800', color: '#0f172a', margin: '0 0 8px 0' }}>Lịch sử đỗ xe</h2>
                    <p style={{ color: '#64748b', margin: 0 }}>Theo dõi chi tiết các lượt ra vào và thời lượng gửi xe của bạn</p>
                </div>

                {/* THẺ THỐNG KÊ */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '35px' }}>
                    <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '20px', boxShadow: '0 10px 25px rgba(0,0,0,0.03)', borderLeft: '6px solid #2563eb' }}>
                        <div style={{ color: '#64748b', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>Tổng lượt sử dụng</div>
                        <div style={{ fontSize: '36px', fontWeight: '800', color: '#1e293b', marginTop: '10px' }}>{totalCount}</div>
                    </div>
                    <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '20px', boxShadow: '0 10px 25px rgba(0,0,0,0.03)', borderLeft: '6px solid #10b981' }}>
                        <div style={{ color: '#64748b', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>Lượt gửi trong tháng</div>
                        <div style={{ fontSize: '36px', fontWeight: '800', color: '#1e293b', marginTop: '10px' }}>{thisMonthCount}</div>
                    </div>
                    <div style={{ backgroundColor: '#2563eb', padding: '25px', borderRadius: '20px', boxShadow: '0 10px 25px rgba(37,99,235,0.2)' }}>
                        <div style={{ color: '#bfdbfe', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>Xe đang đỗ tại bãi</div>
                        <div style={{ 
                            fontSize: activeCount === 0 ? '28px' : '36px', 
                            fontWeight: '800', color: 'white', marginTop: '10px' 
                        }}>
                            {activeCount === 0 ? 'Trống' : activeCount}
                        </div>
                    </div>
                </div>

                {/* KHU VỰC BẢNG LỊCH SỬ */}
                <div style={{ backgroundColor: 'white', borderRadius: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                    
                    {/* Thanh công cụ: Tìm kiếm và Lọc */}
                    <div style={{ padding: '20px 25px', borderBottom: '1px solid #f1f5f9', display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'center' }}>
                        <input 
                            type="text" 
                            placeholder="🔍 Tìm vị trí (VD: OTO-1)..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ padding: '12px 18px', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none', width: '280px', backgroundColor: '#f8fafc' }}
                        />
                        
                        <div style={{ flex: 1 }}></div> 

                        <select 
                            value={statusFilter} 
                            onChange={(e) => setStatusFilter(e.target.value)}
                            style={{ padding: '12px 18px', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none', backgroundColor: 'white', fontWeight: '600', color: '#475569', cursor: 'pointer' }}
                        >
                            <option value="ALL">Tất cả trạng thái</option>
                            <option value="ACTIVE">Đang đỗ xe</option>
                            <option value="FINISHED">Đã rời bãi</option>
                        </select>

                        <select 
                            value={sortOption} 
                            onChange={(e) => setSortOption(e.target.value)}
                            style={{ padding: '12px 18px', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none', backgroundColor: 'white', fontWeight: '600', color: '#475569', cursor: 'pointer' }}
                        >
                            <option value="NEWEST">Sắp xếp: Mới nhất</option>
                            <option value="OLDEST">Sắp xếp: Cũ nhất</option>
                        </select>
                    </div>

                    {/* Bảng dữ liệu */}
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead style={{ backgroundColor: '#f8fafc' }}>
                                <tr>
                                    <th style={{ padding: '18px 25px', color: '#64748b', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase' }}>Mã GD</th>
                                    <th style={{ padding: '18px 25px', color: '#64748b', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase' }}>Vị trí (Slot)</th>
                                    <th style={{ padding: '18px 25px', color: '#64748b', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase' }}>Giờ Check-in</th>
                                    <th style={{ padding: '18px 25px', color: '#64748b', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase' }}>Giờ Check-out</th>
                                    <th style={{ padding: '18px 25px', color: '#64748b', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase' }}>Thời lượng</th>
                                    <th style={{ padding: '18px 25px', color: '#64748b', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase' }}>Trạng thái</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="6" style={{ padding: '50px', textAlign: 'center', color: '#94a3b8' }}>Đang tải dữ liệu...</td></tr>
                                ) : displayData.length > 0 ? displayData.map(row => (
                                    <tr key={row.id} style={{ borderBottom: '1px solid #f1f5f9', transition: '0.2s' }}>
                                        <td style={{ padding: '20px 25px', fontWeight: '700', color: '#0f172a' }}>#{row.id}</td>
                                        <td style={{ padding: '20px 25px' }}>
                                            <span style={{ backgroundColor: '#eff6ff', color: '#2563eb', padding: '6px 12px', borderRadius: '8px', fontWeight: '700' }}>
                                                {row.slotName || row.slot_name}
                                            </span>
                                        </td>
                                        <td style={{ padding: '20px 25px', color: '#475569' }}>{formatTime(row.checkInTime || row.check_in_time)}</td>
                                        <td style={{ padding: '20px 25px', color: '#475569' }}>{formatTime(row.checkOutTime || row.check_out_time)}</td>
                                        <td style={{ padding: '20px 25px', fontWeight: '600', color: '#334155' }}>
                                            {calculateDuration(row.checkInTime || row.check_in_time, row.checkOutTime || row.check_out_time)}
                                        </td>
                                        <td style={{ padding: '20px 25px' }}>
                                            <span style={{ 
                                                padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '700',
                                                backgroundColor: row.status === 'ACTIVE' ? '#fef3c7' : '#dcfce7',
                                                color: row.status === 'ACTIVE' ? '#b45309' : '#166534'
                                            }}>
                                                {row.status === 'ACTIVE' ? '● ĐANG ĐỖ' : '● HOÀN TẤT'}
                                            </span>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan="6" style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>Không tìm thấy lịch sử phù hợp.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default ParkingHistory;