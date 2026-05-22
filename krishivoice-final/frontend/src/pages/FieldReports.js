import React, { useState, useEffect } from 'react';
import axios from 'axios';

const FieldReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await axios.get('/api/reports?limit=50');
      setReports(response.data.reports || getSampleReports());
      setLoading(false);
    } catch (error) {
      setReports(getSampleReports());
      setLoading(false);
    }
  };

  const getSampleReports = () => [
    { id: '1', transcription: 'Tomato crop showing white fly infestation', crop: 'Tomato', pest_disease: 'White fly', severity: 'high', date: '2024-05-22', product_recommended: 'Actara' },
    { id: '2', transcription: 'Rice paddy looks healthy', crop: 'Rice', severity: 'low', date: '2024-05-21' }
  ];

  return (
    <div className="reports-page">
      <header className="page-header">
        <h1>📄 Field Reports</h1>
        <p>Browse field observations</p>
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
              <span className={`severity-badge severity-${report.severity}`}>{report.severity}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FieldReports;
