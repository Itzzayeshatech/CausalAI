import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

import pytest
import pandas as pd
from app import app, load_table, correlation_analysis, build_root_cause_result

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_load_table():
    rows = [
        {'col1': 1, 'col2': 2},
        {'col1': 3, 'col2': 4}
    ]
    df = load_table(rows)
    assert isinstance(df, pd.DataFrame)
    assert len(df) == 2

def test_correlation_analysis():
    rows = [
        {'A': 1, 'B': 2, 'C': 3},
        {'A': 4, 'B': 5, 'C': 6},
        {'A': 7, 'B': 8, 'C': 9}
    ]
    df = load_table(rows)
    corr = correlation_analysis(df, 'C')
    assert isinstance(corr, dict)
    assert 'A' in corr
    assert 'B' in corr

def test_analyze_endpoint(client):
    payload = {
        'type': 'root-cause',
        'rows': [
            {'Sales': 100, 'Price': 10, 'Marketing': 20},
            {'Sales': 200, 'Price': 15, 'Marketing': 30}
        ],
        'targetColumn': 'Sales',
        'datasetName': 'Test'
    }
    response = client.post('/analyze', json=payload)
    assert response.status_code == 200
    data = response.get_json()
    assert 'rootCause' in data