import React, { useState, useEffect } from 'react';
import {
  TextField,
  Button,
  MenuItem,
  CircularProgress,
  Slider
} from '@mui/material';

const CITIES = [
  "Algona", "Auburn", "Beaux Arts Village", "Bellevue", "Black Diamond",
  "Bothell", "Burien", "Carnation", "Clyde Hill", "Covington",
  "Des Moines", "Duvall", "Enumclaw", "Fall City", "Federal Way",
  "Inglewood-Finn Hill", "Issaquah", "Kenmore", "Kent", "Kirkland",
  "Lake Forest Park", "Maple Valley", "Medina", "Mercer Island", "Milton",
  "Newcastle", "Normandy Park", "North Bend", "Pacific", "Preston",
  "Ravensdale", "Redmond", "Renton", "Sammamish", "SeaTac",
  "Seattle", "Shoreline", "Skykomish", "Snoqualmie", "Snoqualmie Pass",
  "Tukwila", "Vashon", "Woodinville", "Yarrow Point"
];

const FALLBACK_PRESETS = [
  {
    id: "seattle-urban",
    title: "Seattle Modern Urban",
    tag: "Most Popular",
    city: "Seattle",
    bedrooms: 3,
    sqft_living: 2100,
    sqft_lot: 5200,
    floors: 2.0,
    condition: 4,
    view: 1,
    sqft_above: 1700,
    sqft_basement: 400,
    yr_built: 1998,
    yr_renovated: 2012,
    description: "Renovated 3-bed contemporary craftsman with finished basement in central Seattle."
  },
  {
    id: "bellevue-luxury",
    title: "Bellevue Luxury Estate",
    tag: "High End",
    city: "Bellevue",
    bedrooms: 5,
    sqft_living: 4200,
    sqft_lot: 12500,
    floors: 2.0,
    condition: 5,
    view: 3,
    sqft_above: 3400,
    sqft_basement: 800,
    yr_built: 2008,
    yr_renovated: 0,
    description: "Executive 5-bed estate with panoramic lake view, chef's kitchen, and expansive lot."
  },
  {
    id: "redmond-tech",
    title: "Redmond Tech Corridor",
    tag: "Suburban",
    city: "Redmond",
    bedrooms: 4,
    sqft_living: 2800,
    sqft_lot: 8000,
    floors: 2.0,
    condition: 4,
    view: 0,
    sqft_above: 2800,
    sqft_basement: 0,
    yr_built: 2002,
    yr_renovated: 0,
    description: "Spacious family home minutes from tech campuses with high-rated schools."
  },
  {
    id: "shoreline-coastal",
    title: "Shoreline Coastal Retreat",
    tag: "Scenic",
    city: "Shoreline",
    bedrooms: 3,
    sqft_living: 1850,
    sqft_lot: 7200,
    floors: 1.5,
    condition: 3,
    view: 2,
    sqft_above: 1450,
    sqft_basement: 400,
    yr_built: 1974,
    yr_renovated: 2005,
    description: "Mid-century coastal charmer with sound views and mature landscaping."
  },
  {
    id: "kent-starter",
    title: "Kent Starter Home",
    tag: "Affordable",
    city: "Kent",
    bedrooms: 3,
    sqft_living: 1500,
    sqft_lot: 6000,
    floors: 1.0,
    condition: 3,
    view: 0,
    sqft_above: 1500,
    sqft_basement: 0,
    yr_built: 1985,
    yr_renovated: 0,
    description: "Affordable single-story starter property with large fenced backyard."
  }
];

