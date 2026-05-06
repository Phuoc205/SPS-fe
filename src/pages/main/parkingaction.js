import React, { useEffect, useMemo, useState } from 'react';
import Header from '../../components/header';
import Footer from '../../components/footer';
import './css/parkingaction.css';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const PARKING_LOTS_API = `${API_BASE}/api/parking-lots`;
const SLOTS_API = `${API_BASE}/api/slots`;

const PARKING_META = {
  1: {
    shortName: 'BX1',
    type: 'Xe máy',
    openTime: '06:00 - 22:00',
    price: '3.000đ/lượt',
    color: '#2f80ed',
    note: 'Bãi chính, phù hợp sinh viên đi học tại các khu H1, H2, H3.',
    directions: [
      'Đi vào từ cổng xe máy phía trên bên phải.',
      'Di chuyển dọc theo đường trên cùng.',
      'Bãi giữ xe 1 nằm phía trên cụm H1, H2, H3.'
    ],
    mapClass: 'parking-1'
  },
  2: {
    shortName: 'BX2',
    type: 'Xe máy',
    openTime: '06:00 - 22:00',
    price: '3.000đ/lượt',
    color: '#27ae60',
    note: 'Thuận tiện cho người đi từ phía Tạ Quang Bửu.',
    directions: [
      'Đi vào từ đường Tạ Quang Bửu phía dưới.',
      'Di chuyển lên khu bên phải bản đồ.',
      'Bãi giữ xe 2 nằm ở phía dưới bên phải.'
    ],
    mapClass: 'parking-2'
  },
  3: {
    shortName: 'ÔT',
    type: 'Ô tô',
    openTime: '06:00 - 21:30',
    price: '3.000đ/lượt',
    color: '#bb6bd9',
    note: 'Bãi ô tô gần H6.',
    directions: [
      'Đi theo đường ngang giữa bản đồ.',
      'Bãi ô tô nằm bên trái H6.'
    ],
    mapClass: 'parking-car'
  }
};

const DEFAULT_META = {
  shortName: 'BX',
  type: 'Chưa xác định',
  openTime: '06:00 - 22:00',
  price: 'Chưa cấu hình',
  color: '#64748b',
  note: 'Thông tin mô tả đang được cập nhật.',
  directions: ['Chọn bãi xe trên bản đồ để xem chi tiết.'],
  mapClass: 'parking-1'
};

const normalizeText = (value) =>
  String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();

const isAvailableStatus = (status) => {
  const normalized = normalizeText(status);
  return ['available', 'free', 'vacant', 'empty', 'trong', 'con trong'].includes(normalized);
};

const isMaintenanceStatus = (status) => {
  const normalized = normalizeText(status);
  return ['maintenance', 'inactive', 'bao tri', 'under maintenance'].includes(normalized);
};

const buildParkingAreas = (lots, slots) => {
  const safeLots = Array.isArray(lots) ? lots : [];
  const safeSlots = Array.isArray(slots) ? slots : [];

  return safeLots.map((lot, index) => {
    const lotId = Number(lot?.id);
    const meta = PARKING_META[lotId] || {
      ...DEFAULT_META,
      shortName: `BX${index + 1}`
    };

    const lotSlots = safeSlots.filter((slot) => Number(slot?.parkingLotId) === lotId);
    const totalSlots = lotSlots.length;
    const available = lotSlots.filter((slot) => isAvailableStatus(slot?.status)).length;
    const maintenanceSlots = lotSlots.filter((slot) => isMaintenanceStatus(slot?.status)).length;
    const occupied = Math.max(totalSlots - available - maintenanceSlots, 0);

    return {
      id: lotId,
      name: lot?.name || `Bãi xe ${lotId}`,
      shortName: meta.shortName,
      type: meta.type,
      location: lot?.location || 'Chưa có vị trí',
      capacity: totalSlots,
      available,
      occupied,
      maintenanceSlots,
      statusText: totalSlots > 0 ? 'Đang hoạt động' : 'Chưa có dữ liệu chỗ đỗ',
      isMaintenance: false,
      openTime: meta.openTime,
      price: meta.price,
      color: meta.color,
      note:
        totalSlots > 0
          ? meta.note
          : 'Bãi xe đã có trong hệ thống nhưng hiện chưa có slot nào được trả về từ API /api/slots.',
      directions: meta.directions,
      mapClass: meta.mapClass,
      slotNames: lotSlots.map((slot) => slot?.name).filter(Boolean)
    };
  });
};

