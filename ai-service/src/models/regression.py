import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.linear_model import LinearRegression, Ridge, Lasso
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import r2_score, mean_squared_error, mean_absolute_error
from sklearn.feature_selection import SelectKBest, f_regression
import warnings
warnings.filterwarnings('ignore')

class RegressionAnalyzer:
    """Advanced regression analysis for business predictions"""
    
    def __init__(self):
        self.models = {
            'linear': LinearRegression(),
            'ridge': Ridge(alpha=1.0),
            'lasso': Lasso(alpha=1.0),
            'random_forest': RandomForestRegressor(n_estimators=100, random_state=42),
            'gradient_boost': GradientBoostingRegressor(n_estimators=100, random_state=42)
        }
        self.best_model = None
        self.scaler = StandardScaler()
        self.feature_names = None
        
    def prepare_data(self, df: pd.DataFrame, target_column: str) -> tuple:
        """Prepare data for regression analysis"""
        # Select numeric columns
        numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
        
        if target_column not in numeric_cols:
            raise ValueError(f"Target column '{target_column}' not found in numeric columns")
        
        # Handle missing values
        df_clean = df[numeric_cols].fillna(df[numeric_cols].median())
        
        # Separate features and target
        X = df_clean.drop(columns=[target_column])
        y = df_clean[target_column]
        
        # Remove features with no variance
        variance = X.var()
        X = X.loc[:, variance > 0.01]
        
        self.feature_names = X.columns.tolist()
        
        return X, y
    
    def train_models(self, X: pd.DataFrame, y: pd.Series) -> Dict:
        """Train multiple regression models and select the best"""
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        # Scale features
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)
        
        model_results = {}
        
        for name, model in self.models.items():
            try:
                # Train model
                if name in ['linear', 'ridge', 'lasso']:
                    model.fit(X_train_scaled, y_train)
                    y_pred = model.predict(X_test_scaled)
                else:
                    model.fit(X_train, y_train)
                    y_pred = model.predict(X_test)
                
                # Calculate metrics
                r2 = r2_score(y_test, y_pred)
                mse = mean_squared_error(y_test, y_pred)
                mae = mean_absolute_error(y_test, y_pred)
                
                # Cross-validation
                cv_scores = cross_val_score(model, X_train, y_train, cv=5, scoring='r2')
                
                model_results[name] = {
                    'model': model,
                    'r2_score': r2,
                    'mse': mse,
                    'mae': mae,
                    'cv_mean': cv_scores.mean(),
                    'cv_std': cv_scores.std(),
                    'predictions': y_pred
                }
                
            except Exception as e:
                print(f"Error training {name}: {str(e)}")
                continue
        
        # Select best model based on R2 score
        if model_results:
            best_model_name = max(model_results.keys(), 
                              key=lambda x: model_results[x]['r2_score'])
            self.best_model = model_results[best_model_name]['model']
            
            return {
                'best_model': best_model_name,
                'all_results': model_results,
                'feature_names': self.feature_names
            }
        
        raise ValueError("No models could be trained successfully")
    
    def get_feature_importance(self, X: pd.DataFrame) -> Dict:
        """Extract feature importance from the best model"""
        if self.best_model is None:
            return {}
        
        importance_scores = {}
        
        if hasattr(self.best_model, 'feature_importances_'):
            # Tree-based models
            importance_scores = dict(zip(
                self.feature_names, 
                self.best_model.feature_importances_
            ))
        elif hasattr(self.best_model, 'coef_'):
            # Linear models
            coef = self.best_model.coef_
            if len(coef.shape) == 1:
                importance_scores = dict(zip(self.feature_names, np.abs(coef)))
            else:
                importance_scores = dict(zip(
                    self.feature_names, 
                    np.abs(coef[0])
                ))
        
        # Sort by importance
        sorted_importance = dict(sorted(
            importance_scores.items(), 
            key=lambda x: x[1], 
            reverse=True
        ))
        
        return sorted_importance
    
    def predict_scenario(self, df: pd.DataFrame, target_column: str, 
                     changes: List[Dict]) -> Dict:
        """Predict outcomes for what-if scenarios"""
        # Prepare data
        X, y = self.prepare_data(df, target_column)
        
        # Train model
        training_results = self.train_models(X, y)
        
        # Get baseline prediction
        baseline_data = X.mean().to_dict()
        baseline_df = pd.DataFrame([baseline_data])
        
        if training_results['best_model'] in ['linear', 'ridge', 'lasso']:
            baseline_scaled = self.scaler.transform(baseline_df)
            baseline_pred = self.best_model.predict(baseline_scaled)[0]
        else:
            baseline_pred = self.best_model.predict(baseline_df)[0]
        
        # Predict scenarios
        scenario_results = []
        
        for change in changes:
            scenario_data = baseline_data.copy()
            variable = change.get('variable')
            delta_percent = change.get('deltaPercent', 0) / 100
            
            if variable in scenario_data:
                scenario_data[variable] *= (1 + delta_percent)
                
                scenario_df = pd.DataFrame([scenario_data])
                
                if training_results['best_model'] in ['linear', 'ridge', 'lasso']:
                    scenario_scaled = self.scaler.transform(scenario_df)
                    scenario_pred = self.best_model.predict(scenario_scaled)[0]
                else:
                    scenario_pred = self.best_model.predict(scenario_df)[0]
                
                scenario_results.append({
                    'variable': variable,
                    'deltaPercent': delta_percent * 100,
                    'baseline': baseline_pred,
                    'predicted': scenario_pred,
                    'impact': scenario_pred - baseline_pred,
                    'impactPercent': ((scenario_pred - baseline_pred) / baseline_pred) * 100
                })
        
        return {
            'baseline': baseline_pred,
            'scenarios': scenario_results,
            'model_performance': {
                'r2_score': training_results['all_results'][training_results['best_model']]['r2_score'],
                'model_used': training_results['best_model']
            }
        }
    
    def get_regression_insights(self, df: pd.DataFrame, target_column: str) -> Dict:
        """Generate business insights from regression analysis"""
        try:
            X, y = self.prepare_data(df, target_column)
            training_results = self.train_models(X, y)
            feature_importance = self.get_feature_importance(X)
            
            top_features = list(feature_importance.items())[:5]
            best_model = training_results['best_model']
            r2_score = training_results['all_results'][best_model]['r2_score']
            
            insights = []
            recommendations = []
            
            # Model performance insight
            if r2_score > 0.8:
                insights.append(f"Excellent predictive model (R² = {r2_score:.3f})")
                recommendations.append("Model is highly reliable for business decisions")
            elif r2_score > 0.6:
                insights.append(f"Good predictive model (R² = {r2_score:.3f})")
                recommendations.append("Model provides solid predictions for planning")
            elif r2_score > 0.4:
                insights.append(f"Fair predictive model (R² = {r2_score:.3f})")
                recommendations.append("Consider additional features for better accuracy")
            else:
                insights.append(f"Limited predictive power (R² = {r2_score:.3f})")
                recommendations.append("Model needs improvement - collect more data")
            
            # Top drivers insight
            if top_features:
                top_feature, importance = top_features[0]
                insights.append(
                    f"{top_feature} is the strongest predictor ({importance:.3f} importance)"
                )
                
                if importance > 0.3:
                    recommendations.append(
                        f"Prioritize {top_feature} optimization for maximum impact"
                    )
            
            return {
                'insight': '; '.join(insights),
                'recommendations': recommendations,
                'top_features': top_features,
                'model_performance': {
                    'r2_score': r2_score,
                    'best_model': best_model,
                    'model_type': self._get_model_type(best_model)
                }
            }
            
        except Exception as e:
            return {
                'insight': f'Regression analysis failed: {str(e)}',
                'recommendations': ['Check data quality and try again'],
                'top_features': [],
                'model_performance': None
            }
    
    def _get_model_type(self, model_name: str) -> str:
        """Get human-readable model type"""
        model_types = {
            'linear': 'Linear Regression',
            'ridge': 'Ridge Regression',
            'lasso': 'Lasso Regression',
            'random_forest': 'Random Forest',
            'gradient_boost': 'Gradient Boosting'
        }
        return model_types.get(model_name, 'Unknown')
