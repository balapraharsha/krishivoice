import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Calendar, AlertCircle, CheckCircle, Clock, MapPin,
  TrendingUp, Navigation, AlertTriangle, Target, ChevronRight,
  User, Leaf, BarChart3, Route, Bell
} from 'lucide-react';

function getTodayDate() {
  return new Date().toISOString().split('T')[0];
}

const getSampleBriefing = () => ({
  date: getTodayDate(),
  priority_visits: [
    { farmer_id: 'f1a2b3c4-5678-90ab', reason: 'Follow-up overdue by 5 days', priority: 'high',   last_visit: '2024-05-15', notes: 'White fly on tomatoes. Actara spray recommended.' },
    { farmer_id: 'a9b8c7d6-5432-10fe', reason: 'Follow-up overdue by 3 days', priority: 'high',   last_visit: '2024-05-17', notes: 'Product delivery pending. Check retailer stock.' },
    { farmer_id: 'x1y2z3a4-5678-90bc', reason: 'Follow-up due today',         priority: 'medium', last_visit: '2024-05-12', notes: 'Discuss crop rotation for next season.' },
    { farmer_id: 'p9q8r7s6-5432-10ef', reason: 'New farmer in territory',      priority: 'medium', last_visit: null,         notes: 'Initial assessment. Introduce Syngenta products.' },
    { farmer_id: 'k3l4m5n6-7890-12cd', reason: 'Pest follow-up required',      priority: 'low',    last_visit: '2024-05-10', notes: 'Monitor cotton bollworm treatment results.' },
  ],
  pest_alerts: [
    { pest_name: 'White Fly',     severity: 'critical', district: 'Guntur',   date: '2024-05-21', affected: 12 },
    { pest_name: 'Aphid',         severity: 'high',     district: 'Prakasam', date: '2024-05-20', affected: 8  },
    { pest_name: 'Stem Borer',    severity: 'medium',   district: 'Krishna',  date: '2024-05-19', affected: 5  },
  ],
  territory_insights: 'This week: 42 visits completed with 73.8% success rate. Strong performance! Territory shows increasing activity in rice crop protection. Prioritize white fly follow-ups in Guntur district.',
  recent_visit_count: 42,
  recommended_visits: 8
});

const PRIORITY_CONFIG = {
  high:   { color: '#EF4444', bg: 'rgba(239,68,68,0.1)',   label: 'High Priority' },
  medium: { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)',  label: 'Medium' },
  low:    { color: '#10B981', bg: 'rgba(16,185,129,0.1)',  label: 'Low Priority' },
};