const ParkingAction = () => {
  const [parkingAreas, setParkingAreas] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchParkingData = async () => {
      try {
        setLoading(true);
        setError('');

        const [lotsResponse, slotsResponse] = await Promise.all([
          fetch(PARKING_LOTS_API),
          fetch(SLOTS_API)
        ]);

        if (!lotsResponse.ok) {
          throw new Error(`Không tải được parking lots: HTTP ${lotsResponse.status}`);
        }

        if (!slotsResponse.ok) {
          throw new Error(`Không tải được slots: HTTP ${slotsResponse.status}`);
        }

        const lotsData = await lotsResponse.json();
        const slotsData = await slotsResponse.json();
        const mappedAreas = buildParkingAreas(lotsData, slotsData);

        setParkingAreas(mappedAreas);
        setSelectedId(mappedAreas[0]?.id ?? null);
      } catch (err) {
        console.error('Lỗi tải dữ liệu bãi xe:', err);
        setError('Không thể tải dữ liệu bãi xe từ backend. Hãy kiểm tra /api/parking-lots và /api/slots.');
      } finally {
        setLoading(false);
      }
    };

    fetchParkingData();
  }, []);

  const selectedArea = useMemo(
    () => parkingAreas.find((area) => area.id === selectedId) || parkingAreas[0] || null,
    [parkingAreas, selectedId]
  );

  const occupancyPercent =
    selectedArea && selectedArea.capacity > 0
      ? Math.round((selectedArea.occupied / selectedArea.capacity) * 100)
      : 0;

  const getParkingClass = (id, baseClass) =>
    `parking ${baseClass} ${selectedId === id ? 'active' : ''}`;

  const bx1 = parkingAreas.find((area) => area.mapClass === 'parking-1');
  const bx2 = parkingAreas.find((area) => area.mapClass === 'parking-2');
  const car = parkingAreas.find((area) => area.mapClass === 'parking-car');

  if (loading) {
    return (
      <div className="parkinglot-main-wrapper">
        <Header />
        <main className="parkinglot-page">
          <section className="parkinglot-content parkinglot-content-nohero">
            <p>Đang tải dữ liệu bãi xe...</p>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="parkinglot-main-wrapper">
        <Header />
        <main className="parkinglot-page">
          <section className="parkinglot-content parkinglot-content-nohero">
            <p style={{ color: 'red' }}>{error}</p>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  if (!selectedArea) {
    return (
      <div className="parkinglot-main-wrapper">
        <Header />
        <main className="parkinglot-page">
          <section className="parkinglot-content parkinglot-content-nohero">
            <p>Chưa có dữ liệu bãi xe.</p>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="parkinglot-main-wrapper">
      <Header />

      <main className="parkinglot-page">
        <section className="parkinglot-content parkinglot-content-nohero">
          <div className="parkinglot-layout">
            <div className="parkinglot-map-card">
              <div className="parkinglot-legend">
                {parkingAreas.map((area) => (
                  <button
                    key={area.id}
                    type="button"
                    className={`legend-chip ${selectedId === area.id ? 'active' : ''}`}
                    onClick={() => setSelectedId(area.id)}
                    style={{ '--chip-color': area.color }}
                  >
                    <span className="legend-dot" />
                    {area.name}
                  </button>
                ))}
              </div>

              <div className="campus-map-shell">
                <div className="map-scale-frame">
                  <div className="map">
                    <div className="road r-top"></div>
                    <div className="road r-bottom"></div>
                    <div className="road r-h-mid"></div>
                    <div className="road r-v-main"></div>
                    <div className="road r-v-left"></div>
                    <div className="road r-v-right"></div>

                    <div className="forest">
                      <div className="tree-slot"></div>
                      <div className="tree-slot"></div>
                    </div>

                    <div className="map-text map-text-top">Thomas Edison</div>
                    <div className="map-text map-text-bottom">Tạ Quang Bửu</div>
                    <div className="map-text gate-motor">Cổng xe máy</div>

                    <div className="b h1">
                      <div className="core"></div>
                      <span className="label">H1</span>
                    </div>

                    <div className="b h2">
                      <div className="core"></div>
                      <span className="label">H2</span>
                    </div>

                    <div className="b h3">
                      <div className="core"></div>
                      <span className="label">H3</span>
                    </div>

                    <div className="b tdtt">
                      <span className="label">TDTT</span>
                    </div>

                    <div className="b h6">
                      <span className="label">H6</span>
                    </div>

                    {bx1 && (
                      <button
                        type="button"
                        className={getParkingClass(bx1.id, 'parking-1')}
                        onClick={() => setSelectedId(bx1.id)}
                        aria-label={`Xem chi tiết ${bx1.name}`}
                      >
                        <span className="parking-badge">{bx1.shortName}</span>
                        <span className="parking-text">{bx1.name}</span>
                      </button>
                    )}

                    {bx2 && (
                      <button
                        type="button"
                        className={getParkingClass(bx2.id, 'parking-2')}
                        onClick={() => setSelectedId(bx2.id)}
                        aria-label={`Xem chi tiết ${bx2.name}`}
                      >
                        <span className="parking-badge">{bx2.shortName}</span>
                        <span className="parking-text">{bx2.name}</span>
                      </button>
                    )}

                    {car && (
                      <button
                        type="button"
                        className={getParkingClass(car.id, 'parking-car')}
                        onClick={() => setSelectedId(car.id)}
                        aria-label={`Xem chi tiết ${car.name}`}
                      >
                        <span className="parking-badge">{car.shortName}</span>
                        <span className="parking-text">{car.name}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <aside className="parkinglot-detail-card">
              <p className="parkinglot-kicker">Đang chọn</p>
              <h2>{selectedArea.name}</h2>

              <div className="detail-stat-grid">
                <div className="detail-stat-box">
                  <span>Loại xe</span>
                  <strong>{selectedArea.type}</strong>
                </div>
                <div className="detail-stat-box">
                  <span>Vị trí</span>
                  <strong>{selectedArea.location}</strong>
                </div>
                <div className="detail-stat-box">
                  <span>Sức chứa</span>
                  <strong>{selectedArea.capacity} chỗ</strong>
                </div>
                <div className="detail-stat-box">
                  <span>Chỗ trống</span>
                  <strong>{selectedArea.available} chỗ</strong>
                </div>
              </div>

              <div className="detail-stat-grid">
                <div className="detail-stat-box">
                  <span>Đang chiếm dụng</span>
                  <strong>{selectedArea.occupied} chỗ</strong>
                </div>
                <div className="detail-stat-box">
                  <span>Đang bảo trì</span>
                  <strong>{selectedArea.maintenanceSlots} chỗ</strong>
                </div>
              </div>

              <div className="detail-section">
                <div className="progress-title-row">
                  <h3>Mức độ sử dụng</h3>
                  <span>{occupancyPercent}%</span>
                </div>
                <div className="occupancy-track">
                  <div
                    className="occupancy-fill"
                    style={{
                      width: `${occupancyPercent}%`,
                      background: selectedArea.color
                    }}
                  />
                </div>
              </div>

              <div className="detail-section">
                <h3>Thông tin</h3>
                <ul className="detail-list">
                  <li><strong>Giờ hoạt động:</strong> {selectedArea.openTime}</li>
                  <li><strong>Giá gửi:</strong> {selectedArea.price}</li>
                  <li><strong>Trạng thái:</strong> {selectedArea.statusText}</li>
                  <li><strong>Ghi chú:</strong> {selectedArea.note}</li>
                </ul>
              </div>

              <div className="detail-section">
                <h3>Danh sách slot</h3>
                {selectedArea.slotNames.length > 0 ? (
                  <div className="detail-list">
                    {selectedArea.slotNames.join(', ')}
                  </div>
                ) : (
                  <p>Chưa có slot nào được trả về từ backend.</p>
                )}
              </div>

              <div className="detail-section">
                <h3>Điều hướng</h3>
                <ol className="direction-list">
                  {selectedArea.directions.map((step, index) => (
                    <li key={`${selectedArea.id}-${index}`}>{step}</li>
                  ))}
                </ol>
              </div>
            </aside>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ParkingAction;
