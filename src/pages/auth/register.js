import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import "./css/login.css";

// Đảm bảo bạn đã cấu hình file .env (REACT_APP_API_URL=http://localhost:8080)
// Hoặc thay trực tiếp URL vào đây nếu muốn test nhanh
const api_url = process.env.REACT_APP_API_URL;

const Register = () => {
    const [name, setName] = useState("");
    const [cardId, setCardId] = useState("");
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    
    const navigate = useNavigate();

    const handleRegister = async (event) => {
        event.preventDefault();

        if (password !== confirmPassword) {
            alert("Mật khẩu xác nhận không trùng!");
            return;
        }

        try {
            await axios.post(`${api_url}/auth/register`, {
                name,
                username,
                password,
                cardId,
                email
            });

            alert("Đăng ký thành công!");
            navigate("/login");

        } catch (err) {
            console.error(err);
            alert(err.response?.data || "Đăng ký thất bại");
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                
                {/* TRÁI - FORM ĐĂNG KÝ */}
                <div className="login-form-section">
                    <div className="brand-logo-mobile">
                        <h2>SPS</h2>
                    </div>
                    
                    <div className="login-header">
                        <h2>Tạo Tài Khoản</h2>
                        <p>Đăng ký để trải nghiệm dịch vụ đỗ xe thông minh</p>
                    </div>

                    <form onSubmit={handleRegister} className="login-form">
                        <div className="input-group">
                            <label>Họ và tên</label>
                            <input
                                type="text"
                                placeholder="Nhập họ và tên của bạn"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label>Mã số Card (Card ID)</label>
                            <input
                                type="text"
                                value={cardId}
                                onChange={(e) => setCardId(e.target.value)}
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label>Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label>Tên đăng nhập</label>
                            <input
                                type="text"
                                placeholder="Nhập username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label>Mật khẩu</label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label>Xác nhận mật khẩu</label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>

                        <button type="submit" className="btn-primary">ĐĂNG KÝ</button>
                        
                        <div className="signup-prompt">
                            <span>Đã có tài khoản?</span>
                            <button 
                                type="button" 
                                className="btn-text" 
                                onClick={() => navigate("/login")}
                            >
                                Đăng nhập
                            </button>
                        </div>
                    </form>
                </div>

                {/* PHẢI - NỘI DUNG GIỚI THIỆU */}
                <div className="login-info-section">
                    <div className="info-content">
                        <h1>Gia Nhập Cùng SPS</h1>
                        <p className="description">
                            Chỉ với vài bước đăng ký đơn giản, bạn đã có thể quản lý lịch sử đỗ xe, 
                            thanh toán tiện lợi và nhận các thông báo tức thời từ hệ thống Smart Parking.
                        </p>

                        <ul className="feature-list">
                            <li>
                                <span className="check-icon">✓</span> Tiết kiệm thời gian tìm chỗ
                            </li>
                            <li>
                                <span className="check-icon">✓</span> Lịch sử giao dịch minh bạch
                            </li>
                            <li>
                                <span className="check-icon">✓</span> Bảo mật thông tin an toàn
                            </li>
                            <li>
                                <span className="check-icon">✓</span> Hỗ trợ khách hàng 24/7
                            </li>
                        </ul>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Register;