/* Khanh Trinh */

import React, { useState } from 'react'
import ReactDOM from 'react-dom/client'
import Header from "../../components/header"
import Footer from "../../components/footer"
import './css/parkinghistory.css';

const api_url = process.env.REACT_APP_API_URL;
const ParkingHistory = () => {
    // Code here
    // Phân quyền: Đổi thành 'FACULTY' để xem góc nhìn Giảng viên
    const [userRole, setUserRole] = useState('STUDENT'); 

    // Dữ liệu mock
    const [historyData, setHistoryData] = useState([
        { id: 'P-10305', plate: '59-S1 123.45', timeIn: '26/03/2026 07:15', timeOut: '26/03/2026 18:30', location: 'Khu A - Cổng Lý Thường Kiệt', fee: 4000, status: 'UNPAID' },
        { id: 'P-10293', plate: '59-S1 123.45', timeIn: '26/03/2026 09:30', timeOut: '26/03/2026 11:30', location: 'Khu A - Cổng Tô Hiến Thành', fee: 4000, status: 'UNPAID' },
        { id: 'P-10280', plate: '59-S1 123.45', timeIn: '25/03/2026 08:00', timeOut: '25/03/2026 17:00', location: 'Khu B - Cổng Lý Thường Kiệt', fee: 4000, status: 'UNPAID' },
        { id: 'P-10211', plate: '59-S1 123.45', timeIn: '20/03/2026 09:15', timeOut: '20/03/2026 12:00', location: 'Khu A - Cổng Ký Túc Xá', fee: 4000, status: 'PAID' },
        { id: 'P-09150', plate: '59-S1 123.45', timeIn: '15/02/2026 13:00', timeOut: '15/02/2026 16:45', location: 'Khu B - Cổng Tô Hiến Thành', fee: 4000, status: 'PAID' }, 
    ]);

    // Các state cho Bộ lọc
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // State cho Modal Cổng thanh toán BKPay
    const [bkPayModal, setBkPayModal] = useState({
        isOpen: false,
        paymentId: null, 
        amount: 0,
        isProcessing: false 
    });

    // --- CÁC HÀM HỖ TRỢ VÀ TÍNH TOÁN ---

    const parseDate = (dateStr) => {
        if (!dateStr || dateStr.includes('Đang')) return null;
        const [datePart, timePart] = dateStr.split(' ');
        const [day, month, year] = datePart.split('/');
        const [hour, minute] = timePart.split(':');
        return new Date(year, month - 1, day, hour, minute);
    };

    // 1. Tính tổng nợ
    const totalDebt = historyData
        .filter(item => item.status === 'UNPAID')
        .reduce((sum, item) => sum + item.fee, 0);

    // 2. Tính số lượt gửi trong tháng 3 (tháng 3 có index là 2 trong Date)
    const targetMonth = 2; // Tháng 3
    const monthlyCount = historyData.filter(item => {
        const itemDate = parseDate(item.timeIn);
        return itemDate && itemDate.getMonth() === targetMonth;
    }).length;

    // 3. Xử lý Lọc Dữ Liệu
    const filteredData = historyData.filter(item => {
        const itemDate = parseDate(item.timeIn);
        
        if (statusFilter !== 'ALL' && item.status !== statusFilter) return false;
        
        if (startDate && itemDate) {
            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0); 
            if (itemDate < start) return false;
        }

        if (endDate && itemDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999); 
            if (itemDate > end) return false;
        }

        return true;
    });

    // --- LOGIC THANH TOÁN ---

    const openBKPay = (id = null, amount) => {
        setBkPayModal({ isOpen: true, paymentId: id, amount: amount, isProcessing: false });
    };

    const cancelPayment = () => {
        setBkPayModal({ ...bkPayModal, isOpen: false });
    };

    const confirmPayment = () => {
        setBkPayModal({ ...bkPayModal, isProcessing: true }); 
        setTimeout(() => {
            setHistoryData(prevData => prevData.map(item => {
                if (bkPayModal.paymentId === null || item.id === bkPayModal.paymentId) {
                    return { ...item, status: 'PAID' }; 
                }
                return item;
            }));
            setBkPayModal({ isOpen: false, paymentId: null, amount: 0, isProcessing: false });
            alert("✅ Thanh toán thành công qua BKPay!");
        }, 1500);
    };

    return (
        <div className="parking-container">
            <Header/>
            
            <div className="parking-content">
                <h2 className="parking-title">
                    Lịch sử gửi xe & Thanh toán
                </h2>

                {/* KHU VỰC THỐNG KÊ DASHBOARD */}
                <div className="dashboard-stats">
                    <div className="stat-card">
                        <h4 className="stat-card-title">Tổng nợ cần thanh toán</h4>
                        <p className="stat-value-debt">
                            {userRole === 'FACULTY' ? '0 VNĐ' : `${totalDebt.toLocaleString()} VNĐ`}
                        </p>
                    </div>

                    <div className="stat-card">
                        <h4 className="stat-card-title">Số lượt gửi trong tháng 3</h4>
                        <p className="stat-value-count">
                            {monthlyCount} lượt
                        </p>
                    </div>

                    <div className="pay-all-wrapper">
                        <button 
                            className="pay-all-btn"
                            disabled={totalDebt === 0 || userRole === 'FACULTY'}
                            onClick={() => openBKPay(null, totalDebt)}
                        >
                            Thanh toán tất cả ({userRole === 'FACULTY' ? '0đ' : `${totalDebt.toLocaleString()}đ`})
                        </button>
                    </div>
                </div>

                {/* BỘ LỌC DỮ LIỆU */}
                <div className="filter-container">
                    <div className="filter-group">
                        <label className="filter-label">Từ ngày:</label>
                        <input type="date" className="filter-input" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                    </div>
                    
                    <div className="filter-group">
                        <label className="filter-label">Đến ngày:</label>
                        <input type="date" className="filter-input" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                    </div>

                    <div className="filter-group">
                        <label className="filter-label">Trạng thái:</label>
                        <select className="filter-input" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                            <option value="ALL">Tất cả trạng thái</option>
                            <option value="UNPAID">Chờ thanh toán</option>
                            <option value="PAID">Đã thanh toán</option>
                        </select>
                    </div>
                    
                    {/* Nút Xóa bộ lọc */}
                    {(startDate || endDate || statusFilter !== 'ALL') && (
                        <button 
                            className="clear-filter-btn"
                            onClick={() => { setStartDate(''); setEndDate(''); setStatusFilter('ALL'); }}
                        >
                            Bỏ lọc
                        </button>
                    )}
                </div>

                {/* BẢNG DỮ LIỆU */}
                <div className="table-wrapper">
                    <table className="parking-table">
                        <thead>
                            <tr>
                                <th>Mã phiên</th>
                                <th>Biển số</th>
                                <th>Thời gian vào</th>
                                <th>Thời gian ra</th>
                                <th>Thành tiền</th>
                                <th>Trạng thái</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.length > 0 ? filteredData.map((row, index) => (
                                <tr key={row.id} className={index % 2 === 0 ? "row-even" : "row-odd"}>
                                    <td><strong>{row.id}</strong></td>
                                    <td>{row.plate}</td>
                                    <td>{row.timeIn}</td>
                                    <td>{row.timeOut}</td>
                                    
                                    <td>
                                        {userRole === 'FACULTY' ? '0 đ' : `${row.fee.toLocaleString()} đ`}
                                    </td>
                                    
                                    <td>
                                        {userRole === 'FACULTY' ? (
                                            <span className="badge-free">Miễn phí</span>
                                        ) : row.status === 'UNPAID' ? (
                                            <span className="badge-unpaid">Chờ thanh toán</span>
                                        ) : (
                                            <span className="badge-paid">Đã thanh toán</span>
                                        )}
                                    </td>
                                    
                                    <td>
                                        {row.status === 'UNPAID' && userRole !== 'FACULTY' ? (
                                            <button className="action-btn" onClick={() => openBKPay(row.id, row.fee)}>
                                                Thanh toán
                                            </button>
                                        ) : (
                                            <span className="no-action-text">Không yêu cầu</span>
                                        )}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="7" className="empty-row">
                                        Không tìm thấy lịch sử gửi xe trong khoảng thời gian này.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MÔ PHỎNG CỔNG THANH TOÁN BKPAY */}
            {bkPayModal.isOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3 className="modal-title">
                            Cổng thanh toán BKPay
                        </h3>
                        
                        {bkPayModal.isProcessing ? (
                            <div className="modal-body-processing">
                                <div className="loading-spinner"></div>
                                <p className="processing-text">Đang xử lý giao dịch...</p>
                            </div>
                        ) : (
                            <div className="modal-body-info">
                                <p><strong>Mã giao dịch:</strong> {bkPayModal.paymentId || 'Thanh toán gộp (Tất cả nợ)'}</p>
                                <p><strong>Tổng tiền:</strong> <span className="amount-highlight">{bkPayModal.amount.toLocaleString()} VNĐ</span></p>
                                <p className="modal-note">
                                    Vui lòng kiểm tra lại thông tin trước khi xác nhận.
                                </p>
                                
                                <div className="modal-actions">
                                    <button className="cancel-btn" onClick={cancelPayment}>
                                        Huỷ giao dịch
                                    </button>
                                    <button className="confirm-btn" onClick={confirmPayment}>
                                        Xác nhận thanh toán
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <Footer/>
        </div>
    )
};

export default ParkingHistory