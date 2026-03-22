import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../css/banner.css";
import banner1 from "/public/images/banner1.png"
import banner2 from "/public/images/banner2.png"
import banner3 from "/public/images/banner3.png"
const Banner = () => {

    const images = [
        banner1,
        banner2,
        banner3
    ];
    const navigate = useNavigate();

    const [current, setCurrent] = useState(0);

    const nextSlide = () => {
        setCurrent((prev) => (prev + 1) % images.length);
    };

    const prevSlide = () => {
        setCurrent((prev) => (prev - 1 + images.length) % images.length);
    };

    // Auto chuyển banner mỗi 3 giây
    useEffect(() => {

        const interval = setInterval(() => {
            nextSlide();
        }, 3000);

        return () => clearInterval(interval);

    }, []);

    const goToParking = () => {
        navigate("/parkinglot");
    };

    return (
        <div className="banner">

            <button className="banner-btn left" onClick={prevSlide}>
                ❮
            </button>

            <img
                src={images[current]}
                alt="banner"
                className="banner-img"
            />

            <div className="banner-overlay">

                <h1>
                    SMART PARKING SYSTEM
                </h1>

                <p>
                    Hệ thống quản lý bãi đỗ xe thông minh trong khuôn viên trường.
                    Giúp theo dõi, quản lý và tối ưu việc sử dụng bãi xe hiệu quả.
                </p>

                <button className="banner-btn-link" onClick={goToParking}>
                    Xem bãi xe
                </button>

            </div>

            <button className="banner-btn right" onClick={nextSlide}>
                ❯
            </button>

        </div>
    );
};

export default Banner;