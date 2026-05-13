import React, { useEffect, useState } from "react";
import axios from "axios";

import "./css/payment.css";
import Header from "../../components/header";
import Footer from "../../components/footer";

const Payment = () => {
    const API_URL = process.env.REACT_APP_API_URL;

    const [user] = useState(
        JSON.parse(localStorage.getItem("user")) || {}
    );

    const [paymentData, setPaymentData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);

    // Tách fetchPayments ra ngoài useEffect để có thể gọi lại sau khi pay
    const fetchPayments = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("userToken");

            const response = await axios.get(
                `${API_URL}/payments/user/${user.id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setPaymentData(response.data);
        } catch (err) {
            console.error("Lỗi khi tải danh sách thanh toán:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.id) {
            fetchPayments();
        } else {
            setLoading(false);
        }
    }, [API_URL, user?.id]);

    // Lọc các payment đang chờ thanh toán (PENDING)
    const pendingPayments = paymentData.filter(
        (item) => item.status === "PENDING"
    );

    const handlePayment = async (payment) => {
        try {
            setProcessingId(payment.id);
            const token = localStorage.getItem("userToken");

            // Gọi API pay với payment id đã có sẵn
            const payResponse = await axios.post(
                `${API_URL}/payments/${payment.id}/pay`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            console.log("Kết quả thanh toán:", payResponse.data);
            alert(`Thanh toán thành công cho hóa đơn #${payment.id}`);

            // Refresh lại danh sách sau khi thanh toán
            await fetchPayments();
        } catch (err) {
            console.error("Lỗi thanh toán:", err);
            alert("Thanh toán thất bại. Vui lòng thử lại.");
        } finally {
            setProcessingId(null);
        }
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleString("vi-VN");
    };

    const formatCurrency = (amount) => {
        if (amount == null) return "-";
        return amount.toLocaleString("vi-VN") + " VNĐ";
    };

    if (loading) {
        return (
            <div className="payment-loading">Đang tải dữ liệu...</div>
        );
    }

    return (
        <div>
            <Header />
            <div className="payment-page">
                <div className="payment-container">
                    <div className="payment-header">
                        <h2>Thanh toán phí đỗ xe</h2>
                        <p>Các hóa đơn đang chờ thanh toán</p>
                    </div>

                    <div className="payment-summary">
                        <div className="summary-card">
                            <span className="summary-title">
                                Phiên chưa thanh toán
                            </span>
                            <span className="summary-value">
                                {pendingPayments.length}
                            </span>
                        </div>
                    </div>

                    <div className="payment-table-wrapper">
                        <table className="payment-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Số tiền</th>
                                    <th>Ngày tạo</th>
                                    <th>Từ ngày</th>
                                    <th>Đến ngày</th>
                                    <th>Nhà cung cấp</th>
                                    <th>Trạng thái</th>
                                    <th>Hành động</th>
                                </tr>
                            </thead>

                            <tbody>
                                {pendingPayments.length > 0 ? (
                                    pendingPayments.map((item) => (
                                        <tr key={item.id}>
                                            <td>#{item.id}</td>

                                            <td className="money">
                                                {formatCurrency(item.amount)}
                                            </td>

                                            <td>
                                                {formatDateTime(item.createdAt)}
                                            </td>

                                            <td>
                                                {formatDateTime(
                                                    item.invoice?.fromDate
                                                )}
                                            </td>

                                            <td>
                                                {formatDateTime(
                                                    item.invoice?.toDate
                                                )}
                                            </td>

                                            <td>
                                                {item.provider || "-"}
                                            </td>

                                            <td>
                                                <span
                                                    className={`status ${item.status?.toLowerCase()}`}
                                                >
                                                    {item.status}
                                                </span>
                                            </td>

                                            <td>
                                                <button
                                                    className="pay-btn"
                                                    onClick={() =>
                                                        handlePayment(item)
                                                    }
                                                    disabled={
                                                        processingId ===
                                                            item.id ||
                                                        item.status !==
                                                            "PENDING"
                                                    }
                                                >
                                                    {processingId === item.id
                                                        ? "Đang xử lý..."
                                                        : item.status ===
                                                          "PENDING"
                                                        ? "Thanh toán"
                                                        : "Đã thanh toán"}
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
                                            Không có hóa đơn cần thanh toán
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Payment;