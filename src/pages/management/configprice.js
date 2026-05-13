import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './css/configprice.css';
 
const API_URL = process.env.REACT_APP_API_URL;
 
/* ─── lookup tables ──────────────────────────────────────────── */
const ROLE_LABELS = {
    CUSTOMER: 'Khách hàng',
    RESIDENT: 'Cư dân',
    STUDENT:  'Sinh viên',
    STAFF:    'Nhân viên',
};
 
const VEHICLE_LABELS = {
    CAR:  'Ô tô',
    MOTORBIKE: 'Xe máy',
};
 
const PLAN_LABELS = {
    HOURLY:  'Theo giờ',
    DAILY:   'Theo ngày',
    WEEKLY:  'Theo tuần',
    MONTHLY: 'Theo tháng',
};
 
const PLAN_UNIT = {
    HOURLY:  'giờ',
    DAILY:   'ngày',
    WEEKLY:  'tuần',
    MONTHLY: 'tháng',
};
 
const PLAN_ICONS  = { HOURLY:'⏱', DAILY:'📅', WEEKLY:'🗓', MONTHLY:'📆' };
const VEHICLE_ICONS = { CAR: '🚗', MOTORBIKE: '🏍' };
 
/* ─── helpers ────────────────────────────────────────────────── */
const fmt  = (n) => Number(n || 0).toLocaleString('vi-VN') + ' ₫';
const newId = () => `new-${Date.now()}-${Math.random().toString(36).slice(2)}`;
 
const emptyRow = () => ({
    _id:           newId(),
    isNew:         true,
    userRole:      'CUSTOMER',
    vehicleType:   'CAR',
    planType:      'HOURLY',
    price:         '',
    durationValue: '1',
    active:        true,
});
 
