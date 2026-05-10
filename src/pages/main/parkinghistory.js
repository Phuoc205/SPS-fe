import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import "./css/parkinghistory.css";

const ParkingHistory = () => {
    const API_URL = "http://localhost:5000";

    const { user, token } = useAuth();

    const [historyData, setHistoryData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [statusFilter, setStatusFilter] = useState("ALL");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    useEffect(() => {

        const fetchHistory = async () => {

            try {

                const response = await axios.get(
                    `${API_URL}/api/history/user/${user.id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                setHistoryData(response.data);

            } catch (err) {

                console.error(err);

                setError(
                    "Không thể tải lịch sử gửi xe từ máy chủ."
                );

            } finally {

                setLoading(false);
            }
        };

        if (user?.id) {

            fetchHistory();

        } else {

            setLoading(false);

            setError(
                "Không tìm thấy User ID. Vui lòng đăng nhập lại."
            );
        }

    }, [user, token]);

    // Format thời gian hiển thị
    const formatDateTime = (dateString) => {
        if (!dateString) return 'Đang đỗ';
        return new Date(dateString).toLocaleString('vi-VN');
    };

    // Xử lý bộ lọc
    const filteredData = historyData.filter(item => {
        const itemDate = item.entryTime ? new Date(item.entryTime) : null;
        
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

    if (loading) return <div className="parking-container"><div className="parking-content"><p>Đang tải dữ liệu...</p></div></div>;
    if (error) return <div className="parking-container"><div className="parking-content"><p>{error}</p></div></div>;

    return (
        <div className="parking-container">

            <div className="parking-content">
                <h2 className="parking-title">Lịch sử đỗ xe</h2>

                {/* BỘ LỌC */}
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
                            <option value="ALL">Tất cả</option>
                            <option value="ACTIVE">Đang đỗ (ACTIVE)</option>
                            <option value="FINISHED">Đã rời (FINISHED)</option>
                        </select>
                    </div>
                    {(startDate || endDate || statusFilter !== 'ALL') && (
                        <button className="clear-filter-btn" onClick={() => { setStartDate(''); setEndDate(''); setStatusFilter('ALL'); }}>
                            Bỏ lọc
                        </button>
                    )}
                </div>

                {/* Table */}
                <div className="table-wrapper">
                    <table className="parking-table">
                        <thead>
                            <tr>
                                <th>Mã phiên (ID)</th>
                                <th>Biển số xe</th>
                                <th>Loại xe</th>
                                <th>Vị trí đỗ (Slot)</th>
                                <th>Thời gian vào</th>
                                <th>Thời gian ra</th>
                                <th>Trạng thái</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredData.length > 0 ? (
                                filteredData.map((row, index) => (
                                    <tr key={row.sessionId} className={index % 2 === 0 ? "row-even" : "row-odd"}>
                                        <td><strong>{row.sessionId}</strong></td>
                                        <td>{row.plateNumber}</td>
                                        <td>{row.vehicleType}</td>
                                        <td>{row.slotName}</td>
                                        <td>{formatDateTime(row.entryTime)}</td>
                                        <td>{formatDateTime(row.exitTime)}</td>
                                        <td>
                                            <span className={row.status === 'ACTIVE' ? "badge-active" : "badge-finished"}>
                                                {row.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="empty-row" style={{ textAlign: "center", padding: "20px" }}>
                                        Không tìm thấy lịch sử phù hợp.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
};

export default ParkingHistory;