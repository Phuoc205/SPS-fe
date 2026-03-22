import React from "react";
import "../css/homepage.css";

const ParkingPreview = () => {
    return (
        <div className="section">
            <h2>Bãi đỗ xe</h2>

            <div className="features">
                <div className="card">
                    <h3>Bãi A</h3>
                    <p>Còn 20 chỗ trống</p>
                </div>

                <div className="card">
                    <h3>Bãi B</h3>
                    <p>Còn 10 chỗ trống</p>
                </div>

                <div className="card">
                    <h3>Bãi C</h3>
                    <p>Đã đầy</p>
                </div>
            </div>
        </div>
    );
};

export default ParkingPreview;