import React, { useState, useEffect } from "react";
import "./css/iotmanagement.css";

const api_url = process.env.REACT_APP_API_URL;

const IOTManagement = () => {
    const [devices, setDevices] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    
    const [currentPage, setCurrentPage] = useState(1);
    const devicesPerPage = 8;
    
    // ĐÃ SỬA: Đổi name -> deviceName, type -> deviceType để khớp 100% với file Device.java
    const [formData, setFormData] = useState({
        id: "",
        deviceName: "",
        deviceType: "",
        status: "ACTIVE"
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
                ? `${api_url}/api/devices?keyword=${encodeURIComponent(keyword)}`
                : `${api_url}/api/devices`;
            
            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                setDevices(data);
            }
        } catch (error) {
            console.error("Lỗi khi tải danh sách thiết bị:", error);
        }
    };

    const displayedDevices = devices.filter(device => {
        if (statusFilter === "ALL") return true;
        return device.status === statusFilter;
    });

    const indexOfLast = currentPage * devicesPerPage;
    const indexOfFirst = indexOfLast - devicesPerPage;
    const currentDevices = displayedDevices.slice(indexOfFirst, indexOfLast);
    const totalPages = Math.ceil(displayedDevices.length / devicesPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const openAddModal = () => {
        setIsEditing(false);
        setFormData({ id: "", deviceName: "", deviceType: "", status: "ACTIVE" });
        setShowModal(true);
    };

    const openEditModal = (device) => {
        setIsEditing(true);
        // Đảm bảo dữ liệu cũ đổ vào form đúng chuẩn
        setFormData({
            id: device.id,
            deviceName: device.deviceName || "",
            deviceType: device.deviceType || "",
            status: device.status || "ACTIVE"
        });
        setShowModal(true);
    };

    const closeModal = () => setShowModal(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const url = isEditing 
            ? `${api_url}/api/devices/${formData.id}` 
            : `${api_url}/api/devices`;
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
                const errorMsg = await response.text();
                alert(`Lỗi Backend (Mã ${response.status}): Không thể lưu!\nChi tiết: ${errorMsg}`);
            }
        } catch (error) {
            alert("Lỗi kết nối mạng tới Spring Boot (Cổng 5000)!");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa thiết bị này?")) {
            try {
                const response = await fetch(`${api_url}/api/devices/${id}`, { method: "DELETE" });
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
                                    placeholder="Tìm tên thiết bị..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onKeyDown={(e) => {if (e.key === 'Enter') fetchDevices(searchTerm); }}
                                />
                            </div>
                            
                            {/* ĐÃ SỬA: Đổi setRoleFilter thành setStatusFilter */}
                            <select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                                <option value="ALL">Tất cả trạng thái</option>
                                <option value="ACTIVE">Đang hoạt động</option>
                                <option value="MAINTENANCE">Bảo trì</option>
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
                                <th>Tên thiết bị</th>
                                <th>Loại</th>
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
                                            {/* ĐÃ SỬA: lấy device.deviceName thay vì device.name */}
                                            <span className="device-name">{device.deviceName || "N/A"}</span>
                                        </td>
                                        {/* ĐÃ SỬA: lấy device.deviceType thay vì device.type */}
                                        <td><span className="text-gray">{device.deviceType || "Cảm biến"}</span></td>
                                        <td>
                                            <span className={`status-badge ${device.status?.toLowerCase()}`}>
                                                {device.status === "ACTIVE" ? "Hoạt động" : 
                                                 device.status === "MAINTENANCE" ? "Bảo trì" : "Tắt"}
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
                                    <td colSpan="4" className="empty-state">Không tìm thấy thiết bị nào.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>

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

                {showModal && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <h3>{isEditing ? "Cập nhật thiết bị" : "Thêm thiết bị mới"}</h3>
                            <form className="iot-form" onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label>Tên thiết bị</label>
                                    {/* ĐÃ SỬA: name="deviceName" */}
                                    <input type="text" name="deviceName" value={formData.deviceName} onChange={handleInputChange} required />
                                </div>
                                <div className="form-group">
                                    <label>Loại thiết bị</label>
                                    {/* ĐÃ SỬA: name="deviceType" */}
                                    <input type="text" name="deviceType" value={formData.deviceType} onChange={handleInputChange} placeholder="Ví dụ: Barrier, Camera..." required />
                                </div>
                                <div className="form-group">
                                    <label>Trạng thái</label>
                                    <select name="status" value={formData.status} onChange={handleInputChange}>
                                        <option value="ACTIVE">Hoạt động</option>
                                        <option value="MAINTENANCE">Bảo trì</option>
                                        <option value="INACTIVE">Ngừng hoạt động</option>
                                    </select>
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