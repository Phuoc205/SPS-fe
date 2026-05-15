import React, { useState, useEffect } from "react";
import "./css/IOTmanagement.css";

const api_url = process.env.REACT_APP_API_URL; // Đảm bảo bạn đã cấu hình port 5000 (hoặc port của Spring Boot)

const IOTManagement = () => {
    const [devices, setDevices] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    
    const [currentPage, setCurrentPage] = useState(1);
    const devicesPerPage = 8;
    
    // Đã sửa: Khớp 100% với file Device.java trong Spring Boot
    const [formData, setFormData] = useState({
        id: "",
        deviceCode: "",
        type: "",
        location: "",
        slotId: "",
        active: true
    });

    useEffect(() => {
        fetchDevices();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter]);

    const fetchDevices = async (keyword = "") => {
        try {
            const url = keyword 
                ? `${api_url}/devices?keyword=${encodeURIComponent(keyword)}`
                : `${api_url}/devices`;
            
            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                setDevices(data);
            }
        } catch (error) {
            console.error("Lỗi khi tải danh sách thiết bị:", error);
        }
    };

    // Đã sửa: Lọc theo thuộc tính 'active' (kiểu boolean)
    const displayedDevices = devices.filter(device => {
        if (statusFilter === "ALL") return true;
        if (statusFilter === "ACTIVE") return device.active === true;
        if (statusFilter === "INACTIVE") return device.active === false;
        return true;
    });

    const indexOfLast = currentPage * devicesPerPage;
    const indexOfFirst = indexOfLast - devicesPerPage;
    const currentDevices = displayedDevices.slice(indexOfFirst, indexOfLast);
    const totalPages = Math.ceil(displayedDevices.length / devicesPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        // Xử lý riêng cho checkbox trạng thái
        const val = type === 'checkbox' ? checked : value;
        setFormData({ ...formData, [name]: val });
    };

    const openAddModal = () => {
        setIsEditing(false);
        setFormData({ id: "", deviceCode: "", type: "", location: "", slotId: "", active: true });
        setShowModal(true);
    };

    const openEditModal = (device) => {
        setIsEditing(true);
        setFormData({
            id: device.id,
            deviceCode: device.deviceCode || "",
            type: device.type || "",
            location: device.location || "",
            slotId: device.slotId || "",
            active: device.active !== undefined ? device.active : true
        });
        setShowModal(true);
    };

    const closeModal = () => setShowModal(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const url = isEditing 
            ? `${api_url}/devices/${formData.id}` 
            : `${api_url}/devices`;
        const method = isEditing ? "PUT" : "POST";

        const dataToSend = { ...formData };
        if (!isEditing) delete dataToSend.id;

        try {
            const response = await fetch(url, {
                method: method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(dataToSend),
            });

            if (response.ok) {
                alert(isEditing ? "Cập nhật thành công!" : "Thêm mới thành công!");
                fetchDevices(); 
                closeModal();
            } else {
                alert(`Lỗi lưu dữ liệu. Mã lỗi: ${response.status}`);
            }
        } catch (error) {
            alert("Lỗi kết nối tới Server Spring Boot!");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa thiết bị này?")) {
            try {
                const response = await fetch(`${api_url}/devices/${id}`, { method: "DELETE" });
                if (response.ok) {
                    fetchDevices();
                } else {
                    alert("Lỗi khi xóa từ server!");
                }
            } catch (error) {
                console.error("Lỗi khi xóa:", error);
            }
        }
    };

    return (
        <div className="iot-page">
            <div className="iot-container">
                <div className="iot-header">
                    <div className="iot-title">
                        <h2>Quản lý thiết bị IoT</h2>
                        <p>Theo dõi và cấu hình các thiết bị cảm biến, barrier trong hệ thống.</p>
                    </div>

                    <div className="header-actions">
                        <div className="search-filter-group">
                            <div className="search-wrapper">
                                <svg className="search-icon" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                                </svg>
                                <input
                                    type="text"
                                    placeholder="Tìm mã thiết bị..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onKeyDown={(e) => {if (e.key === 'Enter') fetchDevices(searchTerm); }}
                                />
                            </div>
                            
                            <select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                                <option value="ALL">Tất cả trạng thái</option>
                                <option value="ACTIVE">Đang hoạt động</option>
                                <option value="INACTIVE">Ngừng hoạt động</option>
                            </select>
                        </div>
                        <button className="btn-add" onClick={openAddModal}>+ Thêm thiết bị</button>
                    </div>
                </div>

                <div className="table-wrapper">
                    <table className="iot-table">
                        <thead>
                            <tr>
                                <th>Mã thiết bị</th>
                                <th>Loại</th>
                                <th>Vị trí</th>
                                <th>Trạng thái</th>
                                <th className="action-col">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentDevices.length > 0 ? (
                                currentDevices.map((device) => (
                                    <tr key={device.id}>
                                        <td className="device-info-cell">
                                            <div className="device-icon">📟</div>
                                            {/* Đã sửa: Dùng deviceCode */}
                                            <span className="device-name">{device.deviceCode || "N/A"}</span>
                                        </td>
                                        {/* Đã sửa: Dùng type */}
                                        <td><span className="text-gray">{device.type || "N/A"}</span></td>
                                        <td><span className="text-gray">{device.location || "N/A"}</span></td>
                                        <td>
                                            {/* Đã sửa: Dựa vào boolean active */}
                                            <span className={`status-badge ${device.active ? 'active' : 'inactive'}`}>
                                                {device.active ? "Hoạt động" : "Tắt"}
                                            </span>
                                        </td>
                                        <td className="actions">
                                            <button className="btn-icon" onClick={() => openEditModal(device)} title="Sửa">✏️</button>
                                            <button className="btn-icon delete" onClick={() => handleDelete(device.id)} title="Xóa">🗑️</button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="empty-state">Không tìm thấy thiết bị nào.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    {/* Pagination giữ nguyên */}
                    {totalPages > 1 && (
                        <div className="pagination">
                            <button className="page-btn" disabled={currentPage === 1} onClick={() => paginate(currentPage - 1)}>Trước</button>
                            <div className="page-numbers">
                                {[...Array(totalPages)].map((_, i) => (
                                    <button key={i} className={`page-num ${currentPage === i + 1 ? 'active' : ''}`} onClick={() => paginate(i + 1)}>{i + 1}</button>
                                ))}
                            </div>
                            <button className="page-btn" disabled={currentPage === totalPages} onClick={() => paginate(currentPage + 1)}>Sau</button>
                        </div>
                    )}
                </div>

                {/* Modal Thêm/Sửa */}
                {showModal && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <h3>{isEditing ? "Cập nhật thiết bị" : "Thêm thiết bị mới"}</h3>
                            <form className="iot-form" onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label>Mã thiết bị (Code)</label>
                                    <input type="text" name="deviceCode" value={formData.deviceCode} onChange={handleInputChange} placeholder="VD: ESP32-01" required />
                                </div>
                                <div className="form-group">
                                    <label>Loại thiết bị</label>
                                    <select name="type" value={formData.type} onChange={handleInputChange} required>
                                        <option value="">-- Chọn loại --</option>
                                        <option value="SENSOR">Cảm biến (SENSOR)</option>
                                        <option value="GATE">Barrier (GATE)</option>
                                        <option value="CAMERA">Camera (CAMERA)</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Vị trí</label>
                                    <input type="text" name="location" value={formData.location} onChange={handleInputChange} placeholder="VD: Cổng A, Khu B1..." />
                                </div>
                                <div className="form-group">
                                    <label style={{display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer'}}>
                                        <input type="checkbox" name="active" checked={formData.active} onChange={handleInputChange} style={{width: 'auto', margin: 0}} />
                                        Thiết bị đang hoạt động (Active)
                                    </label>
                                </div>
                                <div className="modal-actions">
                                    <button type="button" className="btn-cancel" onClick={closeModal}>Hủy</button>
                                    <button type="submit" className="btn-save">Lưu</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default IOTManagement;