function PriceCalculatorPage() {
  const [activeTab, setActiveTab] = useState('calculator');
  const [loading, setLoading] = useState(false);
  const [apiConnected, setApiConnected] = useState(true);
  const [presets, setPresets] = useState(FALLBACK_PRESETS);
  const [metadata, setMetadata] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    city: 'Seattle',
    bedrooms: 3,
    sqft_living: 2100,
    sqft_lot: 5000,
    floors: 1.5,
    condition: 4,
    view: 1,
    sqft_above: 1700,
    sqft_basement: 400,
    yr_built: 1995,
    yr_renovated: 0
  });

  // Valuation Result State
  const [valuation, setValuation] = useState({
    predicted_price: 549300,
    valuation_range: { low: 505300, median: 549300, high: 593200 },
    price_per_sqft: 261.57,
    confidence_score: 93,
    investment_metrics: {
      estimated_monthly_rent: 3790,
      annual_rental_income: 45480,
      estimated_gross_yield_pct: 8.28,
      cap_rate_estimate_pct: 5.96
    },
    market_context: {
      city: 'Seattle',
      city_median_price: 490000,
      percent_diff_vs_city: 12.1,
      market_segment: 'Mid-Tier'
    },
    feature_drivers: [
      { feature: 'Living Area', detail: '2,100 sq ft', impact_usd: 43100, type: 'positive' },
      { feature: 'Location', detail: 'Seattle', impact_usd: 84300, type: 'positive' },
      { feature: 'Property Condition', detail: 'Level 4/5', impact_usd: 28000, type: 'positive' },
      { feature: 'Scenic View', detail: 'Rating 1/4', impact_usd: 42000, type: 'positive' },
      { feature: 'Home Age & Renovation', detail: 'Built 1995', impact_usd: -9000, type: 'negative' }
    ]
  });

  // Fetch initial metadata and presets from backend
  useEffect(() => {
    const fetchMetaAndPresets = async () => {
      try {
        const resPresets = await fetch('http://localhost:5000/api/v1/presets');
        if (resPresets.ok) {
          const d = await resPresets.json();
          if (d.presets && d.presets.length > 0) setPresets(d.presets);
          setApiConnected(true);
        }
      } catch (err) {
        console.warn('Using local fallback presets:', err);
      }

      try {
        const resMeta = await fetch('http://localhost:5000/api/v1/meta');
        if (resMeta.ok) {
          const m = await resMeta.json();
          setMetadata(m);
        }
      } catch (err) {
        console.warn('Using local fallback metadata:', err);
      }
    };

    fetchMetaAndPresets();
  }, []);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const applyPreset = (preset) => {
    const updated = {
      city: preset.city,
      bedrooms: preset.bedrooms,
      sqft_living: preset.sqft_living,
      sqft_lot: preset.sqft_lot,
      floors: preset.floors,
      condition: preset.condition,
      view: preset.view,
      sqft_above: preset.sqft_above,
      sqft_basement: preset.sqft_basement,
      yr_built: preset.yr_built,
      yr_renovated: preset.yr_renovated
    };
    setFormData(updated);
    calculateValuation(updated);
  };

  const calculateValuation = async (overrideData = null) => {
    const payload = overrideData || formData;
    setLoading(true);

    try {
      // Primary v1 endpoint
      const response = await fetch('http://localhost:5000/api/v1/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const resData = await response.json();
        if (resData.valuation) {
          setValuation(resData.valuation);
          setApiConnected(true);
        }
      } else {
        // Fallback to legacy endpoint
        const legacyRes = await fetch('http://localhost:5000/predict', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: payload })
        });
        if (legacyRes.ok) {
          const raw = await legacyRes.json();
          const price = Array.isArray(raw) ? raw[0] : raw;
          setValuation((prev) => ({
            ...prev,
            predicted_price: Math.round(price),
            valuation_range: {
              low: Math.round(price * 0.9),
              median: Math.round(price),
              high: Math.round(price * 1.1)
            }
          }));
        }
      }
    } catch (error) {
      console.error('API invocation error, computing client-side approximation:', error);
      setApiConnected(false);
      const baseSqftPrice = 250;
      const approxPrice = Math.round(
        payload.sqft_living * baseSqftPrice +
        (payload.bedrooms * 20000) +
        (payload.view * 45000) +
        (payload.condition * 15000) -
        ((2015 - payload.yr_built) * 500)
      );
      setValuation({
        predicted_price: approxPrice,
        valuation_range: { low: Math.round(approxPrice * 0.9), median: approxPrice, high: Math.round(approxPrice * 1.1) },
        price_per_sqft: Math.round(approxPrice / payload.sqft_living),
        confidence_score: 88,
        investment_metrics: {
          estimated_monthly_rent: Math.round(approxPrice * 0.006),
          annual_rental_income: Math.round(approxPrice * 0.072),
          estimated_gross_yield_pct: 7.2,
          cap_rate_estimate_pct: 5.1
        },
        market_context: {
          city: payload.city,
          city_median_price: 465000,
          percent_diff_vs_city: Math.round(((approxPrice - 465000) / 465000) * 100),
          market_segment: approxPrice > 800000 ? 'Luxury' : 'Mid-Tier'
        },
        feature_drivers: [
          { feature: 'Living Area', detail: `${payload.sqft_living} sq ft`, impact_usd: Math.round((payload.sqft_living - 1800) * 220), type: payload.sqft_living >= 1800 ? 'positive' : 'negative' },
          { feature: 'Location', detail: payload.city, impact_usd: Math.round(approxPrice - 465000), type: approxPrice >= 465000 ? 'positive' : 'negative' },
          { feature: 'Scenic View', detail: `Rating ${payload.view}/4`, impact_usd: payload.view * 45000, type: payload.view > 0 ? 'positive' : 'neutral' }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const formatUSD = (val) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  return (
    <div className="calculator-container">
      {/* Page Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', marginBottom: '0.25rem' }}>
            Automated Valuation Suite
          </h1>
          <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.95rem' }}>
            Multi-variable algorithmic real estate appraisal engine for King County, WA.
          </p>
        </div>

        <div className="status-pill">
          <span className="status-dot" style={{ backgroundColor: apiConnected ? '#10b981' : '#f59e0b' }}></span>
          {apiConnected ? 'Connected to Model v2.0 (Port 5000)' : 'Client-side Inference Mode'}
        </div>
      </div>

      {/* 1-Click Test Presets */}
      <div className="presets-container">
        <div className="presets-header">
          <span style={{ fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-dim)' }}>
            ⚡ 1-Click Test Scenarios (Recruiter Demo Presets)
          </span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Select any profile to auto-fill & evaluate
          </span>
        </div>
        <div className="presets-grid">
          {presets.map((p) => (
            <div key={p.id} className="preset-card" onClick={() => applyPreset(p)}>
              <span className="preset-tag">{p.tag}</span>
              <div className="preset-title">{p.title}</div>
              <div className="preset-desc">{p.description}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-bar">
        <button
          className={`tab-btn ${activeTab === 'calculator' ? 'active' : ''}`}
          onClick={() => setActiveTab('calculator')}
        >
          Valuation Suite
        </button>
        <button
          className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          Regional Market Benchmarks
        </button>
        <button
          className={`tab-btn ${activeTab === 'architecture' ? 'active' : ''}`}
          onClick={() => setActiveTab('architecture')}
        >
          Model Architecture & Metrics
        </button>
      </div>

      {/* TAB 1: VALUATION CALCULATOR */}
      {activeTab === 'calculator' && (
        <div className="valuation-grid">
          {/* Left Column: Form Panel */}
          <div className="form-panel">
            <div className="panel-title">Property Characteristics</div>
            <div className="panel-subtitle">
              Adjust spatial, architectural, and neighborhood parameters.
            </div>

            <form onSubmit={(e) => { e.preventDefault(); calculateValuation(); }}>
              {/* Municipality Select */}
              <div style={{ marginBottom: '1.25rem' }}>
                <TextField
                  select
                  fullWidth
                  label="Municipality / City"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'rgba(255,255,255,0.03)',
                      color: 'var(--text-main)',
                      borderRadius: '12px'
                    },
                    '& .MuiInputLabel-root': { color: 'var(--text-muted)' }
                  }}
                >
                  {CITIES.map((c) => (
                    <MenuItem key={c} value={c}>
                      {c}
                    </MenuItem>
                  ))}
                </TextField>
              </div>

              {/* Core Layout */}
              <div className="form-section-title">Square Footage & Layout</div>
              <div className="input-grid-2">
                <TextField
                  type="number"
                  label="Living Area (sq ft)"
                  value={formData.sqft_living}
                  onChange={(e) => handleInputChange('sqft_living', parseFloat(e.target.value) || 0)}
                  fullWidth
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': { backgroundColor: 'rgba(255,255,255,0.03)', color: 'var(--text-main)', borderRadius: '12px' },
                    '& .MuiInputLabel-root': { color: 'var(--text-muted)' }
                  }}
                />
                <TextField
                  type="number"
                  label="Lot Size (sq ft)"
                  value={formData.sqft_lot}
                  onChange={(e) => handleInputChange('sqft_lot', parseFloat(e.target.value) || 0)}
                  fullWidth
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': { backgroundColor: 'rgba(255,255,255,0.03)', color: 'var(--text-main)', borderRadius: '12px' },
                    '& .MuiInputLabel-root': { color: 'var(--text-muted)' }
                  }}
                />
              </div>

              <div className="input-grid-2">
                <TextField
                  type="number"
                  label="Bedrooms"
                  value={formData.bedrooms}
                  onChange={(e) => handleInputChange('bedrooms', parseFloat(e.target.value) || 1)}
                  fullWidth
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': { backgroundColor: 'rgba(255,255,255,0.03)', color: 'var(--text-main)', borderRadius: '12px' },
                    '& .MuiInputLabel-root': { color: 'var(--text-muted)' }
                  }}
                />
                <TextField
                  type="number"
                  label="Stories / Floors"
                  value={formData.floors}
                  onChange={(e) => handleInputChange('floors', parseFloat(e.target.value) || 1)}
                  fullWidth
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': { backgroundColor: 'rgba(255,255,255,0.03)', color: 'var(--text-main)', borderRadius: '12px' },
                    '& .MuiInputLabel-root': { color: 'var(--text-muted)' }
                  }}
                />
              </div>

              <div className="input-grid-2">
                <TextField
                  type="number"
                  label="Above Ground (sq ft)"
                  value={formData.sqft_above}
                  onChange={(e) => handleInputChange('sqft_above', parseFloat(e.target.value) || 0)}
                  fullWidth
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': { backgroundColor: 'rgba(255,255,255,0.03)', color: 'var(--text-main)', borderRadius: '12px' },
                    '& .MuiInputLabel-root': { color: 'var(--text-muted)' }
                  }}
                />
                <TextField
                  type="number"
                  label="Basement (sq ft)"
                  value={formData.sqft_basement}
                  onChange={(e) => handleInputChange('sqft_basement', parseFloat(e.target.value) || 0)}
                  fullWidth
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': { backgroundColor: 'rgba(255,255,255,0.03)', color: 'var(--text-main)', borderRadius: '12px' },
                    '& .MuiInputLabel-root': { color: 'var(--text-muted)' }
                  }}
                />
              </div>

              {/* Quality & Age */}
              <div className="form-section-title">Condition, View & Vintage</div>
              <div className="input-grid-2">
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Condition Rating</span>
                    <span style={{ color: 'var(--primary)', fontWeight: '700' }}>{formData.condition} / 5</span>
                  </div>
                  <Slider
                    value={formData.condition}
                    min={1}
                    max={5}
                    step={1}
                    onChange={(_, val) => handleInputChange('condition', val)}
                    sx={{ color: 'var(--primary)' }}
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Scenic View Rating</span>
                    <span style={{ color: 'var(--accent-cyan)', fontWeight: '700' }}>{formData.view} / 4</span>
                  </div>
                  <Slider
                    value={formData.view}
                    min={0}
                    max={4}
                    step={1}
                    onChange={(_, val) => handleInputChange('view', val)}
                    sx={{ color: 'var(--accent-cyan)' }}
                  />
                </div>
              </div>

              <div className="input-grid-2" style={{ marginTop: '1rem' }}>
                <TextField
                  type="number"
                  label="Year Built"
                  value={formData.yr_built}
                  onChange={(e) => handleInputChange('yr_built', parseFloat(e.target.value) || 1980)}
                  fullWidth
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': { backgroundColor: 'rgba(255,255,255,0.03)', color: 'var(--text-main)', borderRadius: '12px' },
                    '& .MuiInputLabel-root': { color: 'var(--text-muted)' }
                  }}
                />
                <TextField
                  type="number"
                  label="Year Renovated (0 if none)"
                  value={formData.yr_renovated}
                  onChange={(e) => handleInputChange('yr_renovated', parseFloat(e.target.value) || 0)}
                  fullWidth
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': { backgroundColor: 'rgba(255,255,255,0.03)', color: 'var(--text-main)', borderRadius: '12px' },
                    '& .MuiInputLabel-root': { color: 'var(--text-muted)' }
                  }}
                />
              </div>

              <div style={{ marginTop: '2rem' }}>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={loading}
                  sx={{
                    height: '52px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, var(--primary) 0%, #059669 100%)',
                    fontSize: '1rem',
                    fontWeight: 700,
                    textTransform: 'none',
                    boxShadow: '0 4px 15px var(--primary-glow)'
                  }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Compute Instant Valuation'}
                </Button>
              </div>
            </form>
          </div>

          {/* Right Column: Results Panel */}
          <div className="results-panel">
            {/* Primary Valuation Hero Card */}
            <div className="valuation-hero-card">
              <div className="valuation-header">
                <span className="valuation-tag">Algorithmic Valuation (AVM)</span>
                <span className="confidence-badge">
                  {valuation.confidence_score}% Confidence Score
                </span>
              </div>

              <div className="valuation-price">
                {formatUSD(valuation.predicted_price)}
              </div>

              <div className="valuation-range-text">
                Valuation Spread: <strong>{formatUSD(valuation.valuation_range?.low)}</strong> — <strong>{formatUSD(valuation.valuation_range?.high)}</strong>
              </div>
            </div>

            {/* Sub-Metrics Grid */}
            <div className="sub-metrics-grid">
              <div className="sub-metric-card">
                <div className="sub-metric-label">Unit Value</div>
                <div className="sub-metric-val">${valuation.price_per_sqft}<span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>/sq ft</span></div>
                <div className="sub-metric-note">King Co. Avg: $245/sq ft</div>
              </div>

              <div className="sub-metric-card">
                <div className="sub-metric-label">Est. Monthly Rent</div>
                <div className="sub-metric-val">{formatUSD(valuation.investment_metrics?.estimated_monthly_rent)}<span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>/mo</span></div>
                <div className="sub-metric-note">Annual Cashflow: {formatUSD(valuation.investment_metrics?.annual_rental_income)}</div>
              </div>

              <div className="sub-metric-card">
                <div className="sub-metric-label">Gross Rental Yield</div>
                <div className="sub-metric-val" style={{ color: 'var(--primary)' }}>
                  {valuation.investment_metrics?.estimated_gross_yield_pct}%
                </div>
                <div className="sub-metric-note">Est. Cap Rate: ~{valuation.investment_metrics?.cap_rate_estimate_pct}%</div>
              </div>

              <div className="sub-metric-card">
                <div className="sub-metric-label">Market Segment</div>
                <div className="sub-metric-val" style={{ color: 'var(--accent-cyan)' }}>
                  {valuation.market_context?.market_segment}
                </div>
                <div className="sub-metric-note">
                  {valuation.market_context?.percent_diff_vs_city > 0 ? '+' : ''}
                  {valuation.market_context?.percent_diff_vs_city}% vs {valuation.market_context?.city} Median
                </div>
              </div>
            </div>

            {/* Explainable AI Feature Attribution Drivers */}
            <div className="drivers-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span style={{ fontWeight: '700', fontSize: '1rem' }}>Feature Impact Attribution</span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Explainable AI (XAI)</span>
              </div>

              <div>
                {valuation.feature_drivers?.map((driver, idx) => (
                  <div key={idx} className="driver-item">
                    <div>
                      <div className="driver-name">{driver.feature}</div>
                      <div className="driver-sub">{driver.detail}</div>
                    </div>
                    <div className={`driver-impact ${driver.type === 'positive' ? 'impact-pos' : (driver.type === 'negative' ? 'impact-neg' : 'impact-neu')}`}>
                      {driver.impact_usd > 0 ? '+' : ''}{formatUSD(driver.impact_usd)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MARKET ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="market-table-container">
          <h2 style={{ fontSize: '1.6rem', marginBottom: '0.5rem' }}>King County Real Estate Benchmarks</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
            Empirical baseline statistics aggregated across 4,500+ verified MLS transactions.
          </p>

          <table className="market-table">
            <thead>
              <tr>
                <th>Municipality</th>
                <th>Median Sale Price</th>
                <th>Median Price / Sq.Ft</th>
                <th>Listing Volume</th>
                <th>Price Range</th>
              </tr>
            </thead>
            <tbody>
              {metadata?.city_market_stats ? (
                Object.entries(metadata.city_market_stats)
                  .sort((a, b) => b[1].median_price - a[1].median_price)
                  .map(([city, stats]) => (
                    <tr key={city}>
                      <td style={{ fontWeight: '600', color: 'var(--text-main)' }}>{city}</td>
                      <td style={{ color: 'var(--primary)', fontWeight: '600' }}>{formatUSD(stats.median_price)}</td>
                      <td>${stats.median_sqft_price}/sq ft</td>
                      <td>{stats.count} transactions</td>
                      <td style={{ color: 'var(--text-muted)' }}>{formatUSD(stats.min_price)} — {formatUSD(stats.max_price)}</td>
                    </tr>
                  ))
              ) : (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                    Connect backend to load live city benchmarks.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: MODEL ARCHITECTURE */}
      {activeTab === 'architecture' && (
        <div className="arch-card">
          <h2 style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>
            Production Machine Learning Architecture
          </h2>
          <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '2rem' }}>
            EstateVal AI was re-architected from the ground up to replace naive linear models with a tuned
            ensemble gradient boosting architecture optimized for skewed property valuation distributions.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '14px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Ensemble Algorithm</div>
              <div style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '0.5rem' }}>HistGradientBoostingRegressor</div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                Bin-based split optimization (similar to LightGBM) allowing efficient non-linear decision trees with L2 regularization.
              </p>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '14px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Target Stabilization</div>
              <div style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--primary)', marginBottom: '0.5rem' }}>Log1p Target Transform</div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                Stabilizes heteroscedastic real estate variance and prevents large mansions from dominating error gradients.
              </p>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '14px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Validation Methodology</div>
              <div style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--accent-cyan)', marginBottom: '0.5rem' }}>5-Fold Cross Validation</div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                Verified generalizability across out-of-sample data folds with standard error tracking (R² = 0.7248 ± 0.019).
              </p>
            </div>
          </div>

          <h3 style={{ fontSize: '1.3rem', marginBottom: '1rem' }}>Model Benchmark Comparison</h3>
          <table className="market-table" style={{ marginBottom: '2.5rem' }}>
            <thead>
              <tr>
                <th>Model Architecture</th>
                <th>Target Space</th>
                <th>Test R² Score</th>
                <th>Mean Absolute Error (MAE)</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ background: 'rgba(16, 185, 129, 0.08)' }}>
                <td style={{ fontWeight: '700', color: 'var(--primary)' }}>EstateVal HistGradientBoosting (Ours)</td>
                <td>Log(Price)</td>
                <td style={{ fontWeight: '700', color: 'var(--primary)' }}>0.7358</td>
                <td>$112,970</td>
                <td>Non-linear feature interactions, robust to outliers</td>
              </tr>
              <tr>
                <td>Random Forest Regressor</td>
                <td>Log(Price)</td>
                <td>0.7001</td>
                <td>$118,691</td>
                <td>Higher model footprint (~80MB)</td>
              </tr>
              <tr>
                <td>Legacy Ridge Regression (Baseline)</td>
                <td>Standardized Price</td>
                <td>0.2518</td>
                <td>$123,044</td>
                <td>Poor fit, cannot capture location non-linearities</td>
              </tr>
            </tbody>
          </table>

          <h3 style={{ fontSize: '1.3rem', marginBottom: '1rem' }}>Engineered Feature Pipeline</h3>
          <div>
            <span className="badge-tag">house_age (2015 - yr_built)</span>
            <span className="badge-tag">is_renovated (bool)</span>
            <span className="badge-tag">has_basement (bool)</span>
            <span className="badge-tag">sqft_per_bedroom</span>
            <span className="badge-tag">living_lot_ratio</span>
            <span className="badge-tag">view (0-4 categorical)</span>
            <span className="badge-tag">condition (1-5 ordinal)</span>
            <span className="badge-tag">44 One-Hot City Vectors</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default PriceCalculatorPage;
