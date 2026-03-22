import React from "react";
import "../css/homepage.css";

const Stats = () => {
    return (
        <div className="section stats">
            <div className="stat">
                <h2>500+</h2>
                <p>Chỗ đỗ xe</p>
            </div>

            <div className="stat">
                <h2>1000+</h2>
                <p>Lượt xe mỗi ngày</p>
            </div>

            <div className="stat">
                <h2>99%</h2>
                <p>Hệ thống ổn định</p>
            </div>
        </div>
    );
};

export default Stats;