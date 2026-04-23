import pandas as pd
import numpy as np
from typing import Dict, List, Any, Optional
from ..models.correlation import CorrelationAnalyzer
from ..models.regression import RegressionAnalyzer
from ..models.insights import InsightsEngine

class MLEngine:
    """Main ML engine coordinating all analysis components"""
    
    def __init__(self):
        self.correlation_analyzer = CorrelationAnalyzer()
        self.regression_analyzer = RegressionAnalyzer()
        self.insights_engine = InsightsEngine()
        
    def analyze_root_cause(self, df: pd.DataFrame, target_column: str, 
                         dataset_name: str = "Dataset") -> Dict[str, Any]:
        """Perform comprehensive root cause analysis"""
        try:
            # Validate inputs
            if df.empty:
                raise ValueError("Empty dataset provided")
            
            if target_column not in df.columns:
                raise ValueError(f"Target column '{target_column}' not found")
            
            # Correlation analysis
            correlation_results = self.correlation_analyzer.compute_correlation_matrix(
                df, target_column
            )
            
            # Regression analysis
            X, y = self.regression_analyzer.prepare_data(df, target_column)
            regression_results = self.regression_analyzer.train_models(X, y)
            
            # Feature importance
            feature_importance = self.regression_analyzer.get_feature_importance(X)
            
            # Generate insights
            insights = self.insights_engine.generate_insights(
                {
                    'correlation': correlation_results['correlations'],
                    'regression': regression_results['all_results'][
                        regression_results['best_model']
                    ],
                    'importance': feature_importance,
                    'targetColumn': target_column
                },
                df
            )
            
            # Determine root cause
            root_cause = self._determine_root_cause(
                correlation_results['correlations'],
                feature_importance
            )
            
            return {
                'dataset': dataset_name,
                'targetColumn': target_column,
                'correlation': correlation_results['correlations'],
                'regression': {
                    'coefficients': dict(zip(
                        self.regression_analyzer.feature_names,
                        self.regression_analyzer.best_model.coef_
                    )) if hasattr(self.regression_analyzer.best_model, 'coef_') else {},
                    'intercept': float(
                        self.regression_analyzer.best_model.intercept_
                    ) if hasattr(self.regression_analyzer.best_model, 'intercept_') else 0,
                    'score': regression_results['all_results'][
                        regression_results['best_model']
                    ]['r2_score'],
                    'model_used': regression_results['best_model']
                },
                'importance': feature_importance,
                'rootCause': root_cause,
                'insights': insights,
                'summary': self._generate_summary(root_cause, insights),
                'metadata': {
                    'data_points': len(df),
                    'features_analyzed': len(df.select_dtypes(include=[np.number]).columns),
                    'analysis_timestamp': pd.Timestamp.now().isoformat(),
                    'model_performance': {
                        'r2_score': regression_results['all_results'][
                            regression_results['best_model']
                        ]['r2_score'],
                        'best_model': regression_results['best_model']
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
        """Perform what-if scenario analysis"""
        try:
            # Validate inputs
            if df.empty:
                raise ValueError("Empty dataset provided")
            
            if target_column not in df.columns:
                raise ValueError(f"Target column '{target_column}' not found")
            
            if not changes:
                raise ValueError("No scenario changes provided")
            
            # Regression analysis for prediction
            X, y = self.regression_analyzer.prepare_data(df, target_column)
            training_results = self.regression_analyzer.train_models(X, y)
            
            # Scenario predictions
            scenario_results = self.regression_analyzer.predict_scenario(
                df, target_column, changes
            )
            
            # Generate insights
            insights = self.insights_engine.generate_insights(
                {
                    'regression': training_results['all_results'][
                        training_results['best_model']
                    ],
                    'targetColumn': target_column
                },
                df
            )
            
            # Analyze scenario impacts
            impact_analysis = self._analyze_scenario_impacts(scenario_results['scenarios'])
            
            return {
                'dataset': dataset_name,
                'targetColumn': target_column,
                'scenarioName': scenario_name,
                'simulation': scenario_results,
                'insights': insights,
                'impactAnalysis': impact_analysis,
                'recommendation': self._generate_scenario_recommendation(
                    scenario_results['scenarios'], impact_analysis
                ),
                'metadata': {
                    'scenarios_tested': len(changes),
                    'model_performance': scenario_results['model_performance'],
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
        
        # Combine correlation and importance scores
        combined_scores = {}
        
        # Normalize scores to 0-1 range
        max_corr = max(abs(v) for v in correlations.values()) if correlations else 1
        max_imp = max(feature_importance.values()) if feature_importance else 1
        
        for feature in set(list(correlations.keys()) + list(feature_importance.keys())):
            corr_score = abs(correlations.get(feature, 0)) / max_corr
            imp_score = feature_importance.get(feature, 0) / max_imp
            
            # Weighted combination (favor importance slightly)
            combined_scores[feature] = 0.6 * imp_score + 0.4 * corr_score
        
        # Find top feature
        if combined_scores:
            top_feature = max(combined_scores.items(), key=lambda x: x[1])
            
            return {
                'feature': top_feature[0],
                'correlation': correlations.get(top_feature[0], 0),
                'importance': feature_importance.get(top_feature[0], 0),
                'score': top_feature[1],
                'description': f"{top_feature[0]} is the primary driver of business outcomes"
            }
        
        return {
            'feature': 'Unknown',
            'correlation': 0,
            'importance': 0,
            'score': 0,
            'description': 'Unable to determine root cause'
        }
    
    def _generate_summary(self, root_cause: Dict, insights: Dict) -> str:
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
        
        # Add top recommendation
        if insights.get('recommendations'):
            summary += f". {insights['recommendations'][0] if insights['recommendations'] else ''}"
        
        return summary
    
    def _analyze_scenario_impacts(self, scenarios: List[Dict]) -> Dict[str, Any]:
        """Analyze impacts of what-if scenarios"""
        if not scenarios:
            return {}
        
        impacts = {
            'positive_impacts': [],
            'negative_impacts': [],
            'largest_impact': None,
            'smallest_impact': None,
            'average_impact': 0,
            'total_range': 0
        }
        
        impact_values = []
        
        for scenario in scenarios:
            impact = scenario.get('impact', 0)
            impact_percent = scenario.get('impactPercent', 0)
            
            impact_values.append(impact)
            
            if impact > 0:
                impacts['positive_impacts'].append(scenario)
            elif impact < 0:
                impacts['negative_impacts'].append(scenario)
        
        if impact_values:
            impacts['largest_impact'] = max(scenarios, key=lambda x: x.get('impact', 0))
            impacts['smallest_impact'] = min(scenarios, key=lambda x: x.get('impact', 0))
            impacts['average_impact'] = np.mean(impact_values)
            impacts['total_range'] = max(impact_values) - min(impact_values)
        
        return impacts
    
    def _generate_scenario_recommendation(self, scenarios: List[Dict], 
                                    impact_analysis: Dict) -> str:
        """Generate recommendation based on scenario analysis"""
        if not scenarios:
            return "No scenarios to analyze"
        
        if impact_analysis.get('positive_impacts'):
            best_scenario = max(
                impact_analysis['positive_impacts'], 
                key=lambda x: x.get('impact', 0)
            )
            
            variable = best_scenario.get('variable', 'Unknown')
            impact_pct = best_scenario.get('impactPercent', 0)
            
            return (
                f"Focus on {variable} optimization - "
                f"potential {impact_pct:.1f}% improvement in target metric"
            )
        
        return "Review scenario parameters for better outcomes"
