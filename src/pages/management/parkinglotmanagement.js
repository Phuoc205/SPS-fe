import React, { useEffect, useState } from 'react'
import axios from 'axios'
import './css/parkinglotmangement.css'
import bkLogo from '/public/images/logo-sps.png'

const api_url = process.env.REACT_APP_API_URL;
const initialForm = { name: '', location: '', capacity: '' }

const ParkingLotManagement = () => { 
    const [lots, setLots] = useState([])
    const [form, setForm] = useState(initialForm)
    const [message, setMessage] = useState('')
    const [showManagement, setShowManagement] = useState(false)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (showManagement) {
            loadParkingLots()
        }
    }, [showManagement])

    const loadParkingLots = async () => {
        setLoading(true)
        setMessage('')
        try {
            const response = await axios.get(`${api_url}/api/parking-lots`)
            setLots(Array.isArray(response.data) ? response.data : [])
        } catch (err) {
            console.error('Lỗi tải danh sách khu đỗ:', err)
            setMessage('Không thể tải danh sách khu đỗ từ backend. Vui lòng kiểm tra kết nối.')
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }))
        setMessage('')
    }

    const handleAddLot = async (event) => {
        event.preventDefault()
        if (!form.name.trim() || !form.location.trim() || !form.capacity.trim()) {
            setMessage('Vui lòng điền tên, vị trí và sức chứa khu đỗ.')
            return
        }

        try {
            const payload = {
                name: form.name.trim(),
                location: form.location.trim(),
                capacity: parseInt(form.capacity.trim(), 10)
            }
            await axios.post(`${api_url}/api/parking-lots`, payload)
            setForm(initialForm)
            setMessage('Đã thêm khu đỗ mới.')
            loadParkingLots()
        } catch (err) {
            console.error('Lỗi tạo khu đỗ:', err)
            setMessage('Không thể tạo khu đỗ. Vui lòng thử lại.')
        }
    }

    const handleDeleteLot = async (id) => {
        if (!window.confirm('Bạn có chắc muốn xóa khu đỗ này?')) return
        try {
            await axios.delete(`${api_url}/api/parking-lots/${id}`)
            setMessage('Đã xóa khu đỗ.')
            loadParkingLots()
        } catch (err) {
            console.error('Lỗi xóa khu đỗ:', err)
            setMessage('Không thể xóa khu đỗ. Vui lòng thử lại.')
        }
    }

    const handleReset = () => {
        setForm(initialForm)
        setMessage('Đã đặt lại form.')
        loadParkingLots()
    }

    // ===== WELCOME SCREEN =====
    if (!showManagement) {
        return (
            <div>
                <div className="parkinglot-welcome">
                    <div className="parkinglot-welcome-card">
                        <img src={bkLogo} alt="BK Logo" className="welcome-logo" />
                        <h1 className="welcome-title">Quản lý khu đỗ xe</h1>
                        <p className="welcome-desc">Xem và điều chỉnh danh sách các khu đỗ xe trong hệ thống</p>
                        <button
                            className="button primary welcome-btn"
                            onClick={() => setShowManagement(true)}
                        >
                            ⚙️ Điều chỉnh
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    // ===== MANAGEMENT SCREEN =====
    return (
        <div>

            <div className="parkinglot-page">

                {/* ===== FORM (LEFT) ===== */}
                <div className="card parkinglot-form-card">
                    <h2>Thêm khu</h2>

                    <input
                        type="text"
                        value={form.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        placeholder="Tên khu"
                    />
                    <input
                        type="text"
                        value={form.location}
                        onChange={(e) => handleChange('location', e.target.value)}
                        placeholder="Vị trí/khu vực"
                    />
                    <input
                        type="number"
                        value={form.capacity}
                        onChange={(e) => handleChange('capacity', e.target.value)}
                        placeholder="Sức chứa"
                        min="1"
                    />

                    <div className="parkinglot-actions">
                        <button type="submit" onClick={handleAddLot} className="button primary">
                            Thêm
                        </button>
                        <button type="button" onClick={handleReset} className="button secondary">
                            Reset
                        </button>
                        {/* NÚT THOÁT MỚI */}
                        <button
                            type="button"
                            onClick={() => setShowManagement(false)}
                            className="button danger"
                        >
                            Thoát
                        </button>
                    </div>

                    {message && <div className="parkinglot-message">{message}</div>}
                </div>

                {/* ===== TABLE (RIGHT) ===== */}
                <div className="card parkinglot-table-card">
                    <div className="parkinglot-topbar">
                        <h2>Danh sách khu</h2>
                        <img src={bkLogo} alt="BK Logo" className="parkinglot-bklogo" />
                    </div>

                    <div className="parkinglot-table-wrap">
                        <table className="parkinglot-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Tên khu</th>
                                    <th>Vị trí</th>
                                    <th>Sức chứa</th>
                                    <th>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="parkinglot-center-cell">
                                            Đang tải dữ liệu...
                                        </td>
                                    </tr>
                                ) : lots.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="parkinglot-center-cell">
                                            Chưa có khu đỗ nào. Hãy thêm khu mới.
                                        </td>
                                    </tr>
                                ) : (
                                    lots.map((lot, index) => (
                                        <tr key={lot.id}>
                                            <td>{index + 1}</td>
                                            <td>{lot.name}</td>
                                            <td>{lot.location || '-'}</td>
                                            <td>{lot.capacity || '-'}</td>
                                            <td>
                                                <button
                                                    className="button danger"
                                                    type="button"
                                                    onClick={() => handleDeleteLot(lot.id)}
                                                >
                                                    Xóa
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>

        </div>
    )
}

export default ParkingLotManagement