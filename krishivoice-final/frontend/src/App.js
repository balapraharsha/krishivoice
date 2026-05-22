import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Home, Mic, Map, Calendar, FileText, Users, BarChart3, Sprout } from 'lucide-react';
import './App.css';

// Pages
import Dashboard from './pages/Dashboard';
import VoiceRecording from './pages/VoiceRecording';
import PestOutbreakMap from './pages/PestOutbreakMap';
import DailyBriefing from './pages/DailyBriefing';
import FieldReports from './pages/FieldReports';
import Farmers from './pages/Farmers';
import Analytics from './pages/Analytics';

function Sidebar() {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/voice', icon: Mic, label: 'Voice Recording' },
    { path: '/pest-map', icon: Map, label: 'Pest Outbreak Map' },
    { path: '/briefing', icon: Calendar, label: 'Daily Briefing' },
    { path: '/reports', icon: FileText, label: 'Field Reports' },
    { path: '/farmers', icon: Users, label: 'Farmers' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics' }
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="logo-container">
          <div className="logo-icon">
            <Sprout size={24} />
          </div>
          <div className="logo-text">
            <h1>KrishiVoice</h1>
            <p>Voice Intelligence for Agriculture</p>
          </div>
        </div>
      </div>
      
      <nav className="sidebar-nav">
        {navItems.map(({ path, icon: Icon, label }) => (
          <Link
            key={path}
            to={path}
            className={`nav-link ${location.pathname === path ? 'active' : ''}`}
          >
            <Icon size={20} />
            <span>{label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}

function App() {
  return (
    <Router>
      <div className="app-container">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/voice" element={<VoiceRecording />} />
            <Route path="/pest-map" element={<PestOutbreakMap />} />
            <Route path="/briefing" element={<DailyBriefing />} />
            <Route path="/reports" element={<FieldReports />} />
            <Route path="/farmers" element={<Farmers />} />
            <Route path="/analytics" element={<Analytics />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;