import React from "react";
import { useNavigate } from "react-router-dom";
import "../css/componentcss/footer.css";

const Footer = () => {
    const navigate = useNavigate();
    const goToParking = () => {
        navigate("/parkingaction");
    };
    const goToNews = () => {
        navigate("/news");
    };
    return (
        <footer className="footer">

            <div className="footer-container">

                <div className="footer-section">
                    <h2>SMART PARKING</h2>
                    <p>
                        Hệ thống quản lý bãi đỗ xe thông minh giúp sinh viên 
                        và nhân viên dễ dàng tìm kiếm và quản lý chỗ đỗ xe 
                        trong khuôn viên trường.
                    </p>
                </div>

                <div className="footer-section">
                    <h3>Liên kết</h3>
                    <ul>
                        <li>Trang chủ</li>
                        <li onClick={goToParking}>Bãi đỗ xe</li>
                        <li onClick={goToNews}>Hướng dẫn sử dụng</li>
                        <li onClick={goToNews}>Liên hệ</li>
                    </ul>
                </div>

                <div className="footer-section">
                    <h3>Liên hệ</h3>
                    <p>Email: smartparking@hcmut.edu.vn</p>
                    <p>Hotline: 0123 456 789</p>
                    <p>Địa chỉ: Đại học Bách Khoa TP.HCM</p>
                </div>

            </div>

            <div className="footer-bottom">
                © 2026 Smart Parking System. All rights reserved.
            </div>

        </footer>
    );
};

export default Footer;