import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from '../components/header';
import Footer from '../components/footer';

// Hàm xử lý chống lỗi Invalid Date của Spring Boot
const formatTime = (timeData) => {
    if (!timeData) return 'Đang cập nhật...';
    // Nếu Spring Boot trả về mảng [2026, 5, 12, 14, 15, 2]
    if (Array.isArray(timeData)) {
        const [y, m, d, h, min, s] = timeData;
        return new Date(y, m - 1, d, h || 0, min || 0, s || 0).toLocaleString('vi-VN');
    }
    // Nếu trả về chuỗi ISO string bình thường
    return new Date(timeData).toLocaleString('vi-VN');
};

const Payment = () => {
    const API_URL = 'http://localhost:5000';
    const [user] = useState(JSON.parse(localStorage.getItem('user')) || {});
    const [token] = useState(localStorage.getItem('userToken'));
    
    const [invoices, setInvoices] = useState([]);
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [totalDebt, setTotalDebt] = useState(0);
    const [showBKPay, setShowBKPay] = useState(false);
    const [payStep, setPayStep] = useState(1); 

    // State cho việc Sắp xếp (Sort)
    const [sortOption, setSortOption] = useState('TIME_DESC');

    const fetchData = async () => {
        if (!user?.id) return;
        try {
            const headers = { Authorization: `Bearer ${token}` };
            const [invRes, payRes] = await Promise.all([
                axios.get(`${API_URL}/api/invoices/user/${user.id}`, { headers }).catch(() => ({ data: [] })),
                axios.get(`${API_URL}/api/billing/user/history?userId=${user.id}`, { headers }).catch(() => ({ data: [] }))
            ]);
            
            const pendingInvs = (invRes.data || []).filter(inv => inv.status === 'GENERATED' || inv.status === 'UNPAID');
            setInvoices(pendingInvs);
            
            // Tính tổng nợ
            const debt = pendingInvs.reduce((acc, curr) => acc + (curr.totalAmount || curr.total_amount || 0), 0);
            setTotalDebt(debt);

            // Lưu danh sách gốc
            setPayments(payRes.data || []);
            
        } catch (err) {
            console.error("Lỗi:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user.id, token]);

    const handleStartPay = () => {
        if(totalDebt <= 0) return;
        setPayStep(1);
        setShowBKPay(true);
    };

    const handleConfirmPay = async () => {
        setPayStep(2); 
        try {
            await axios.post(`${API_URL}/api/billing/user/pay-all?userId=${user.id}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPayStep(3); 
            setTimeout(() => {
                setShowBKPay(false);
                fetchData(); 
            }, 2000);
        } catch (err) {
            console.error("Lỗi thanh toán:", err);
            alert("Có lỗi xảy ra trong quá trình thanh toán, vui lòng thử lại!");
            setPayStep(1);
        }
    };

    // XỬ LÝ SẮP XẾP LỊCH SỬ GIAO DỊCH
    const sortedPayments = [...payments].sort((a, b) => {
        const timeA = new Date(a.createdAt || a.created_at).getTime() || 0;
        const timeB = new Date(b.createdAt || b.created_at).getTime() || 0;
        const priceA = a.amount || a.total_amount || 0;
        const priceB = b.amount || b.total_amount || 0;

        switch (sortOption) {
            case 'TIME_DESC': return timeB - timeA; // Mới nhất
            case 'TIME_ASC': return timeA - timeB;  // Cũ nhất
            case 'PRICE_DESC': return priceB - priceA; // Giá lớn nhất
            case 'PRICE_ASC': return priceA - priceB;  // Giá nhỏ nhất
            default: return timeB - timeA;
        }
    });

    return (
        <div style={{ backgroundColor: '#f9fafb', minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: "'Inter', sans-serif" }}>
            <Header />

            <div style={{ flex: 1, padding: '40px 20px', maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
                <div style={{ marginBottom: '40px' }}>
                    <h2 style={{ fontSize: '32px', fontWeight: '800', color: '#111827', margin: '0 0 10px 0' }}>Thanh toán dịch vụ</h2>
                    <p style={{ color: '#6b7280', fontSize: '16px', margin: 0 }}>Quản lý hóa đơn đỗ xe định kỳ tích hợp cổng BKPay</p>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '100px', color: '#6b7280' }}>Đang đồng bộ dữ liệu tài chính...</div>
                ) : (
                    <>
                        <div style={{ backgroundColor: 'white', borderRadius: '24px', padding: '30px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)', marginBottom: '40px', border: totalDebt > 0 ? '1px solid #fecaca' : '1px solid #d1fae5' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                                <h3 style={{ margin: 0, color: totalDebt > 0 ? '#dc2626' : '#059669', fontSize: '20px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span style={{ fontSize: '24px' }}>{totalDebt > 0 ? '🔔' : '🎉'}</span> TỔNG DƯ NỢ HIỆN TẠI
                                </h3>
                            </div>

                            {totalDebt > 0 ? (
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '25px 30px', backgroundColor: '#fef2f2', borderRadius: '16px', border: '1px dashed #fca5a5' }}>
                                    <div>
                                        <div style={{ color: '#991b1b', fontSize: '12px', fontWeight: '800', letterSpacing: '1px', marginBottom: '5px' }}>ĐÃ BAO GỒM {invoices.length} LƯỢT CHƯA THANH TOÁN</div>
                                        <h2 style={{ margin: '0 0 5px 0', color: '#7f1d1d', fontSize: '45px', fontWeight: '900' }}>{totalDebt.toLocaleString()}đ</h2>
                                        <p style={{ margin: 0, color: '#991b1b', fontSize: '14px' }}>Số tiền được cập nhật tự động tính đến hôm nay.</p>
                                    </div>
                                    <button 
                                        onClick={handleStartPay}
                                        style={{ backgroundColor: '#2563eb', color: 'white', padding: '16px 35px', borderRadius: '12px', border: 'none', fontWeight: '800', cursor: 'pointer', fontSize: '15px', boxShadow: '0 10px 20px rgba(37,99,235,0.25)', transition: 'background 0.2s' }}
                                    >
                                        THANH TOÁN TOÀN BỘ (BKPAY)
                                    </button>
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '30px', backgroundColor: '#f0fdf4', color: '#059669', borderRadius: '16px', fontWeight: '700', fontSize: '16px' }}>
                                    Tuyệt vời! Bạn không có khoản nợ nào cần thanh toán.
                                </div>
                            )}
                        </div>

                        <div style={{ backgroundColor: 'white', borderRadius: '24px', padding: '30px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', border: '1px solid #e5e7eb' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '15px' }}>
                                <h3 style={{ margin: 0, color: '#111827', fontSize: '20px' }}>Lịch sử giao dịch</h3>
                                
                                {/* BỘ LỌC SẮP XẾP */}
                                <div>
                                    <select 
                                        value={sortOption} 
                                        onChange={(e) => setSortOption(e.target.value)}
                                        style={{ padding: '10px 15px', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none', backgroundColor: '#f8fafc', fontWeight: '600', color: '#475569', cursor: 'pointer' }}
                                    >
                                        <option value="TIME_DESC">Sắp xếp: Mới nhất</option>
                                        <option value="TIME_ASC">Sắp xếp: Cũ nhất</option>
                                        <option value="PRICE_DESC">Sắp xếp: Số tiền cao nhất</option>
                                        <option value="PRICE_ASC">Sắp xếp: Số tiền thấp nhất</option>
                                    </select>
                                </div>
                            </div>

                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                    <thead style={{ backgroundColor: '#f8fafc' }}>
                                        <tr>
                                            <th style={{ padding: '18px 25px', color: '#6b7280', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase' }}>Mã GD</th>
                                            <th style={{ padding: '18px 25px', color: '#6b7280', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase' }}>Thời gian</th>
                                            <th style={{ padding: '18px 25px', color: '#6b7280', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase' }}>Số tiền</th>
                                            <th style={{ padding: '18px 25px', color: '#6b7280', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase' }}>Cổng TT</th>
                                            <th style={{ padding: '18px 25px', color: '#6b7280', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase' }}>Trạng thái</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sortedPayments.length > 0 ? sortedPayments.map(p => (
                                            <tr key={p.paymentId} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                                <td style={{ padding: '20px 25px', fontWeight: '800', color: '#111827' }}>#{p.paymentId}</td>
                                                <td style={{ padding: '20px 25px', color: '#4b5563' }}>{formatTime(p.createdAt || p.created_at)}</td>
                                                <td style={{ padding: '20px 25px', fontWeight: '900', color: '#059669', fontSize: '16px' }}>+{(p.amount || p.total_amount)?.toLocaleString()}đ</td>
                                                <td style={{ padding: '20px 25px' }}><span style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '800' }}>{p.provider || 'BKPAY'}</span></td>
                                                <td style={{ padding: '20px 25px' }}>
                                                    <span style={{ backgroundColor: '#d1fae5', color: '#059669', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '800' }}>● Đã thanh toán</span>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr><td colSpan="5" style={{ padding: '50px', textAlign: 'center', color: '#9ca3af' }}>Bạn chưa có dữ liệu giao dịch nào.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}
            </div>

            <Footer />

            {showBKPay && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(17, 24, 39, 0.75)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(5px)' }}>
                    <div style={{ backgroundColor: 'white', width: '420px', borderRadius: '32px', padding: '40px', textAlign: 'center', boxShadow: '0 25px 50px rgba(0,0,0,0.3)', position: 'relative', overflow: 'hidden' }}>
                        
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '6px', background: 'linear-gradient(90deg, #2563eb, #3b82f6)' }}></div>

                        {payStep === 1 && (
                            <div style={{ animation: 'fadeIn 0.3s ease' }}>
                                <div style={{ width: '70px', height: '70px', backgroundColor: '#eff6ff', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '32px', margin: '0 auto 20px' }}>💳</div>
                                <h2 style={{ color: '#1e3a8a', margin: '0 0 10px 0', fontSize: '26px', fontWeight: '800' }}>Cổng BKPay</h2>
                                <p style={{ color: '#6b7280', margin: '0 0 25px 0' }}>Xác nhận thanh toán gộp toàn bộ nợ phí đỗ xe.</p>
                                
                                <div style={{ backgroundColor: '#f8fafc', padding: '25px', borderRadius: '20px', border: '1px solid #e2e8f0', marginBottom: '30px' }}>
                                    <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>Tổng thanh toán</span>
                                    <h1 style={{ margin: '5px 0 0 0', color: '#dc2626', fontSize: '42px', fontWeight: '900' }}>{totalDebt.toLocaleString()}đ</h1>
                                </div>

                                <div style={{ display: 'flex', gap: '15px' }}>
                                    <button onClick={() => setShowBKPay(false)} style={{ flex: 1, padding: '16px', borderRadius: '14px', border: 'none', background: '#f1f5f9', color: '#475569', fontWeight: '700', cursor: 'pointer' }}>HỦY BỎ</button>
                                    <button onClick={handleConfirmPay} style={{ flex: 2, padding: '16px', borderRadius: '14px', border: 'none', background: '#2563eb', color: 'white', fontWeight: '800', cursor: 'pointer', boxShadow: '0 8px 15px rgba(37,99,235,0.25)' }}>XÁC NHẬN TRẢ</button>
                                </div>
                            </div>
                        )}

                        {payStep === 2 && (
                            <div style={{ padding: '40px 0', animation: 'fadeIn 0.3s ease' }}>
                                <div style={{ width: '60px', height: '60px', border: '6px solid #f1f5f9', borderTop: '6px solid #2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 25px' }}></div>
                                <h3 style={{ color: '#111827', fontSize: '22px', margin: '0 0 10px 0' }}>Đang kết nối BKPay...</h3>
                                <p style={{ color: '#6b7280', margin: 0 }}>Vui lòng giữ nguyên màn hình</p>
                            </div>
                        )}

                        {payStep === 3 && (
                            <div style={{ padding: '30px 0', animation: 'fadeIn 0.4s ease' }}>
                                <div style={{ width: '90px', height: '90px', backgroundColor: '#d1fae5', color: '#059669', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '45px', margin: '0 auto 25px', boxShadow: '0 0 0 10px #ecfdf5' }}>✔</div>
                                <h2 style={{ color: '#059669', fontSize: '28px', margin: '0 0 10px 0', fontWeight: '800' }}>Thanh toán thành công!</h2>
                                <p style={{ color: '#6b7280', margin: 0 }}>Hệ thống đã ghi nhận. Cảm ơn bạn!</p>
                            </div>
                        )}

                        <style>{`
                            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                            @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                        `}</style>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Payment;