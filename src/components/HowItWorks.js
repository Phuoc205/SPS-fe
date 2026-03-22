import React from "react";
import "../css/homepage.css";

const HowItWorks = () => {
    return (
        <div className="section">
            <h2>Cách sử dụng</h2>

            <div className="features">
                <div className="card">
                    <h3>1️⃣ Đăng nhập</h3>
                    <p>Sử dụng tài khoản của bạn</p>
                </div>

                <div className="card">
                    <h3>2️⃣ Vào bãi</h3>
                    <p>Quét thẻ để vào hệ thống</p>
                </div>

                <div className="card">
                    <h3>3️⃣ Gửi xe</h3>
                    <p>Hệ thống ghi nhận tự động</p>
                </div>

                <div className="card">
                    <h3>4️⃣ Tra cứu</h3>
                    <p>Xem lịch sử và thanh toán</p>
                </div>
            </div>
        </div>
    );
};

export default HowItWorks;