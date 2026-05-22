import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, AlertCircle, CheckCircle, Clock, MapPin, TrendingUp } from 'lucide-react';

const DailyBriefing = () => {
  const [briefing, setBriefing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const [userId] = useState('demo-user-123'); // Would come from auth

  useEffect(() => {
    fetchBriefing();
  }, [selectedDate]);

  const fetchBriefing = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/briefing/daily/${userId}?briefing_date=${selectedDate}`);
      setBriefing(response.data.briefing);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching briefing:', error);
      // Use sample data for demo
      setBriefing(getSampleBriefing());
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading your daily briefing...</div>;
  }

  return (
    <div className="briefing-page">
      <header className="page-header">
        <h1>📋 Daily Briefing</h1>
        <p>AI-powered priority list and territory insights</p>
      </header>

      {/* Date Selector */}
      <div className="briefing-controls">
        <div className="date-selector">
          <Calendar size={20} />
          <input 
            type="date" 
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
        <div className="briefing-stats">
          <div className="stat">
            <span className="stat-label">Recommended Visits:</span>
            <span className="stat-value">{briefing?.recommended_visits || 0}</span>
          </div>
          <div className="stat">
            <span className="stat-label">This Week:</span>
            <span className="stat-value">{briefing?.recent_visit_count || 0} visits</span>
          </div>
        </div>
      </div>

      {/* Territory Insights */}
      {briefing?.territory_insights && (
        <div className="insights-card">
          <div className="card-header">
            <TrendingUp size={24} />
            <h3>Territory Insights</h3>
          </div>
          <p className="insights-text">{briefing.territory_insights}</p>
        </div>
      )}

      {/* Priority Visits */}
      <div className="priority-section">
        <h3>🎯 Priority Visits Today</h3>
        {briefing?.priority_visits && briefing.priority_visits.length > 0 ? (
          <div className="priority-list">
            {briefing.priority_visits.map((visit, index) => (
              <PriorityCard key={index} visit={visit} index={index} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <CheckCircle size={48} color="#10B981" />
            <p>All caught up! No pending follow-ups.</p>
          </div>
        )}
      </div>

      {/* Pest Alerts */}
      {briefing?.pest_alerts && briefing.pest_alerts.length > 0 && (
        <div className="alerts-section">
          <h3>⚠️ Pest Alerts in Your Territory</h3>
          <div className="alert-cards">
            {briefing.pest_alerts.map((alert, index) => (
              <AlertCard key={index} alert={alert} />
            ))}
          </div>
        </div>
      )}

      {/* Route Optimization (if available) */}
      <div className="route-section">
        <h3>🗺️ Suggested Visit Route</h3>
        <div className="route-card">
          <p className="route-description">
            Optimized route to visit all priority farmers efficiently.
            Estimated time savings: <strong>45 minutes</strong>
          </p>
          <button className="btn-primary">View Optimized Route</button>
        </div>
      </div>
    </div>
  );
};

// Priority Visit Card Component
const PriorityCard = ({ visit, index }) => {
  const getPriorityColor = (priority) => {
    const colors = {
      high: '#DC2626',
      medium: '#F59E0B',
      low: '#10B981'
    };
    return colors[priority] || colors.medium;
  };

  return (
    <div className="priority-card" style={{ borderLeftColor: getPriorityColor(visit.priority) }}>
      <div className="priority-header">
        <div className="priority-number">{index + 1}</div>
        <div className="priority-info">
          <h4>Farmer ID: {visit.farmer_id?.substring(0, 8)}...</h4>
          <span className="priority-badge" style={{ backgroundColor: getPriorityColor(visit.priority) }}>
            {visit.priority.toUpperCase()}
          </span>
        </div>
      </div>
      
      <div className="priority-details">
        <div className="detail-row">
          <AlertCircle size={16} />
          <span>{visit.reason}</span>
        </div>
        
        {visit.last_visit && (
          <div className="detail-row">
            <Clock size={16} />
            <span>Last visit: {visit.last_visit}</span>
          </div>
        )}
        
        {visit.notes && (
          <div className="priority-notes">
            <strong>Notes:</strong> {visit.notes}
          </div>
        )}
      </div>
      
      <div className="priority-actions">
        <button className="btn-secondary">View Details</button>
        <button className="btn-primary">Mark Complete</button>
      </div>
    </div>
  );
};

// Pest Alert Card Component
const AlertCard = ({ alert }) => {
  const getSeverityColor = (severity) => {
    const colors = {
      critical: '#DC2626',
      high: '#EA580C',
      medium: '#F59E0B',
      low: '#10B981'
    };
    return colors[severity] || colors.medium;
  };

  return (
    <div className="alert-card">
      <div className="alert-icon" style={{ backgroundColor: getSeverityColor(alert.severity) }}>
        <AlertCircle size={24} color="white" />
      </div>
      <div className="alert-content">
        <h4>{alert.pest_name}</h4>
        <div className="alert-meta">
          <span className="severity-badge" style={{ backgroundColor: getSeverityColor(alert.severity) }}>
            {alert.severity}
          </span>
          <span className="alert-location">
            <MapPin size={14} />
            {alert.district}
          </span>
          <span className="alert-date">{alert.date}</span>
        </div>
      </div>
    </div>
  );
};

// Helper functions
function getTodayDate() {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

// Sample briefing data for demo
const getSampleBriefing = () => ({
  date: getTodayDate(),
  priority_visits: [
    {
      farmer_id: "f1a2b3c4-5678-90ab-cdef-1234567890ab",
      visit_id: "v9876543-21ab-cdef-0123-456789abcdef",
      reason: "Follow-up overdue by 5 days",
      priority: "high",
      last_visit: "2024-05-15",
      notes: "Pest issue - White fly on tomatoes. Recommended Actara spray."
    },
    {
      farmer_id: "a9b8c7d6-5432-10fe-dcba-0987654321fe",
      visit_id: "v1234567-89ab-cdef-0123-456789abcdef",
      reason: "Follow-up overdue by 3 days",
      priority: "high",
      last_visit: "2024-05-17",
      notes: "Product delivery pending. Check stock at retailer."
    },
    {
      farmer_id: "x1y2z3a4-5678-90bc-def0-1234567890cd",
      visit_id: "v2345678-90ab-cdef-0123-456789abcdef",
      reason: "Follow-up due today",
      priority: "medium",
      last_visit: "2024-05-12",
      notes: "Discuss crop rotation strategy for next season."
    },
    {
      farmer_id: "p9q8r7s6-5432-10ef-dcba-0987654321gh",
      visit_id: "v3456789-01bc-def0-1234-567890abcdef",
      reason: "New farmer in territory",
      priority: "medium",
      last_visit: null,
      notes: "Initial assessment visit. Introduce Syngenta products."
    }
  ],
  pest_alerts: [
    {
      pest_name: "White fly",
      severity: "critical",
      district: "Guntur",
      date: "2024-05-21"
    },
    {
      pest_name: "Aphid",
      severity: "high",
      district: "Prakasam",
      date: "2024-05-20"
    },
    {
      pest_name: "Stem borer",
      severity: "medium",
      district: "Krishna",
      date: "2024-05-19"
    }
  ],
  territory_insights: "This week: 42 visits completed with 73.8% success rate. Excellent performance! Your territory shows increasing activity in rice crop protection. Focus on follow-ups to improve outcomes.",
  recent_visit_count: 42,
  recommended_visits: 8
});

export default DailyBriefing;
