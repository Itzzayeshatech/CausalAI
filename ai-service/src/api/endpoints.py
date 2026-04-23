from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import sys
import os

# Add the src directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from services.ml_engine import MLEngine

app = Flask(__name__)
CORS(app)

# Initialize ML Engine
ml_engine = MLEngine()

def load_data_from_request(payload):
    """Load and validate data from request payload"""
    rows = payload.get('rows', [])
    
    if not rows:
        raise ValueError("No data provided")
    
    # Convert to DataFrame
    df = pd.DataFrame(rows)
    
    if df.empty:
        raise ValueError("Empty dataset provided")
    
    return df

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'CausalAI ML Engine',
        'version': '2.0.0'
    })

@app.route('/analyze', methods=['POST'])
def analyze():
    """Main analysis endpoint"""
    try:
        payload = request.get_json()
        
        if not payload:
            return jsonify({
                'error': 'No JSON payload provided'
            }), 400
        
        # Validate required fields
        analysis_type = payload.get('type')
        if not analysis_type:
            return jsonify({
                'error': 'Analysis type is required'
            }), 400
        
        # Load data
        df = load_data_from_request(payload)
        dataset_name = payload.get('datasetName', 'Unknown Dataset')
        target_column = payload.get('targetColumn')
        
        if not target_column:
            return jsonify({
                'error': 'Target column is required'
            }), 400
        
        # Route to appropriate analysis
        if analysis_type == 'root-cause':
            result = ml_engine.analyze_root_cause(
                df, target_column, dataset_name
            )
        elif analysis_type == 'what-if':
            changes = payload.get('changes', [])
            scenario_name = payload.get('scenarioName', 'What-If Scenario')
            
            if not changes:
                return jsonify({
                    'error': 'At least one scenario change is required'
                }), 400
            
            result = ml_engine.analyze_what_if(
                df, target_column, changes, dataset_name, scenario_name
            )
        else:
            return jsonify({
                'error': f'Unknown analysis type: {analysis_type}'
            }), 400
        
        # Check for errors in result
        if 'error' in result:
            return jsonify(result), 500
        
        return jsonify(result)
        
    except ValueError as e:
        return jsonify({
            'error': f'Validation error: {str(e)}'
        }), 400
    except Exception as e:
        return jsonify({
            'error': f'Analysis failed: {str(e)}'
        }), 500

@app.route('/analyze/batch', methods=['POST'])
def batch_analyze():
    """Batch analysis endpoint for multiple datasets"""
    try:
        payload = request.get_json()
        
        if not payload:
            return jsonify({
                'error': 'No JSON payload provided'
            }), 400
        
        datasets = payload.get('datasets', [])
        if not datasets:
            return jsonify({
                'error': 'No datasets provided for batch analysis'
            }), 400
        
        results = []
        
        for dataset_payload in datasets:
            try:
                df = load_data_from_request(dataset_payload)
                dataset_name = dataset_payload.get('datasetName', 'Unknown Dataset')
                target_column = dataset_payload.get('targetColumn')
                analysis_type = dataset_payload.get('type', 'root-cause')
                
                if not target_column:
                    results.append({
                        'dataset': dataset_name,
                        'error': 'Target column is required'
                    })
                    continue
                
                if analysis_type == 'root-cause':
                    result = ml_engine.analyze_root_cause(
                        df, target_column, dataset_name
                    )
                elif analysis_type == 'what-if':
                    changes = dataset_payload.get('changes', [])
                    scenario_name = dataset_payload.get('scenarioName', 'What-If Scenario')
                    
                    if not changes:
                        results.append({
                            'dataset': dataset_name,
                            'error': 'At least one scenario change is required'
                        })
                        continue
                    
                    result = ml_engine.analyze_what_if(
                        df, target_column, changes, dataset_name, scenario_name
                    )
                else:
                    results.append({
                        'dataset': dataset_name,
                        'error': f'Unknown analysis type: {analysis_type}'
                    })
                    continue
                
                results.append(result)
                
            except Exception as e:
                dataset_name = dataset_payload.get('datasetName', 'Unknown Dataset')
                results.append({
                    'dataset': dataset_name,
                    'error': f'Analysis failed: {str(e)}'
                })
        
        return jsonify({
            'results': results,
            'total_datasets': len(datasets),
            'successful_analyses': len([r for r in results if 'error' not in r])
        })
        
    except Exception as e:
        return jsonify({
            'error': f'Batch analysis failed: {str(e)}'
        }), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({
        'error': 'Endpoint not found'
    }), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({
        'error': 'Internal server error'
    }), 500

if __name__ == '__main__':
    # Configuration
    host = os.getenv('AI_SERVICE_HOST', '0.0.0.0')
    port = int(os.getenv('AI_SERVICE_PORT', 8000))
    debug = os.getenv('AI_SERVICE_DEBUG', 'False').lower() == 'true'
    
    print(f"Starting CausalAI ML Engine on {host}:{port}")
    print(f"Debug mode: {debug}")
    
    app.run(host=host, port=port, debug=debug)
