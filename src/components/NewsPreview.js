import React from "react";
import "../css/homepage.css";

const NewsPreview = () => {
    return (
        <div className="section">
            <h2>Tin tức</h2>

            <div className="features">
                <div className="card">
                    <h3>Bảo trì hệ thống</h3>
                    <p>Hệ thống sẽ bảo trì vào cuối tuần</p>
                </div>

                <div className="card">
                    <h3>Nâng cấp mới</h3>
                    <p>Thêm tính năng điều hướng thông minh</p>
                </div>

                <div className="card">
                    <h3>Mẹo gửi xe</h3>
                    <p>Cách tìm chỗ nhanh nhất</p>
                </div>
            </div>
        </div>
    );
};

export default NewsPreview;