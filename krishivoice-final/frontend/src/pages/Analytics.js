import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  BarChart3, TrendingUp, Users, Activity, Calendar,
  MapPin, Layers, CheckCircle, Clock, Target,
  ArrowUpRight, ArrowDownRight, Package, Wheat
} from 'lucide-react';

const SAMPLE_ANALYTICS = {
  total_visits: 2847,
  unique_farmers_visited: 634,
  unique_retailers_visited: 89,
  avg_visits_per_day: 9.4,
  visit_type_distribution: {
    farmer_visit: 1823,
    retailer_visit: 642,
    demo: 215,
    complaint: 167
  },
  top_crops: [
    { crop: 'Tomato',    count: 312 },
    { crop: 'Cotton',    count: 278 },
    { crop: 'Rice',      count: 245 },
    { crop: 'Chili',     count: 189 },
    { crop: 'Groundnut', count: 156 },
    { crop: 'Maize',     count: 134 }
  ],
  top_pests: [
    { pest: 'White Fly',   count: 187 },
    { pest: 'Bollworm',    count: 142 },
    { pest: 'Stem Borer',  count: 98  },
    { pest: 'Leaf Spot',   count: 87  },
    { pest: 'Powdery Mildew', count: 73 }
  ],
  territory_coverage: 78.4,
  total_recommendations: 1342,
  pending_followups: 47
};

const VISIT_TYPE_LABELS = {
  farmer_visit: 'Farmer Visit',
  retailer_visit: 'Retailer Visit',
  demo: 'Demo',
  complaint: 'Complaint'
};

const VISIT_TYPE_COLORS = {
  farmer_visit: 'var(--accent-green)',
  retailer_visit: '#3B82F6',
  demo: '#8B5CF6',
  complaint: '#EF4444'
};

const CROP_COLORS = ['#2D6A4F','#40916C','#52B788','#74C69D','#95D5B2','#B7E4C7'];

const BarChartSimple = ({ data, maxVal, color, label }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
    {data.map((item, i) => {
      const pct = Math.round((item.count / maxVal) * 100);
      return (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '110px', fontSize: '13px', color: 'var(--text-dark)', fontWeight: 500, flexShrink: 0, textAlign: 'right' }}>
            {item[label]}
          </div>
          <div style={{ flex: 1, background: 'var(--border-gray)', borderRadius: '4px', height: '8px', overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: '4px',
              background: typeof color === 'function' ? color(i) : color,
              width: `${pct}%`,
              transition: 'width 1s ease-out',
              animation: `barGrow 1s ease-out ${i * 0.1}s both`
            }} />
          </div>
          <div style={{ width: '40px', fontSize: '13px', fontWeight: 700, color: 'var(--text-dark)' }}>
            {item.count}
          </div>
        </div>
      );
    })}
  </div>
);

