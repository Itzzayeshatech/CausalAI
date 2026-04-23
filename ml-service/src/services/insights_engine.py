import pandas as pd
import numpy as np
from typing import Dict, List, Any, Optional
import logging
from datetime import datetime
import json

class InsightsEngine:
    """Enterprise-grade business insights generation"""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.insight_templates = {
            'correlation': {
                'strong_positive': "{feature} shows strong positive correlation with {target} (r = {value:.3f})",
                'moderate_positive': "{feature} shows moderate positive correlation with {target} (r = {value:.3f})",
                'strong_negative': "{feature} shows strong negative impact on {target} (r = {value:.3f})",
                'weak_correlation': "{feature} has weak correlation with {target} (r = {value:.3f})"
            },
            'performance': {
                'excellent': "Model performance is excellent (R² > 0.85) - highly reliable for business decisions",
                'good': "Model performance is good (R² > 0.70) - suitable for strategic planning",
                'fair': "Model performance is fair (R² > 0.50) - use with caution",
                'poor': "Model performance is poor (R² < 0.50) - requires improvement"
            },
            'recommendation': {
                'prioritize_feature': "Prioritize {feature} optimization - it's the key business driver",
                'monitor_feature': "Monitor {feature} closely - it significantly impacts {target}",
                'investigate_causes': "Investigate root causes of {feature} variations",
                'optimize_process': "Optimize {feature} process to improve {target} consistency",
                'consider_interaction': "Consider {feature} interactions with other key drivers"
            },
            'risk': {
                'high_volatility': "{feature} shows high volatility - implement controls",
                'negative_trend': "{feature} shows declining trend - immediate attention required",
                'data_quality': "Poor {feature} data quality affecting analysis reliability",
                'outlier_impact': "Outliers in {feature} may indicate special circumstances"
            },
            'opportunity': {
                'growth_potential': "Strong {feature} correlation suggests growth opportunities",
                'efficiency_gain': "Optimizing {feature} could yield significant efficiency gains",
                'competitive_advantage': "Leveraging {feature} insights could provide competitive advantage",
                'cost_reduction': "{feature} optimization opportunities may reduce operational costs"
            }
        }
    
    def generate_comprehensive_insights(self, analysis_results: Dict, 
                                        dataset_profile: Optional[Dict] = None) -> Dict[str, Any]:
        """Generate comprehensive business insights from ML analysis"""
        self.logger.info("Generating comprehensive business insights")
        
        insights = {
            'executive_summary': '',
            'key_drivers': [],
            'performance_metrics': {},
            'business_recommendations': [],
            'risk_factors': [],
            'opportunities': [],
            'actionable_insights': [],
            'kpi_impacts': [],
            'confidence_level': 'medium'
        }
        
        # Extract key information
        target_column = analysis_results.get('targetColumn', 'Target')
        model_performance = analysis_results.get('model_performance', {})
        feature_importance = analysis_results.get('importance', {})
        correlations = analysis_results.get('correlation', {})
        
        # Generate executive summary
        insights['executive_summary'] = self._generate_executive_summary(
            target_column, model_performance, feature_importance
        )
        
        # Identify key drivers
        insights['key_drivers'] = self._identify_key_drivers(
            feature_importance, correlations, target_column
        )
        
        # Performance metrics
        insights['performance_metrics'] = self._analyze_performance_metrics(
            model_performance, dataset_profile
        )
        
        # Business recommendations
        insights['business_recommendations'] = self._generate_business_recommendations(
            feature_importance, correlations, target_column
        )
        
        # Risk factors
        insights['risk_factors'] = self._identify_risk_factors(
            analysis_results, dataset_profile
        )
        
        # Opportunities
        insights['opportunities'] = self._identify_opportunities(
            feature_importance, correlations, target_column
        )
        
        # Actionable insights
        insights['actionable_insights'] = self._generate_actionable_insights(
            insights['key_drivers'], insights['business_recommendations']
        )
        
        # KPI impacts
        insights['kpi_impacts'] = self._calculate_kpi_impacts(
            feature_importance, correlations
        )
        
        # Confidence assessment
        insights['confidence_level'] = self._assess_confidence_level(
            model_performance, dataset_profile
        )
        
        self.logger.info("Comprehensive insights generation completed")
        
        return insights
    
    def _generate_executive_summary(self, target_column: str, 
                                  model_performance: Dict, 
                                  feature_importance: Dict) -> str:
        """Generate C-level executive summary"""
        r2_score = model_performance.get('r2_score', 0)
        model_used = model_performance.get('model_used', 'Unknown')
        
        if not feature_importance:
            return f"Insufficient data to generate reliable insights for {target_column}."
        
        top_feature = list(feature_importance.keys())[0] if feature_importance else 'Unknown'
        top_importance = list(feature_importance.values())[0] if feature_importance else 0
        
        summary_parts = []
        
        # Model performance statement
        if r2_score > 0.85:
            summary_parts.append(f"Excellent predictive model (R² = {r2_score:.3f}) provides highly reliable insights")
        elif r2_score > 0.70:
            summary_parts.append(f"Good predictive model (R² = {r2_score:.3f}) supports confident decision-making")
        elif r2_score > 0.50:
            summary_parts.append(f"Fair predictive model (R² = {r2_score:.3f}) - use insights with caution")
        else:
            summary_parts.append(f"Limited predictive power (R² = {r2_score:.3f}) - collect more data")
        
        # Key driver statement
        if top_importance > 0.8:
            summary_parts.append(f"{top_feature} is the dominant business driver with {top_importance:.3f} importance score")
        elif top_importance > 0.6:
            summary_parts.append(f"{top_feature} is a significant business driver requiring strategic focus")
        else:
            summary_parts.append(f"Multiple factors influence {target_column} - holistic approach recommended")
        
        # Strategic recommendation
        if model_used in ['Random Forest', 'Gradient Boosting']:
            summary_parts.append(f"Advanced {model_used} model captures complex business relationships effectively")
        
        return ". ".join(summary_parts)
    
    def _identify_key_drivers(self, feature_importance: Dict, 
                             correlations: Dict, target_column: str) -> List[Dict]:
        """Identify and rank key business drivers"""
        key_drivers = []
        
        # Sort features by importance
        sorted_features = sorted(feature_importance.items(), 
                              key=lambda x: x[1], reverse=True)
        
        for i, (feature, importance) in enumerate(sorted_features[:5]):
            correlation_value = correlations.get(feature, 0)
            correlation_strength = self._classify_correlation_strength(abs(correlation_value))
            
            driver_info = {
                'rank': i + 1,
                'feature': feature,
                'importance_score': importance,
                'correlation': correlation_value,
                'correlation_strength': correlation_strength,
                'impact_level': self._classify_impact_level(importance),
                'business_impact': self._generate_business_impact_statement(
                    feature, target_column, importance, correlation_value
                )
            }
            
            key_drivers.append(driver_info)
        
        return key_drivers
    
    def _analyze_performance_metrics(self, model_performance: Dict, 
                                   dataset_profile: Optional[Dict]) -> Dict[str, Any]:
        """Analyze model performance metrics"""
        r2_score = model_performance.get('r2_score', 0)
        model_used = model_performance.get('model_used', 'Unknown')
        
        performance_analysis = {
            'predictive_accuracy': {
                'score': r2_score,
                'classification': self._classify_model_performance(r2_score),
                'business_reliability': self._assess_business_reliability(r2_score)
            },
            'model_complexity': self._assess_model_complexity(model_used),
            'data_utilization': self._assess_data_utilization(dataset_profile) if dataset_profile else {}
        }
        
        return performance_analysis
    
    def _generate_business_recommendations(self, feature_importance: Dict, 
                                        correlations: Dict, target_column: str) -> List[str]:
        """Generate actionable business recommendations"""
        recommendations = []
        
        # Top 3 features
        top_features = list(feature_importance.keys())[:3]
        
        for i, feature in enumerate(top_features):
            importance = feature_importance[feature]
            correlation = correlations.get(feature, 0)
            
            if importance > 0.8:
                recommendations.append(
                    f"Priority #{i+1}: Immediately optimize {feature} - critical business driver ({importance:.3f} importance)"
                )
            elif importance > 0.6:
                recommendations.append(
                    f"Priority #{i+1}: Focus improvement efforts on {feature} - high impact driver"
                )
            elif importance > 0.4:
                recommendations.append(
                    f"Priority #{i+1}: Consider {feature} optimization - moderate business impact"
                )
            
            # Add specific recommendations based on correlation
            if correlation > 0.7:
                recommendations.append(
                    f"Leverage {feature} strength to maximize {target_column} outcomes"
                )
            elif correlation < -0.5:
                recommendations.append(
                    f"Investigate and address {feature} issues - negative impact on {target_column}"
                )
        
        # Strategic recommendations
        if len(top_features) >= 2:
            recommendations.append(
                f"Implement combined optimization strategy for {top_features[0]} and {top_features[1]}"
            )
        
        # Process recommendations
        recommendations.append("Establish monitoring framework for key business metrics")
        recommendations.append("Develop data-driven decision making processes")
        
        return recommendations
    
    def _identify_risk_factors(self, analysis_results: Dict, 
                               dataset_profile: Optional[Dict]) -> List[str]:
        """Identify potential business risks"""
        risks = []
        
        # Model-related risks
        r2_score = analysis_results.get('model_performance', {}).get('r2_score', 0)
        if r2_score < 0.5:
            risks.append("Low model reliability may lead to poor business decisions")
        
        # Data quality risks
        if dataset_profile:
            missing_pct = dataset_profile.get('missing_data_pct', 0)
            if missing_pct > 15:
                risks.append(f"High missing data rate ({missing_pct:.1f}%) affects analysis reliability")
            
            duplicate_pct = dataset_profile.get('duplicate_rows', 0) / dataset_profile.get('total_rows', 1) * 100
            if duplicate_pct > 10:
                risks.append(f"High duplicate data rate ({duplicate_pct:.1f}%) may bias results")
        
        # Business logic risks
        correlations = analysis_results.get('correlation', {})
        negative_correlations = [(f, c) for f, c in correlations.items() if c < -0.5]
        if negative_correlations:
            top_negative = max(negative_correlations, key=lambda x: abs(x[1]))
            risks.append(
                f"Strong negative correlation: {top_negative[0]} (r = {top_negative[1]:.3f})"
            )
        
        # Feature importance risks
        feature_importance = analysis_results.get('importance', {})
        if feature_importance:
            top_features = list(feature_importance.keys())[:3]
            if len(top_features) == 1 and feature_importance[top_features[0]] > 0.9:
                risks.append(
                    f"Over-reliance on single factor: {top_features[0]} ({feature_importance[top_features[0]]:.3f} importance)"
                )
        
        return risks
    
    def _identify_opportunities(self, feature_importance: Dict, 
                               correlations: Dict, target_column: str) -> List[str]:
        """Identify business opportunities"""
        opportunities = []
        
        # High-correlation opportunities
        high_corr_features = [
            f for f, c in correlations.items() 
            if c > 0.7 and f in feature_importance
        ]
        
        for feature in high_corr_features:
            importance = feature_importance[feature]
            opportunities.append(
                f"Strong {feature} correlation ({correlations[feature]:.3f}) indicates growth opportunity"
            )
        
        # Underutilized feature opportunities
        if feature_importance:
            moderate_features = [
                f for f, imp in feature_importance.items() 
                if 0.3 < imp < 0.6 and correlations.get(f, 0) > 0.4
            ]
            
            for feature in moderate_features:
                opportunities.append(
                    f"Underutilized lever: {feature} has untapped potential"
                )
        
        # Model improvement opportunities
        model_used = analysis_results.get('model_performance', {}).get('model_used', '')
        if model_used in ['Linear Regression']:
            opportunities.append(
                "Consider advanced ML models to capture non-linear relationships"
            )
        
        # Data collection opportunities
        opportunities.append("Expand data collection to improve model accuracy")
        opportunities.append("Implement real-time data streaming for current insights")
        
        return opportunities
    
    def _generate_actionable_insights(self, key_drivers: List[Dict], 
                                      recommendations: List[str]) -> List[str]:
        """Generate specific actionable insights"""
        actionable = []
        
        # Time-based actions
        actionable.append("Immediate: Focus on top 3 key drivers identified")
        actionable.append("Short-term: Implement monitoring framework for critical metrics")
        actionable.append("Medium-term: Develop predictive models for business forecasting")
        actionable.append("Long-term: Establish data-driven culture across organization")
        
        # Resource allocation
        if key_drivers:
            top_driver = key_drivers[0]['feature'] if key_drivers else 'Unknown'
            actionable.append(f"Allocate resources to optimize {top_driver} performance")
        
        # Process improvements
        actionable.extend(recommendations[:3])  # Top 3 recommendations
        
        return actionable
    
    def _calculate_kpi_impacts(self, feature_importance: Dict, 
                             correlations: Dict) -> Dict[str, Any]:
        """Calculate KPI impact projections"""
        kpi_impacts = {}
        
        if feature_importance:
            # Revenue impact estimation
            top_feature = list(feature_importance.keys())[0]
            top_importance = feature_importance[top_feature] if top_feature in feature_importance else 0
            
            if top_importance > 0.7:
                kpi_impacts['revenue_impact'] = {
                    'potential_change': '15-25%',
                    'confidence': 'high',
                    'timeframe': '3-6 months',
                    'description': f"Optimizing {top_feature} could significantly impact revenue"
                }
            elif top_importance > 0.5:
                kpi_impacts['revenue_impact'] = {
                    'potential_change': '5-15%',
                    'confidence': 'medium',
                    'timeframe': '6-12 months',
                    'description': f"Improving {top_feature} should moderately impact revenue"
                }
            else:
                kpi_impacts['revenue_impact'] = {
                    'potential_change': '0-5%',
                    'confidence': 'low',
                    'timeframe': '12+ months',
                    'description': f"{top_feature} optimization has limited revenue impact"
                }
        
        # Efficiency gains
        high_corr_count = len([c for c in correlations.values() if c > 0.6])
        if high_corr_count > 2:
            kpi_impacts['efficiency_gains'] = {
                'potential_savings': '10-20%',
                'confidence': 'high',
                'description': "Multiple optimization opportunities available"
            }
        
        return kpi_impacts
    
    def _assess_confidence_level(self, model_performance: Dict, 
                               dataset_profile: Optional[Dict]) -> str:
        """Assess overall confidence in insights"""
        confidence_score = 0
        
        # Model performance contribution
        r2_score = model_performance.get('r2_score', 0)
        if r2_score > 0.8:
            confidence_score += 0.4
        elif r2_score > 0.6:
            confidence_score += 0.3
        elif r2_score > 0.4:
            confidence_score += 0.2
        
        # Data quality contribution
        if dataset_profile:
            data_quality = dataset_profile.get('data_quality_score', 0)
            confidence_score += (data_quality / 100) * 0.3
        
        # Sample size contribution
        if dataset_profile:
            sample_size = dataset_profile.get('total_rows', 0)
            if sample_size > 1000:
                confidence_score += 0.2
            elif sample_size > 500:
                confidence_score += 0.1
            elif sample_size > 100:
                confidence_score += 0.05
        
        # Classify confidence
        if confidence_score >= 0.8:
            return "high"
        elif confidence_score >= 0.6:
            return "medium"
        elif confidence_score >= 0.4:
            return "low"
        else:
            return "very_low"
    
    def _classify_correlation_strength(self, correlation_value: float) -> str:
        """Classify correlation strength for business interpretation"""
        abs_corr = abs(correlation_value)
        if abs_corr >= 0.8:
            return "very_strong"
        elif abs_corr >= 0.6:
            return "strong"
        elif abs_corr >= 0.4:
            return "moderate"
        elif abs_corr >= 0.2:
            return "weak"
        else:
            return "very_weak"
    
    def _classify_impact_level(self, importance_score: float) -> str:
        """Classify feature impact level"""
        if importance_score >= 0.8:
            return "critical"
        elif importance_score >= 0.6:
            return "high"
        elif importance_score >= 0.4:
            return "medium"
        else:
            return "low"
    
    def _classify_model_performance(self, r2_score: float) -> str:
        """Classify model performance"""
        if r2_score >= 0.85:
            return "excellent"
        elif r2_score >= 0.70:
            return "good"
        elif r2_score >= 0.50:
            return "fair"
        else:
            return "poor"
    
    def _assess_business_reliability(self, r2_score: float) -> str:
        """Assess business reliability of model"""
        if r2_score >= 0.85:
            return "highly_reliable"
        elif r2_score >= 0.70:
            return "reliable"
        elif r2_score >= 0.50:
            return "moderately_reliable"
        else:
            return "low_reliability"
    
    def _assess_model_complexity(self, model_used: str) -> str:
        """Assess model complexity"""
        if model_used in ['Linear Regression']:
            return "low"
        elif model_used in ['Ridge', 'Lasso']:
            return "low"
        elif model_used in ['Random Forest']:
            return "medium"
        elif model_used in ['Gradient Boosting']:
            return "high"
        else:
            return "unknown"
    
    def _assess_data_utilization(self, dataset_profile: Dict) -> Dict[str, Any]:
        """Assess data utilization efficiency"""
        total_rows = dataset_profile.get('total_rows', 0)
        missing_data_pct = dataset_profile.get('missing_data_pct', 0)
        
        return {
            'utilization_score': max(0, 100 - missing_data_pct),
            'efficiency': 'high' if total_rows > 1000 else 'medium' if total_rows > 100 else 'low',
            'completeness': 'excellent' if missing_data_pct < 5 else 'good' if missing_data_pct < 15 else 'poor'
        }
    
    def _generate_business_impact_statement(self, feature: str, target_column: str, 
                                       importance: float, correlation: float) -> str:
        """Generate business impact statement"""
        correlation_direction = "positively impacts" if correlation > 0 else "negatively impacts"
        
        if importance > 0.8:
            return f"{feature} is the primary driver of {target_column} - {correlation_direction} business outcomes with {importance:.3f} importance"
        elif importance > 0.6:
            return f"{feature} significantly influences {target_column} - {correlation_direction} business performance"
        elif importance > 0.4:
            return f"{feature} moderately affects {target_column} - {correlation_direction} business results"
        else:
            return f"{feature} has minimal impact on {target_column} - {correlation_direction} business outcomes"
