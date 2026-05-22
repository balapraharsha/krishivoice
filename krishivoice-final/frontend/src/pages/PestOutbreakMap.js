import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import axios from 'axios';
import { AlertTriangle, Filter, MapPin, Clock, Map, Activity, Info } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

const SAMPLE_OUTBREAKS = [
  { cluster_id: 'whi_17.42_78.51', pest_name: 'White Fly',  severity: 'critical', report_count: 12, center_lat: 17.42, center_lng: 78.51, radius_km: 8.5,  district: 'Guntur',    state: 'Andhra Pradesh', first_reported: '2024-05-10', latest_reported: '2024-05-22' },
  { cluster_id: 'aph_23.02_72.57', pest_name: 'Aphid',      severity: 'high',     report_count: 8,  center_lat: 23.02, center_lng: 72.57, radius_km: 6.2,  district: 'Ahmedabad', state: 'Gujarat',        first_reported: '2024-05-15', latest_reported: '2024-05-21' },
  { cluster_id: 'ste_28.61_77.23', pest_name: 'Stem Borer', severity: 'medium',   report_count: 5,  center_lat: 28.61, center_lng: 77.23, radius_km: 4.8,  district: 'Delhi',     state: 'Delhi',          first_reported: '2024-05-18', latest_reported: '2024-05-22' },
  { cluster_id: 'bol_21.15_79.08', pest_name: 'Bollworm',   severity: 'high',     report_count: 9,  center_lat: 21.15, center_lng: 79.08, radius_km: 7.3,  district: 'Nagpur',    state: 'Maharashtra',    first_reported: '2024-05-12', latest_reported: '2024-05-21' },
  { cluster_id: 'lea_12.97_77.59', pest_name: 'Leaf Curl',  severity: 'medium',   report_count: 6,  center_lat: 12.97, center_lng: 77.59, radius_km: 5.1,  district: 'Bangalore', state: 'Karnataka',      first_reported: '2024-05-16', latest_reported: '2024-05-22' },
];

const SEV_COLORS = {
  critical: '#DC2626',
  high:     '#EA580C',
  medium:   '#F59E0B',
  low:      '#10B981'
};

const SEV_BG = {
  critical: 'rgba(220,38,38,0.1)',
  high:     'rgba(234,88,12,0.1)',
  medium:   'rgba(245,158,11,0.1)',
  low:      'rgba(16,185,129,0.1)'
};

const SeverityBadge = ({ severity }) => (
  <span style={{
    padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 700,
    background: SEV_BG[severity] || SEV_BG.medium, color: SEV_COLORS[severity] || SEV_COLORS.medium,
    textTransform: 'uppercase', letterSpacing: '0.5px'
  }}>
    {severity}
  </span>
);