/* ════════════════════════════════════════════════════════════════
   Main component
════════════════════════════════════════════════════════════════ */
const ConfigPrice = () => {
    const [rows,       setRows]       = useState([]);
    const [loading,    setLoading]    = useState(true);
    const [saving,     setSaving]     = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [toast,      setToast]      = useState(null);
    const [filter,     setFilter]     = useState({ vehicleType:'', planType:'', active:'' });
 
    /* toast auto-dismiss */
    useEffect(() => {
        if (!toast) return;
        const t = setTimeout(() => setToast(null), 3500);
        return () => clearTimeout(t);
    }, [toast]);
 
    const notify = (text, type = 'ok') => setToast({ text, type });
 
    /* ── load ── */
    const load = async () => {
        setLoading(true);
        try {
            const res  = await axios.get(`${API_URL}/pricing`);
            const data = Array.isArray(res.data) ? res.data : [];
            setRows(data.map(r => ({
                ...r,
                _id:           r.id,
                isNew:         false,
                price:         String(r.price         ?? ''),
                durationValue: String(r.durationValue ?? '1'),
            })));
        } catch {
            notify('Không thể tải dữ liệu từ server.', 'err');
            setRows([]);
        } finally {
            setLoading(false);
        }
    };
 
    useEffect(() => { load(); }, []);
 
    /* ── helpers ── */
    const change = (_id, field, value) =>
        setRows(cur => cur.map(r => r._id !== _id ? r : { ...r, [field]: value }));
 
    const addRow = () => setRows(cur => [emptyRow(), ...cur]);
 
    const removeRow = async (_id) => {
        const row = rows.find(r => r._id === _id);
        if (!row) return;
        if (row.isNew) { setRows(cur => cur.filter(r => r._id !== _id)); return; }
        if (!window.confirm('Xoá cấu hình giá này?')) return;
        setDeletingId(_id);
        try {
            await axios.delete(`${API_URL}/pricing/${row.id}`);
            notify('Đã xoá cấu hình.');
            load();
        } catch {
            notify('Lỗi khi xoá. Vui lòng thử lại.', 'err');
        } finally {
            setDeletingId(null);
        }
    };
 
    const toggleActive = async (row) => {
        if (row.isNew) { change(row._id, 'active', !row.active); return; }
        try {
            await axios.put(`${API_URL}/pricing/${row.id}`, {
                userRole:      row.userRole,
                vehicleType:   row.vehicleType,
                planType:      row.planType,
                price:         Number(row.price),
                durationValue: Number(row.durationValue),
                active:        !row.active,
            });
            notify(`${!row.active ? 'Đã kích hoạt' : 'Đã tắt'} cấu hình.`);
            load();
        } catch {
            notify('Lỗi khi cập nhật trạng thái.', 'err');
        }
    };
 
    const validate = (row) => {
        if (!row.price || Number(row.price) <= 0)         return 'Giá phải lớn hơn 0';
        if (!row.durationValue || Number(row.durationValue) <= 0) return 'Thời hạn phải lớn hơn 0';
        return null;
    };
 
    /* save all NEW rows */
    const saveAllNew = async () => {
        const newRows = rows.filter(r => r.isNew);
        if (!newRows.length) { notify('Không có cấu hình mới để lưu.'); return; }
        for (const r of newRows) {
            const err = validate(r);
            if (err) { notify(`[${VEHICLE_LABELS[r.vehicleType]} - ${PLAN_LABELS[r.planType]}] ${err}`, 'err'); return; }
        }
        setSaving(true);
        try {
            await Promise.all(newRows.map(r =>
                axios.post(`${API_URL}/pricing`, {
                    userRole:      r.userRole,
                    vehicleType:   r.vehicleType,
                    planType:      r.planType,
                    price:         Number(r.price),
                    durationValue: Number(r.durationValue),
                    active:        r.active,
                })
            ));
            notify(`✓ Đã lưu ${newRows.length} cấu hình mới.`);
            load();
        } catch {
            notify('Lỗi khi lưu lên server.', 'err');
        } finally {
            setSaving(false);
        }
    };
 
    /* save single existing row */
    const saveRow = async (row) => {
        const err = validate(row);
        if (err) { notify(err, 'err'); return; }
        setSaving(true);
        try {
            await axios.put(`${API_URL}/pricing/${row.id}`, {
                userRole:      row.userRole,
                vehicleType:   row.vehicleType,
                planType:      row.planType,
                price:         Number(row.price),
                durationValue: Number(row.durationValue),
                active:        row.active,
            });
            notify('✓ Đã cập nhật cấu hình.');
            load();
        } catch {
            notify('Lỗi khi cập nhật.', 'err');
        } finally {
            setSaving(false);
        }
    };
 
    /* filtered view */
    const visible = rows.filter(r => {
        if (filter.vehicleType && r.vehicleType !== filter.vehicleType) return false;
        if (filter.planType    && r.planType    !== filter.planType)    return false;
        if (filter.active === 'true'  && !r.active)  return false;
        if (filter.active === 'false' &&  r.active)  return false;
        return true;
    });
 
    const newRows     = rows.filter(r => r.isNew);
    const savedRows   = rows.filter(r => !r.isNew);
    const activeCnt   = savedRows.filter(r => r.active).length;
    const inactiveCnt = savedRows.filter(r => !r.active).length;
 
    /* ── render ── */
    return (
        <div className="cp-root">
 
            {/* ── toast ── */}
            {toast && (
                <div className={`cp-toast cp-toast--${toast.type}`}>
                    <span>{toast.text}</span>
                    <button className="cp-toast__close" onClick={() => setToast(null)}>✕</button>
                </div>
            )}
 
            {/* ── page header ── */}
            <header className="cp-header">
                <div className="cp-header__left">
                    <div className="cp-header__icon">₫</div>
                    <div>
                        <h1 className="cp-title">Bảng Cấu Hình Giá</h1>
                        <p className="cp-subtitle">Quản lý giá gửi xe theo loại phương tiện, gói dịch vụ và nhóm khách hàng</p>
                    </div>
                </div>
                <div className="cp-header__stats">
                    <div className="cp-stat">
                        <span className="cp-stat__num">{savedRows.length}</span>
                        <span className="cp-stat__lbl">Tổng</span>
                    </div>
                    <div className="cp-stat cp-stat--ok">
                        <span className="cp-stat__num">{activeCnt}</span>
                        <span className="cp-stat__lbl">Đang dùng</span>
                    </div>
                    <div className="cp-stat cp-stat--off">
                        <span className="cp-stat__num">{inactiveCnt}</span>
                        <span className="cp-stat__lbl">Đã tắt</span>
                    </div>
                </div>
            </header>
 
            {/* ── toolbar ── */}
            <div className="cp-toolbar">
                <div className="cp-filters">
                    <select className="cp-select"
                        value={filter.vehicleType}
                        onChange={e => setFilter(f => ({...f, vehicleType: e.target.value}))}>
                        <option value="">🚘 Tất cả xe</option>
                        {Object.entries(VEHICLE_LABELS).map(([k,v]) =>
                            <option key={k} value={k}>{VEHICLE_ICONS[k]} {v}</option>)}
                    </select>
 
                    <select className="cp-select"
                        value={filter.planType}
                        onChange={e => setFilter(f => ({...f, planType: e.target.value}))}>
                        <option value="">📋 Tất cả gói</option>
                        {Object.entries(PLAN_LABELS).map(([k,v]) =>
                            <option key={k} value={k}>{PLAN_ICONS[k]} {v}</option>)}
                    </select>
 
                    <select className="cp-select"
                        value={filter.active}
                        onChange={e => setFilter(f => ({...f, active: e.target.value}))}>
                        <option value="">🔘 Tất cả TT</option>
                        <option value="true">✅ Đang dùng</option>
                        <option value="false">⛔ Đã tắt</option>
                    </select>
                </div>
 
                <div className="cp-actions">
                    {newRows.length > 0 && (
                        <button className="cp-btn cp-btn--save" onClick={saveAllNew} disabled={saving}>
                            {saving ? '⏳ Đang lưu…' : `💾 Lưu ${newRows.length} hàng mới`}
                        </button>
                    )}
                    <button className="cp-btn cp-btn--add" onClick={addRow}>
                        + Thêm cấu hình
                    </button>
                    <button className="cp-btn cp-btn--reload" onClick={load} title="Tải lại">↺</button>
                </div>
            </div>
 
            {/* ── table ── */}
            <div className="cp-table-wrap">
                {loading ? (
                    <div className="cp-loading">
                        <div className="cp-spinner" />
                        <span>Đang tải dữ liệu…</span>
                    </div>
                ) : visible.length === 0 ? (
                    <div className="cp-empty">
                        <div className="cp-empty__icon">📋</div>
                        <p>Chưa có cấu hình nào phù hợp.</p>
                        <button className="cp-btn cp-btn--add" onClick={addRow}>+ Thêm ngay</button>
                    </div>
                ) : (
                    <table className="cp-table">
                        <thead>
                            <tr>
                                <th style={{width:48}}>#</th>
                                <th>Loại xe</th>
                                <th>Gói dịch vụ</th>
                                <th>Nhóm KH</th>
                                <th>Thời hạn</th>
                                <th>Đơn giá</th>
                                <th style={{width:110}}>Trạng thái</th>
                                <th style={{width:140}}>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {visible.map((row, idx) => (
                                <PricingRow
                                    key={row._id}
                                    row={row}
                                    idx={idx + 1}
                                    planUnit={PLAN_UNIT}
                                    vehicleLabels={VEHICLE_LABELS}
                                    vehicleIcons={VEHICLE_ICONS}
                                    planLabels={PLAN_LABELS}
                                    planIcons={PLAN_ICONS}
                                    roleLabels={ROLE_LABELS}
                                    fmt={fmt}
                                    onChange={change}
                                    onRemove={removeRow}
                                    onSave={saveRow}
                                    onToggle={toggleActive}
                                    deleting={deletingId === row._id}
                                    saving={saving}
                                />
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};
 
/* ════════════════════════════════════════════════════════════════
   PricingRow sub-component
════════════════════════════════════════════════════════════════ */
const PricingRow = ({
    row, idx, planUnit, vehicleLabels, vehicleIcons,
    planLabels, planIcons, roleLabels, fmt,
    onChange, onRemove, onSave, onToggle, deleting, saving,
}) => {
    const [editing, setEditing] = useState(row.isNew);
 
    const handleSave = async () => {
        await onSave(row);
        setEditing(false);
    };
 
    return (
        <tr className={[
            row.isNew   ? 'cp-tr--new'      : '',
            !row.active ? 'cp-tr--inactive' : '',
            editing     ? 'cp-tr--editing'  : '',
        ].filter(Boolean).join(' ')}>
 
            {/* # */}
            <td className="cp-td--idx">
                {row.isNew
                    ? <span className="cp-badge cp-badge--new">NEW</span>
                    : <span className="cp-idx-num">{idx}</span>
                }
            </td>
 
            {/* vehicle */}
            <td>
                {editing ? (
                    <select className="cp-select cp-select--sm"
                        value={row.vehicleType}
                        onChange={e => onChange(row._id, 'vehicleType', e.target.value)}>
                        {Object.entries(vehicleLabels).map(([k,v]) =>
                            <option key={k} value={k}>{vehicleIcons[k]} {v}</option>)}
                    </select>
                ) : (
                    <span className={`cp-chip cp-chip--${row.vehicleType.toLowerCase()}`}>
                        {vehicleIcons[row.vehicleType]} {vehicleLabels[row.vehicleType]}
                    </span>
                )}
            </td>
 
            {/* plan */}
            <td>
                {editing ? (
                    <select className="cp-select cp-select--sm"
                        value={row.planType}
                        onChange={e => onChange(row._id, 'planType', e.target.value)}>
                        {Object.entries(planLabels).map(([k,v]) =>
                            <option key={k} value={k}>{planIcons[k]} {v}</option>)}
                    </select>
                ) : (
                    <span className="cp-plan-tag">
                        {planIcons[row.planType]} {planLabels[row.planType]}
                    </span>
                )}
            </td>
 
            {/* role */}
            <td>
                {editing ? (
                    <select className="cp-select cp-select--sm"
                        value={row.userRole}
                        onChange={e => onChange(row._id, 'userRole', e.target.value)}>
                        {Object.entries(roleLabels).map(([k,v]) =>
                            <option key={k} value={k}>{v}</option>)}
                    </select>
                ) : (
                    <span className="cp-role-tag">{roleLabels[row.userRole] ?? row.userRole}</span>
                )}
            </td>
 
            {/* duration */}
            <td>
                {editing ? (
                    <div className="cp-inline-group">
                        <input type="number" min="1"
                            className="cp-input cp-input--sm"
                            value={row.durationValue}
                            onChange={e => onChange(row._id, 'durationValue', e.target.value)} />
                        <span className="cp-unit-label">{planUnit[row.planType]}</span>
                    </div>
                ) : (
                    <span className="cp-duration">
                        {row.durationValue} <span className="cp-unit-label">{planUnit[row.planType]}</span>
                    </span>
                )}
            </td>
 
            {/* price */}
            <td className="cp-td--price">
                {editing ? (
                    <div className="cp-inline-group">
                        <input type="text"
                            className="cp-input cp-input--price"
                            value={row.price}
                            placeholder="VD: 20000"
                            onChange={e => onChange(row._id, 'price', e.target.value.replace(/[^0-9]/g, ''))} />
                        <span className="cp-unit-label">₫</span>
                    </div>
                ) : (
                    <strong className="cp-price">{fmt(row.price)}</strong>
                )}
            </td>
 
            {/* active toggle */}
            <td>
                <button
                    className={`cp-toggle ${row.active ? 'cp-toggle--on' : 'cp-toggle--off'}`}
                    onClick={() => onToggle(row)}
                    title={row.active ? 'Nhấn để tắt' : 'Nhấn để bật'}>
                    <span className="cp-toggle__track">
                        <span className="cp-toggle__knob" />
                    </span>
                    <span className="cp-toggle__lbl">{row.active ? 'Dùng' : 'Tắt'}</span>
                </button>
            </td>
 
            {/* actions */}
            <td className="cp-td--actions">
                {row.isNew ? (
                    <button className="cp-btn-sm cp-btn-sm--ghost" onClick={() => onRemove(row._id)}>
                        ✕ Huỷ
                    </button>
                ) : editing ? (
                    <>
                        <button className="cp-btn-sm cp-btn-sm--confirm" onClick={handleSave} disabled={saving}>
                            ✓ Lưu
                        </button>
                        <button className="cp-btn-sm cp-btn-sm--ghost" onClick={() => setEditing(false)}>
                            ✕
                        </button>
                    </>
                ) : (
                    <>
                        <button className="cp-btn-sm cp-btn-sm--edit" onClick={() => setEditing(true)}>
                            ✎ Sửa
                        </button>
                        <button className="cp-btn-sm cp-btn-sm--del" onClick={() => onRemove(row._id)} disabled={deleting}>
                            {deleting ? '…' : '🗑'}
                        </button>
                    </>
                )}
            </td>
        </tr>
    );
};
 
export default ConfigPrice;