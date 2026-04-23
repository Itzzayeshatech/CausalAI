import pandas as pd
import numpy as np
from typing import Dict, List, Tuple, Optional, Any
import logging
from scipy import stats
from sklearn.preprocessing import StandardScaler, LabelEncoder, RobustScaler
from sklearn.impute import SimpleImputer
from sklearn.feature_selection import SelectKBest, f_classif, f_regression
from sklearn.decomposition import PCA
from sklearn.model_selection import train_test_split
import warnings
warnings.filterwarnings('ignore')

class DataProcessor:
    """Enterprise-grade data processing pipeline"""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.scaler = None
        self.imputer = None
        self.feature_selector = None
        
    def validate_dataset(self, df: pd.DataFrame, target_column: str) -> Dict[str, Any]:
        """Comprehensive dataset validation"""
        validation_results = {
            'is_valid': True,
            'errors': [],
            'warnings': [],
            'metadata': {}
        }
        
        # Basic structure checks
        if df.empty:
            validation_results['is_valid'] = False
            validation_results['errors'].append("Dataset is empty")
            return validation_results
        
        if target_column not in df.columns:
            validation_results['is_valid'] = False
            validation_results['errors'].append(f"Target column '{target_column}' not found")
            return validation_results
        
        # Data quality checks
        total_rows = len(df)
        missing_data = df.isnull().sum()
        duplicate_rows = df.duplicated().sum()
        
        # Column analysis
        numeric_columns = df.select_dtypes(include=[np.number]).columns.tolist()
        categorical_columns = df.select_dtypes(include=['object']).columns.tolist()
        
        validation_results['metadata'] = {
            'total_rows': total_rows,
            'total_columns': len(df.columns),
            'numeric_columns': len(numeric_columns),
            'categorical_columns': len(categorical_columns),
            'missing_data_pct': (missing_data.sum() / (total_rows * len(df.columns))) * 100,
            'duplicate_rows': duplicate_rows,
            'memory_usage_mb': df.memory_usage(deep=True).sum() / (1024**2)
        }
        
        # Warnings
        if validation_results['metadata']['missing_data_pct'] > 20:
            validation_results['warnings'].append("High percentage of missing data (>20%)")
        
        if validation_results['metadata']['duplicate_rows'] > total_rows * 0.1:
            validation_results['warnings'].append("High percentage of duplicate rows (>10%)")
        
        if len(numeric_columns) < 2:
            validation_results['warnings'].append("Few numeric columns for analysis (<2)")
        
        # Errors
        if total_rows < 50:
            validation_results['errors'].append("Dataset too small for reliable analysis (<50 rows)")
        
        if total_rows > 1000000:
            validation_results['warnings'].append("Large dataset may impact processing time")
        
        return validation_results
    
    def clean_data(self, df: pd.DataFrame, target_column: str) -> Tuple[pd.DataFrame, Dict[str, Any]]:
        """Advanced data cleaning and preprocessing"""
        self.logger.info(f"Starting data cleaning for dataset with {len(df)} rows")
        
        cleaning_report = {
            'original_rows': len(df),
            'original_columns': len(df.columns),
            'actions_taken': []
        }
        
        # Remove completely empty rows
        original_rows = len(df)
        df_clean = df.dropna(how='all').copy()
        removed_empty = original_rows - len(df_clean)
        if removed_empty > 0:
            cleaning_report['actions_taken'].append(f"Removed {removed_empty} completely empty rows")
        
        # Handle duplicate rows
        original_rows = len(df_clean)
        df_clean = df_clean.drop_duplicates().copy()
        removed_duplicates = original_rows - len(df_clean)
        if removed_duplicates > 0:
            cleaning_report['actions_taken'].append(f"Removed {removed_duplicates} duplicate rows")
        
        # Separate target and features
        y = df_clean[target_column].copy()
        X = df_clean.drop(columns=[target_column]).copy()
        
        # Remove rows with missing target values
        original_rows = len(X)
        valid_mask = ~y.isnull()
        X = X[valid_mask]
        y = y[valid_mask]
        removed_missing_target = original_rows - len(X)
        if removed_missing_target > 0:
            cleaning_report['actions_taken'].append(f"Removed {removed_missing_target} rows with missing target values")
        
        # Handle missing values in features
        missing_before = X.isnull().sum().sum()
        
        # Numeric columns: impute with median
        numeric_columns = X.select_dtypes(include=[np.number]).columns
        if len(numeric_columns) > 0:
            self.imputer = SimpleImputer(strategy='median')
            X[numeric_columns] = self.imputer.fit_transform(X[numeric_columns])
            cleaning_report['actions_taken'].append(f"Imputed missing values in {len(numeric_columns)} numeric columns")
        
        # Categorical columns: impute with mode
        categorical_columns = X.select_dtypes(include=['object']).columns
        if len(categorical_columns) > 0:
            cat_imputer = SimpleImputer(strategy='most_frequent')
            X[categorical_columns] = cat_imputer.fit_transform(X[categorical_columns])
            cleaning_report['actions_taken'].append(f"Imputed missing values in {len(categorical_columns)} categorical columns")
        
        missing_after = X.isnull().sum().sum()
        cleaning_report['missing_values_handled'] = missing_before - missing_after
        
        # Combine cleaned features with target
        df_processed = X.copy()
        df_processed[target_column] = y
        
        cleaning_report.update({
            'final_rows': len(df_processed),
            'final_columns': len(df_processed.columns),
            'data_quality_score': self._calculate_data_quality_score(df_processed)
        })
        
        self.logger.info(f"Data cleaning completed: {cleaning_report}")
        
        return df_processed, cleaning_report
    
    def engineer_features(self, df: pd.DataFrame, target_column: str) -> Tuple[pd.DataFrame, Dict[str, Any]]:
        """Advanced feature engineering"""
        self.logger.info("Starting feature engineering")
        
        feature_report = {
            'original_features': len(df.columns) - 1,  # Exclude target
            'engineered_features': 0,
            'transformations': []
        }
        
        df_engineered = df.copy()
        
        # Identify numeric and categorical columns
        numeric_columns = df.select_dtypes(include=[np.number]).columns.drop(target_column, errors='ignore')
        categorical_columns = df.select_dtypes(include=['object']).columns
        
        # Numeric feature engineering
        for col in numeric_columns:
            if col in df_engineered.columns:
                # Polynomial features
                df_engineered[f'{col}_squared'] = df_engineered[col] ** 2
                df_engineered[f'{col}_cubed'] = df_engineered[col] ** 3
                feature_report['engineered_features'] += 2
                feature_report['transformations'].append(f"Added polynomial features for {col}")
                
                # Log transformation
                if (df_engineered[col] > 0).all():
                    df_engineered[f'{col}_log'] = np.log1p(df_engineered[col])
                    feature_report['engineered_features'] += 1
                    feature_report['transformations'].append(f"Added log transformation for {col}")
                
                # Square root transformation
                if (df_engineered[col] >= 0).all():
                    df_engineered[f'{col}_sqrt'] = np.sqrt(df_engineered[col])
                    feature_report['engineered_features'] += 1
                    feature_report['transformations'].append(f"Added square root transformation for {col}")
                
                # Binning/Discretization
                try:
                    df_engineered[f'{col}_binned'] = pd.qcut(df_engineered[col], q=5, labels=False, duplicates='drop')
                    feature_report['engineered_features'] += 1
                    feature_report['transformations'].append(f"Added quantile binning for {col}")
                except:
                    pass
        
        # Categorical feature engineering
        for col in categorical_columns:
            if col in df_engineered.columns:
                # Frequency encoding
                freq_map = df_engineered[col].value_counts().to_dict()
                df_engineered[f'{col}_freq'] = df_engineered[col].map(freq_map)
                feature_report['engineered_features'] += 1
                feature_report['transformations'].append(f"Added frequency encoding for {col}")
        
        # Interaction features (for top correlated numeric columns)
        if len(numeric_columns) >= 2:
            top_numeric = numeric_columns[:2]  # Take top 2 numeric columns
            if len(top_numeric) >= 2:
                col1, col2 = top_numeric[0], top_numeric[1]
                if col1 in df_engineered.columns and col2 in df_engineered.columns:
                    df_engineered[f'{col1}_{col2}_interaction'] = df_engineered[col1] * df_engineered[col2]
                    df_engineered[f'{col1}_{col2}_ratio'] = df_engineered[col1] / (df_engineered[col2] + 1e-8)
                    feature_report['engineered_features'] += 2
                    feature_report['transformations'].append(f"Added interaction features for {col1} and {col2}")
        
        # Date/Time features (if date columns detected)
        date_columns = df_engineered.select_dtypes(include=['datetime64']).columns
        for col in date_columns:
            if col in df_engineered.columns:
                df_engineered[f'{col}_year'] = df_engineered[col].dt.year
                df_engineered[f'{col}_month'] = df_engineered[col].dt.month
                df_engineered[f'{col}_day'] = df_engineered[col].dt.day
                df_engineered[f'{col}_weekday'] = df_engineered[col].dt.weekday
                feature_report['engineered_features'] += 4
                feature_report['transformations'].append(f"Added date-time features for {col}")
        
        # Remove original target column if it got duplicated
        if target_column in df_engineered.columns and df_engineered[target_column].name != target_column:
            df_engineered = df_engineered.drop(columns=[target_column])
        
        feature_report['total_features'] = len(df_engineered.columns) - 1  # Exclude target
        
        self.logger.info(f"Feature engineering completed: {feature_report}")
        
        return df_engineered, feature_report
    
    def scale_features(self, X: pd.DataFrame, method: str = 'standard') -> Tuple[np.ndarray, Any]:
        """Feature scaling with multiple methods"""
        self.logger.info(f"Scaling features using {method} method")
        
        numeric_columns = X.select_dtypes(include=[np.number]).columns
        
        if len(numeric_columns) == 0:
            return X.values, None
        
        if method == 'standard':
            self.scaler = StandardScaler()
        elif method == 'robust':
            self.scaler = RobustScaler()
        else:
            raise ValueError(f"Unknown scaling method: {method}")
        
        X_scaled = X.copy()
        X_scaled[numeric_columns] = self.scaler.fit_transform(X[numeric_columns])
        
        return X_scaled.values, self.scaler
    
    def select_features(self, X: pd.DataFrame, y: pd.Series, k: int = 10) -> Tuple[np.ndarray, List[str], Any]:
        """Intelligent feature selection"""
        self.logger.info(f"Selecting top {k} features")
        
        # Remove constant and quasi-constant features
        selector = VarianceThreshold(threshold=0.01)
        selector.fit(X)
        X_var_filtered = selector.transform(X)
        
        # Univariate feature selection
        selector = SelectKBest(score_func=f_regression, k=min(k, X.shape[1]))
        selector.fit(X_var_filtered, y)
        X_selected = selector.transform(X_var_filtered)
        
        selected_features = X.columns[selector.get_support()].tolist()
        
        self.logger.info(f"Selected {len(selected_features)} features: {selected_features}")
        
        return X_selected, selected_features, selector
    
    def detect_outliers(self, df: pd.DataFrame, method: str = 'iqr') -> Dict[str, Any]:
        """Outlier detection using multiple methods"""
        self.logger.info(f"Detecting outliers using {method} method")
        
        numeric_columns = df.select_dtypes(include=[np.number]).columns
        outlier_report = {
            'method': method,
            'outliers_detected': 0,
            'outlier_columns': {},
            'outlier_indices': []
        }
        
        if method == 'iqr':
            for col in numeric_columns:
                Q1 = df[col].quantile(0.25)
                Q3 = df[col].quantile(0.75)
                IQR = Q3 - Q1
                lower_bound = Q1 - 1.5 * IQR
                upper_bound = Q3 + 1.5 * IQR
                
                outliers = df[(df[col] < lower_bound) | (df[col] > upper_bound)]
                outlier_indices = outliers.index.tolist()
                
                outlier_report['outlier_columns'][col] = {
                    'count': len(outliers),
                    'percentage': (len(outliers) / len(df)) * 100,
                    'bounds': [lower_bound, upper_bound]
                }
                outlier_report['outliers_detected'] += len(outliers)
                outlier_report['outlier_indices'].extend(outlier_indices)
        
        elif method == 'zscore':
            for col in numeric_columns:
                z_scores = np.abs(stats.zscore(df[col].dropna()))
                outliers = df[z_scores > 3]
                outlier_indices = outliers.index.tolist()
                
                outlier_report['outlier_columns'][col] = {
                    'count': len(outliers),
                    'percentage': (len(outliers) / len(df)) * 100,
                    'threshold': 3
                }
                outlier_report['outliers_detected'] += len(outliers)
                outlier_report['outlier_indices'].extend(outlier_indices)
        
        self.logger.info(f"Outlier detection completed: {outlier_report}")
        
        return outlier_report
    
    def _calculate_data_quality_score(self, df: pd.DataFrame) -> float:
        """Calculate overall data quality score"""
        total_cells = len(df) * len(df.columns)
        missing_cells = df.isnull().sum().sum()
        duplicate_rows = df.duplicated().sum()
        
        # Base score starts at 100
        score = 100.0
        
        # Deduct for missing data
        missing_penalty = (missing_cells / total_cells) * 30
        score -= missing_penalty
        
        # Deduct for duplicates
        duplicate_penalty = (duplicate_rows / len(df)) * 20
        score -= duplicate_penalty
        
        # Bonus for good structure
        numeric_columns = len(df.select_dtypes(include=[np.number]).columns)
        if numeric_columns >= 3:
            score += 5  # Bonus for sufficient numeric columns
        
        return max(0, min(100, score))
    
    def generate_data_profile(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Generate comprehensive data profile"""
        self.logger.info("Generating data profile")
        
        profile = {
            'basic_info': {
                'rows': len(df),
                'columns': len(df.columns),
                'memory_usage_mb': df.memory_usage(deep=True).sum() / (1024**2),
                'dtypes': df.dtypes.value_counts().to_dict()
            },
            'column_details': {},
            'correlations': None,
            'distributions': {}
        }
        
        # Detailed column analysis
        for col in df.columns:
            col_info = {
                'dtype': str(df[col].dtype),
                'non_null_count': df[col].count(),
                'null_count': df[col].isnull().sum(),
                'null_percentage': (df[col].isnull().sum() / len(df)) * 100,
                'unique_count': df[col].nunique(),
                'memory_usage_mb': df[col].memory_usage(deep=True) / (1024**2)
            }
            
            if df[col].dtype in ['int64', 'float64']:
                col_info.update({
                    'min': df[col].min(),
                    'max': df[col].max(),
                    'mean': df[col].mean(),
                    'median': df[col].median(),
                    'std': df[col].std()
                })
            
            profile['column_details'][col] = col_info
        
        # Correlation matrix for numeric columns
        numeric_df = df.select_dtypes(include=[np.number])
        if len(numeric_df.columns) > 1:
            correlation_matrix = numeric_df.corr()
            profile['correlations'] = correlation_matrix.to_dict()
        
        self.logger.info("Data profiling completed")
        
        return profile
