import pandas as pd
import numpy as np
from typing import Dict, List, Any, Tuple, Optional
import logging
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor, ExtraTreesRegressor
from sklearn.linear_model import LinearRegression, Ridge, Lasso, ElasticNet
from sklearn.svm import SVR
from sklearn.tree import DecisionTreeRegressor
from sklearn.neighbors import KNeighborsRegressor
from sklearn.model_selection import train_test_split, cross_val_score, GridSearchCV
from sklearn.preprocessing import StandardScaler, RobustScaler, MinMaxScaler
from sklearn.feature_selection import SelectKBest, f_regression, RFE
from sklearn.metrics import r2_score, mean_squared_error, mean_absolute_error
import joblib
import json
import os
from datetime import datetime

class MLEngine:
    """Production-grade ML engine with multiple algorithms and model selection"""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.models = {}
        self.scalers = {}
        self.feature_importance = {}
        self.model_performance = {}
        
    def train_multiple_models(self, X: pd.DataFrame, y: pd.Series, 
                           task_type: str = 'regression') -> Dict[str, Any]:
        """Train multiple ML models and select the best one"""
        self.logger.info(f"Training {len(X)} samples with {len(X.columns)} features")
        
        # Data preprocessing
        X_processed = self._preprocess_data(X)
        X_train, X_test, y_train, y_test = train_test_split(
            X_processed, y, test_size=0.2, random_state=42
        )
        
        model_results = {}
        
        # Linear Models
        linear_models = {
            'linear': LinearRegression(),
            'ridge': Ridge(alpha=1.0),
            'lasso': Lasso(alpha=1.0),
            'elastic_net': ElasticNet(alpha=1.0, l1_ratio=0.5)
        }
        
        for name, model in linear_models.items():
            try:
                model.fit(X_train, y_train)
                y_pred = model.predict(X_test)
                
                model_results[name] = {
                    'model': model,
                    'predictions': y_pred,
                    'r2_score': r2_score(y_test, y_pred),
                    'rmse': np.sqrt(mean_squared_error(y_test, y_pred)),
                    'mae': mean_absolute_error(y_test, y_pred),
                    'cv_scores': cross_val_score(model, X_processed, y, cv=5, scoring='r2')
                }
            except Exception as e:
                self.logger.error(f"Error training {name}: {str(e)}")
                continue
        
        # Tree-based Models
        tree_models = {
            'random_forest': RandomForestRegressor(
                n_estimators=100, max_depth=10, random_state=42
            ),
            'gradient_boosting': GradientBoostingRegressor(
                n_estimators=100, learning_rate=0.1, max_depth=6, random_state=42
            ),
            'extra_trees': ExtraTreesRegressor(
                n_estimators=100, max_depth=10, random_state=42
            ),
            'decision_tree': DecisionTreeRegressor(max_depth=8, random_state=42)
        }
        
        for name, model in tree_models.items():
            try:
                model.fit(X_train, y_train)
                y_pred = model.predict(X_test)
                
                model_results[name] = {
                    'model': model,
                    'predictions': y_pred,
                    'r2_score': r2_score(y_test, y_pred),
                    'rmse': np.sqrt(mean_squared_error(y_test, y_pred)),
                    'mae': mean_absolute_error(y_test, y_pred),
                    'cv_scores': cross_val_score(model, X_processed, y, cv=5, scoring='r2')
                }
            except Exception as e:
                self.logger.error(f"Error training {name}: {str(e)}")
                continue
        
        # Other Models
        other_models = {
            'svr': SVR(kernel='rbf', C=1.0),
            'knn': KNeighborsRegressor(n_neighbors=5)
        }
        
        for name, model in other_models.items():
            try:
                # Scale data for these models
                scaler = StandardScaler()
                X_train_scaled = scaler.fit_transform(X_train)
                X_test_scaled = scaler.transform(X_test)
                
                model.fit(X_train_scaled, y_train)
                y_pred = model.predict(X_test_scaled)
                
                model_results[name] = {
                    'model': model,
                    'predictions': y_pred,
                    'r2_score': r2_score(y_test, y_pred),
                    'rmse': np.sqrt(mean_squared_error(y_test, y_pred)),
                    'mae': mean_absolute_error(y_test, y_pred),
                    'cv_scores': cross_val_score(model, X_processed, y, cv=5, scoring='r2'),
                    'scaler': scaler
                }
            except Exception as e:
                self.logger.error(f"Error training {name}: {str(e)}")
                continue
        
        # Model selection
        best_model_name = max(model_results.keys(), 
                              key=lambda x: model_results[x]['r2_score'])
        best_model = model_results[best_model_name]
        
        # Feature importance
        feature_importance = self._calculate_feature_importance(
            best_model['model'], X_processed.columns.tolist()
        )
        
        # Store results
        self.models[task_type] = model_results
        self.model_performance[task_type] = {
            'best_model': best_model_name,
            'best_score': best_model['r2_score'],
            'all_results': model_results
        }
        self.feature_importance[task_type] = feature_importance
        
        self.logger.info(f"Best model: {best_model_name} (R² = {best_model['r2_score']:.4f})")
        
        return {
            'best_model': best_model_name,
            'best_score': best_model['r2_score'],
            'model_results': model_results,
            'feature_importance': feature_importance,
            'data_info': {
                'total_samples': len(X),
                'training_samples': len(X_train),
                'test_samples': len(X_test),
                'features': len(X.columns)
            }
        }
    
    def predict_with_model(self, model_name: str, X_new: pd.DataFrame, 
                        task_type: str = 'regression') -> np.ndarray:
        """Make predictions using a trained model"""
        if task_type not in self.models:
            raise ValueError(f"No models trained for task type: {task_type}")
        
        if model_name not in self.models[task_type]:
            raise ValueError(f"Model {model_name} not found")
        
        model_result = self.models[task_type][model_name]
        model = model_result['model']
        
        # Preprocess new data
        X_new_processed = self._preprocess_data(X_new)
        
        # Apply scaling if needed
        if 'scaler' in model_result:
            X_new_scaled = model_result['scaler'].transform(X_new_processed)
        else:
            X_new_scaled = X_new_processed
        
        predictions = model.predict(X_new_scaled)
        
        return predictions
    
    def _preprocess_data(self, X: pd.DataFrame) -> pd.DataFrame:
        """Advanced data preprocessing"""
        X_processed = X.copy()
        
        # Handle missing values
        numeric_columns = X_processed.select_dtypes(include=[np.number]).columns
        if len(numeric_columns) > 0:
            # Median imputation for numeric
            for col in numeric_columns:
                median_val = X_processed[col].median()
                X_processed[col] = X_processed[col].fillna(median_val)
        
        # Handle categorical encoding
        categorical_columns = X_processed.select_dtypes(include=['object']).columns
        for col in categorical_columns:
            if X_processed[col].dtype == 'object':
                # Frequency encoding for high-cardinality
                if X_processed[col].nunique() > 10:
                    freq_map = X_processed[col].value_counts().to_dict()
                    X_processed[col] = X_processed[col].map(freq_map)
                else:
                    # One-hot encoding for low-cardinality
                    dummies = pd.get_dummies(X_processed[col], prefix=col)
                    X_processed = pd.concat([X_processed.drop(columns=[col]), dummies], axis=1)
        
        return X_processed
    
    def _calculate_feature_importance(self, model, feature_names: List[str]) -> Dict[str, float]:
        """Calculate feature importance from trained model"""
        importance = {}
        
        if hasattr(model, 'feature_importances_'):
            # Tree-based models
            importances = model.feature_importances_
            for i, feature in enumerate(feature_names):
                if i < len(importances):
                    importance[feature] = float(importances[i])
        
        elif hasattr(model, 'coef_'):
            # Linear models
            coefs = model.coef_
            if len(coefs.shape) == 1:
                for i, feature in enumerate(feature_names):
                    if i < len(coefs[0]):
                        importance[feature] = float(abs(coefs[0][i]))
            else:
                for i, feature in enumerate(feature_names):
                    if i < len(coefs):
                        importance[feature] = float(abs(coefs[i]))
        
        return importance
    
    def save_model(self, model_name: str, task_type: str, 
                  filepath: str) -> bool:
        """Save trained model to disk"""
        try:
            if task_type not in self.models or model_name not in self.models[task_type]:
                return False
            
            model_result = self.models[task_type][model_name]
            model = model_result['model']
            
            # Create directory if it doesn't exist
            os.makedirs(os.path.dirname(filepath), exist_ok=True)
            
            # Save model and metadata
            joblib.dump(model, filepath)
            
            metadata = {
                'model_name': model_name,
                'task_type': task_type,
                'performance': model_result,
                'feature_importance': self.feature_importance.get(task_type, {}),
                'saved_at': datetime.now().isoformat(),
                'version': '1.0'
            }
            
            metadata_path = filepath.replace('.pkl', '_metadata.json')
            with open(metadata_path, 'w') as f:
                json.dump(metadata, f, indent=2)
            
            self.logger.info(f"Model saved to {filepath}")
            return True
            
        except Exception as e:
            self.logger.error(f"Error saving model: {str(e)}")
            return False
    
    def load_model(self, filepath: str) -> Dict[str, Any]:
        """Load trained model from disk"""
        try:
            # Load model
            model = joblib.load(filepath)
            
            # Load metadata
            metadata_path = filepath.replace('.pkl', '_metadata.json')
            with open(metadata_path, 'r') as f:
                metadata = json.load(f)
            
            self.logger.info(f"Model loaded from {filepath}")
            
            return {
                'model': model,
                'metadata': metadata
            }
            
        except Exception as e:
            self.logger.error(f"Error loading model: {str(e)}")
            return {}
    
    def get_model_summary(self, task_type: str) -> Dict[str, Any]:
        """Get summary of all trained models"""
        if task_type not in self.model_performance:
            return {}
        
        performance = self.model_performance[task_type]
        results = self.models.get(task_type, {})
        
        summary = {
            'task_type': task_type,
            'best_model': performance['best_model'],
            'best_score': performance['best_score'],
            'models_trained': len(results),
            'model_rankings': []
        }
        
        # Rank models by performance
        sorted_models = sorted(results.items(), 
                              key=lambda x: x[1]['r2_score'], 
                              reverse=True)
        
        for i, (name, result) in enumerate(sorted_models):
            summary['model_rankings'].append({
                'rank': i + 1,
                'name': name,
                'r2_score': result['r2_score'],
                'rmse': result['rmse'],
                'mae': result['mae'],
                'cv_mean': np.mean(result['cv_scores']),
                'cv_std': np.std(result['cv_scores'])
            })
        
        return summary
    
    def hyperparameter_tuning(self, X: pd.DataFrame, y: pd.Series, 
                           model_type: str = 'random_forest') -> Dict[str, Any]:
        """Perform hyperparameter tuning for specified model"""
        self.logger.info(f"Starting hyperparameter tuning for {model_type}")
        
        X_processed = self._preprocess_data(X)
        X_train, X_test, y_train, y_test = train_test_split(
            X_processed, y, test_size=0.2, random_state=42
        )
        
        if model_type == 'random_forest':
            param_grid = {
                'n_estimators': [50, 100, 200],
                'max_depth': [5, 10, 15, None],
                'min_samples_split': [2, 5, 10],
                'min_samples_leaf': [1, 2, 4]
            }
            model = RandomForestRegressor(random_state=42)
        elif model_type == 'gradient_boosting':
            param_grid = {
                'n_estimators': [50, 100, 200],
                'learning_rate': [0.01, 0.1, 0.2],
                'max_depth': [3, 5, 7],
                'subsample': [0.8, 0.9, 1.0]
            }
            model = GradientBoostingRegressor(random_state=42)
        else:
            raise ValueError(f"Hyperparameter tuning not supported for {model_type}")
        
        grid_search = GridSearchCV(
            estimator=model,
            param_grid=param_grid,
            cv=3,
            scoring='r2',
            n_jobs=-1,
            verbose=1
        )
        
        grid_search.fit(X_train, y_train)
        
        best_model = grid_search.best_estimator_
        best_params = grid_search.best_params_
        best_score = grid_search.best_score_
        
        y_pred = best_model.predict(X_test)
        test_score = r2_score(y_test, y_pred)
        
        self.logger.info(f"Best params: {best_params}")
        self.logger.info(f"Best CV score: {best_score:.4f}")
        self.logger.info(f"Test score: {test_score:.4f}")
        
        return {
            'best_model': best_model,
            'best_params': best_params,
            'best_cv_score': best_score,
            'test_score': test_score,
            'all_results': grid_search.cv_results_
        }
    
    def ensemble_predictions(self, predictions_list: List[np.ndarray], 
                         method: str = 'weighted_average') -> np.ndarray:
        """Combine predictions from multiple models"""
        if not predictions_list:
            return np.array([])
        
        # Simple averaging
        if method == 'simple_average':
            return np.mean(predictions_list, axis=0)
        
        # Weighted averaging (weights based on model performance)
        elif method == 'weighted_average':
            # Equal weights for now, but could be based on validation scores
            weights = np.ones(len(predictions_list)) / len(predictions_list)
            return np.average(predictions_list, axis=0, weights=weights)
        
        # Voting (for classification)
        elif method == 'majority_vote':
            # This would need to be adapted for regression
            return np.mean(predictions_list, axis=0)
        
        else:
            raise ValueError(f"Unknown ensemble method: {method}")
