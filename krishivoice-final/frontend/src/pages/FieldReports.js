import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  FileText, Filter, AlertTriangle, CheckCircle, Clock,
  Sprout, Package, MapPin, Calendar, ChevronDown, Search,
  AlertCircle, Leaf, TrendingUp, Eye
} from 'lucide-react';

const SAMPLE_REPORTS = [
  {
    id: 'RPT-001A2B',
    transcription: 'Tomato crop showing severe white fly infestation across 3 acres. Leaves turning yellow and curling. Immediate intervention required.',
    crop: 'Tomato',
    pest_disease: 'White Fly',
    severity: 'high',
    date: '2024-05-22',
    product_recommended: 'Actara 25WG',
    location: 'Guntur, AP',
    rep_name: 'Ravi Kumar'
  },
  {
    id: 'RPT-002C3D',
    transcription: 'Rice paddy looks healthy. Normal growth stage. No pest or disease signs observed. Farmer satisfied with current crop condition.',
    crop: 'Rice',
    pest_disease: null,
    severity: 'low',
    date: '2024-05-21',
    product_recommended: null,
    location: 'Krishna, AP',
    rep_name: 'Suresh Rao'
  },
  {
    id: 'RPT-003E4F',
    transcription: 'Chili crop showing powdery mildew on lower leaves. About 20% of the crop affected. Medium severity, needs treatment soon.',
    crop: 'Chili',
    pest_disease: 'Powdery Mildew',
    severity: 'medium',
    date: '2024-05-20',
    product_recommended: 'Amistar Top',
    location: 'Prakasam, AP',
    rep_name: 'Lakshmi Devi'
  },
  {
    id: 'RPT-004G5H',
    transcription: 'Cotton bollworm detected in early flowering stage. Critical situation — 40% plants affected. Emergency treatment recommended immediately.',
    crop: 'Cotton',
    pest_disease: 'Bollworm',
    severity: 'critical',
    date: '2024-05-19',
    product_recommended: 'Coragen 20SC',
    location: 'Nalgonda, TS',
    rep_name: 'Venkat Reddy'
  },
  {
    id: 'RPT-005I6J',
    transcription: 'Groundnut crop in good condition. Farmer has applied fertilizer as recommended. Slight leaf spot visible but within acceptable range.',
    crop: 'Groundnut',
    pest_disease: 'Leaf Spot',
    severity: 'low',
    date: '2024-05-18',
    product_recommended: 'Kavach',
    location: 'Kurnool, AP',
    rep_name: 'Priya Sharma'
  },
  {
    id: 'RPT-006K7L',
    transcription: 'Maize crop showing signs of stem borer infestation. Dead hearts visible in approximately 15% of plants. Treatment needed.',
    crop: 'Maize',
    pest_disease: 'Stem Borer',
    severity: 'medium',
    date: '2024-05-17',
    product_recommended: 'Ampligo',
    location: 'Medak, TS',
    rep_name: 'Ravi Kumar'
  }
];

const severityConfig = {
  critical: { label: 'Critical', color: '#EF4444', bg: 'rgba(239,68,68,0.1)', icon: AlertTriangle },
  high:     { label: 'High',     color: '#F97316', bg: 'rgba(249,115,22,0.1)', icon: AlertCircle },
  medium:   { label: 'Medium',   color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', icon: Clock },
  low:      { label: 'Low',      color: '#10B981', bg: 'rgba(16,185,129,0.1)', icon: CheckCircle },
};

const SeverityBadge = ({ severity }) => {
  const cfg = severityConfig[severity] || severityConfig.low;
  const Icon = cfg.icon;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      padding: '4px 10px', borderRadius: '20px', fontSize: '12px',
      fontWeight: 700, background: cfg.bg, color: cfg.color,
      textTransform: 'uppercase', letterSpacing: '0.5px'
    }}>
      <Icon size={12} />
      {cfg.label}
    </span>
  );
};

const FieldReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => { fetchReports(); }, []);

  const fetchReports = async () => {
    try {
      const res = await axios.get('/api/reports?limit=50');
      const data = res.data.reports;
      setReports(data && data.length > 0 ? data : SAMPLE_REPORTS);
    } catch {
      setReports(SAMPLE_REPORTS);
    } finally {
      setLoading(false);
    }
  };

  const filtered = reports.filter(r => {
    const matchSev = severityFilter === 'all' || r.severity === severityFilter;
    const q = search.toLowerCase();
    const matchSearch = !q || r.crop?.toLowerCase().includes(q) ||
      r.pest_disease?.toLowerCase().includes(q) ||
      r.transcription?.toLowerCase().includes(q) ||
      r.location?.toLowerCase().includes(q);
    return matchSev && matchSearch;
  });

  const counts = {
    critical: reports.filter(r => r.severity === 'critical').length,
    high:     reports.filter(r => r.severity === 'high').length,
    medium:   reports.filter(r => r.severity === 'medium').length,
    low:      reports.filter(r => r.severity === 'low').length,
  };

  if (loading) return (
    <div className="loading">
      <div className="spinner"></div>
    </div>
  );

  return (
    <div className="reports-page" style={{ animation: 'fadeIn 0.5s ease-out' }}>
      {/* Header */}
      <header className="page-header" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div className="header-icon"><FileText size={24} /></div>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            Field Reports
          </h1>
          <p style={{ color: 'var(--text-gray)', marginTop: '4px' }}>
            {reports.length} reports — browse and analyze field observations
          </p>
        </div>
      </header>

      {/* Summary Badges */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap', animation: 'slideUp 0.5s ease-out' }}>
        {Object.entries(counts).map(([sev, count]) => {
          const cfg = severityConfig[sev];
          return (
            <button
              key={sev}
              onClick={() => setSeverityFilter(severityFilter === sev ? 'all' : sev)}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '8px 16px', borderRadius: '8px', border: `2px solid ${severityFilter === sev ? cfg.color : 'var(--border-gray)'}`,
                background: severityFilter === sev ? cfg.bg : 'var(--white)',
                color: severityFilter === sev ? cfg.color : 'var(--text-gray)',
                cursor: 'pointer', fontWeight: 600, fontSize: '13px',
                transition: 'all 0.2s ease'
              }}
            >
              <span style={{ fontSize: '18px', fontWeight: 700 }}>{count}</span>
              {cfg.label}
            </button>
          );
        })}
      </div>

      {/* Search + Filter Bar */}
      <div style={{
        display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap',
        background: 'var(--white)', padding: '16px', borderRadius: '12px',
        boxShadow: 'var(--shadow)', animation: 'slideUp 0.6s ease-out'
      }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-gray)' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by crop, pest, location..."
            style={{
              width: '100%', padding: '8px 12px 8px 36px',
              border: '1px solid var(--border-gray)', borderRadius: '8px',
              fontSize: '14px', outline: 'none', color: 'var(--text-dark)'
            }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={16} style={{ color: 'var(--text-gray)' }} />
          <select
            value={severityFilter}
            onChange={e => setSeverityFilter(e.target.value)}
            style={{
              padding: '8px 12px', border: '1px solid var(--border-gray)',
              borderRadius: '8px', fontSize: '14px', color: 'var(--text-dark)',
              background: 'var(--white)', cursor: 'pointer'
            }}
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
        <span style={{ display: 'flex', alignItems: 'center', color: 'var(--text-gray)', fontSize: '13px' }}>
          {filtered.length} result{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Reports List */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><FileText size={32} /></div>
          <p style={{ fontWeight: 600, color: 'var(--text-dark)' }}>No reports match your filters</p>
          <p style={{ fontSize: '14px', marginTop: '4px' }}>Try adjusting the search or severity filter</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filtered.map((report, index) => {
            const cfg = severityConfig[report.severity] || severityConfig.low;
            const isExpanded = expandedId === report.id;
            return (
              <div
                key={report.id || index}
                style={{
                  background: 'var(--white)', borderRadius: '12px',
                  boxShadow: 'var(--shadow)', borderLeft: `4px solid ${cfg.color}`,
                  overflow: 'hidden', transition: 'all 0.3s ease',
                  animation: `slideUp 0.4s ease-out ${index * 0.05}s both`,
                  transform: isExpanded ? 'none' : undefined,
                  boxShadow: isExpanded ? 'var(--shadow-lg)' : 'var(--shadow)'
                }}
              >
                {/* Card Header */}
                <div
                  style={{ padding: '16px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                  onClick={() => setExpandedId(isExpanded ? null : report.id)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
                    <div style={{
                      width: '40px', height: '40px', borderRadius: '10px',
                      background: cfg.bg, display: 'flex', alignItems: 'center',
                      justifyContent: 'center', color: cfg.color, flexShrink: 0
                    }}>
                      <Leaf size={20} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-dark)' }}>
                          {report.crop || 'Unknown Crop'}
                        </span>
                        {report.pest_disease && (
                          <span style={{ fontSize: '13px', color: 'var(--text-gray)' }}>
                            — {report.pest_disease}
                          </span>
                        )}
                        <SeverityBadge severity={report.severity} />
                      </div>
                      <div style={{ display: 'flex', gap: '16px', marginTop: '4px', flexWrap: 'wrap' }}>
                        {report.location && (
                          <span style={{ fontSize: '12px', color: 'var(--text-gray)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <MapPin size={11} /> {report.location}
                          </span>
                        )}
                        {report.date && (
                          <span style={{ fontSize: '12px', color: 'var(--text-gray)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Calendar size={11} /> {report.date}
                          </span>
                        )}
                        <span style={{ fontSize: '12px', color: 'var(--text-gray)', fontFamily: 'monospace' }}>
                          #{(report.id || `RPT-${index}`).toString().substring(0, 8)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <ChevronDown
                    size={18}
                    style={{ color: 'var(--text-gray)', transition: 'transform 0.3s ease', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', flexShrink: 0 }}
                  />
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div style={{ borderTop: '1px solid var(--border-gray)', padding: '16px 20px', animation: 'fadeIn 0.3s ease-out' }}>
                    <div style={{ marginBottom: '12px' }}>
                      <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-gray)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Field Observation
                      </p>
                      <p style={{ fontSize: '14px', color: 'var(--text-dark)', lineHeight: 1.6 }}>
                        {report.transcription}
                      </p>
                    </div>
                    {report.product_recommended && (
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        padding: '10px 14px', background: 'rgba(82,183,136,0.08)',
                        borderRadius: '8px', marginTop: '12px'
                      }}>
                        <Package size={16} style={{ color: 'var(--accent-green)' }} />
                        <span style={{ fontSize: '13px', color: 'var(--text-gray)' }}>Recommended Product:</span>
                        <span style={{ fontWeight: 700, color: 'var(--primary-green)', fontSize: '14px' }}>
                          {report.product_recommended}
                        </span>
                      </div>
                    )}
                    {report.rep_name && (
                      <p style={{ fontSize: '12px', color: 'var(--text-gray)', marginTop: '10px' }}>
                        Reported by: <strong style={{ color: 'var(--text-dark)' }}>{report.rep_name}</strong>
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FieldReports;