/* ConfigPrice – 2 bảng riêng: Xe ô tô & Xe máy */

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './css/configprice.css';
import bkLogo from '/public/images/logo-sps.png';

const api_url = process.env.REACT_APP_API_URL;

const DEFAULT_CONFIGS = [
    { vehicleType: 'CAR',  type: 'HOURLY',  pricePerHour: 10000, pricePerDay: 0,     pricePerMonth: 0 },
    { vehicleType: 'CAR',  type: 'DAILY',   pricePerHour: 0,     pricePerDay: 50000, pricePerMonth: 0 },
    { vehicleType: 'CAR',  type: 'MONTHLY', pricePerHour: 0,     pricePerDay: 0,     pricePerMonth: 800000 },
    { vehicleType: 'BIKE', type: 'HOURLY',  pricePerHour: 5000,  pricePerDay: 0,     pricePerMonth: 0 },
    { vehicleType: 'BIKE', type: 'DAILY',   pricePerHour: 0,     pricePerDay: 20000, pricePerMonth: 0 },
    { vehicleType: 'BIKE', type: 'MONTHLY', pricePerHour: 0,     pricePerDay: 0,     pricePerMonth: 300000 },
];

const TYPE_ORDER  = ['HOURLY', 'DAILY', 'MONTHLY'];
const TYPE_LABELS = { HOURLY: 'Theo giờ', DAILY: 'Theo ngày', MONTHLY: 'Theo tháng' };
const TYPE_FIELD  = { HOURLY: 'pricePerHour', DAILY: 'pricePerDay', MONTHLY: 'pricePerMonth' };
const TYPE_NEW    = { HOURLY: 'newPricePerHour', DAILY: 'newPricePerDay', MONTHLY: 'newPricePerMonth' };
const TYPE_UNIT   = { HOURLY: 'VNĐ/giờ', DAILY: 'VNĐ/ngày', MONTHLY: 'VNĐ/tháng' };

const emptyNew  = () => ({ newPricePerHour: '', newPricePerDay: '', newPricePerMonth: '' });
const formatVnd = (n) => Number(n || 0).toLocaleString('vi-VN') + ' VNĐ';