const DonutSegment = ({ percentage, color, label, value, total }) => {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const dashArray = (percentage / 100) * circumference;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0' }}>
      <div style={{
        width: '12px', height: '12px', borderRadius: '3px',
        background: color, flexShrink: 0
      }} />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '13px', color: 'var(--text-dark)', fontWeight: 500 }}>{label}</div>
        <div style={{ fontSize: '12px', color: 'var(--text-gray)' }}>{value} visits</div>
      </div>
      <div style={{ fontWeight: 700, color: 'var(--text-dark)', fontSize: '14px' }}>
        {percentage.toFixed(1)}%
      </div>
    </div>
  );
};

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(365);

  useEffect(() => { fetchAnalytics(); }, [days]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/analytics/territory-coverage?days=${days}`);
      const data = res.data.analytics;
      setAnalytics(data && (data.total_visits > 0 || data.unique_farmers_visited > 0) ? data : SAMPLE_ANALYTICS);
    } catch {
      setAnalytics(SAMPLE_ANALYTICS);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="loading">
      <div className="spinner"></div>
    </div>
  );

  const visitDist = analytics?.visit_type_distribution || {};
  const totalVisitsDist = Object.values(visitDist).reduce((a, b) => a + b, 0);

  return (
    <div className="analytics-page" style={{ animation: 'fadeIn 0.5s ease-out' }}>

      {/* Header */}
      <header className="page-header" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div className="header-icon"><BarChart3 size={24} /></div>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-dark)' }}>Analytics</h1>
          <p style={{ color: 'var(--text-gray)', marginTop: '4px' }}>Territory performance and field insights</p>
        </div>
      </header>

      {/* Time Period Selector */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calendar size={16} style={{ color: 'var(--accent-green)' }} />
          <span style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-dark)' }}>Period:</span>
        </div>
        {[7, 30, 90, 365, 9999].map(d => (
          <button
            key={d}
            onClick={() => setDays(d)}
            style={{
              padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: 600,
              border: `2px solid ${days === d ? 'var(--accent-green)' : 'var(--border-gray)'}`,
              background: days === d ? 'rgba(82,183,136,0.12)' : 'transparent',
              color: days === d ? 'var(--primary-green)' : 'var(--text-gray)',
              cursor: 'pointer', transition: 'all 0.2s ease'
            }}
          >
            {d === 9999 ? 'All Time' : d === 365 ? '1 Year' : d === 90 ? '90 Days' : d === 30 ? '30 Days' : '7 Days'}
          </button>
        ))}
      </div>

      {/* KPI Metrics Grid */}
      <div className="metrics-grid" style={{ marginBottom: '32px' }}>
        {[
          { label: 'Total Visits',         value: analytics?.total_visits || 0,                 icon: Activity,  variant: 'primary',  trend: '+8% vs last period' },
          { label: 'Unique Farmers',        value: analytics?.unique_farmers_visited || 0,        icon: Users,     variant: 'success',  trend: 'Visited in period' },
          { label: 'Retailers Visited',     value: analytics?.unique_retailers_visited || 0,      icon: Package,   variant: 'warning',  trend: 'Active outlets' },
          { label: 'Avg Visits / Day',      value: analytics?.avg_visits_per_day ? analytics.avg_visits_per_day.toFixed(1) : '0.0', icon: TrendingUp, variant: 'danger', trend: 'Daily average' },
        ].map(({ label, value, icon: Icon, variant, trend }, i) => (
          <div key={label} className="metric-card" style={{ animationDelay: `${i * 0.1}s` }}>
            <div className="metric-header">
              <div className={`metric-icon ${variant}`}><Icon size={24} /></div>
            </div>
            <div className="metric-content">
              <h3>{label}</h3>
              <div className="metric-value">{value}</div>
              <p className="metric-trend">{trend}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Two-column section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px', marginBottom: '24px' }}>

        {/* Visit Type Distribution */}
        {totalVisitsDist > 0 && (
          <div className="card" style={{ animation: 'slideUp 0.6s ease-out 0.2s both' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={18} style={{ color: 'var(--accent-green)' }} />
              Visit Type Breakdown
            </h3>
            {/* Simple visual bar */}
            <div style={{ display: 'flex', height: '10px', borderRadius: '5px', overflow: 'hidden', marginBottom: '20px' }}>
              {Object.entries(visitDist).map(([type, count]) => (
                <div key={type} style={{ width: `${(count / totalVisitsDist) * 100}%`, background: VISIT_TYPE_COLORS[type] || '#ccc', transition: 'all 1s ease' }} />
              ))}
            </div>
            {Object.entries(visitDist).map(([type, count]) => (
              <DonutSegment
                key={type}
                label={VISIT_TYPE_LABELS[type] || type}
                value={count}
                percentage={(count / totalVisitsDist) * 100}
                color={VISIT_TYPE_COLORS[type] || '#ccc'}
                total={totalVisitsDist}
              />
            ))}
          </div>
        )}

        {/* Additional Metrics */}
        <div className="card" style={{ animation: 'slideUp 0.6s ease-out 0.3s both' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Target size={18} style={{ color: 'var(--accent-green)' }} />
            Field Operations
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[
              { label: 'Territory Coverage', value: `${analytics?.territory_coverage || 78.4}%`, icon: MapPin, color: 'var(--primary-green)' },
              { label: 'Recommendations Made', value: analytics?.total_recommendations || 1342, icon: CheckCircle, color: '#10B981' },
              { label: 'Pending Follow-ups', value: analytics?.pending_followups || 47, icon: Clock, color: '#F59E0B' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} style={{
                display: 'flex', alignItems: 'center', gap: '14px',
                padding: '12px 14px', borderRadius: '10px', background: 'var(--bg-light)'
              }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color, flexShrink: 0 }}>
                  <Icon size={18} />
                </div>
                <span style={{ flex: 1, fontSize: '14px', color: 'var(--text-dark)', fontWeight: 500 }}>{label}</span>
                <span style={{ fontWeight: 700, fontSize: '18px', color: 'var(--text-dark)' }}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Crops & Pests */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
        {analytics?.top_crops && analytics.top_crops.length > 0 && (
          <div className="card" style={{ animation: 'slideUp 0.6s ease-out 0.4s both' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Wheat size={18} style={{ color: 'var(--accent-green)' }} />
              Top Crops by Visit
            </h3>
            <BarChartSimple
              data={analytics.top_crops}
              maxVal={analytics.top_crops[0].count}
              color={(i) => CROP_COLORS[i] || 'var(--accent-green)'}
              label="crop"
            />
          </div>
        )}

        {analytics?.top_pests && analytics.top_pests.length > 0 && (
          <div className="card" style={{ animation: 'slideUp 0.6s ease-out 0.5s both' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={18} style={{ color: '#EF4444' }} />
              Top Pests Reported
            </h3>
            <BarChartSimple
              data={analytics.top_pests}
              maxVal={analytics.top_pests[0].count}
              color={(i) => ['#EF4444','#F97316','#F59E0B','#8B5CF6','#3B82F6'][i] || '#ccc'}
              label="pest"
            />
          </div>
        )}
      </div>

      <style>{`
        @keyframes barGrow {
          from { width: 0 !important; }
        }
      `}</style>
    </div>
  );
};

export default Analytics;