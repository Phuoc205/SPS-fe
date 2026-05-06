/* Long Thanh - update, logic unchanged */

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './css/configprice.css';
import bkLogo from '/public/images/logo-sps.png';

const api_url = process.env.REACT_APP_API_URL;

const VEHICLE_LABELS = { CAR: 'Xe ô tô', BIKE: 'Xe máy' };

const PRICING_TYPE_LABELS = {
    HOURLY: 'Theo giờ',
    DAILY:  'Theo ngày',
    MONTHLY:'Theo tháng',
};

const TYPE_TO_FIELD     = { HOURLY:'pricePerHour', DAILY:'pricePerDay', MONTHLY:'pricePerMonth' };
const TYPE_TO_NEW_FIELD = { HOURLY:'newPricePerHour', DAILY:'newPricePerDay', MONTHLY:'newPricePerMonth' };
const TYPE_UNIT_LABEL   = { HOURLY:'VNĐ/giờ', DAILY:'VNĐ/ngày', MONTHLY:'VNĐ/tháng' };

const emptyNewRates = () => ({ newPricePerHour:'', newPricePerDay:'', newPricePerMonth:'' });
const formatVnd = (n) => Number(n||0).toLocaleString('vi-VN') + ' VNĐ';

const ConfigPrice = () => {
    const [configPrices, setConfigPrices] = useState([]);
    const [loading,      setLoading]      = useState(true);
    const [message,      setMessage]      = useState({ text:'', isError:false });
    const [showEditor,   setShowEditor]   = useState(false);

    useEffect(() => { loadConfigPrices(); }, []);

    const loadConfigPrices = async () => {
        setLoading(true);
        setMessage({ text:'', isError:false });
        try {
            const res  = await axios.get(`${api_url}/api/pricing`);
            const data = Array.isArray(res.data) ? res.data : [];
            setConfigPrices(data.map(item => ({
                id: item.id,
                vehicleType: item.vehicleType || 'CAR',
                type:        item.type        || 'HOURLY',
                pricePerHour:  Number(item.pricePerHour  ?? 0),
                pricePerDay:   Number(item.pricePerDay   ?? 0),
                pricePerMonth: Number(item.pricePerMonth ?? 0),
                createdAt: item.createdAt || null,
                ...emptyNewRates(),
                isNew: false,
            })));
        } catch (err) {
            console.error('Lỗi tải giá:', err);
            setMessage({ text:'Không thể tải giá từ API. Vui lòng kiểm tra kết nối backend.', isError:true });
            setConfigPrices([]);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (id, field, value) => {
        const numeric = ['newPricePerHour','newPricePerDay','newPricePerMonth'];
        setConfigPrices(cur => cur.map(item =>
            item.id !== id ? item : {
                ...item,
                [field]: numeric.includes(field) ? value.replace(/[^0-9]/g,'') : value,
                ...(field === 'type' ? emptyNewRates() : {}),
            }
        ));
        setMessage({ text:'', isError:false });
    };

    const handleAddConfig = () => {
        setConfigPrices(cur => [...cur, {
            id: `new-${Date.now()}`,
            vehicleType:'CAR', type:'HOURLY',
            pricePerHour:0, pricePerDay:0, pricePerMonth:0,
            createdAt:null, ...emptyNewRates(), isNew:true,
        }]);
        setMessage({ text:'', isError:false });
    };

    const handleDeleteConfig = async (id) => {
        const item = configPrices.find(i => i.id === id);
        if (item?.isNew) { setConfigPrices(c => c.filter(i => i.id !== id)); return; }
        if (!window.confirm('Bạn có chắc muốn xoá cấu hình giá này?')) return;
        try {
            await axios.delete(`${api_url}/api/pricing/${id}`);
            setMessage({ text:'Đã xoá cấu hình thành công.', isError:false });
            loadConfigPrices();
        } catch (err) {
            setMessage({ text:'Lỗi khi xoá cấu hình. Vui lòng thử lại.', isError:true });
        }
    };

    const buildPayload = (item) => {
        const nf  = TYPE_TO_NEW_FIELD[item.type];
        const f   = TYPE_TO_FIELD[item.type];
        const val = item[nf]?.trim() !== '' ? Number(item[nf]) : item[f];
        return {
            vehicleType: item.vehicleType,
            type: item.type,
            pricePerHour:  item.type==='HOURLY'  ? val : item.pricePerHour,
            pricePerDay:   item.type==='DAILY'   ? val : item.pricePerDay,
            pricePerMonth: item.type==='MONTHLY' ? val : item.pricePerMonth,
        };
    };

    const hasChanges = (item) =>
        item.newPricePerHour.trim()!=='' ||
        item.newPricePerDay.trim()!==''  ||
        item.newPricePerMonth.trim()!=='' ||
        item.isNew;

    const handleApplyPrices = async () => {
        const changed = configPrices.filter(hasChanges);
        if (changed.length === 0) { setMessage({ text:'Chưa có giá mới để cập nhật.', isError:false }); return; }
        for (const item of changed) {
            const val = item[TYPE_TO_NEW_FIELD[item.type]]?.trim();
            if (item.isNew && (!val || Number(val) <= 0)) {
                setMessage({ text:'Vui lòng nhập giá hợp lệ (> 0) cho tất cả cấu hình mới.', isError:true });
                return;
            }
        }
        try {
            await Promise.all(changed.map(item =>
                (item.isNew || `${item.id}`.startsWith('new-'))
                    ? axios.post(`${api_url}/api/pricing`, buildPayload(item))
                    : axios.put(`${api_url}/api/pricing/${item.id}`, buildPayload(item))
            ));
            setMessage({ text:'✓ Giá đã được cập nhật thành công.', isError:false });
            loadConfigPrices();
        } catch (err) {
            setMessage({ text:'Lỗi khi lưu giá lên server. Vui lòng thử lại.', isError:true });
        }
    };

    const handleResetForm = () => { loadConfigPrices(); setMessage({ text:'Đã tải lại dữ liệu từ backend.', isError:false }); };

    const getCurrentPrice = (item) => item[TYPE_TO_FIELD[item.type]] || 0;
    const getNewPrice     = (item) => item[TYPE_TO_NEW_FIELD[item.type]] || '';
    const getNewFieldKey  = (item) => TYPE_TO_NEW_FIELD[item.type];

    return (
        <div>
            <div className="configprice-page">
                <div className="configprice-wrapper">
                    <div className="configprice-box">

                        <div className="configprice-header">
                            <img src={bkLogo} alt="BK Logo" className="configprice-logo" />
                            <h1>Bảng Điều Chỉnh Giá Gửi Xe</h1>
                            <p className="configprice-intro">
                            
                            </p>
                        </div>

                        {!showEditor && (
                            <div className="configprice-open-action">
                                <button className="cp-btn cp-btn-primary" onClick={() => setShowEditor(true)}>
                                    Mở bảng sửa giá
                                </button>
                            </div>
                        )}

                        {showEditor && (
                            <>
                                <div className="configprice-actions">
                                    <button className="cp-btn cp-btn-primary"  onClick={handleAddConfig}>+ Thêm cấu hình</button>
                                    <button className="cp-btn cp-btn-outline"  onClick={handleApplyPrices}>Cập nhật giá</button>
                                    <button className="cp-btn cp-btn-neutral"  onClick={handleResetForm}>Đặt lại</button>
                                    <button className="cp-btn cp-btn-ghost"    onClick={() => setShowEditor(false)}>Đóng bảng</button>
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
                                                <th>#</th>
                                                <th>Loại xe</th>
                                                <th>Loại giá</th>
                                                <th>Giá hiện tại</th>
                                                <th>Giá mới</th>
                                                <th>Xem trước</th>
                                                <th></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {loading ? (
                                                <tr><td colSpan="7" className="configprice-center-cell">
                                                    <span className="cp-loading">Đang tải dữ liệu...</span>
                                                </td></tr>
                                            ) : configPrices.length === 0 ? (
                                                <tr><td colSpan="7" className="configprice-center-cell">
                                                    Chưa có cấu hình giá. Nhấn <strong>+ Thêm cấu hình</strong> để bắt đầu.
                                                </td></tr>
                                            ) : configPrices.map((item, idx) => {
                                                const cur     = getCurrentPrice(item);
                                                const newVal  = getNewPrice(item);
                                                const preview = newVal.trim()!=='' ? Number(newVal) : cur;
                                                const changed = newVal.trim()!=='';
                                                return (
                                                    <tr key={item.id} className={[item.isNew?'cp-row-new':'', changed?'cp-row-changed':''].join(' ').trim()}>
                                                        <td className="cp-idx">{idx+1}</td>
                                                        <td>
                                                            <select value={item.vehicleType} onChange={e=>handleChange(item.id,'vehicleType',e.target.value)} className="cp-select">
                                                                {Object.keys(VEHICLE_LABELS).map(t=><option key={t} value={t}>{VEHICLE_LABELS[t]}</option>)}
                                                            </select>
                                                        </td>
                                                        <td>
                                                            <select value={item.type} onChange={e=>handleChange(item.id,'type',e.target.value)} className="cp-select">
                                                                {Object.keys(PRICING_TYPE_LABELS).map(t=><option key={t} value={t}>{PRICING_TYPE_LABELS[t]}</option>)}
                                                            </select>
                                                        </td>
                                                        <td className="cp-price-current">
                                                            <span>{formatVnd(cur)}</span>
                                                            <small className="cp-unit">{TYPE_UNIT_LABEL[item.type]}</small>
                                                        </td>
                                                        <td>
                                                            <input
                                                                type="text"
                                                                value={newVal}
                                                                placeholder={`Nhập giá (${TYPE_UNIT_LABEL[item.type]})`}
                                                                onChange={e=>handleChange(item.id, getNewFieldKey(item), e.target.value)}
                                                                className={`cp-input${changed?' cp-input-active':''}`}
                                                            />
                                                        </td>
                                                        <td>
                                                            <span className={`cp-preview${changed?' cp-preview-changed':''}`}>
                                                                {formatVnd(preview)}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <button className="cp-btn cp-btn-danger cp-btn-sm" onClick={()=>handleDeleteConfig(item.id)}>
                                                                Xoá
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
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