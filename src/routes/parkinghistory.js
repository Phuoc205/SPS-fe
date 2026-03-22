/* Do Khanh Trinh */
/* Lich su gui xe */


import React, { useState } from 'react'
import ReactDOM from 'react-dom/client'
import Header from "../components/header"
import Footer from "../components/footer"

const ParkingHistory = () => {
    const [history] = useState([
        {
            id: 1,
            plate: "59A-12345",
            checkIn: "2026-03-20 08:00",
            checkOut: "2026-03-20 10:30",
            fee: 10000,
            status: "Paid"
        },
        {
            id: 2,
            plate: "51B-67890",
            checkIn: "2026-03-19 09:15",
            checkOut: "2026-03-19 11:00",
            fee: 15000,
            status: "Unpaid"
        }
    ])

    return (
        <div>
            <Header/>
            <div style={{ padding: "20px" }}>
                <h2>Lịch sử gửi xe</h2>

                <table border="1" cellPadding="10" style={{ width: "100%", marginTop: "20px" }}>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Biển số</th>
                            <th>Check-in</th>
                            <th>Check-out</th>
                            <th>Phí (VND)</th>
                            <th>Trạng thái</th>
                        </tr>
                    </thead>
                    <tbody>
                        {history.map((item) => (
                            <tr key={item.id}>
                                <td>{item.id}</td>
                                <td>{item.plate}</td>
                                <td>{item.checkIn}</td>
                                <td>{item.checkOut}</td>
                                <td>{item.fee.toLocaleString()}</td>
                                <td style={{ color: item.status === "Paid" ? "green" : "red" }}>
                                    {item.status}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Footer/>
        </div>
    )
};

export default ParkingHistory