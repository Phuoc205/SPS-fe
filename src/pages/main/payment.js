import React, { useEffect, useState } from "react";
import axios from "axios";

import "./css/payment.css";
import Header from "../../components/header"
import Footer from "../../components/footer"
const Payment = () => {
    const API_URL = process.env.REACT_APP_API_URL;

    const [user] = useState(
        JSON.parse(localStorage.getItem("user")) || {}
    );

    const [historyData, setHistoryData] = useState([]);

    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);

    useEffect(() => {

        const fetchHistory = async () => {

            try {

                const token = localStorage.getItem("userToken");

                const response = await axios.get(
                    `${API_URL}/history/user/${user.id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                setHistoryData(response.data);

            } catch (err) {

                console.error(err);

            } finally {

                setLoading(false);
            }
        };

        if (user?.id) {
            fetchHistory();
        } else {
            setLoading(false);
        }

    }, [API_URL, user]);

    const finishedSessions = historyData.filter(
        item => item.status === "FINISHED"
    );

    const handlePayment = async (session) => {

        try {

            setProcessingId(session.sessionId);

            const token = localStorage.getItem("userToken");

            // 1. tạo payment
            const createResponse = await axios.post(
                `${API_URL}/payments`,
                {
                    userId: user.id,
                    sessionId: session.sessionId
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const payment = createResponse.data;

            // 2. pay
            const payResponse = await axios.post(
                `${API_URL}/payments/${payment.id}/pay`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            alert(
                `Thanh toán thành công cho phiên #${session.sessionId}`
            );

            console.log(payResponse.data);

        } catch (err) {

            console.error(err);

            alert("Thanh toán thất bại");

        } finally {

            setProcessingId(null);
        }
    };

    const formatDateTime = (dateString) => {

        if (!dateString) return "-";

        return new Date(dateString).toLocaleString("vi-VN");
    };

    if (loading) {
        return (
            <div className="payment-loading">
                Đang tải dữ liệu...
            </div>
        );
    }

    return (
        <div>
        <Header/>
        <div className="payment-page">
            <div className="payment-container">

                <div className="payment-header">
                    <h2>Thanh toán phí đỗ xe</h2>

                    <p>
                        Các phiên đã hoàn thành cần thanh toán
                    </p>
                </div>

                <div className="payment-summary">

                    <div className="summary-card">
                        <span className="summary-title">
                            Phiên chưa thanh toán
                        </span>

                        <span className="summary-value">
                            {finishedSessions.length}
                        </span>
                    </div>

                </div>

                <div className="payment-table-wrapper">

                    <table className="payment-table">

                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Slot</th>
                                <th>Check In</th>
                                <th>Check Out</th>
                                <th>Số giờ</th>
                                <th>Số tiền</th>
                                <th>Trạng thái</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>

                        <tbody>

                            {finishedSessions.length > 0 ? (

                                finishedSessions.map((item) => (

                                    <tr key={item.sessionId}>

                                        <td>
                                            #{item.sessionId}
                                        </td>

                                        <td>
                                            {item.slotName}
                                        </td>

                                        <td>
                                            {formatDateTime(item.checkInTime)}
                                        </td>

                                        <td>
                                            {formatDateTime(item.checkOutTime)}
                                        </td>

                                        <td>
                                            {item.durationHours} giờ
                                        </td>

                                        <td className="money">
                                            {item.amount?.toLocaleString("vi-VN")} VNĐ
                                        </td>

                                        <td>
                                            <span className="status finished">
                                                {item.status}
                                            </span>
                                        </td>

                                        <td>

                                            <button
                                                className="pay-btn"
                                                onClick={() => handlePayment(item)}
                                                disabled={
                                                    processingId === item.sessionId
                                                }
                                            >
                                                {
                                                    processingId === item.sessionId
                                                        ? "Đang xử lý..."
                                                        : "Thanh toán"
                                                }
                                            </button>

                                        </td>

                                    </tr>

                                ))

                            ) : (

                                <tr>

                                    <td
                                        colSpan="8"
                                        className="empty-row"
                                    >
                                        Không có phiên cần thanh toán
                                    </td>

                                </tr>

                            )}

                        </tbody>

                    </table>

                </div>

            </div>
            

        </div>
        <Footer/>
        </div>
        
    );
};

export default Payment;