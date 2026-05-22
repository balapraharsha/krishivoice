import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart3, TrendingUp, Users, Activity } from 'lucide-react';

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(365);
  
  useEffect(() => {
    fetchAnalytics();
  }, [days]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/analytics/territory-coverage?days=${days}`);
      setAnalytics(response.data.analytics);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setAnalytics({
        total_visits: 0,
        unique_farmers_visited: 0,
        unique_retailers_visited: 0,
        avg_visits_per_day: 0
      });
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="analytics-page">
      <header className="page-header">
        <div className="header-icon">
          <BarChart3 size={24} />
        </div>
        <div>
          <h1>Analytics</h1>
          <p>Territory performance and insights</p>
        </div>
      </header>

      {/* Date Range Selector */}
      <div className="card" style={{ marginBottom: '24px', padding: '16px' }}>
        <label style={{ marginRight: '12px', fontWeight: '600' }}>Time Period:</label>
        <select 
          value={days} 
          onChange={(e) => setDays(Number(e.target.value))}
          style={{ 
            padding: '8px 16px', 
            borderRadius: '6px', 
            border: '1px solid var(--border-gray)',
            fontSize: '14px'
          }}
        >
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
          <option value={180}>Last 6 months</option>
          <option value={365}>Last 1 year</option>
          <option value={730}>Last 2 years</option>
          <option value={9999}>All time</option>
        </select>
        <span style={{ marginLeft: '16px', color: 'var(--text-gray)' }}>
          Showing data from last {days === 9999 ? 'all time' : `${days} days`}
        </span>
      </div>

      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-header">
            <div className="metric-icon primary">
              <Activity size={24} />
            </div>
          </div>
          <div className="metric-content">
            <h3>Total Visits</h3>
            <div className="metric-value">{analytics?.total_visits || 0}</div>
            <p className="metric-trend">In selected period</p>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <div className="metric-icon success">
              <Users size={24} />
            </div>
          </div>
          <div className="metric-content">
            <h3>Unique Farmers</h3>
            <div className="metric-value">{analytics?.unique_farmers_visited || 0}</div>
            <p className="metric-trend">Visited in period</p>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <div className="metric-icon warning">
              <TrendingUp size={24} />
            </div>
          </div>
          <div className="metric-content">
            <h3>Avg Visits/Day</h3>
            <div className="metric-value">
              {analytics?.avg_visits_per_day ? analytics.avg_visits_per_day.toFixed(1) : '0.0'}
            </div>
            <p className="metric-trend">Daily average</p>
          </div>
        </div>
      </div>

      {analytics?.total_visits === 0 && (
        <div className="empty-state">
          <div className="empty-icon">
            <BarChart3 size={32} />
          </div>
          <p>No visit data available in the selected time period.</p>
          <p style={{ fontSize: '14px', marginTop: '8px' }}>Try selecting "All time" from the dropdown above.</p>
        </div>
      )}

      {analytics && analytics.visit_type_distribution && Object.keys(analytics.visit_type_distribution).length > 0 && (
        <div className="card" style={{ marginTop: '32px' }}>
          <h3 style={{ marginBottom: '20px' }}>Visit Type Distribution</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
            {Object.entries(analytics.visit_type_distribution).map(([type, count]) => (
              <div key={type} style={{ border: '1px solid var(--border-gray)', borderRadius: '8px', padding: '16px', textAlign: 'center' }}>
                <h4 style={{ fontSize: '14px', color: 'var(--text-gray)', marginBottom: '8px', textTransform: 'capitalize' }}>
                  {type}
                </h4>
                <p style={{ fontSize: '32px', fontWeight: '700', color: 'var(--text-dark)' }}>{count}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;