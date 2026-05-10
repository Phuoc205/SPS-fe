import React, { useState, useEffect } from "react";
import axios from "axios";
import "./css/parkingaction.css";

const api_url = process.env.REACT_APP_API_URL;

const ParkingAction = () => {

    const [lots, setLots] = useState([]);
    const [slots, setSlots] = useState([]);

    const [selectedLot, setSelectedLot] = useState(null);

    const [loadingLots, setLoadingLots] = useState(true);
    const [slotLoading, setSlotLoading] = useState(false);

    useEffect(() => {
        fetchLots();
    }, []);

    useEffect(() => {

        let interval;

        if (selectedLot) {

            fetchSlots();

            interval = setInterval(() => {
                fetchSlots();
            }, 3000);
        }

        return () => clearInterval(interval);

    }, [selectedLot]);

    const fetchLots = async () => {

        try {

            setLoadingLots(true);

            const res = await axios.get(
                `${api_url}/parking-lots`
            );

            setLots(res.data);

        } catch (error) {

            console.error(
                "Lỗi khi tải danh sách bãi xe:",
                error
            );

        } finally {

            setLoadingLots(false);
        }
    };

    const fetchSlots = async () => {

        if (!selectedLot) return;

        try {

            setSlotLoading(true);

            const res = await axios.get(
                `${api_url}/slots`
            );

            const filteredSlots = res.data.filter(
                (s) => s.lotId === selectedLot.id
            );

            filteredSlots.sort((a, b) =>
                (a.slotName || "").localeCompare(
                    b.slotName || ""
                )
            );

            setSlots(filteredSlots);

        } catch (error) {

            console.error(
                "Lỗi khi tải danh sách vị trí:",
                error
            );

        } finally {

            setSlotLoading(false);
        }
    };

    return (
        <div className="parking-action-wrapper">

            <div className="pa-container">

                {/* HEADER */}
                <header className="pa-header">

                    <div>
                        <h2 className="pa-title">
                            Hệ Thống Giám Sát Bãi Xe
                        </h2>

                        <p className="pa-subtitle">
                            Đại học Bách Khoa TPHCM -
                            Cập nhật thời gian thực
                        </p>
                    </div>

                    {selectedLot && (
                        <button
                            className="btn-back"
                            onClick={() => {
                                setSelectedLot(null);
                                setSlots([]);
                            }}
                        >
                            <svg
                                className="icon-back"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                                />
                            </svg>

                            Quay lại danh sách
                        </button>
                    )}

                </header>

                <main className="pa-main">

                    {/* VIEW LOTS */}
                    {!selectedLot ? (

                        <div className="lot-selection-view">

                            <h3 className="section-heading">
                                Chọn khu vực bãi đỗ
                            </h3>

                            {loadingLots ? (

                                <div className="loading-state">
                                    <div className="spinner"></div>
                                    <p>
                                        Đang tải danh sách bãi xe...
                                    </p>
                                </div>

                            ) : (

                                <div className="lots-grid">

                                    {lots.map((lot) => (

                                        <div
                                            key={lot.id}
                                            className="lot-card"
                                            onClick={() => {

                                                setSelectedLot(lot);

                                                setSlots([]);
                                            }}
                                        >

                                            <div className="lot-card-icon">
                                                🅿️
                                            </div>

                                            <div className="lot-card-content">

                                                <h4>
                                                    {lot.name}
                                                </h4>

                                                <p>
                                                    Sức chứa tối đa:
                                                    {" "}
                                                    <strong>
                                                        {lot.capacity}
                                                    </strong>
                                                    {" "}xe
                                                </p>

                                            </div>

                                            <div className="lot-card-action">

                                                <span>
                                                    Xem chi tiết
                                                </span>

                                                <svg
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="M9 5l7 7-7 7"
                                                    />
                                                </svg>

                                            </div>

                                        </div>

                                    ))}

                                </div>

                            )}

                        </div>

                    ) : (

                        /* VIEW SLOTS */
                        <div className="slot-detail-view">

                            <div className="detail-header">

                                <h3>
                                    Trạng thái khu vực:
                                    {" "}
                                    <span className="highlight-text">
                                        {selectedLot.name}
                                    </span>
                                </h3>

                                <div className="status-legend">

                                    <div className="legend-item">
                                        <span className="dot dot-free"></span>
                                        Vị trí trống
                                    </div>

                                    <div className="legend-item">
                                        <span className="dot dot-occupied"></span>
                                        Đã có xe
                                    </div>

                                </div>

                            </div>

                            {/* LOADING */}
                            {slotLoading ? (

                                <div className="loading-state">

                                    <div className="spinner"></div>

                                    <p>
                                        Đang đồng bộ dữ liệu cảm biến...
                                    </p>

                                </div>

                            ) : slots.length === 0 ? (

                                /* EMPTY */
                                <div className="empty-state">

                                    <div className="empty-icon">
                                        🅿️
                                    </div>

                                    <h3>
                                        Không có ô đỗ nào
                                    </h3>

                                    <p>
                                        Khu vực này hiện chưa có dữ liệu.
                                    </p>

                                </div>

                            ) : (

                                /* GRID */
                                <div className="slots-grid">

                                    {slots.map((slot) => (

                                        <div
                                            key={slot.id}
                                            className={`slot-box ${
                                                slot.occupied
                                                    ? "is-occupied"
                                                    : "is-free"
                                            }`}
                                        >

                                            <div className="slot-header">

                                                <span className="slot-name">
                                                    {slot.slotName}
                                                </span>

                                            </div>

                                            <div className="slot-body">

                                                {slot.occupied ? (

                                                    <div className="car-present">

                                                        <span className="car-emoji">
                                                            🚘
                                                        </span>

                                                        <span className="status-text text-red">
                                                            Đang đỗ
                                                        </span>

                                                    </div>

                                                ) : (

                                                    <div className="car-absent">

                                                        <span className="status-text text-green">
                                                            Trống
                                                        </span>

                                                    </div>

                                                )}

                                            </div>

                                        </div>

                                    ))}

                                </div>

                            )}

                        </div>

                    )}

                </main>

            </div>

        </div>
    );
};

export default ParkingAction;