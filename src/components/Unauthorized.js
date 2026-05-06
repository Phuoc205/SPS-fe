import React from "react";
import { useNavigate } from "react-router-dom";

import "../css/componentcss/Unauthorized.css"
const Unauthorized = () => {
    const navigate = useNavigate();

    return (
        <div className="unauthorized-page">
            <div className="unauthorized-box">
                <h1>403</h1>
                <h2>Unauthorized Access</h2>
                <p>Bạn không có quyền truy cập trang này.</p>

                <div className="btn-group">
                    <button onClick={() => navigate(-1)}>
                        Quay lại
                    </button>

                    <button onClick={() => navigate("/login")}>
                        Đăng nhập lại
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Unauthorized;