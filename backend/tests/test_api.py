"""
EstateVal AI - Automated Unit & Integration Tests
===================================================
Tests API endpoints, response structures, health checks,
input validation, and backwards compatibility.
"""

import pytest
import sys
import os

# Add parent directory to path so app can be imported
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from app import app

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_health_endpoint(client):
    response = client.get('/health')
    assert response.status_code == 200
    data = response.get_json()
    assert data['status'] == 'healthy'
    assert data['model_loaded'] is True

def test_metadata_endpoint(client):
    response = client.get('/api/v1/meta')
    assert response.status_code == 200
    data = response.get_json()
    assert 'metrics' in data
    assert 'city_market_stats' in data
    assert data['metrics']['r2_score_log'] > 0.70

def test_presets_endpoint(client):
    response = client.get('/api/v1/presets')
    assert response.status_code == 200
    data = response.get_json()
    assert 'presets' in data
    assert len(data['presets']) >= 3
    assert 'city' in data['presets'][0]

def test_predict_v1_endpoint(client):
    payload = {
        "bedrooms": 3,
        "sqft_living": 2100,
        "sqft_lot": 5000,
        "floors": 1.5,
        "view": 1,
        "condition": 4,
        "sqft_above": 1700,
        "sqft_basement": 400,
        "yr_built": 1995,
        "yr_renovated": 0,
        "city": "Seattle"
    }
    response = client.post('/api/v1/predict', json=payload)
    assert response.status_code == 200
    data = response.get_json()
    assert data['status'] == 'success'
    val = data['valuation']
    assert val['predicted_price'] > 50000
    assert 'valuation_range' in val
    assert val['valuation_range']['low'] < val['valuation_range']['high']
    assert 'investment_metrics' in val
    assert val['investment_metrics']['estimated_monthly_rent'] > 0
    assert 'feature_drivers' in val

def test_legacy_predict_endpoint(client):
    payload = {
        "data": {
            "bedrooms": 3,
            "sqft_living": 1800,
            "sqft_lot": 4500,
            "floors": 1,
            "condition": 3,
            "sqft_above": 1400,
            "sqft_basement": 400,
            "yr_built": 1980,
            "yr_renovated": 0,
            "city": "Shoreline"
        }
    }
    response = client.post('/predict', json=payload)
    assert response.status_code == 200
    data = response.get_json()
    assert isinstance(data, list)
    assert len(data) == 1
    assert data[0] > 50000
