/* SlotManagement.jsx */
/* Smart Parking - Staff Slot Monitor */

import React, { useEffect, useMemo, useState } from "react";
import "./css/slotmanagement.css";

const API_URL = "http://localhost:5000/api/slots";

const SlotManagement = () => {

    const [user, setUser] = useState(null);

    const [slots, setSlots] = useState([]);

    const [loading, setLoading] = useState(true);

    const [selectedLot, setSelectedLot] = useState("ALL");

    const [selectedSlot, setSelectedSlot] = useState(null);

    const [message, setMessage] = useState("");

    const [search, setSearch] = useState("");

    /* =========================
       LOAD USER + AUTO REFRESH
    ========================== */

    useEffect(() => {

        const storedUser = localStorage.getItem("user");

        if (storedUser) {

            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error(e);
            }
        }

        fetchSlots();

        const interval = setInterval(() => {
            fetchSlots(false);
        }, 10000);

        return () => clearInterval(interval);

    }, []);

    /* =========================
       FETCH SLOT
    ========================== */

    const fetchSlots = async (showLoading = true) => {

        try {

            if (showLoading) {
                setLoading(true);
            }

            const response = await fetch(API_URL);

            if (!response.ok) {
                throw new Error("Cannot load slots");
            }

            const data = await response.json();

            const normalized = data.map((slot) => ({
                id: slot.id,
                slotName: slot.slotName,
                occupied: slot.occupied,

                lot: {
                    id: slot.lotId,
                    name: slot.lotName,
                    location: slot.lotLocation
                }
            }));

            setSlots(normalized);

        } catch (err) {

            console.error(err);

        } finally {

            if (showLoading) {
                setLoading(false);
            }
        }
    };

    /* =========================
       UPDATE SLOT STATUS
    ========================== */

    const handleToggleSlot = async (slot) => {

        try {

            const response = await fetch(
                `${API_URL}/${slot.id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        slotName: slot.slotName,
                        occupied: !slot.occupied,
                        lot: slot.lot
                    })
                }
            );

            if (!response.ok) {
                throw new Error("Update failed");
            }

            const updated = await response.json();

            setSlots((prev) =>
                prev.map((s) =>
                    s.id === updated.id
                        ? updated
                        : s
                )
            );

            setSelectedSlot(updated);

            setMessage(
                `${updated.slotName} → ${
                    updated.occupied
                        ? "ĐÃ ĐỖ"
                        : "TRỐNG"
                }`
            );

            setTimeout(() => {
                setMessage("");
            }, 2500);

        } catch (err) {

            console.error(err);

            alert("Cập nhật trạng thái thất bại!");
        }
    };

    /* =========================
       FILTER LOTS
    ========================== */

    const lots = useMemo(() => {

        const unique = [];

        slots.forEach((slot) => {

            if (
                slot.lot &&
                !unique.find((l) => l.id === slot.lot.id)
            ) {
                unique.push(slot.lot);
            }
        });

        return unique;

    }, [slots]);

    /* =========================
       DISPLAYED SLOTS
    ========================== */

    const displayedSlots = useMemo(() => {

        let data = [...slots];

        if (selectedLot !== "ALL") {

            data = data.filter(
                (slot) => slot.lot?.id === selectedLot
            );
        }

        if (search.trim()) {

            data = data.filter((slot) =>
                slot.slotName
                    ?.toLowerCase()
                    .includes(search.toLowerCase())
            );
        }

        return data.sort((a, b) =>
            a.slotName.localeCompare(b.slotName)
        );

    }, [slots, selectedLot, search]);

    /* =========================
       STATS
    ========================== */

    const totalFree =
        displayedSlots.filter((s) => !s.occupied).length;

    const totalOccupied =
        displayedSlots.filter((s) => s.occupied).length;

    /* =========================
       PERMISSION
    ========================== */

    const canAccess =
        user &&
        (
            user.role === "ADMIN" ||
            user.role === "STAFF" ||
            user.role === "PARKING_STAFF"
        );

    if (!canAccess) {

        return (
            <div className="slot-page">

                <div className="access-box">

                    <h2>
                        🚫 Truy cập bị từ chối
                    </h2>

                    <p>
                        Chỉ Staff/Admin được sử dụng.
                    </p>

                </div>

            </div>
        );
    }

    /* =========================
       UI
    ========================== */

    return (

        <div className="slot-page">

            {/* HEADER */}

            <div className="slot-header">

                <div>

                    <h1>
                        Giám sát ô đỗ xe
                    </h1>

                    <p>
                        Theo dõi trạng thái realtime
                        và cập nhật thủ công.
                    </p>

                </div>

                <button
                    className="refresh-btn"
                    onClick={() => fetchSlots()}
                >
                    🔄 Refresh
                </button>

            </div>

            {/* STATS */}

            <div className="stats-row">

                <div className="stat-card free">

                    <h3>{totalFree}</h3>

                    <p>Ô trống</p>

                </div>

                <div className="stat-card occupied">

                    <h3>{totalOccupied}</h3>

                    <p>Đang đỗ</p>

                </div>

                <div className="stat-card total">

                    <h3>{displayedSlots.length}</h3>

                    <p>Tổng ô</p>

                </div>

            </div>

            {/* TOOLBAR */}

            <div className="toolbar">

                <input
                    type="text"
                    placeholder="Tìm ô đỗ..."
                    value={search}
                    onChange={(e) =>
                        setSearch(e.target.value)
                    }
                />

                <select
                    value={selectedLot}
                    onChange={(e) => {

                        const value = e.target.value;

                        setSelectedLot(
                            value === "ALL"
                                ? "ALL"
                                : parseInt(value)
                        );
                    }}
                >

                    <option value="ALL">
                        Tất cả bãi xe
                    </option>

                    {lots.map((lot) => (

                        <option
                            key={lot.id}
                            value={lot.id}
                        >
                            {lot.name}
                        </option>

                    ))}

                </select>

            </div>

            {/* SUCCESS */}

            {message && (

                <div className="success-box">
                    {message}
                </div>

            )}

            {/* SLOT MAP */}

            {loading ? (

                <div className="loading-box">
                    Đang tải dữ liệu...
                </div>

            ) : (

                <div className="slot-map">

                    {displayedSlots.map((slot) => (

                        <div
                            key={slot.id}
                            className={`slot-tile ${
                                slot.occupied
                                    ? "occupied"
                                    : "free"
                            }`}
                            onClick={() =>
                                setSelectedSlot(slot)
                            }
                        >

                            <div className="slot-name">
                                {slot.slotName}
                            </div>

                            <div className="slot-icon">

                                {slot.occupied
                                    ? "🚗"
                                    : "🟢"}

                            </div>

                        </div>

                    ))}

                </div>

            )}

            {/* MODAL */}

            {selectedSlot && (

                <div
                    className="modal-overlay"
                    onClick={() =>
                        setSelectedSlot(null)
                    }
                >

                    <div
                        className="slot-modal"
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >

                        <h2>
                            {selectedSlot.slotName}
                        </h2>

                        <div
                            className={`modal-status ${
                                selectedSlot.occupied
                                    ? "occupied"
                                    : "free"
                            }`}
                        >

                            {selectedSlot.occupied
                                ? "🚗 ĐÃ ĐỖ"
                                : "🟢 TRỐNG"}

                        </div>

                        <div className="modal-info">

                            <p>
                                <strong>ID:</strong>{" "}
                                {selectedSlot.id}
                            </p>

                            <p>
                                <strong>Bãi xe:</strong>{" "}
                                {selectedSlot.lot?.name || "N/A"}
                            </p>

                            <p>
                                <strong>Vị trí:</strong>{" "}
                                {selectedSlot.lot?.location || "N/A"}
                            </p>

                        </div>

                        <button
                            className="toggle-btn"
                            onClick={() =>
                                handleToggleSlot(
                                    selectedSlot
                                )
                            }
                        >

                            {selectedSlot.occupied
                                ? "Đánh dấu TRỐNG"
                                : "Đánh dấu ĐÃ ĐỖ"}

                        </button>

                        <button
                            className="close-btn"
                            onClick={() =>
                                setSelectedSlot(null)
                            }
                        >
                            Đóng
                        </button>

                    </div>

                </div>

            )}

        </div>
    );
};

export default SlotManagement;