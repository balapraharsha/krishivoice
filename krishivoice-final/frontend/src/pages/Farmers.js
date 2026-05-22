import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Users, MapPin, Sprout, Phone, Globe, Search,
  Filter, SlidersHorizontal, User, Layers, TrendingUp,
  ChevronRight, Wheat
} from 'lucide-react';

const SAMPLE_FARMERS = [
  { name: 'Ramesh Kumar',    village: 'Tenali',    district: 'Guntur',   state: 'Andhra Pradesh', primary_crop: '{"crop":"Tomato","season":"Kharif"}',    land_size_acres: 5.5,  phone: '+91 98765 43210', language: 'Telugu' },
  { name: 'Lakshmi Devi',   village: 'Chirala',   district: 'Prakasam', state: 'Andhra Pradesh', primary_crop: '{"crop":"Chili","season":"Rabi"}',        land_size_acres: 3.2,  phone: '+91 98765 43211', language: 'Telugu' },
  { name: 'Suresh Reddy',   village: 'Nandyal',   district: 'Kurnool',  state: 'Andhra Pradesh', primary_crop: '{"crop":"Groundnut","season":"Kharif"}',  land_size_acres: 8.0,  phone: '+91 98765 43212', language: 'Telugu' },
  { name: 'Parvati Bai',    village: 'Nizamabad', district: 'Nizamabad',state: 'Telangana',       primary_crop: '{"crop":"Cotton","season":"Kharif"}',     land_size_acres: 12.5, phone: '+91 98765 43213', language: 'Telugu' },
  { name: 'Venkat Swamy',   village: 'Warangal',  district: 'Warangal', state: 'Telangana',       primary_crop: '{"crop":"Rice","season":"Kharif"}',       land_size_acres: 4.8,  phone: '+91 98765 43214', language: 'Telugu' },
  { name: 'Anitha Kumari',  village: 'Ongole',    district: 'Prakasam', state: 'Andhra Pradesh', primary_crop: '{"crop":"Maize","season":"Rabi"}',        land_size_acres: 6.3,  phone: '+91 98765 43215', language: 'Telugu' },
  { name: 'Raju Naidu',     village: 'Bhimavaram',district: 'W. Godavari',state:'Andhra Pradesh',primary_crop: '{"crop":"Banana","season":"Annual"}',     land_size_acres: 2.1,  phone: '+91 98765 43216', language: 'Telugu' },
  { name: 'Geetha Rani',    village: 'Kadapa',    district: 'YSR Kadapa',state:'Andhra Pradesh', primary_crop: '{"crop":"Sugarcane","season":"Annual"}',  land_size_acres: 9.7,  phone: '+91 98765 43217', language: 'Telugu' },
];

const CROP_COLORS = {
  Tomato: '#EF4444', Chili: '#F97316', Cotton: '#8B5CF6',
  Rice: '#10B981', Groundnut: '#F59E0B', Maize: '#3B82F6',
  Banana: '#84CC16', Sugarcane: '#06B6D4'
};

const parseCrop = (cropData) => {
  if (!cropData) return { crop: 'Not specified', season: '' };
  if (typeof cropData === 'string') {
    try {
      const p = JSON.parse(cropData);
      return { crop: p.crop || cropData, season: p.season || '' };
    } catch {
      return { crop: cropData.substring(0, 40), season: '' };
    }
  }
  return { crop: cropData.crop || String(cropData), season: cropData.season || '' };
};

const getInitials = (name) =>
  name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);

const avatarColors = [
  '#2D6A4F','#40916C','#52B788','#1D4ED8','#7C3AED',
  '#B45309','#DC2626','#0891B2'
];

const FarmerCard = ({ farmer, index }) => {
  const cropInfo = parseCrop(farmer.primary_crop);
  const cropColor = CROP_COLORS[cropInfo.crop] || 'var(--accent-green)';
  const avatarColor = avatarColors[index % avatarColors.length];

  return (
    <div
      className="farmer-card"
      style={{ animation: `slideUp 0.4s ease-out ${(index % 8) * 0.06}s both` }}
    >
      {/* Card Top */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '16px' }}>
        <div style={{
          width: '48px', height: '48px', borderRadius: '12px',
          background: avatarColor, display: 'flex', alignItems: 'center',
          justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '16px',
          flexShrink: 0, boxShadow: `0 2px 8px ${avatarColor}55`
        }}>
          {getInitials(farmer.name)}
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '2px' }}>
            {farmer.name}
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-gray)', fontSize: '13px' }}>
            <MapPin size={12} />
            {farmer.village}, {farmer.district}
          </div>
        </div>
        <span style={{
          padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700,
          background: `${cropColor}18`, color: cropColor,
          textTransform: 'uppercase', letterSpacing: '0.4px', flexShrink: 0
        }}>
          {cropInfo.crop}
        </span>
      </div>

      {/* Divider */}
      <div style={{ height: '1px', background: 'var(--border-gray)', marginBottom: '14px' }} />

      {/* Details */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '13px' }}>
        {farmer.state && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-gray)' }}>
            <Globe size={13} style={{ color: 'var(--accent-green)', flexShrink: 0 }} />
            <span>{farmer.state}</span>
          </div>
        )}
        {farmer.land_size_acres && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-gray)' }}>
            <Layers size={13} style={{ color: 'var(--accent-green)', flexShrink: 0 }} />
            <span>{farmer.land_size_acres} acres</span>
          </div>
        )}
        {cropInfo.season && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-gray)' }}>
            <Sprout size={13} style={{ color: 'var(--accent-green)', flexShrink: 0 }} />
            <span>{cropInfo.season}</span>
          </div>
        )}
        {farmer.language && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-gray)' }}>
            <Globe size={13} style={{ color: 'var(--accent-green)', flexShrink: 0 }} />
            <span>{farmer.language}</span>
          </div>
        )}
        {farmer.phone && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-gray)', gridColumn: '1 / -1' }}>
            <Phone size={13} style={{ color: 'var(--accent-green)', flexShrink: 0 }} />
            <span>{farmer.phone}</span>
          </div>
        )}
      </div>
    </div>
  );
};

