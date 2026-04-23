from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import StandardScaler

app = Flask(__name__)
CORS(app)


def load_table(rows):
    return pd.DataFrame(rows)


def correlation_analysis(df, target_column):
    numeric = df.select_dtypes(include=[np.number]).fillna(0)
    if target_column not in numeric.columns:
        return {}
    correlations = numeric.corr()[target_column].drop(target_column)
    return correlations.abs().sort_values(ascending=False).to_dict()


def regression_analysis(df, target_column):
    numeric = df.select_dtypes(include=[np.number]).fillna(0)
    if target_column not in numeric.columns or numeric.shape[1] < 2:
        return {}
    X = numeric.drop(columns=[target_column])
    y = numeric[target_column]
    model = LinearRegression()
    model.fit(X, y)
    coefs = dict(zip(X.columns, model.coef_.tolist()))
    intercept = float(model.intercept_)
    return {"coefficients": coefs, "intercept": intercept, "score": model.score(X, y)}


def feature_importance(df, target_column):
    corr = correlation_analysis(df, target_column)
    importance = [{"feature": k, "score": float(v)} for k, v in corr.items()]
    importance.sort(key=lambda item: item["score"], reverse=True)
    return importance


def lookup_top_factor(correlation, regression, target_column):
    top_corr = max(correlation.items(), key=lambda x: x[1]) if correlation else (None, 0)
    top_coef = max(regression.get("coefficients", {}).items(), key=lambda x: abs(x[1])) if regression.get("coefficients") else (None, 0)
    candidate = top_corr[0] or top_coef[0]
    score = float(top_corr[1]) if candidate == top_corr[0] else float(abs(top_coef[1]))
    return {
        "feature": candidate,
        "correlation": float(top_corr[1]),
        "coefficient": float(top_coef[1]),
        "score": score,
        "description": f"Top impact factor for {target_column} is {candidate}."
    }


def simulate_what_if(df, target_column, changes):
    numeric = df.select_dtypes(include=[np.number]).fillna(0)
    if target_column not in numeric.columns:
        return {}
    model = LinearRegression()
    X = numeric.drop(columns=[target_column])
    y = numeric[target_column]
    if X.shape[1] == 0:
        return {}
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    model.fit(X_scaled, y)
    base_values = X.mean().to_dict()
    predictions = []
    for change in changes:
        variable = change.get("variable")
        delta = float(change.get("deltaPercent", 0)) / 100.0
        modified = base_values.copy()
        if variable in modified:
            modified[variable] = modified[variable] * (1 + delta)
        modified_vector = scaler.transform(pd.DataFrame([modified]))
        predicted = float(model.predict(modified_vector)[0])
        predictions.append({
            "variable": variable,
            "deltaPercent": delta * 100,
            "predicted": predicted
        })
    baseline = float(model.predict(scaler.transform(pd.DataFrame([base_values])))[0])
    return {"baseline": baseline, "scenarios": predictions}


def build_root_cause_result(df, target_column, payload):
    correlation = correlation_analysis(df, target_column)
    regression = regression_analysis(df, target_column)
    importance = feature_importance(df, target_column)
    root_cause = lookup_top_factor(correlation, regression, target_column)
    return {
        "dataset": payload.get("datasetName"),
        "targetColumn": target_column,
        "correlation": correlation,
        "regression": regression,
        "importance": importance,
        "rootCause": root_cause,
        "summary": f"{root_cause.get('feature')} is the strongest factor affecting {target_column}."
    }


def build_what_if_result(df, target_column, payload):
    simulation = simulate_what_if(df, target_column, payload.get("changes", []))
    return {
        "dataset": payload.get("datasetName"),
        "targetColumn": target_column,
        "scenarioName": payload.get("scenarioName"),
        "simulation": simulation,
        "recommendation": "Review the top change variables for impact and adjust strategy accordingly."
    }

@app.route('/analyze', methods=['POST'])
def analyze():
    payload = request.json or {}
    rows = payload.get('rows', [])
    dataset_name = payload.get('datasetName')
    target_column = payload.get('targetColumn')
    if not rows or not target_column:
        return jsonify({"error": "rows and targetColumn are required"}), 400
    try:
        df = load_table(rows)
        if payload.get('type') == 'root-cause':
            result = build_root_cause_result(df, target_column, payload)
        else:
            result = build_what_if_result(df, target_column, payload)
        return jsonify(result)
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)
