import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, MapPin, Sprout, Phone, Globe } from 'lucide-react';

const Farmers = () => {
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
      console.error('Error fetching farmers:', error);
      setLoading(false);
    }
  };

  const parseCrop = (cropData) => {
    if (!cropData) return 'Not specified';
    
    if (typeof cropData === 'string') {
      try {
        const parsed = JSON.parse(cropData);
        if (parsed.crop) {
          return `${parsed.crop} (${parsed.season || 'Season not specified'})`;
        }
        return cropData.substring(0, 50);
      } catch (e) {
        return cropData.substring(0, 50);
      }
    }
    
    if (cropData.crop) {
      return `${cropData.crop} (${cropData.season || 'Season not specified'})`;
    }
    
    return String(cropData).substring(0, 50);
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="farmers-page">
      <header className="page-header">
        <div className="header-icon">
          <Users size={24} />
        </div>
        <div>
          <h1>Farmers</h1>
          <p>Registered farmer profiles ({farmers.length} total)</p>
        </div>
      </header>
      
      <div className="farmers-grid">
        {farmers.map((farmer, index) => (
          <div key={index} className="farmer-card">
            <h3>
              <div className="avatar">{getInitials(farmer.name)}</div>
              {farmer.name}
            </h3>
            <div className="farmer-details">
              <div className="detail-row">
                <MapPin size={16} />
                <span>{farmer.village}, {farmer.district}</span>
              </div>
              {farmer.state && (
                <div className="detail-row">
                  <MapPin size={16} />
                  <span><strong>State:</strong> {farmer.state}</span>
                </div>
              )}
              <div className="detail-row">
                <Sprout size={16} />
                <span><strong>Crop:</strong> {parseCrop(farmer.primary_crop)}</span>
              </div>
              <div className="detail-row">
                <Sprout size={16} />
                <span><strong>Land:</strong> {farmer.land_size_acres} acres</span>
              </div>
              {farmer.phone && (
                <div className="detail-row">
                  <Phone size={16} />
                  <span>{farmer.phone}</span>
                </div>
              )}
              {farmer.language && (
                <div className="detail-row">
                  <Globe size={16} />
                  <span>{farmer.language}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Farmers;