const Farmers = () => {
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [cropFilter, setCropFilter] = useState('all');

  useEffect(() => { fetchFarmers(); }, []);

  const fetchFarmers = async () => {
    try {
      const res = await axios.get('/api/farmers?limit=100');
      const data = res.data.farmers;
      setFarmers(data && data.length > 0 ? data : SAMPLE_FARMERS);
    } catch {
      setFarmers(SAMPLE_FARMERS);
    } finally {
      setLoading(false);
    }
  };

  // Unique crops for filter
  const allCrops = [...new Set(
    farmers.map(f => parseCrop(f.primary_crop).crop).filter(Boolean)
  )].sort();

  const filtered = farmers.filter(f => {
    const cropInfo = parseCrop(f.primary_crop);
    const matchCrop = cropFilter === 'all' || cropInfo.crop === cropFilter;
    const q = search.toLowerCase();
    const matchSearch = !q ||
      f.name?.toLowerCase().includes(q) ||
      f.village?.toLowerCase().includes(q) ||
      f.district?.toLowerCase().includes(q) ||
      cropInfo.crop.toLowerCase().includes(q);
    return matchCrop && matchSearch;
  });

  const totalAcres = filtered.reduce((sum, f) => sum + (parseFloat(f.land_size_acres) || 0), 0);

  if (loading) return (
    <div className="loading">
      <div className="spinner"></div>
    </div>
  );

  return (
    <div className="farmers-page" style={{ animation: 'fadeIn 0.5s ease-out' }}>
      {/* Header */}
      <header className="page-header" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div className="header-icon"><Users size={24} /></div>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-dark)' }}>Farmers</h1>
          <p style={{ color: 'var(--text-gray)', marginTop: '4px' }}>
            {farmers.length} registered farmer profiles
          </p>
        </div>
      </header>

      {/* Summary Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Total Farmers', value: farmers.length, icon: Users, color: 'var(--primary-green)' },
          { label: 'Total Area (acres)', value: farmers.reduce((s, f) => s + (parseFloat(f.land_size_acres) || 0), 0).toFixed(1), icon: Layers, color: '#3B82F6' },
          { label: 'Unique Crops', value: allCrops.length, icon: Wheat, color: '#F59E0B' },
          { label: 'Filtered Results', value: filtered.length, icon: Filter, color: '#8B5CF6' },
        ].map(({ label, value, icon: Icon, color }, i) => (
          <div key={label} className="card" style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px', animation: `slideUp 0.4s ease-out ${i * 0.08}s both` }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color, flexShrink: 0 }}>
              <Icon size={20} />
            </div>
            <div>
              <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-dark)' }}>{value}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-gray)', marginTop: '1px' }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Search + Filter */}
      <div style={{
        display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap',
        background: 'var(--white)', padding: '16px', borderRadius: '12px', boxShadow: 'var(--shadow)'
      }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-gray)' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, village, district..."
            style={{ width: '100%', padding: '8px 12px 8px 36px', border: '1px solid var(--border-gray)', borderRadius: '8px', fontSize: '14px', outline: 'none' }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <SlidersHorizontal size={16} style={{ color: 'var(--text-gray)' }} />
          <select
            value={cropFilter}
            onChange={e => setCropFilter(e.target.value)}
            style={{ padding: '8px 12px', border: '1px solid var(--border-gray)', borderRadius: '8px', fontSize: '14px', background: 'var(--white)', cursor: 'pointer' }}
          >
            <option value="all">All Crops</option>
            {allCrops.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><User size={32} /></div>
          <p style={{ fontWeight: 600, color: 'var(--text-dark)' }}>No farmers match your search</p>
          <p style={{ fontSize: '14px', marginTop: '4px' }}>Try a different name or crop filter</p>
        </div>
      ) : (
        <div className="farmers-grid">
          {filtered.map((farmer, i) => (
            <FarmerCard key={i} farmer={farmer} index={i} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Farmers;