"""
EstateVal AI - Production-Grade Model Training Pipeline
=========================================================
Trains an advanced ensemble Gradient Boosting Regressor for house price valuation,
computes validation metrics (R2, MAE, RMSE), permutation feature importances,
and aggregates city-level market benchmarks.
"""

import os
import json
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split, cross_val_score, KFold
from sklearn.metrics import r2_score, mean_absolute_error, mean_squared_error
from sklearn.ensemble import HistGradientBoostingRegressor, RandomForestRegressor
from sklearn.linear_model import Ridge
from sklearn.inspection import permutation_importance
import joblib

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, 'data.csv')

def train_and_export():
    print("[1/5] Loading and cleaning dataset...")
    df = pd.read_csv(DATA_PATH)
    initial_len = len(df)
    
    # Data cleaning: filter out unrealistic prices
    df = df[(df['price'] >= 25000) & (df['price'] <= 8000000)].copy()
    df = df[df['bedrooms'] > 0].copy()
    print(f"Retained {len(df)}/{initial_len} valid listings after cleaning.")

    # Calculate City-level Market Statistics
    df['price_per_sqft'] = df['price'] / df['sqft_living']
    city_stats = {}
    for city, group in df.groupby('city'):
        city_stats[city] = {
            'median_price': round(float(group['price'].median()), 2),
            'mean_price': round(float(group['price'].mean()), 2),
            'median_sqft_price': round(float(group['price_per_sqft'].median()), 2),
            'count': int(len(group)),
            'min_price': round(float(group['price'].min()), 2),
            'max_price': round(float(group['price'].max()), 2)
        }

    # Feature Engineering
    ref_year = 2015
    df['house_age'] = ref_year - df['yr_built']
    df['is_renovated'] = (df['yr_renovated'] > 0).astype(int)
    df['has_basement'] = (df['sqft_basement'] > 0).astype(int)
    df['sqft_per_bedroom'] = df['sqft_living'] / (df['bedrooms'] + 0.5)
    df['living_lot_ratio'] = df['sqft_living'] / (df['sqft_lot'] + 1.0)

    # Core Features
    numeric_features = [
        'bedrooms', 'sqft_living', 'sqft_lot', 'floors', 'view', 'condition',
        'sqft_above', 'sqft_basement', 'yr_built', 'yr_renovated',
        'house_age', 'is_renovated', 'has_basement', 'sqft_per_bedroom', 'living_lot_ratio'
    ]
    
    # Categorical encoding
    X_num = df[numeric_features].copy()
    cities = sorted(df['city'].unique().tolist())
    city_dummies = pd.get_dummies(df['city'], prefix='city', drop_first=False)
    
    X = pd.concat([X_num, city_dummies], axis=1)
    feature_names = X.columns.tolist()
    
    # Target in log space for stabilizing variance in real estate pricing
    y_raw = df['price'].values
    y_log = np.log1p(y_raw)

    print(f"[2/5] Training/Validation split ({len(feature_names)} features)...")
    X_train, X_test, y_train, y_test, p_train, p_test = train_test_split(
        X, y_log, y_raw, test_size=0.2, random_state=42
    )

    # 1. Baseline Ridge
    print("[3/5] Benchmarking models...")
    ridge = Ridge(alpha=10.0, random_state=42).fit(X_train, y_train)
    p_pred_ridge = np.expm1(ridge.predict(X_test))
    r2_ridge = r2_score(p_test, p_pred_ridge)
    mae_ridge = mean_absolute_error(p_test, p_pred_ridge)

    # 2. Advanced HistGradientBoostingRegressor
    hgb = HistGradientBoostingRegressor(
        max_iter=300,
        learning_rate=0.08,
        max_depth=8,
        l2_regularization=1.5,
        random_state=42
    )
    hgb.fit(X_train, y_train)
    
    # Cross validation
    cv = KFold(n_splits=5, shuffle=True, random_state=42)
    cv_scores = cross_val_score(hgb, X, y_log, cv=cv, scoring='r2')
    
    # Test evaluation
    pred_test_log = hgb.predict(X_test)
    pred_test_price = np.expm1(pred_test_log)
    
    r2_hgb_log = r2_score(y_test, pred_test_log)
    r2_hgb_price = r2_score(p_test, pred_test_price)
    mae_hgb = mean_absolute_error(p_test, pred_test_price)
    rmse_hgb = np.sqrt(mean_squared_error(p_test, pred_test_price))

    print(f"--- MODEL EVALUATION RESULTS ---")
    print(f"Baseline Ridge (Price R2): {r2_ridge:.4f} | MAE: ${mae_ridge:,.2f}")
    print(f"Upgraded HistGradientBoosting (Log R2): {r2_hgb_log:.4f}")
    print(f"Upgraded HistGradientBoosting (Price R2): {r2_hgb_price:.4f}")
    print(f"5-Fold CV Log R2: {cv_scores.mean():.4f} +/- {cv_scores.std():.4f}")
    print(f"Test MAE: ${mae_hgb:,.2f} | RMSE: ${rmse_hgb:,.2f}")

    print("[4/5] Computing feature importances via permutation...")
    perm_importance = permutation_importance(hgb, X_test, y_test, n_repeats=5, random_state=42)
    importances = {}
    for idx in perm_importance.importances_mean.argsort()[::-1][:15]:
        importances[feature_names[idx]] = round(float(perm_importance.importances_mean[idx]), 4)

    # Export Model
    model_output_path = os.path.join(BASE_DIR, 'estate_model.pkl')
    joblib.dump(hgb, model_output_path)
    print(f"Saved production model to {model_output_path}")

    # Export Metadata
    metadata = {
        'model_name': 'EstateVal HistGradientBoosting Ensemble',
        'version': '2.0.0',
        'target_transform': 'log1p',
        'metrics': {
            'r2_score_price': round(float(r2_hgb_price), 4),
            'r2_score_log': round(float(r2_hgb_log), 4),
            'cross_val_r2': round(float(cv_scores.mean()), 4),
            'mae_usd': round(float(mae_hgb), 2),
            'rmse_usd': round(float(rmse_hgb), 2),
            'baseline_ridge_r2': round(float(r2_ridge), 4),
            'baseline_ridge_mae': round(float(mae_ridge), 2),
            'improvement_percent': round(float((r2_hgb_price - r2_ridge) / abs(r2_ridge) * 100), 1)
        },
        'top_feature_importances': importances,
        'features': {
            'numeric': numeric_features,
            'cities': cities,
            'all_columns': feature_names
        },
        'city_market_stats': city_stats,
        'dataset_summary': {
            'total_sales_records': int(len(df)),
            'county': 'King County, Washington (Seattle Metro)',
            'overall_median_price': round(float(df['price'].median()), 2),
            'overall_mean_price': round(float(df['price'].mean()), 2),
            'overall_median_sqft_price': round(float(df['price_per_sqft'].median()), 2)
        }
    }
    
    metadata_path = os.path.join(BASE_DIR, 'model_metadata.json')
    with open(metadata_path, 'w', encoding='utf-8') as f:
        json.dump(metadata, f, indent=2)
    print(f"Saved model metadata to {metadata_path}")
    print("[5/5] Pipeline completed successfully!")

if __name__ == '__main__':
    train_and_export()
