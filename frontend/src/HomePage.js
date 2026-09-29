import React from 'react';
import { Link } from 'react-router-dom';
import TextTransition, { presets } from 'react-text-transition';

const TEXTS = [
  'Institutional-Grade Real Estate Valuation',
  'Trained on 4,500+ King County Sales',
  'Transparent Machine Learning & Market Insights'
];

function HomePage() {
  const [index, setIndex] = React.useState(0);

  React.useEffect(() => {
    const intervalId = setInterval(() => setIndex((i) => i + 1), 3000);
    return () => clearTimeout(intervalId);
  }, []);

  return (
    <div className="hero-container">
      <div className="hero-pill">
        <span className="status-dot"></span>
        Production ML Engine v2.0 • HistGradientBoosting
      </div>

      <h1 className="hero-title">
        <TextTransition springConfig={presets.wobbly}>
          {TEXTS[index % TEXTS.length]}
        </TextTransition>
      </h1>

      <p className="hero-subtitle">
        EstateVal AI delivers accurate property valuations, 95% confidence bounds,
        explainable feature impacts, and regional investment metrics powered by modern ensemble regression.
      </p>

      <div className="hero-cta-group">
        <Link to="/price-calculator" className="btn-primary">
          Launch Valuation Suite &rarr;
        </Link>
        <a href="#features" className="btn-secondary">
          Explore Architecture
        </a>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-val">0.7358</div>
          <div className="stat-label">Model R² Score (5-Fold CV)</div>
        </div>
        <div className="stat-card">
          <div className="stat-val">4,546</div>
          <div className="stat-label">Verified Home Transactions</div>
        </div>
        <div className="stat-card">
          <div className="stat-val">59</div>
          <div className="stat-label">Engineered Features</div>
        </div>
        <div className="stat-card">
          <div className="stat-val">&lt; 20ms</div>
          <div className="stat-label">Real-Time Inference Latency</div>
        </div>
      </div>

      <div id="features" style={{ marginTop: '5rem', textAlign: 'left' }}>
        <h2 style={{ textAlign: 'center', fontSize: '2.2rem', marginBottom: '1rem' }}>
          Engineered for Real-World Machine Learning
        </h2>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '3rem', maxWidth: '650px', margin: '0 auto 3rem auto' }}>
          Replacing legacy linear baselines with modern non-linear gradient boosted trees, automated data cleaning, and transparent feature attribution.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          <div className="stat-card" style={{ textAlign: 'left' }}>
            <h3 style={{ color: 'var(--primary)', fontSize: '1.2rem', marginBottom: '0.5rem' }}>
              🌲 Gradient Boosting Ensemble
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6' }}>
              Built with scikit-learn's HistGradientBoostingRegressor using log-transformed price targets, non-linear interaction modeling, and L2 regularization.
            </p>
          </div>

          <div className="stat-card" style={{ textAlign: 'left' }}>
            <h3 style={{ color: 'var(--accent-cyan)', fontSize: '1.2rem', marginBottom: '0.5rem' }}>
              🔍 Explainable Valuation
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6' }}>
              Provides full feature attribution breaking down living square footage, view premiums, condition scores, and neighborhood impact in dollar values.
            </p>
          </div>

          <div className="stat-card" style={{ textAlign: 'left' }}>
            <h3 style={{ color: 'var(--accent-indigo)', fontSize: '1.2rem', marginBottom: '0.5rem' }}>
              📊 Market Intelligence
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6' }}>
              Benchmarked against 44 King County municipality markets with median price-per-square-foot metrics and regional comparisons.
            </p>
          </div>

          <div className="stat-card" style={{ textAlign: 'left' }}>
            <h3 style={{ color: 'var(--accent-amber)', fontSize: '1.2rem', marginBottom: '0.5rem' }}>
              💼 Investment Analytics
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6' }}>
              Real-time calculation of estimated monthly rental cashflows, gross yields, and estimated capitalization rates.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
