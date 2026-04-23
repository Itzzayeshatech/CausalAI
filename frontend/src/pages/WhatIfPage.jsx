import { useEffect, useState } from 'react';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorDisplay from '../components/ErrorDisplay';

const WhatIfPage = ({ showToast }) => {
  const [datasets, setDatasets] = useState([]);
  const [selectedDataset, setSelectedDataset] = useState('');
  const [targetColumn, setTargetColumn] = useState('Revenue');
  const [scenarioName, setScenarioName] = useState('Increase marketing spend');
  const [changes, setChanges] = useState([{ variable: 'MarketingSpend', deltaPercent: 20 }]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDatasets = async () => {
      try {
        const res = await api.get('/datasets');
        setDatasets(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchDatasets();
  }, []);

  const handleChange = (index, field, value) => {
    const nextChanges = changes.map((item, idx) => idx === index ? { ...item, [field]: value } : item);
    setChanges(nextChanges);
  };

  const addScenario = () => setChanges([...changes, { variable: '', deltaPercent: 0 }]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/analysis/what-if', { datasetId: selectedDataset, targetColumn, changes, scenarioName });
      setResult(res.data);
      showToast('What-if simulation generated');
    } catch (err) {
      setError(err.response?.data?.message || 'What-if analysis failed');
      showToast('What-if failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-card">
        <h1 className="text-3xl font-semibold text-white">What-If Simulator</h1>
        <p className="mt-2 text-slate-400">Test business scenarios and estimate the impact on your target metric.</p>
      </div>
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-card">
        <form className="grid gap-5" onSubmit={handleSubmit}>
          <label className="block">
            <span className="text-sm text-slate-300">Dataset</span>
            <select value={selectedDataset} onChange={(e) => setSelectedDataset(e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-sky-500">
              <option value="">Select dataset</option>
              {datasets.map((dataset) => (
                <option key={dataset._id} value={dataset._id}>{dataset.name}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-sm text-slate-300">Scenario name</span>
            <input value={scenarioName} onChange={(e) => setScenarioName(e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-sky-500" />
          </label>
          <label className="block">
            <span className="text-sm text-slate-300">Target metric</span>
            <input value={targetColumn} onChange={(e) => setTargetColumn(e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-sky-500" />
          </label>
          <div className="space-y-4 rounded-3xl border border-slate-800 bg-slate-950 p-5">
            <h2 className="text-lg font-semibold text-slate-100">Scenario changes</h2>
            {changes.map((change, index) => (
              <div key={index} className="grid gap-3 md:grid-cols-2">
                <input value={change.variable} onChange={(e) => handleChange(index, 'variable', e.target.value)} placeholder="Variable" className="rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100 outline-none focus:border-sky-500" />
                <input value={change.deltaPercent} onChange={(e) => handleChange(index, 'deltaPercent', Number(e.target.value))} type="number" placeholder="Delta %" className="rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100 outline-none focus:border-sky-500" />
              </div>
            ))}
            <button type="button" onClick={addScenario} className="rounded-2xl border border-slate-700 px-5 py-3 text-sm text-slate-100 transition hover:border-slate-500">Add change</button>
          </div>
          {error && <ErrorDisplay message={error} />}
          <button disabled={loading} type="submit" className="inline-flex items-center justify-center rounded-2xl bg-sky-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:opacity-50">
            {loading ? <LoadingSpinner /> : 'Run what-if simulation'}
          </button>
        </form>
      </div>
      {result && (
        <div className="space-y-6">
          {/* Simulation Overview */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-card">
            <h2 className="text-2xl font-semibold text-white mb-4">What-If Simulation Results</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="rounded-2xl bg-slate-950 p-4 text-center">
                <p className="text-slate-400 text-sm">Baseline</p>
                <p className="text-white text-2xl font-bold">{result.simulation?.baseline?.toFixed(2) || 'N/A'}</p>
              </div>
              <div className="rounded-2xl bg-slate-950 p-4 text-center">
                <p className="text-slate-400 text-sm">Best Case</p>
                <p className="text-green-400 text-2xl font-bold">{result.simulation?.bestScenario?.predicted?.toFixed(2) || 'N/A'}</p>
              </div>
              <div className="rounded-2xl bg-slate-950 p-4 text-center">
                <p className="text-slate-400 text-sm">Worst Case</p>
                <p className="text-red-400 text-2xl font-bold">{result.simulation?.worstScenario?.predicted?.toFixed(2) || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Scenario Results */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-card">
            <h2 className="text-2xl font-semibold text-white mb-4">Scenario Analysis</h2>
            <div className="space-y-4">
              {(result.simulation?.scenarios || []).map((scenario, index) => (
                <div key={scenario.id || index} className="rounded-2xl bg-slate-950 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-sky-400">{scenario.variable}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      scenario.impact > 0 ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
                    }`}>
                      {scenario.impact > 0 ? '+' : ''}{scenario.impactPercent?.toFixed(1)}%
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div>
                      <p className="text-slate-400">Change</p>
                      <p className="text-white font-medium">{scenario.deltaPercent > 0 ? '+' : ''}{scenario.deltaPercent}%</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Predicted</p>
                      <p className="text-white font-medium">{scenario.predicted?.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Impact</p>
                      <p className="text-white font-medium">{scenario.impact?.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Confidence</p>
                      <p className="text-white font-medium">{(scenario.confidence * 100)?.toFixed(0)}%</p>
                    </div>
                  </div>
                  <p className="text-slate-300 text-sm mt-2">{scenario.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Insights */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-card">
            <h2 className="text-2xl font-semibold text-white mb-4">Key Insights</h2>
            <ul className="space-y-2">
              {(result.insights || []).map((insight, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="text-sky-400 mt-1">•</span>
                  <span className="text-slate-200">{insight}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Recommendations */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-card">
            <h2 className="text-2xl font-semibold text-white mb-4">Strategic Recommendations</h2>
            <ul className="space-y-2">
              {(result.recommendations || []).map((rec, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="text-green-400 mt-1">✓</span>
                  <span className="text-slate-200">{rec}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Risk Assessment */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-card">
            <h2 className="text-2xl font-semibold text-white mb-4">Risk Assessment</h2>
            <div className="space-y-3">
              <div>
                <h3 className="text-green-400 font-medium mb-2">Low Risk</h3>
                <ul className="space-y-1">
                  {(result.riskAssessment?.lowRisk || []).map((risk, index) => (
                    <li key={index} className="text-slate-200 text-sm">• {risk}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-yellow-400 font-medium mb-2">Medium Risk</h3>
                <ul className="space-y-1">
                  {(result.riskAssessment?.mediumRisk || []).map((risk, index) => (
                    <li key={index} className="text-slate-200 text-sm">• {risk}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-red-400 font-medium mb-2">High Risk</h3>
                <ul className="space-y-1">
                  {(result.riskAssessment?.highRisk || []).map((risk, index) => (
                    <li key={index} className="text-slate-200 text-sm">• {risk}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Implementation Guide */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-card">
            <h2 className="text-2xl font-semibold text-white mb-4">Implementation Guide</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-2xl bg-slate-950 p-4">
                <h3 className="text-sky-400 font-medium mb-2">Timeline</h3>
                <p className="text-slate-200">{result.implementation?.timeline || 'N/A'}</p>
              </div>
              <div className="rounded-2xl bg-slate-950 p-4">
                <h3 className="text-sky-400 font-medium mb-2">Resources</h3>
                <p className="text-slate-200">{result.implementation?.resources || 'N/A'}</p>
              </div>
              <div className="rounded-2xl bg-slate-950 p-4">
                <h3 className="text-sky-400 font-medium mb-2">KPIs</h3>
                <ul className="space-y-1">
                  {(result.implementation?.kpis || []).map((kpi, index) => (
                    <li key={index} className="text-slate-200 text-sm">• {kpi}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WhatIfPage;