/* ─── Sub-component: bảng cho 1 loại xe ─────────────────────────── */
const VehicleTable = ({ title, vehicleType, rows, loading, onChange, onApply, onReset, message }) => {
    const hasAnyChange = rows.some(r =>
        r[TYPE_NEW[r.type]]?.trim() !== ''
    );

    return (
        <div className="cp-vehicle-section">
            <div className="cp-vehicle-header">
                <span className="cp-vehicle-icon">
                    {vehicleType === 'CAR' ? '🚗' : '🏍️'}
                </span>
                <h2 className="cp-vehicle-title">{title}</h2>
            </div>

            {message.text && (
                <div className={`configprice-message${message.isError ? ' error' : ''}`}>
                    {message.text}
                </div>
            )}

            <div className="configprice-table-wrapper">
                <table className="configprice-table">
                    <thead>
                        <tr>
                            <th style={{ width: 40 }}>#</th>
                            <th>Loại giá</th>
                            <th>Giá hiện tại</th>
                            <th>Giá mới</th>
                            <th>Xem trước</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="5" className="configprice-center-cell">
                                    <span className="cp-loading">Đang tải dữ liệu...</span>
                                </td>
                            </tr>
                        ) : rows.map((item, idx) => {
                            const cur     = item[TYPE_FIELD[item.type]] || 0;
                            const newVal  = item[TYPE_NEW[item.type]]  || '';
                            const changed = newVal.trim() !== '';
                            const preview = changed ? Number(newVal) : cur;

                            return (
                                <tr
                                    key={item.id}
                                    className={[
                                        item.isNew  ? 'cp-row-new'     : '',
                                        changed     ? 'cp-row-changed' : '',
                                    ].filter(Boolean).join(' ')}
                                >
                                    <td className="cp-idx">{idx + 1}</td>

                                    {/* Loại giá – chỉ đọc */}
                                    <td>
                                        <span className="cp-type-badge">
                                            {TYPE_LABELS[item.type]}
                                        </span>
                                        <small className="cp-unit" style={{ display: 'block', marginTop: 2 }}>
                                            {TYPE_UNIT[item.type]}
                                        </small>
                                    </td>

                                    {/* Giá hiện tại */}
                                    <td className="cp-price-current">
                                        <span>{formatVnd(cur)}</span>
                                    </td>

                                    {/* Input giá mới */}
                                    <td>
                                        <input
                                            type="text"
                                            value={newVal}
                                            placeholder={`Nhập giá mới`}
                                            onChange={e =>
                                                onChange(item.id, TYPE_NEW[item.type], e.target.value)
                                            }
                                            className={`cp-input${changed ? ' cp-input-active' : ''}`}
                                        />
                                    </td>

                                    {/* Preview */}
                                    <td>
                                        <span className={`cp-preview${changed ? ' cp-preview-changed' : ''}`}>
                                            {formatVnd(preview)}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <div className="cp-vehicle-actions">
                <button
                    className="cp-btn cp-btn-primary"
                    onClick={() => onApply(vehicleType)}
                    disabled={!hasAnyChange}
                >
                    ✓ Lưu giá {title}
                </button>
                <button
                    className="cp-btn cp-btn-neutral"
                    onClick={() => onReset(vehicleType)}
                >
                    ↺ Đặt lại
                </button>
            </div>
        </div>
    );
};

/* ─── Main component ─────────────────────────────────────────────── */
const ConfigPrice = () => {
    const [configPrices, setConfigPrices] = useState([]);
    const [loading,      setLoading]      = useState(true);
    const [showEditor,   setShowEditor]   = useState(false);
    const [messages,     setMessages]     = useState({ CAR: { text: '', isError: false }, BIKE: { text: '', isError: false } });

    useEffect(() => { loadConfigPrices(); }, []);

    const setMsg = (vehicleType, text, isError = false) =>
        setMessages(m => ({ ...m, [vehicleType]: { text, isError } }));

    const loadConfigPrices = async () => {
        setLoading(true);
        try {
            const res  = await axios.get(`${api_url}/api/pricing`);
            const data = Array.isArray(res.data) ? res.data : [];
            initRows(data.length > 0 ? data : DEFAULT_CONFIGS, !data.length);
        } catch {
            initRows(DEFAULT_CONFIGS, true);
        } finally {
            setLoading(false);
        }
    };

    const initRows = (data, isDefault) => {
        // Đảm bảo đủ 6 hàng (2 xe × 3 loại)
        const map = {};
        data.forEach(item => {
            const key = `${item.vehicleType}-${item.type}`;
            map[key]  = item;
        });

        const rows = [];
        ['CAR', 'BIKE'].forEach(vt => {
            TYPE_ORDER.forEach(tp => {
                const key  = `${vt}-${tp}`;
                const base = map[key] || DEFAULT_CONFIGS.find(d => d.vehicleType === vt && d.type === tp);
                rows.push({
                    id:           base?.id ?? `default-${vt}-${tp}`,
                    vehicleType:  vt,
                    type:         tp,
                    pricePerHour:  Number(base?.pricePerHour  ?? 0),
                    pricePerDay:   Number(base?.pricePerDay   ?? 0),
                    pricePerMonth: Number(base?.pricePerMonth ?? 0),
                    createdAt:    base?.createdAt ?? null,
                    isNew:        !base?.id || isDefault,
                    ...emptyNew(),
                });
            });
        });
        setConfigPrices(rows);
    };

    const handleChange = (id, field, value) => {
        setConfigPrices(cur => cur.map(item =>
            item.id !== id ? item : {
                ...item,
                [field]: value.replace(/[^0-9]/g, ''),
            }
        ));
    };

    const rowsFor = (vehicleType) =>
        configPrices.filter(r => r.vehicleType === vehicleType);

    const buildPayload = (item) => {
        const nf  = TYPE_NEW[item.type];
        const f   = TYPE_FIELD[item.type];
        const val = item[nf]?.trim() !== '' ? Number(item[nf]) : item[f];
        return {
            vehicleType:   item.vehicleType,
            type:          item.type,
            pricePerHour:  item.type === 'HOURLY'  ? val : item.pricePerHour,
            pricePerDay:   item.type === 'DAILY'   ? val : item.pricePerDay,
            pricePerMonth: item.type === 'MONTHLY' ? val : item.pricePerMonth,
        };
    };

    const handleApply = async (vehicleType) => {
        const targets = rowsFor(vehicleType).filter(r => r[TYPE_NEW[r.type]]?.trim() !== '');
        if (targets.length === 0) {
            setMsg(vehicleType, 'Chưa có giá mới để cập nhật.', false);
            return;
        }
        for (const item of targets) {
            const val = Number(item[TYPE_NEW[item.type]]);
            if (!val || val <= 0) {
                setMsg(vehicleType, 'Vui lòng nhập giá hợp lệ (> 0) cho tất cả ô đã chỉnh.', true);
                return;
            }
        }
        try {
            await Promise.all(targets.map(item =>
                (item.isNew || `${item.id}`.startsWith('default-'))
                    ? axios.post(`${api_url}/api/pricing`, buildPayload(item))
                    : axios.put(`${api_url}/api/pricing/${item.id}`, buildPayload(item))
            ));
            setMsg(vehicleType, '✓ Giá đã được cập nhật thành công.', false);
            loadConfigPrices();
        } catch (err) {
            console.error(err);
            setMsg(vehicleType, 'Lỗi khi lưu giá lên server. Vui lòng thử lại.', true);
        }
    };

    const handleReset = (vehicleType) => {
        setConfigPrices(cur => cur.map(item =>
            item.vehicleType !== vehicleType ? item : { ...item, ...emptyNew() }
        ));
        setMsg(vehicleType, '', false);
    };

    return (
        <div>
            <div className="configprice-page">
                <div className="configprice-wrapper">
                    <div className="configprice-box">

                        <div className="configprice-header">
                            <img src={bkLogo} alt="Logo" className="configprice-logo" />
                            <h1>Bảng Điều Chỉnh Giá Gửi Xe</h1>
                            <p className="configprice-intro">
                                Cấu hình giá gửi xe theo từng loại phương tiện.
                                Mỗi loại xe gồm 3 mức giá: theo giờ, theo ngày và theo tháng.
                            </p>
                        </div>

                        {!showEditor && (
                            <div className="configprice-open-action">
                                <button
                                    className="cp-btn cp-btn-primary"
                                    onClick={() => setShowEditor(true)}
                                >
                                    Mở bảng sửa giá
                                </button>
                            </div>
                        )}

                        {showEditor && (
                            <>
                                <div className="configprice-actions" style={{ justifyContent: 'flex-end' }}>
                                    <button
                                        className="cp-btn cp-btn-ghost"
                                        onClick={() => { setShowEditor(false); loadConfigPrices(); }}
                                    >
                                        Đóng bảng
                                    </button>
                                </div>

                                <div className="cp-two-tables">
                                    <VehicleTable
                                        title="Xe ô tô"
                                        vehicleType="CAR"
                                        rows={rowsFor('CAR')}
                                        loading={loading}
                                        onChange={handleChange}
                                        onApply={handleApply}
                                        onReset={handleReset}
                                        message={messages.CAR}
                                    />
                                    <VehicleTable
                                        title="Xe máy"
                                        vehicleType="BIKE"
                                        rows={rowsFor('BIKE')}
                                        loading={loading}
                                        onChange={handleChange}
                                        onApply={handleApply}
                                        onReset={handleReset}
                                        message={messages.BIKE}
                                    />
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfigPrice;