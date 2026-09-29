import React from 'react';
import './App.css';
import { Route, Routes, Link, useLocation } from 'react-router-dom';
import HomePage from './HomePage';
import PriceCalculatorPage from './PriceCalculatorPage';

function App() {
  const location = useLocation();

  return (
    <div className="app-wrapper">
      {/* Top Navigation Bar */}
      <nav className="navbar">
        <Link to="/" className="brand">
          <div className="brand-icon">E</div>
          <div className="brand-name">EstateVal AI</div>
          <span className="brand-badge">ML v2.0</span>
        </Link>

        <div className="nav-links">
          <Link
            to="/"
            className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
          >
            Overview
          </Link>
          <Link
            to="/price-calculator"
            className={`nav-link ${location.pathname === '/price-calculator' ? 'active' : ''}`}
          >
            Valuation Suite
          </Link>
          <Link
            to="/price-calculator"
            className="btn-primary"
            style={{ padding: '0.5rem 1.15rem', fontSize: '0.85rem', borderRadius: '8px' }}
          >
            Run Valuation
          </Link>
        </div>
      </nav>

      {/* Main Content Routes */}
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/price-calculator" element={<PriceCalculatorPage />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border-subtle)', padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
        <p style={{ margin: '0 0 0.5rem 0' }}>
          <strong>EstateVal AI</strong> &mdash; Intelligent Real Estate Valuation & Market Analytics Engine
        </p>
        <p style={{ margin: 0, color: 'var(--text-dim)', fontSize: '0.8rem' }}>
          Trained on King County MLS Open Housing Data &bull; HistGradientBoosting Architecture with Log1p Stabilization
        </p>
      </footer>
    </div>
  );
}

export default App;
