import pandas as pd
import numpy as np
from typing import Dict, List, Any, Optional

class SimpleMLEngine:
    """Simplified ML engine using only pandas and numpy"""
    
    def __init__(self):
        self.feature_names = []
        self.best_model = None
        self.coefficients = {}
        self.intercept = 0
    
    def analyze_root_cause(self, df: pd.DataFrame, target_column: str, 
                         dataset_name: str = "Dataset") -> Dict[str, Any]:
        """Perform simplified root cause analysis"""
        try:
            # Validate inputs
            if df.empty:
                raise ValueError("Empty dataset provided")
            
            if target_column not in df.columns:
                raise ValueError(f"Target column '{target_column}' not found")
            
            # Get numeric columns only
            numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
            if target_column not in numeric_cols:
                raise ValueError(f"Target column '{target_column}' must be numeric")
            
            feature_cols = [col for col in numeric_cols if col != target_column]
            if not feature_cols:
                raise ValueError("No numeric feature columns found")
            
            # Correlation analysis
            correlations = {}
            for col in feature_cols:
                corr = df[col].corr(df[target_column])
                if not np.isnan(corr):
                    correlations[col] = corr
            
            # Simple linear regression coefficients
            coefficients = {}
            for col in feature_cols:
                # Simple linear regression coefficient
                x = df[col].values
                y = df[target_column].values
                
                # Calculate coefficient (slope)
                x_mean = np.mean(x)
                y_mean = np.mean(y)
                numerator = np.sum((x - x_mean) * (y - y_mean))
                denominator = np.sum((x - x_mean) ** 2)
                
                if denominator != 0:
                    coef = numerator / denominator
                    coefficients[col] = coef
                else:
                    coefficients[col] = 0
            
            # Feature importance based on absolute correlation
            feature_importance = {}
            for col, corr in correlations.items():
                feature_importance[col] = abs(corr)
            
            # Normalize importance scores
            max_imp = max(feature_importance.values()) if feature_importance else 1
            for col in feature_importance:
                feature_importance[col] = feature_importance[col] / max_imp
            
            # Determine root cause
            root_cause = self._determine_root_cause(correlations, feature_importance)
            
            # Calculate R-squared
            y_pred = self._predict_simple(df, target_column, coefficients)
            r2_score = self._calculate_r2(df[target_column].values, y_pred)
            
            return {
                'dataset': dataset_name,
                'targetColumn': target_column,
                'correlation': correlations,
                'regression': {
                    'coefficients': coefficients,
                    'intercept': df[target_column].mean() - sum(
                        coefficients[col] * df[col].mean() for col in coefficients
                    ),
                    'score': r2_score,
                    'model_used': 'simple_linear_regression'
                },
                'importance': feature_importance,
                'rootCause': root_cause,
                'summary': self._generate_summary(root_cause, correlations),
                'metadata': {
                    'data_points': len(df),
                    'features_analyzed': len(feature_cols),
                    'analysis_timestamp': pd.Timestamp.now().isoformat(),
                    'model_performance': {
                        'r2_score': r2_score,
                        'best_model': 'simple_linear_regression'
                    }
                }
            }
            
        except Exception as e:
            return {
                'error': f'Root cause analysis failed: {str(e)}',
                'dataset': dataset_name,
                'targetColumn': target_column
            }
    
    def analyze_what_if(self, df: pd.DataFrame, target_column: str,
                      changes: List[Dict], dataset_name: str = "Dataset",
                      scenario_name: str = "Scenario") -> Dict[str, Any]:
        """Perform simplified what-if scenario analysis"""
        try:
            # Validate inputs
            if df.empty:
                raise ValueError("Empty dataset provided")
            
            if target_column not in df.columns:
                raise ValueError(f"Target column '{target_column}' not found")
            
            if not changes:
                raise ValueError("No scenario changes provided")
            
            # Get baseline
            baseline_value = df[target_column].mean()
            
            # Calculate coefficients
            numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
            feature_cols = [col for col in numeric_cols if col != target_column]
            
            coefficients = {}
            for col in feature_cols:
                x = df[col].values
                y = df[target_column].values
                
                x_mean = np.mean(x)
                y_mean = np.mean(y)
                numerator = np.sum((x - x_mean) * (y - y_mean))
                denominator = np.sum((x - x_mean) ** 2)
                
                if denominator != 0:
                    coef = numerator / denominator
                    coefficients[col] = coef
                else:
                    coefficients[col] = 0
            
            # Calculate intercept
            intercept = df[target_column].mean() - sum(
                coefficients[col] * df[col].mean() for col in coefficients
            )
            
            # Apply scenarios
            scenarios = []
            for change in changes:
                variable = change.get('variable')
                delta_percent = change.get('deltaPercent', 0)
                
                if variable not in coefficients:
                    continue
                
                # Calculate predicted change
                coef = coefficients[variable]
                current_mean = df[variable].mean()
                new_value = current_mean * (1 + delta_percent / 100)
                delta = new_value - current_mean
                
                predicted_change = coef * delta
                predicted_value = baseline_value + predicted_change
                
                impact_percent = (predicted_change / baseline_value) * 100 if baseline_value != 0 else 0
                
                scenarios.append({
                    'variable': variable,
                    'deltaPercent': delta_percent,
                    'baseline': baseline_value,
                    'predicted': predicted_value,
                    'impact': predicted_change,
                    'impactPercent': impact_percent
                })
            
            return {
                'dataset': dataset_name,
                'targetColumn': target_column,
                'scenarioName': scenario_name,
                'simulation': {
                    'baseline': baseline_value,
                    'scenarios': scenarios
                },
                'recommendation': self._generate_scenario_recommendation(scenarios),
                'metadata': {
                    'scenarios_tested': len(scenarios),
                    'analysis_timestamp': pd.Timestamp.now().isoformat()
                }
            }
            
        except Exception as e:
            return {
                'error': f'What-if analysis failed: {str(e)}',
                'dataset': dataset_name,
                'targetColumn': target_column,
                'scenarioName': scenario_name
            }
    
    def _determine_root_cause(self, correlations: Dict, 
                           feature_importance: Dict) -> Dict[str, Any]:
        """Determine primary root cause from analysis results"""
        if not correlations and not feature_importance:
            return {
                'feature': 'Unknown',
                'correlation': 0,
                'importance': 0,
                'score': 0,
                'description': 'Insufficient data for root cause analysis'
            }
        
        # Find feature with highest absolute correlation
        if correlations:
            top_feature = max(correlations.items(), key=lambda x: abs(x[1]))
            
            return {
                'feature': top_feature[0],
                'correlation': top_feature[1],
                'importance': feature_importance.get(top_feature[0], 0),
                'score': abs(top_feature[1]),
                'description': f"{top_feature[0]} is the primary driver of business outcomes"
            }
        
        return {
            'feature': 'Unknown',
            'correlation': 0,
            'importance': 0,
            'score': 0,
            'description': 'Unable to determine root cause'
        }
    
    def _generate_summary(self, root_cause: Dict, correlations: Dict) -> str:
        """Generate executive summary"""
        if root_cause['feature'] == 'Unknown':
            return "Insufficient data for comprehensive root cause analysis"
        
        feature = root_cause['feature']
        score = root_cause['score']
        
        summary = f"{feature} is the primary business driver"
        
        if score > 0.8:
            summary += " with very high impact"
        elif score > 0.6:
            summary += " with high impact"
        elif score > 0.4:
            summary += " with moderate impact"
        else:
            summary += " with limited impact"
        
        correlation = root_cause['correlation']
        if correlation > 0:
            summary += f". Positive correlation ({correlation:.2f}) suggests increasing {feature} improves outcomes."
        else:
            summary += f". Negative correlation ({correlation:.2f}) suggests decreasing {feature} improves outcomes."
        
        return summary
    
    def _predict_simple(self, df: pd.DataFrame, target_column: str, 
                        coefficients: Dict) -> np.ndarray:
        """Simple prediction using coefficients"""
        intercept = df[target_column].mean() - sum(
            coefficients[col] * df[col].mean() for col in coefficients
        )
        
        predictions = np.full(len(df), intercept)
        for col, coef in coefficients.items():
            if col in df.columns:
                predictions += coef * df[col].values
        
        return predictions
    
    def _calculate_r2(self, y_true: np.ndarray, y_pred: np.ndarray) -> float:
        """Calculate R-squared score"""
        ss_res = np.sum((y_true - y_pred) ** 2)
        ss_tot = np.sum((y_true - np.mean(y_true)) ** 2)
        
        if ss_tot == 0:
            return 0
        
        return 1 - (ss_res / ss_tot)
    
    def _generate_scenario_recommendation(self, scenarios: List[Dict]) -> str:
        """Generate recommendation based on scenario analysis"""
        if not scenarios:
            return "No scenarios to analyze"
        
        # Find best positive scenario
        positive_scenarios = [s for s in scenarios if s.get('impactPercent', 0) > 0]
        
        if positive_scenarios:
            best_scenario = max(positive_scenarios, key=lambda x: x.get('impactPercent', 0))
            
            variable = best_scenario.get('variable', 'Unknown')
            impact_pct = best_scenario.get('impactPercent', 0)
            
            return (
                f"Focus on {variable} optimization - "
                f"potential {impact_pct:.1f}% improvement in target metric"
            )
        
        return "Review scenario parameters for better outcomes"