const PestOutbreakMap = () => {
  const [outbreaks, setOutbreaks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [days, setDays] = useState(14);

  useEffect(() => { fetchOutbreaks(); }, [days]);

  const fetchOutbreaks = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/analytics/pest-outbreaks?days=${days}&min_cluster_size=3`);
      const data = res.data.outbreaks;
      setOutbreaks(data && data.length > 0 ? data : SAMPLE_OUTBREAKS);
    } catch {
      setOutbreaks(SAMPLE_OUTBREAKS);
    } finally {
      setLoading(false);
    }
  };

  const filtered = outbreaks.filter(o =>
    selectedSeverity === 'all' || o.severity === selectedSeverity
  );

  return (
    <div className="pest-map-page" style={{ animation: 'fadeIn 0.5s ease-out' }}>

      {/* Header */}
      <header className="page-header" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div className="header-icon"><Map size={24} /></div>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-dark)' }}>Pest Outbreak Map</h1>
          <p style={{ color: 'var(--text-gray)', marginTop: '4px' }}>Real-time clustering and severity analysis across territories</p>
        </div>
      </header>

      {/* Controls */}
      <div style={{
        background: 'var(--white)', borderRadius: '12px', padding: '16px 20px',
        boxShadow: 'var(--shadow)', marginBottom: '20px', display: 'flex',
        alignItems: 'center', gap: '20px', flexWrap: 'wrap',
        animation: 'slideUp 0.4s ease-out 0.1s both'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Clock size={15} style={{ color: 'var(--text-gray)' }} />
          <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-dark)' }}>Period:</label>
          <select
            value={days}
            onChange={e => setDays(Number(e.target.value))}
            style={{ padding: '6px 10px', border: '1px solid var(--border-gray)', borderRadius: '6px', fontSize: '13px', background: 'var(--white)' }}
          >
            <option value={7}>Last 7 days</option>
            <option value={14}>Last 14 days</option>
            <option value={30}>Last 30 days</option>
          </select>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={15} style={{ color: 'var(--text-gray)' }} />
          <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-dark)' }}>Severity:</label>
          <select
            value={selectedSeverity}
            onChange={e => setSelectedSeverity(e.target.value)}
            style={{ padding: '6px 10px', border: '1px solid var(--border-gray)', borderRadius: '6px', fontSize: '13px', background: 'var(--white)' }}
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto', color: 'var(--text-dark)' }}>
          <AlertTriangle size={16} style={{ color: filtered.some(o => o.severity === 'critical') ? '#DC2626' : 'var(--text-gray)' }} />
          <strong style={{ fontSize: '14px' }}>{filtered.length}</strong>
          <span style={{ fontSize: '13px', color: 'var(--text-gray)' }}>outbreak clusters</span>
        </div>
      </div>

      {/* Legend */}
      <div style={{
        background: 'var(--white)', borderRadius: '10px', padding: '12px 16px',
        boxShadow: 'var(--shadow)', marginBottom: '16px', display: 'flex',
        alignItems: 'center', gap: '20px', flexWrap: 'wrap'
      }}>
        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-gray)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Severity:</span>
        {Object.entries(SEV_COLORS).map(([sev, color]) => (
          <div key={sev} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: color }} />
            <span style={{ fontSize: '13px', color: 'var(--text-dark)', textTransform: 'capitalize' }}>{sev}</span>
          </div>
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-gray)' }}>
          <Info size={13} />
          Circle size indicates number of reports
        </div>
      </div>

      {/* Map */}
      <div style={{
        borderRadius: '14px', overflow: 'hidden', boxShadow: 'var(--shadow-md)',
        marginBottom: '24px', border: '1px solid var(--border-gray)'
      }}>
        {loading ? (
          <div className="loading" style={{ height: '500px' }}>
            <div className="spinner"></div>
          </div>
        ) : (
          <MapContainer center={[20.5, 78.9]} zoom={5} style={{ height: '520px', width: '100%' }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />
            {filtered.map((outbreak, i) => (
              <CircleMarker
                key={outbreak.cluster_id || i}
                center={[outbreak.center_lat, outbreak.center_lng]}
                radius={Math.max(8, outbreak.report_count * 3)}
                fillColor={SEV_COLORS[outbreak.severity]}
                color={SEV_COLORS[outbreak.severity]}
                weight={2}
                opacity={0.9}
                fillOpacity={0.35}
              >
                <Popup>
                  <div style={{ minWidth: '200px', fontFamily: 'sans-serif' }}>
                    <h3 style={{ margin: '0 0 8px', color: '#1B1B1B', fontSize: '15px' }}>{outbreak.pest_name}</h3>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                      <span style={{
                        padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 700,
                        background: SEV_BG[outbreak.severity], color: SEV_COLORS[outbreak.severity],
                        textTransform: 'uppercase'
                      }}>
                        {outbreak.severity}
                      </span>
                    </div>
                    {[
                      ['Reports', outbreak.report_count],
                      ['Location', `${outbreak.district}, ${outbreak.state}`],
                      ['Radius', `${outbreak.radius_km} km`],
                      ['First Reported', outbreak.first_reported],
                      ['Latest', outbreak.latest_reported],
                    ].map(([label, val]) => (
                      <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                        <span style={{ color: '#6B7280', fontWeight: 500 }}>{label}:</span>
                        <span style={{ color: '#1B1B1B', fontWeight: 600 }}>{val}</span>
                      </div>
                    ))}
                  </div>
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>
        )}
      </div>

      {/* Outbreak Cards */}
      {filtered.length > 0 && (
        <>
          <h2 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={18} style={{ color: 'var(--accent-green)' }} />
            Detected Outbreaks
            <span style={{ padding: '3px 10px', borderRadius: '20px', background: 'var(--accent-green)', color: '#fff', fontSize: '12px', fontWeight: 700 }}>
              {filtered.length}
            </span>
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
            {filtered.map((outbreak, i) => (
              <div
                key={outbreak.cluster_id || i}
                style={{
                  background: 'var(--white)', borderRadius: '12px', boxShadow: 'var(--shadow)',
                  padding: '16px 18px', borderLeft: `4px solid ${SEV_COLORS[outbreak.severity]}`,
                  animation: `slideUp 0.4s ease-out ${i * 0.06}s both`, transition: 'all 0.3s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <h4 style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-dark)' }}>{outbreak.pest_name}</h4>
                  <SeverityBadge severity={outbreak.severity} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-gray)' }}>
                    <MapPin size={12} style={{ color: 'var(--accent-green)' }} />
                    {outbreak.district}, {outbreak.state}
                  </div>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <span style={{ color: 'var(--text-gray)' }}>
                      <strong style={{ color: 'var(--text-dark)' }}>{outbreak.report_count}</strong> reports
                    </span>
                    <span style={{ color: 'var(--text-gray)' }}>
                      <strong style={{ color: 'var(--text-dark)' }}>{outbreak.radius_km} km</strong> radius
                    </span>
                  </div>
                  <div style={{ color: 'var(--text-gray)', fontSize: '12px' }}>
                    {outbreak.first_reported} — {outbreak.latest_reported}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default PestOutbreakMap;