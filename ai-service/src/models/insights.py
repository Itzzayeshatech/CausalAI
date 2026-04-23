import numpy as np
import pandas as pd
from typing import Dict, List, Any
from datetime import datetime
import re

class InsightsEngine:
    """AI-powered business insights generator"""
    
    def __init__(self):
        self.insight_templates = {
            'correlation': [
                "{feature} shows {strength} correlation with {target} ({value:.3f})",
                "Strong linear relationship between {feature} and {target}",
                "{feature} accounts for {pct:.1f}% of {target} variation"
            ],
            'recommendation': [
                "Focus optimization efforts on {feature} for maximum impact",
                "Consider increasing {feature} to improve {target}",
                "Monitor {feature} closely as it drives {target} performance",
                "Implement {feature} improvement initiatives",
                "Allocate resources to {feature} enhancement"
            ],
            'trend': [
                "Dataset shows {trend} pattern in {target}",
                "Seasonal variation detected in {target}",
                "Consistent {direction} trend in {target} over time"
            ],
            'business_impact': [
                "Each 1% increase in {feature} could improve {target} by {impact:.2f}%",
                "Optimizing {feature} may increase {target} by {potential:.1f} units",
                "{feature} represents {pct:.1f}% of total {target} drivers"
            ]
        }
    
    def generate_insights(self, analysis_results: Dict, df: pd.DataFrame) -> Dict[str, Any]:
        """Generate comprehensive business insights"""
        insights = {
            'correlation_insights': [],
            'recommendations': [],
            'business_impact': [],
            'trend_insights': [],
            'actionable_items': [],
            'kpi_summary': {},
            'risk_factors': [],
            'opportunities': []
        }
        
        target_column = analysis_results.get('targetColumn', 'Target')
        
        # Correlation insights
        if 'correlation' in analysis_results:
            insights['correlation_insights'] = self._generate_correlation_insights(
                analysis_results['correlation'], target_column
            )
        
        # Regression insights
        if 'regression' in analysis_results:
            insights['business_impact'] = self._generate_business_impact(
                analysis_results['regression'], target_column
            )
        
        # Feature importance insights
        if 'importance' in analysis_results:
            insights['recommendations'] = self._generate_recommendations(
                analysis_results['importance'], target_column
            )
        
        # Trend analysis
        insights['trend_insights'] = self._analyze_trends(df, target_column)
        
        # KPI summary
        insights['kpi_summary'] = self._calculate_kpis(df, target_column)
        
        # Risk factors
        insights['risk_factors'] = self._identify_risks(analysis_results, df)
        
        # Opportunities
        insights['opportunities'] = self._identify_opportunities(analysis_results, df)
        
        # Actionable items
        insights['actionable_items'] = self._generate_actionable_items(insights)
        
        return insights
    
    def _generate_correlation_insights(self, correlations: Dict, target: str) -> List[str]:
        """Generate correlation-based insights"""
        insights = []
        
        if not correlations:
            return ["No significant correlations found"]
        
        # Top 3 correlations
        top_correlations = sorted(correlations.items(), key=lambda x: abs(x[1]), reverse=True)[:3]
        
        for feature, corr_value in top_correlations:
            strength = self._classify_correlation_strength(abs(corr_value))
            
            if abs(corr_value) >= 0.7:
                insights.append(
                    f"{feature} shows {strength} correlation with {target} "
                    f"(r = {corr_value:.3f}) - KEY DRIVER"
                )
            elif abs(corr_value) >= 0.5:
                insights.append(
                    f"{feature} has {strength} correlation with {target} "
                    f"(r = {corr_value:.3f})"
                )
        
        # Negative correlations
        negative_features = [(f, c) for f, c in correlations.items() if c < -0.3]
        if negative_features:
            insights.append(
                f"Warning: {len(negative_features)} factors negatively impact {target}"
            )
        
        return insights
    
    def _generate_business_impact(self, regression: Dict, target: str) -> List[str]:
        """Generate business impact insights"""
        insights = []
        
        if 'coefficients' not in regression:
            return ["Insufficient data for impact analysis"]
        
        coefficients = regression['coefficients']
        r2_score = regression.get('score', 0)
        
        # Model reliability
        if r2_score > 0.8:
            insights.append(f"Highly reliable model (R² = {r2_score:.3f}) for predictions")
        elif r2_score > 0.6:
            insights.append(f"Good predictive model (R² = {r2_score:.3f})")
        else:
            insights.append(f"Model needs improvement (R² = {r2_score:.3f})")
        
        # Impact coefficients
        positive_impacts = [(f, c) for f, c in coefficients.items() if c > 0]
        negative_impacts = [(f, c) for f, c in coefficients.items() if c < 0]
        
        if positive_impacts:
            top_positive = max(positive_impacts, key=lambda x: x[1])
            insights.append(
                f"{top_positive[0]} has strongest positive impact on {target}"
            )
        
        if negative_impacts:
            insights.append(
                f"{len(negative_impacts)} factors reduce {target} performance"
            )
        
        return insights
    
    def _generate_recommendations(self, importance: List[Dict], target: str) -> List[str]:
        """Generate actionable recommendations"""
        recommendations = []
        
        if not importance:
            return ["Collect more data for better recommendations"]
        
        # Top 3 important features
        top_features = importance[:3]
        
        for i, feature_data in enumerate(top_features):
            feature = feature_data['feature']
            score = feature_data['score']
            
            if score > 0.8:
                recommendations.append(
                    f"Priority #{i+1}: Optimize {feature} - CRITICAL driver ({score:.3f})"
                )
            elif score > 0.6:
                recommendations.append(
                    f"Priority #{i+1}: Improve {feature} - HIGH impact ({score:.3f})"
                )
            else:
                recommendations.append(
                    f"Priority #{i+1}: Monitor {feature} - MODERATE impact ({score:.3f})"
                )
        
        # Strategic recommendations
        if len(top_features) >= 2:
            top_feature = top_features[0]['feature']
            second_feature = top_features[1]['feature']
            
            recommendations.append(
                f"Focus on {top_feature} and {second_feature} for compound benefits"
            )
        
        return recommendations
    
    def _analyze_trends(self, df: pd.DataFrame, target: str) -> List[str]:
        """Analyze trends in the data"""
        insights = []
        
        if target not in df.columns:
            return ["Target column not found for trend analysis"]
        
        target_data = df[target].dropna()
        
        if len(target_data) < 3:
            return ["Insufficient data for trend analysis"]
        
        # Simple trend analysis
        values = target_data.values
        trend_slope = np.polyfit(range(len(values)), values, 1)[0]
        
        if trend_slope > 0.1:
            insights.append(f"{target} shows upward trend")
        elif trend_slope < -0.1:
            insights.append(f"{target} shows downward trend")
        else:
            insights.append(f"{target} shows stable pattern")
        
        # Volatility
        volatility = np.std(values) / np.mean(values) if np.mean(values) != 0 else 0
        if volatility > 0.3:
            insights.append(f"High volatility detected in {target}")
        elif volatility < 0.1:
            insights.append(f"Stable {target} performance")
        
        return insights
    
    def _calculate_kpis(self, df: pd.DataFrame, target: str) -> Dict[str, Any]:
        """Calculate key performance indicators"""
        if target not in df.columns:
            return {}
        
        target_data = df[target].dropna()
        
        if len(target_data) == 0:
            return {}
        
        return {
            'mean': float(target_data.mean()),
            'median': float(target_data.median()),
            'std_dev': float(target_data.std()),
            'min_value': float(target_data.min()),
            'max_value': float(target_data.max()),
            'range': float(target_data.max() - target_data.min()),
            'coefficient_of_variation': float(target_data.std() / target_data.mean()) if target_data.mean() != 0 else 0,
            'data_points': len(target_data),
            'growth_rate': self._calculate_growth_rate(target_data)
        }
    
    def _identify_risks(self, analysis_results: Dict, df: pd.DataFrame) -> List[str]:
        """Identify potential business risks"""
        risks = []
        
        # High negative correlations
        if 'correlation' in analysis_results:
            negative_correlations = [
                f for f, c in analysis_results['correlation'].items() 
                if c < -0.5
            ]
            if negative_correlations:
                risks.append(
                    f"High-impact negative factors: {', '.join(negative_correlations)}"
                )
        
        # Low model performance
        if 'regression' in analysis_results:
            r2_score = analysis_results['regression'].get('score', 0)
            if r2_score < 0.5:
                risks.append("Low predictive reliability - decisions may be inaccurate")
        
        # Data quality issues
        target_column = analysis_results.get('targetColumn', '')
        if target_column in df.columns:
            missing_pct = df[target_column].isnull().sum() / len(df) * 100
            if missing_pct > 10:
                risks.append(f"High missing data in {target_column}: {missing_pct:.1f}%")
        
        return risks
    
    def _identify_opportunities(self, analysis_results: Dict, df: pd.DataFrame) -> List[str]:
        """Identify business opportunities"""
        opportunities = []
        
        # High positive correlations
        if 'correlation' in analysis_results:
            high_correlations = [
                f for f, c in analysis_results['correlation'].items() 
                if c > 0.7
            ]
            if high_correlations:
                opportunities.append(
                    f"High-impact levers: {', '.join(high_correlations[:3])}"
                )
        
        # Model strength
        if 'regression' in analysis_results:
            r2_score = analysis_results['regression'].get('score', 0)
            if r2_score > 0.8:
                opportunities.append("Excellent predictability enables confident planning")
        
        return opportunities
    
    def _generate_actionable_items(self, insights: Dict) -> List[str]:
        """Generate specific actionable items"""
        actionable = []
        
        # From recommendations
        if insights.get('recommendations'):
            actionable.extend(insights['recommendations'][:3])
        
        # From opportunities
        if insights.get('opportunities'):
            actionable.append("Develop optimization plan for high-impact factors")
        
        # From risks
        if insights.get('risk_factors'):
            actionable.append("Implement monitoring for identified risk factors")
        
        return actionable[:5]  # Limit to top 5 actions
    
    def _classify_correlation_strength(self, correlation_value: float) -> str:
        """Classify correlation strength"""
        abs_corr = abs(correlation_value)
        if abs_corr >= 0.8:
            return "very strong"
        elif abs_corr >= 0.6:
            return "strong"
        elif abs_corr >= 0.4:
            return "moderate"
        elif abs_corr >= 0.2:
            return "weak"
        else:
            return "very weak"
    
    def _calculate_growth_rate(self, data: pd.Series) -> float:
        """Calculate simple growth rate"""
        if len(data) < 2:
            return 0.0
        
        first_value = data.iloc[0]
        last_value = data.iloc[-1]
        
        if first_value == 0:
            return 0.0
        
        return ((last_value - first_value) / first_value) * 100
