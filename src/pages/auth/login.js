import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import "./css/login.css";
// import Header from "../components/header";
// import Footer from "../components/footer";
// import img1 from "/public/images/logo-sps.png";
// import img2 from "/public/images/logobk.png";

const api_url = process.env.REACT_APP_API_URL;
const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (event) => {
        event.preventDefault();
        try {
            const response = await axios.post(`${api_url}/auth/login`, {
                username,
                password
            });

            const { token, name, role } = response.data;

            localStorage.setItem("user", JSON.stringify({ name, role }));
            localStorage.setItem("userToken", token);

            if (role === "ADMIN") {
                navigate("/admin");
            }
            else if (role == "STAFF") {
                navigate("/staff");
            } else {
                navigate("/");
            }
        } catch (err) {
            console.error(err);
            alert("Sai tài khoản hoặc mật khẩu");
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                
                {/* TRÁI - FORM ĐĂNG NHẬP */}
                <div className="login-form-section">
                    <div className="brand-logo-mobile">
                        <h2>SPS</h2>
                    </div>
                    
                    <div className="login-header">
                        <h2>Đăng Nhập</h2>
                        <p>Chào mừng bạn quay trở lại hệ thống</p>
                    </div>

                    <form onSubmit={handleLogin} className="login-form">
                        <div className="input-group">
                            <label>Tên đăng nhập</label>
                            <input
                                type="text"
                                placeholder="Nhập username của bạn"
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

                        <button type="submit" className="btn-primary">ĐĂNG NHẬP</button>
                        
                        <div className="signup-prompt">
                            <span>Bạn chưa có tài khoản?</span>
                            <button type="button" className="btn-text" onClick={() => navigate("/register")}>Đăng ký ngay</button>
                        </div>
                    </form>
                </div>

                {/* PHẢI - NỘI DUNG GIỚI THIỆU */}
                <div className="login-info-section">
                    <div className="info-content">
                        <h1>Smart Parking System</h1>
                        <p className="description">
                            Hệ thống quản lý bãi đỗ xe thông minh giúp theo dõi, kiểm soát và tối ưu hóa
                            việc sử dụng chỗ đỗ xe theo thời gian thực. Hỗ trợ vận hành hiệu quả, giảm ùn tắc và nâng cao trải nghiệm.
                        </p>

                        <ul className="feature-list">
                            <li>
                                <span className="check-icon">✓</span> Quản lý xe ra/vào tự động
                            </li>
                            <li>
                                <span className="check-icon">✓</span> Thống kê & báo cáo theo thời gian thực
                            </li>
                            <li>
                                <span className="check-icon">✓</span> Phân quyền người dùng rõ ràng
                            </li>
                            <li>
                                <span className="check-icon">✓</span> Tích hợp thanh toán nhanh chóng
                            </li>
                        </ul>

                        <button className="btn-outline">KHÁM PHÁ THÊM</button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Login;