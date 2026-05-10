import React, { useState, useEffect } from "react";
import "./css/usermanagement.css";
import Header from "../../components/header";
import Footer from "../../components/footer";

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState("ALL");
    
    // Thêm các state phục vụ Phân trang (Pagination)
    const [currentPage, setCurrentPage] = useState(1);
    const usersPerPage = 8; // Giới hạn 8 người 1 trang
    
    const [formData, setFormData] = useState({
        id: "",
        name: "",
        username: "", // Thêm dòng này
        password: "", // Thêm dòng này
        email: "",
        cardId: "",
        role: "USER" 
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    // Tự động quay về trang 1 nếu người dùng gõ tìm kiếm hoặc đổi bộ lọc
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, roleFilter]);

    const fetchUsers = async (keyword = "") => {
        try {
            const url = keyword 
                ? `http://localhost:5000/api/users?keyword=${encodeURIComponent(keyword)}` 
                : "http://localhost:5000/api/users";
            
            // Sửa chữ "token" thành "userToken" cho khớp với file login.js
            const token = localStorage.getItem("userToken"); 
            
            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`, // Trình thẻ JWT ra
                    "Content-Type": "application/json"
                }
            });

            if (response.ok) {
                const data = await response.json();
                setUsers(data);
            } else {
                console.error("Lỗi từ server, có thể do Token:", response.status);
            }
        } catch (error) {
            console.error("Lỗi khi tải danh sách:", error);
        }
    };

    // Lọc danh sách theo vai trò
    const displayedUsers = users.filter(user => {
        if (roleFilter === "ALL") return true;
        return user.role === roleFilter;
    });

    // ----- LOGIC PHÂN TRANG -----
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = displayedUsers.slice(indexOfFirstUser, indexOfLastUser); // Cắt 8 người để hiện
    const totalPages = Math.ceil(displayedUsers.length / usersPerPage); // Tính tổng số trang

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const openAddModal = () => {
        setIsEditing(false);
        setFormData({ id: "", name: "", username: "", password: "", email: "", cardId: "", role: "USER" }); // Thêm vào đây nữa
        setShowModal(true);
    };

    const openEditModal = (user) => {
        setIsEditing(true);
        setFormData(user);
        setShowModal(true);
    };

    const closeModal = () => setShowModal(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const url = isEditing 
            ? `http://localhost:5000/api/users/${formData.id}` 
            : "http://localhost:5000/api/users";
        const method = isEditing ? "PUT" : "POST";

        const dataToSend = { ...formData };
        if (!isEditing) delete dataToSend.id; 

        try {
            // Đã đổi thành "userToken" chuẩn xác theo file login.js của nhóm 
            const token = localStorage.getItem("userToken"); 

            const response = await fetch(url, {
                method: method,
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}` // Kẹp thẻ Auth vào đây
                },
                body: JSON.stringify(dataToSend),
            });

            if (response.ok) {
                fetchUsers(); 
                closeModal();
            } else {
                // Hiển thị lỗi rõ ràng hơn để dễ bắt bệnh nếu có
                const errorData = await response.json().catch(() => null);
                alert(`Lỗi Backend (Mã ${response.status}): ${errorData?.message || "Không xác định"}`);
            }
        } catch (error) {
            alert("Lỗi mạng không thể kết nối tới Backend!");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa người dùng này không?")) {
            try {
                // Đã đổi thành "userToken"
                const token = localStorage.getItem("userToken");

                const response = await fetch(`http://localhost:5000/api/users/${id}`, { 
                    method: "DELETE",
                    headers: {
                        "Authorization": `Bearer ${token}` // Kẹp thẻ Auth vào đây
                    }
                });

                if (response.ok) {
                    fetchUsers();
                } else {
                    alert(`Không thể xóa. Lỗi Backend (Mã ${response.status})`);
                }
            } catch (error) {
                console.error("Lỗi khi xóa:", error);
                alert("Lỗi mạng khi thực hiện xóa!");
            }
        }
    };

    return (
        <div className="um-page">
            <Header />
            
            <div className="um-container">
                <div className="um-header">
                    <div className="um-title">
                        <h2>Quản lý người dùng</h2>
                        <p>Quản lý người dùng và phân quyền hệ thống tại đây.</p>
                    </div>

                    <div className="header-actions">
                        <div className="search-filter-group">
                            <div className="search-wrapper">
                                <svg className="search-icon" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                                </svg>
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm người dùng..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onKeyDown={(e) => {if (e.key === 'Enter') fetchUsers(searchTerm); }}
                                />
                            </div>
                            
                            <select 
                                className="filter-select" 
                                value={roleFilter} 
                                onChange={(e) => setRoleFilter(e.target.value)}
                            >
                                <option value="ALL">Tất cả vai trò</option>
                                <option value="USER">Sinh viên</option>
                                <option value="STAFF">Cán bộ/Nhân viên</option>
                                <option value="ADMIN">Quản trị viên</option>
                                
                            </select>
                        </div>
                        <button className="btn-add" onClick={openAddModal}>+ Thêm người dùng</button>
                    </div>
                </div>

                <div className="table-wrapper">
                    <table className="um-table">
                        <thead>
                            <tr>
                                <th>Họ và tên</th>
                                <th>Email</th>
                                <th>Mã thẻ</th>
                                <th>Vai trò</th>
                                <th className="action-col">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentUsers.length > 0 ? (
                                currentUsers.map((user) => (
                                    <tr key={user.id}>
                                        <td className="user-info-cell">
                                            <div className="user-avatar">
                                                {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                                            </div>
                                            <span className="user-name" style={{ color: '#111827', opacity: 1, fontWeight: 600 }}>
    {user.name || "N/A"}
</span>
                                        </td>
                                        <td><span className="text-gray">{user.email || "N/A"}</span></td>
                                        <td><span className="text-gray">{user.cardId || "N/A"}</span></td>
                                        <td>
                                            <span className={`role-badge ${user.role?.toLowerCase() || "user"}`}>
                                                {user.role === "USER" ? "Sinh viên" : 
                                                 user.role === "STAFF" ? "Cán bộ/Nhân viên" :                                                   
                                                 user.role === "ADMIN" ? "Quản trị viên" : "N/A"}
                                            </span>
                                        </td>
                                        <td className="actions">
                                            <button className="btn-icon" onClick={() => openEditModal(user)} title="Sửa">✏️</button>
                                            <button className="btn-icon delete" onClick={() => handleDelete(user.id)} title="Xóa">🗑️</button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="empty-state">Không tìm thấy người dùng nào.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    {/* Thanh Phân trang */}
                    {totalPages > 1 && (
                        <div className="pagination">
                            <button 
                                className="page-btn" 
                                disabled={currentPage === 1} 
                                onClick={() => paginate(currentPage - 1)}
                            >
                                Trước
                            </button>
                            
                            <div className="page-numbers">
                                {[...Array(totalPages)].map((_, index) => (
                                    <button 
                                        key={index} 
                                        className={`page-num ${currentPage === index + 1 ? 'active' : ''}`}
                                        onClick={() => paginate(index + 1)}
                                    >
                                        {index + 1}
                                    </button>
                                ))}
                            </div>

                            <button 
                                className="page-btn" 
                                disabled={currentPage === totalPages} 
                                onClick={() => paginate(currentPage + 1)}
                            >
                                Sau
                            </button>
                        </div>
                    )}
                </div>

                {/* Modal Thêm/Sửa */}
                {showModal && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <h3>{isEditing ? "Chỉnh sửa người dùng" : "Thêm người dùng mới"}</h3>
                            <form className="um-form" onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label>Họ và tên</label>
                                    <input type="text" name="name" value={formData.name} onChange={handleInputChange} required />
                                </div>                                
                                <div className="form-group">
                                    <label>Tên đăng nhập</label>                                    
                                    <input type="text" name="username" value={formData.username || ""} onChange={handleInputChange} required readOnly={isEditing} style={{ backgroundColor: isEditing ? '#f3f4f6' : 'white' }} />
                                </div>
                                {!isEditing && (
                                    <div className="form-group">
                                        <label>Mật khẩu</label>
                                        <input type="password" name="password" value={formData.password || ""} onChange={handleInputChange} required />
                                    </div>
                                )}
                                <div className="form-group">
                                    <label>Email</label>
                                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} required />
                                </div>
                                <div className="form-group">
                                    <label>Mã thẻ</label>
                                    <input type="text" name="cardId" value={formData.cardId} onChange={handleInputChange} required />
                                </div>
                                <div className="form-group">
                                    <label>Vai trò</label>
                                    <select name="role" value={formData.role} onChange={handleInputChange}>
                                        <option value="USER">Sinh viên</option>
                                        <option value="STAFF">Cán bộ/Nhân viên</option>
                                        <option value="ADMIN">Quản trị viên</option>
                                        
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
            <Footer />
        </div>
    );
};

export default UserManagement;