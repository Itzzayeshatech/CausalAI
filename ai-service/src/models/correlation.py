import numpy as np
import pandas as pd
from scipy.stats import pearsonr, spearmanr
from typing import Dict, List, Tuple, Optional

class CorrelationAnalyzer:
    """Advanced correlation analysis for business insights"""
    
    def __init__(self):
        self.correlation_matrix = None
        self.p_values = None
        
    def compute_correlation_matrix(self, df: pd.DataFrame, target_column: str) -> Dict:
        """Compute comprehensive correlation analysis"""
        numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
        
        if target_column not in numeric_cols:
            raise ValueError(f"Target column '{target_column}' not found in numeric columns")
        
        # Pearson correlation (linear relationships)
        pearson_corr = {}
        pearson_pvalues = {}
        
        # Spearman correlation (monotonic relationships)
        spearman_corr = {}
        spearman_pvalues = {}
        
        for col in numeric_cols:
            if col == target_column:
                continue
                
            # Remove NaN values for correlation calculation
            valid_data = df[[col, target_column]].dropna()
            
            if len(valid_data) < 3:  # Need at least 3 points for correlation
                continue
                
            x, y = valid_data[col], valid_data[target_column]
            
            # Pearson correlation
            pearson_r, pearson_p = pearsonr(x, y)
            if not np.isnan(pearson_r):
                pearson_corr[col] = pearson_r
                pearson_pvalues[col] = pearson_p
            
            # Spearman correlation
            spearman_r, spearman_p = spearmanr(x, y)
            if not np.isnan(spearman_r):
                spearman_corr[col] = spearman_r
                spearman_pvalues[col] = spearman_p
        
        # Combine correlations (use absolute values for ranking)
        combined_corr = {}
        for col in pearson_corr.keys():
            pearson_val = abs(pearson_corr[col])
            spearman_val = abs(spearman_corr.get(col, 0))
            
            # Weighted average (favor Pearson for linear relationships)
            combined_corr[col] = 0.7 * pearson_val + 0.3 * spearman_val
        
        # Sort by correlation strength
        sorted_correlations = dict(sorted(combined_corr.items(), key=lambda x: x[1], reverse=True))
        
        return {
            'correlations': sorted_correlations,
            'pearson': pearson_corr,
            'spearman': spearman_corr,
            'p_values': pearson_pvalues,
            'significant_features': self._get_significant_features(sorted_correlations, pearson_pvalues)
        }
    
    def _get_significant_features(self, correlations: Dict, p_values: Dict, alpha: float = 0.05) -> List[str]:
        """Get statistically significant features"""
        significant = []
        for feature, corr_value in correlations.items():
            p_val = p_values.get(feature, 1.0)
            if p_val < alpha:
                significant.append(feature)
        return significant
    
    def get_correlation_insights(self, df: pd.DataFrame, target_column: str) -> Dict:
        """Generate business insights from correlation analysis"""
        corr_analysis = self.compute_correlation_matrix(df, target_column)
        correlations = corr_analysis['correlations']
        
        if not correlations:
            return {'insight': 'No significant correlations found', 'recommendations': []}
        
        top_features = list(correlations.items())[:5]
        strongest_feature = top_features[0] if top_features else None
        
        insights = []
        recommendations = []
        
        if strongest_feature:
            feature_name, corr_value = strongest_feature
            insights.append(
                f"{feature_name} shows strongest correlation with {target_column} "
                f"(r = {corr_value:.3f})"
            )
            
            if corr_value > 0.7:
                recommendations.append(
                    f"Focus optimization efforts on {feature_name} for maximum impact"
                )
            elif corr_value > 0.5:
                recommendations.append(
                    f"{feature_name} is a key driver - consider targeted improvements"
                )
        
        # Check for negative correlations
        negative_correlations = [(f, c) for f, c in correlations.items() if c < -0.3]
        if negative_correlations:
            insights.append(
                f"Found {len(negative_correlations)} features with negative impact"
            )
        
        return {
            'insight': '; '.join(insights),
            'recommendations': recommendations,
            'top_features': top_features,
            'correlation_strength': self._classify_correlation_strength(strongest_feature[1] if strongest_feature else 0)
        }
    
    def _classify_correlation_strength(self, correlation_value: float) -> str:
        """Classify correlation strength for business interpretation"""
        abs_corr = abs(correlation_value)
        if abs_corr >= 0.8:
            return "Very Strong"
        elif abs_corr >= 0.6:
            return "Strong"
        elif abs_corr >= 0.4:
            return "Moderate"
        elif abs_corr >= 0.2:
            return "Weak"
        else:
            return "Very Weak"
