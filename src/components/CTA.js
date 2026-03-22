import React from "react";
import { Link } from "react-router-dom";
import "../css/homepage.css";

const CTA = () => {
    return (
        <div className="cta">
            <h2>Sẵn sàng sử dụng hệ thống?</h2>
            <Link to="/login">
                <button>Đăng nhập ngay</button>
            </Link>
        </div>
    );
};

export default CTA;