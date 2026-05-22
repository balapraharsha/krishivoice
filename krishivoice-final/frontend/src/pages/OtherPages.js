// FieldReports.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FileText, Filter } from 'lucide-react';

export const FieldReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await axios.get('/api/reports?limit=50');
      setReports(response.data.reports || []);
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setReports(getSampleReports());
      setLoading(false);
    }
  };

  return (
    <div className="reports-page">
      <header className="page-header">
        <h1>📄 Field Reports</h1>
        <p>Browse and analyze field observations</p>
      </header>

      <div className="reports-list">
        {reports.map((report, index) => (
          <div key={index} className="report-card">
            <div className="report-header">
              <span className="report-id">Report #{report.id?.substring(0, 8)}</span>
              <span className="report-date">{report.date}</span>
            </div>
            <p className="report-text">{report.transcription}</p>
            <div className="report-meta">
              <span>Crop: {report.crop || 'N/A'}</span>
              <span>Issue: {report.pest_disease || 'N/A'}</span>
              <span className={`severity-badge severity-${report.severity}`}>
                {report.severity || 'Unknown'}
              </span>
            </div>
            {report.product_recommended && (
              <div className="report-recommendation">
                Recommended: <strong>{report.product_recommended}</strong>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Farmers.js
export const Farmers = () => {
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFarmers();
  }, []);

  const fetchFarmers = async () => {
    try {
      const response = await axios.get('/api/farmers?limit=100');
      setFarmers(response.data.farmers || []);
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setFarmers(getSampleFarmers());
      setLoading(false);
    }
  };

  return (
    <div className="farmers-page">
      <header className="page-header">
        <h1>👨‍🌾 Farmers</h1>
        <p>Manage farmer profiles and contacts</p>
      </header>

      <div className="farmers-grid">
        {farmers.map((farmer, index) => (
          <div key={index} className="farmer-card">
            <h3>{farmer.name}</h3>
            <p><strong>Location:</strong> {farmer.village}, {farmer.district}</p>
            <p><strong>Crop:</strong> {farmer.primary_crop || 'Mixed'}</p>
            <p><strong>Land:</strong> {farmer.land_size_acres} acres</p>
            {farmer.phone && <p><strong>Phone:</strong> {farmer.phone}</p>}
          </div>
        ))}
      </div>
    </div>
  );
};

// Analytics.js
export const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  
  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get('/api/analytics/territory-coverage?days=30');
      setAnalytics(response.data.analytics);
    } catch (error) {
      console.error('Error:', error);
      setAnalytics(getSampleAnalytics());
    }
  };

  return (
    <div className="analytics-page">
      <header className="page-header">
        <h1>📊 Analytics</h1>
        <p>Territory performance and insights</p>
      </header>

      {analytics && (
        <div className="analytics-grid">
          <div className="metric-card">
            <h3>Total Visits</h3>
            <p className="metric-value">{analytics.total_visits}</p>
          </div>
          <div className="metric-card">
            <h3>Unique Farmers</h3>
            <p className="metric-value">{analytics.unique_farmers_visited}</p>
          </div>
          <div className="metric-card">
            <h3>Avg Visits/Day</h3>
            <p className="metric-value">{analytics.avg_visits_per_day}</p>
          </div>
        </div>
      )}
    </div>
  );
};

// Sample data
const getSampleReports = () => [
  { id: '1', transcription: 'Tomato crop showing white fly infestation', crop: 'Tomato', pest_disease: 'White fly', severity: 'high', date: '2024-05-22', product_recommended: 'Actara' },
  { id: '2', transcription: 'Rice paddy looks healthy, no issues', crop: 'Rice', pest_disease: null, severity: 'low', date: '2024-05-21', product_recommended: null }
];

const getSampleFarmers = () => [
  { name: 'Ramesh Kumar', village: 'Guntur', district: 'Guntur', primary_crop: 'Tomato', land_size_acres: 5.5, phone: '+91 98765 43210' },
  { name: 'Lakshmi Devi', village: 'Tenali', district: 'Guntur', primary_crop: 'Chili', land_size_acres: 3.2, phone: '+91 98765 43211' }
];

const getSampleAnalytics = () => ({
  total_visits: 245,
  unique_farmers_visited: 128,
  avg_visits_per_day: 8.2
});

export default { FieldReports, Farmers, Analytics };