const SEVERITY_CONFIG = {
  critical: { color: '#EF4444', bg: 'rgba(239,68,68,0.1)',  label: 'Critical' },
  high:     { color: '#F97316', bg: 'rgba(249,115,22,0.1)', label: 'High' },
  medium:   { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', label: 'Medium' },
  low:      { color: '#10B981', bg: 'rgba(16,185,129,0.1)', label: 'Low' },
};

const PriorityCard = ({ visit, index }) => {
  const cfg = PRIORITY_CONFIG[visit.priority] || PRIORITY_CONFIG.medium;
  return (
    <div style={{
      background: 'var(--white)', borderRadius: '12px', boxShadow: 'var(--shadow)',
      borderLeft: `4px solid ${cfg.color}`, padding: '18px 20px',
      animation: `slideUp 0.4s ease-out ${index * 0.07}s both`,
      transition: 'all 0.3s ease'
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
        {/* Number badge */}
        <div style={{
          width: '32px', height: '32px', borderRadius: '8px',
          background: cfg.bg, color: cfg.color, display: 'flex',
          alignItems: 'center', justifyContent: 'center', fontWeight: 800,
          fontSize: '15px', flexShrink: 0
        }}>
          {index + 1}
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-dark)', fontFamily: 'monospace' }}>
              {visit.farmer_id?.substring(0, 12)}...
            </span>
            <span style={{
              padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700,
              background: cfg.bg, color: cfg.color, textTransform: 'uppercase', letterSpacing: '0.5px'
            }}>
              {cfg.label}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', marginBottom: '6px' }}>
            <AlertCircle size={14} style={{ color: cfg.color, flexShrink: 0, marginTop: '2px' }} />
            <span style={{ fontSize: '14px', color: 'var(--text-dark)', fontWeight: 500 }}>{visit.reason}</span>
          </div>

          {visit.last_visit && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              <Clock size={13} style={{ color: 'var(--text-gray)' }} />
              <span style={{ fontSize: '13px', color: 'var(--text-gray)' }}>Last visit: {visit.last_visit}</span>
            </div>
          )}

          {visit.notes && (
            <div style={{
              padding: '8px 12px', background: 'var(--bg-light)', borderRadius: '8px',
              fontSize: '13px', color: 'var(--text-gray)', lineHeight: 1.5, marginTop: '8px'
            }}>
              {visit.notes}
            </div>
          )}

          <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
            <button style={{
              padding: '6px 14px', borderRadius: '6px', border: '2px solid var(--accent-green)',
              background: 'transparent', color: 'var(--primary-green)', fontSize: '12px', fontWeight: 600,
              cursor: 'pointer', transition: 'all 0.2s ease'
            }}>View Details</button>
            <button style={{
              padding: '6px 14px', borderRadius: '6px', border: 'none',
              background: 'var(--accent-green)', color: '#fff', fontSize: '12px', fontWeight: 600,
              cursor: 'pointer', transition: 'all 0.2s ease',
              display: 'flex', alignItems: 'center', gap: '4px'
            }}>
              <CheckCircle size={12} />
              Mark Complete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const AlertCard = ({ alert, index }) => {
  const cfg = SEVERITY_CONFIG[alert.severity] || SEVERITY_CONFIG.medium;
  return (
    <div style={{
      background: 'var(--white)', borderRadius: '10px', boxShadow: 'var(--shadow)',
      padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '14px',
      animation: `slideIn 0.4s ease-out ${index * 0.08}s both`,
      borderTop: `3px solid ${cfg.color}`
    }}>
      <div style={{
        width: '40px', height: '40px', borderRadius: '10px',
        background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: cfg.color, flexShrink: 0
      }}>
        <AlertTriangle size={20} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-dark)' }}>{alert.pest_name}</span>
          <span style={{ padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 700, background: cfg.bg, color: cfg.color, textTransform: 'uppercase' }}>
            {cfg.label}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--text-gray)' }}>
            <MapPin size={11} /> {alert.district}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--text-gray)' }}>
            <Calendar size={11} /> {alert.date}
          </span>
          {alert.affected && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--text-gray)' }}>
              <User size={11} /> {alert.affected} farmers
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

const DailyBriefing = () => {
  const [briefing, setBriefing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const [userId] = useState('demo-user-123');

  useEffect(() => { fetchBriefing(); }, [selectedDate]);

  const fetchBriefing = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/briefing/daily/${userId}?briefing_date=${selectedDate}`);
      const data = res.data.briefing;
      setBriefing(data && data.priority_visits ? data : getSampleBriefing());
    } catch {
      setBriefing(getSampleBriefing());
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="loading">
      <div className="spinner"></div>
    </div>
  );

  const highCount   = briefing?.priority_visits?.filter(v => v.priority === 'high').length || 0;
  const medCount    = briefing?.priority_visits?.filter(v => v.priority === 'medium').length || 0;
  const alertCount  = briefing?.pest_alerts?.length || 0;

  return (
    <div className="briefing-page" style={{ animation: 'fadeIn 0.5s ease-out' }}>

      {/* Header */}
      <header className="page-header" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div className="header-icon"><Calendar size={24} /></div>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-dark)' }}>Daily Briefing</h1>
          <p style={{ color: 'var(--text-gray)', marginTop: '4px' }}>AI-powered priority list and territory insights</p>
        </div>
      </header>

      {/* Date + Stats Bar */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Calendar size={16} style={{ color: 'var(--accent-green)' }} />
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            style={{ padding: '6px 10px', border: '1px solid var(--border-gray)', borderRadius: '8px', fontSize: '14px', color: 'var(--text-dark)', cursor: 'pointer' }}
          />
        </div>
        <div style={{ height: '30px', width: '1px', background: 'var(--border-gray)' }} />
        {[
          { label: 'Recommended Visits', value: briefing?.recommended_visits || 0, color: 'var(--primary-green)' },
          { label: 'High Priority',      value: highCount,                          color: '#EF4444' },
          { label: 'Pest Alerts',        value: alertCount,                         color: '#F97316' },
          { label: 'Visits This Week',   value: briefing?.recent_visit_count || 0,  color: '#3B82F6' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ display: 'flex', flex: '1', alignItems: 'center', gap: '8px', minWidth: '100px' }}>
            <span style={{ fontSize: '22px', fontWeight: 800, color }}>{value}</span>
            <span style={{ fontSize: '12px', color: 'var(--text-gray)', lineHeight: 1.2 }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Territory Insights */}
      {briefing?.territory_insights && (
        <div style={{
          background: 'linear-gradient(135deg, var(--primary-green), var(--secondary-green))',
          borderRadius: '14px', padding: '20px 24px', marginBottom: '28px', color: '#fff',
          animation: 'slideUp 0.5s ease-out 0.1s both', position: 'relative', overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', top: '-20px', right: '-20px', opacity: 0.08 }}>
            <BarChart3 size={120} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <TrendingUp size={20} />
            <h3 style={{ fontWeight: 700, fontSize: '16px' }}>Territory Insights</h3>
          </div>
          <p style={{ fontSize: '14px', lineHeight: 1.7, opacity: 0.92 }}>
            {briefing.territory_insights}
          </p>
        </div>
      )}

      {/* Priority Visits */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(82,183,136,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-green)' }}>
            <Target size={18} />
          </div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-dark)' }}>
            Priority Visits Today
          </h2>
          {briefing?.priority_visits?.length > 0 && (
            <span style={{ padding: '3px 10px', borderRadius: '20px', background: 'var(--accent-green)', color: '#fff', fontSize: '12px', fontWeight: 700 }}>
              {briefing.priority_visits.length}
            </span>
          )}
        </div>

        {briefing?.priority_visits && briefing.priority_visits.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {briefing.priority_visits.map((visit, i) => (
              <PriorityCard key={i} visit={visit} index={i} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon"><CheckCircle size={32} /></div>
            <p style={{ fontWeight: 600, color: 'var(--text-dark)' }}>All caught up!</p>
            <p style={{ fontSize: '14px', marginTop: '4px' }}>No pending follow-up visits for today.</p>
          </div>
        )}
      </div>

      {/* Pest Alerts */}
      {briefing?.pest_alerts && briefing.pest_alerts.length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EF4444' }}>
              <Bell size={18} />
            </div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-dark)' }}>
              Pest Alerts in Territory
            </h2>
            <span style={{ padding: '3px 10px', borderRadius: '20px', background: '#EF4444', color: '#fff', fontSize: '12px', fontWeight: 700 }}>
              {briefing.pest_alerts.length}
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '12px' }}>
            {briefing.pest_alerts.map((alert, i) => (
              <AlertCard key={i} alert={alert} index={i} />
            ))}
          </div>
        </div>
      )}

      {/* Suggested Route */}
      <div style={{
        background: 'var(--white)', borderRadius: '14px', padding: '20px 24px',
        boxShadow: 'var(--shadow)', display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap',
        animation: 'slideUp 0.5s ease-out 0.5s both'
      }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(59,130,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3B82F6', flexShrink: 0 }}>
          <Route size={24} />
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontWeight: 700, fontSize: '16px', color: 'var(--text-dark)', marginBottom: '4px' }}>Optimized Visit Route</h3>
          <p style={{ fontSize: '14px', color: 'var(--text-gray)' }}>
            Route covers all {briefing?.recommended_visits || 0} priority visits efficiently.
            Estimated time savings: <strong style={{ color: 'var(--primary-green)' }}>45 minutes</strong>
          </p>
        </div>
        <button style={{
          padding: '10px 20px', borderRadius: '8px', border: 'none',
          background: '#3B82F6', color: '#fff', fontSize: '14px', fontWeight: 600,
          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
          transition: 'all 0.2s ease', flexShrink: 0
        }}>
          <Navigation size={16} />
          View Route
        </button>
      </div>
    </div>
  );
};

export default DailyBriefing;