import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, FileText, Activity, AlertTriangle, ArrowRight, TrendingUp, Mic, Map } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await axios.get('/api/dashboard/stats');
      setStats(response.data.stats);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      setStats({
        total_farmers: 0,
        total_field_reports: 0,
        total_field_reps: 0,
        pest_outbreaks: 0
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
    <div className="dashboard-page">
      <header className="page-header">
        <div className="header-icon">
          <TrendingUp size={24} />
        </div>
        <div>
          <h1>Dashboard</h1>
          <p>Overview of field operations and insights</p>
        </div>
      </header>

      {/* Metrics Grid */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-header">
            <div className="metric-icon primary">
              <Users size={24} />
            </div>
          </div>
          <div className="metric-content">
            <h3>Total Farmers</h3>
            <div className="metric-value">{stats?.total_farmers || 0}</div>
            <p className="metric-trend">+12% this month</p>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <div className="metric-icon success">
              <FileText size={24} />
            </div>
          </div>
          <div className="metric-content">
            <h3>Field Reports</h3>
            <div className="metric-value">{stats?.total_field_reports || 0}</div>
            <p className="metric-trend">0 this week</p>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <div className="metric-icon warning">
              <Activity size={24} />
            </div>
          </div>
          <div className="metric-content">
            <h3>Field Reps</h3>
            <div className="metric-value">{stats?.total_field_reps || 0}</div>
            <p className="metric-trend">Active territories</p>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <div className="metric-icon danger">
              <AlertTriangle size={24} />
            </div>
          </div>
          <div className="metric-content">
            <h3>Pest Outbreaks</h3>
            <div className="metric-value">{stats?.pest_outbreaks || 0}</div>
            <p className="metric-trend">Requiring attention</p>
          </div>
        </div>
      </div>

      {/* Action Cards */}
      <div className="action-cards">
        <div className="action-card">
          <h3>
            <Mic size={20} />
            Record Field Visit
          </h3>
          <p>Use voice recording to quickly document farmer interactions and pest observations</p>
          <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-green)', fontWeight: 600 }}>
            Start Recording
            <ArrowRight size={16} />
          </div>
        </div>

        <div className="action-card">
          <h3>
            <Map size={20} />
            View Pest Outbreaks
          </h3>
          <p>Interactive map showing real-time pest outbreak clusters across all territories</p>
          <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-green)', fontWeight: 600 }}>
            Open Map
            <ArrowRight size={16} />
          </div>
        </div>

        <div className="action-card">
          <h3>
            <FileText size={20} />
            Daily Briefing
          </h3>
          <p>AI-generated priority visit list with urgent follow-ups and route optimization</p>
          <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-green)', fontWeight: 600 }}>
            View Briefing
            <ArrowRight size={16} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;