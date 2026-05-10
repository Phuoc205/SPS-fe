/* Khanh Trinh */

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Payment = () => {
    // Port 5000 theo API document
    const API_URL = 'http://localhost:5000';
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || {});
    
    // States lưu dữ liệu
    const [historyData, setHistoryData] = useState([]);
    const [paymentHistory, setPaymentHistory] = useState(JSON.parse(localStorage.getItem('local_payment_history')) || []);
    
    // States xử lý UI
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    
    // States dữ liệu thanh toán
    const [totalDebt, setTotalDebt] = useState(0);
    const [paymentId, setPaymentId] = useState(null);

    useEffect(() => {
        const fetchUnpaidHistory = async () => {
            try {
                const token = localStorage.getItem('userToken');
                const response = await axios.get(`${API_URL}/api/history/user/${user.id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setHistoryData(response.data);
            } catch (err) {
                console.error('Lỗi tải dữ liệu gửi xe:', err);
            } finally {
                setLoading(false);
            }
        };

        if (user.id) fetchUnpaidHistory();
        else setLoading(false);
    }, [user.id]);

    // Lọc ra các phiên đã kết thúc (FINISHED) để chuẩn bị thanh toán
    // Lưu ý: Sẽ lấy hết FINISHED, cần BE xử lý không tính tiền các session đã thanh toán
    const unpaidSessions = historyData.filter(item => item.status === 'FINISHED');

    // 1. GỌI API KHỞI TẠO THANH TOÁN (Lấy mã thanh toán và tính tổng nợ)
    const calculateDebt = async () => {
        if (unpaidSessions.length === 0) return;
        setProcessing(true);
        try {
            const token = localStorage.getItem('userToken');
            // Lấy danh sách ID để gửi lên server
            const sessionIds = unpaidSessions.map(item => item.sessionId);

            // API: POST /api/payments
            // Input: { "sessionIds": [1, 2, 3] }
            const response = await axios.post(`${API_URL}/api/payments`, 
                { sessionIds: sessionIds }, 
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Output nhận được: { id: 4, amount: 50000, status: "PENDING", sessionIds: [...] }
            setTotalDebt(response.data.amount);
            setPaymentId(response.data.id); 
        } catch (err) {
            console.error('Lỗi khi tính tổng nợ:', err);
            alert('Lỗi hệ thống: Không thể kết nối với cổng thanh toán.');
        } finally {
            setProcessing(false);
        }
    };

    // 2. HIỂN THỊ MODAL XÁC NHẬN
    const handlePayment = () => {
        if (!paymentId) return;
        setShowConfirmModal(true);
    };

    // 3. THỰC THI THANH TOÁN SAU KHI XÁC NHẬN
    const confirmPayment = async () => {
        setShowConfirmModal(false);
        setProcessing(true);
        try {
            const token = localStorage.getItem('userToken');

            // API: POST /api/payments/{id}/pay
            // Input: None
            const response = await axios.post(`${API_URL}/api/payments/${paymentId}/pay`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Output nhận được: { id: 1, amount: 20000, status: "PAID", message: "Payment success" }
            if (response.data.status === 'PAID') {
                alert(`Thanh toán thành công số tiền ${response.data.amount} VND!`);
                
                // Lưu vào local history để UI có chỗ hiển thị "Lịch sử thanh toán" (Bù đắp việc thiếu API)
                const newRecord = {
                    id: response.data.id,
                    amount: response.data.amount,
                    date: new Date().toISOString()
                };
                const updatedHistory = [newRecord, ...paymentHistory];
                setPaymentHistory(updatedHistory);
                localStorage.setItem('local_payment_history', JSON.stringify(updatedHistory));

                // Reset trạng thái
                setTotalDebt(0);
                setPaymentId(null);
                window.location.reload(); 
            }
        } catch (err) {
            console.error('Lỗi khi thanh toán:', err);
            alert('Thanh toán thất bại, vui lòng thử lại.');
        } finally {
            setProcessing(false);
        }
    };

    const cancelPayment = () => {
        setShowConfirmModal(false);
    };

    if (loading) return <div><div style={{ padding: '20px' }}>Đang tải...</div></div>;

    return (
        <div style={{ backgroundColor: '#f4f7f6', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            
            <div style={{ padding: '40px 20px', flex: 1, maxWidth: '900px', margin: '0 auto', width: '100%' }}>
                <h2 style={{ color: '#2c3e50', borderBottom: '2px solid #3498db', paddingBottom: '10px' }}>
                    Thanh toán phí đỗ xe
                </h2>

                {/* KHU VỰC THAO TÁC */}
                <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', marginBottom: '30px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h3 style={{ margin: 0, color: '#34495e' }}>Phiên chưa thanh toán: <span style={{ color: '#e74c3c' }}>{unpaidSessions.length}</span> lượt</h3>
                        <button 
                            onClick={calculateDebt} 
                            disabled={unpaidSessions.length === 0 || processing || paymentId !== null}
                            style={{ padding: '10px 20px', backgroundColor: (unpaidSessions.length === 0 || paymentId) ? '#bdc3c7' : '#2ecc71', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
                        >
                            {processing && !paymentId ? 'Đang tính toán...' : 'Lập hóa đơn thanh toán'}
                        </button>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', backgroundColor: '#ecf0f1', borderRadius: '5px' }}>
                        <h3 style={{ margin: 0 }}>Tổng nợ hiển thị: <span style={{ color: '#2980b9', fontSize: '24px' }}>{totalDebt.toLocaleString('vi-VN')} VNĐ</span></h3>
                        <button 
                            onClick={handlePayment} 
                            disabled={!paymentId || processing}
                            style={{ padding: '12px 30px', backgroundColor: !paymentId ? '#bdc3c7' : '#3498db', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}
                        >
                            {processing && paymentId ? 'Đang xử lý...' : 'Xác nhận thanh toán'}
                        </button>
                    </div>
                </div>

                {/* KHU VỰC LỊCH SỬ THANH TOÁN (LOCAL) */}
                <h3 style={{ color: '#2c3e50' }}>Lịch sử giao dịch (Local)</h3>
                <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ backgroundColor: '#34495e', color: 'white' }}>
                            <tr>
                                <th style={{ padding: '15px' }}>Mã GD (ID)</th>
                                <th style={{ padding: '15px' }}>Số tiền</th>
                                <th style={{ padding: '15px' }}>Thời gian thanh toán</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paymentHistory.length > 0 ? paymentHistory.map((payment, index) => (
                                <tr key={index} style={{ borderBottom: '1px solid #ecf0f1' }}>
                                    <td style={{ padding: '15px' }}><strong>#{payment.id}</strong></td>
                                    <td style={{ padding: '15px', color: '#27ae60', fontWeight: 'bold' }}>{payment.amount?.toLocaleString('vi-VN')} VNĐ</td>
                                    <td style={{ padding: '15px' }}>{new Date(payment.date).toLocaleString('vi-VN')}</td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="3" style={{ padding: '20px', textAlign: 'center', color: '#7f8c8d' }}>
                                        Chưa có giao dịch thanh toán nào được ghi nhận.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL XÁC NHẬN THANH TOÁN */}
            {showConfirmModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '10px', boxShadow: '0 5px 20px rgba(0,0,0,0.3)', maxWidth: '400px', textAlign: 'center' }}>
                        <h3 style={{ color: '#2c3e50', marginTop: 0 }}>Xác nhận thanh toán</h3>
                        <p style={{ fontSize: '16px', color: '#34495e' }}>Bạn có chắc chắn muốn thanh toán số tiền:</p>
                        <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#e74c3c', margin: '20px 0' }}>
                            {totalDebt.toLocaleString('vi-VN')} VNĐ
                        </p>
                        <p style={{ fontSize: '14px', color: '#7f8c8d', marginBottom: '20px' }}>
                            Mã giao dịch: <strong>#{paymentId}</strong>
                        </p>
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                            <button 
                                onClick={cancelPayment}
                                style={{ padding: '12px 25px', backgroundColor: '#95a5a6', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}
                            >
                                Huỷ
                            </button>
                            <button 
                                onClick={confirmPayment}
                                disabled={processing}
                                style={{ padding: '12px 25px', backgroundColor: processing ? '#bdc3c7' : '#27ae60', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}
                            >
                                {processing ? 'Đang xử lý...' : 'Xác nhận'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Payment;