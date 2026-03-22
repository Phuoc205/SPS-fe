import React from "react";
import "../css/homepage.css";

const Features = () => {
    return (
        <div className="section">
            <h2>Tính năng nổi bật</h2>

            <div className="features">
                <div className="card">
                    <h3>🚗 Theo dõi chỗ trống</h3>
                    <p>Cập nhật trạng thái bãi xe theo thời gian thực</p>
                </div>

                <div className="card">
                    <h3>🧭 Điều hướng thông minh</h3>
                    <p>Hướng dẫn bạn đến chỗ đỗ gần nhất</p>
                </div>

                <div className="card">
                    <h3>🎫 Tra cứu vé</h3>
                    <p>Tìm thông tin vé nhanh chóng</p>
                </div>

                <div className="card">
                    <h3>📊 Lịch sử gửi xe</h3>
                    <p>Xem lại toàn bộ lịch sử của bạn</p>
                </div>
            </div>
        </div>
    );
};

export default Features;