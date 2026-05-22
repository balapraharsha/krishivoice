import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import axios from 'axios';
import { AlertTriangle, Info, Filter } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

const PestOutbreakMap = () => {
  const [outbreaks, setOutbreaks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [days, setDays] = useState(14);

  useEffect(() => {
    fetchOutbreaks();
  }, [days]);

  const fetchOutbreaks = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/analytics/pest-outbreaks?days=${days}&min_cluster_size=3`);
      setOutbreaks(response.data.outbreaks || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching outbreaks:', error);
      // Use sample data for demo
      setOutbreaks(getSampleOutbreaks());
      setLoading(false);
    }
  };

  const filteredOutbreaks = outbreaks.filter(outbreak => 
    selectedSeverity === 'all' || outbreak.severity === selectedSeverity
  );

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
    <div className="pest-map-page">
      <header className="page-header">
        <h1>🗺️ Pest Outbreak Detection Map</h1>
        <p>Real-time clustering and severity analysis across territories</p>
      </header>

      {/* Controls */}
      <div className="map-controls">
        <div className="control-group">
          <label>Time Period:</label>
          <select value={days} onChange={(e) => setDays(Number(e.target.value))}>
            <option value={7}>Last 7 days</option>
            <option value={14}>Last 14 days</option>
            <option value={30}>Last 30 days</option>
          </select>
        </div>

        <div className="control-group">
          <label>Severity Filter:</label>
          <select value={selectedSeverity} onChange={(e) => setSelectedSeverity(e.target.value)}>
            <option value="all">All Severities</option>
            <option value="critical">Critical Only</option>
            <option value="high">High Only</option>
            <option value="medium">Medium Only</option>
            <option value="low">Low Only</option>
          </select>
        </div>

        <div className="outbreak-summary">
          <AlertTriangle size={20} />
          <span><strong>{filteredOutbreaks.length}</strong> outbreak clusters detected</span>
        </div>
      </div>

      {/* Legend */}
      <div className="map-legend">
        <h4>Severity Legend</h4>
        <div className="legend-items">
          <div className="legend-item">
            <span className="legend-color" style={{backgroundColor: '#DC2626'}}></span>
            <span>Critical</span>
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{backgroundColor: '#EA580C'}}></span>
            <span>High</span>
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{backgroundColor: '#F59E0B'}}></span>
            <span>Medium</span>
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{backgroundColor: '#10B981'}}></span>
            <span>Low</span>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="map-container">
        {loading ? (
          <div className="map-loading">Loading outbreak data...</div>
        ) : (
          <MapContainer 
            center={[22.5, 79.5]} 
            zoom={5} 
            style={{ height: '600px', width: '100%' }}
            className="leaflet-map"
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />
            
            {filteredOutbreaks.map((outbreak, index) => (
              <CircleMarker
                key={index}
                center={[outbreak.center_lat, outbreak.center_lng]}
                radius={outbreak.report_count * 3}
                fillColor={getSeverityColor(outbreak.severity)}
                color={getSeverityColor(outbreak.severity)}
                weight={2}
                opacity={0.8}
                fillOpacity={0.4}
              >
                <Popup>
                  <div className="outbreak-popup">
                    <h3>{outbreak.pest_name}</h3>
                    <div className="popup-detail">
                      <strong>Severity:</strong>
                      <span className={`severity-badge severity-${outbreak.severity}`}>
                        {outbreak.severity.toUpperCase()}
                      </span>
                    </div>
                    <div className="popup-detail">
                      <strong>Reports:</strong> {outbreak.report_count}
                    </div>
                    <div className="popup-detail">
                      <strong>Location:</strong> {outbreak.district}, {outbreak.state}
                    </div>
                    <div className="popup-detail">
                      <strong>Radius:</strong> {outbreak.radius_km} km
                    </div>
                    <div className="popup-detail">
                      <strong>First Reported:</strong> {outbreak.first_reported}
                    </div>
                    <div className="popup-detail">
                      <strong>Latest:</strong> {outbreak.latest_reported}
                    </div>
                  </div>
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>
        )}
      </div>

      {/* Outbreak List */}
      <div className="outbreak-list">
        <h3>Detected Outbreaks ({filteredOutbreaks.length})</h3>
        <div className="outbreak-cards">
          {filteredOutbreaks.map((outbreak, index) => (
            <div key={index} className="outbreak-card">
              <div className="outbreak-header">
                <h4>{outbreak.pest_name}</h4>
                <span className={`severity-badge severity-${outbreak.severity}`}>
                  {outbreak.severity}
                </span>
              </div>
              <div className="outbreak-details">
                <p><strong>Location:</strong> {outbreak.district}, {outbreak.state}</p>
                <p><strong>Reports:</strong> {outbreak.report_count}</p>
                <p><strong>Cluster Radius:</strong> {outbreak.radius_km} km</p>
                <p><strong>Date Range:</strong> {outbreak.first_reported} to {outbreak.latest_reported}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Sample outbreak data for demo
const getSampleOutbreaks = () => [
  {
    cluster_id: "whi_17.42_78.51",
    pest_name: "White fly",
    severity: "critical",
    report_count: 12,
    center_lat: 17.42,
    center_lng: 78.51,
    radius_km: 8.5,
    district: "Guntur",
    state: "Andhra Pradesh",
    first_reported: "2024-05-10",
    latest_reported: "2024-05-22"
  },
  {
    cluster_id: "aph_23.02_72.57",
    pest_name: "Aphid",
    severity: "high",
    report_count: 8,
    center_lat: 23.02,
    center_lng: 72.57,
    radius_km: 6.2,
    district: "Ahmedabad",
    state: "Gujarat",
    first_reported: "2024-05-15",
    latest_reported: "2024-05-21"
  },
  {
    cluster_id: "ste_28.61_77.23",
    pest_name: "Stem borer",
    severity: "medium",
    report_count: 5,
    center_lat: 28.61,
    center_lng: 77.23,
    radius_km: 4.8,
    district: "Delhi",
    state: "Delhi",
    first_reported: "2024-05-18",
    latest_reported: "2024-05-22"
  },
  {
    cluster_id: "bol_21.15_79.08",
    pest_name: "Bollworm",
    severity: "high",
    report_count: 9,
    center_lat: 21.15,
    center_lng: 79.08,
    radius_km: 7.3,
    district: "Nagpur",
    state: "Maharashtra",
    first_reported: "2024-05-12",
    latest_reported: "2024-05-21"
  },
  {
    cluster_id: "lea_12.97_77.59",
    pest_name: "Leaf curl",
    severity: "medium",
    report_count: 6,
    center_lat: 12.97,
    center_lng: 77.59,
    radius_km: 5.1,
    district: "Bangalore",
    state: "Karnataka",
    first_reported: "2024-05-16",
    latest_reported: "2024-05-22"
  }
];

export default PestOutbreakMap;
