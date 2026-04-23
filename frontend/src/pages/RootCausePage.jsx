import { useEffect, useState } from 'react';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorDisplay from '../components/ErrorDisplay';

const RootCausePage = ({ showToast }) => {
  const [datasets, setDatasets] = useState([]);
  const [selectedDataset, setSelectedDataset] = useState('');
  const [targetColumn, setTargetColumn] = useState('');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const body = { datasetId: selectedDataset, targetColumn };
      const res = await api.post('/analysis/root-cause', body);
      setResult(res.data);
      showToast('Root cause analysis complete');
    } catch (err) {
      setError(err.response?.data?.message || 'Analysis failed');
      showToast('Root cause failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-card">
        <h1 className="text-3xl font-semibold text-white">Root Cause Results</h1>
        <p className="mt-2 text-slate-400">Identify the most influential factor behind your business outcome.</p>
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
            <span className="text-sm text-slate-300">Target column</span>
            <input value={targetColumn} onChange={(e) => setTargetColumn(e.target.value)} placeholder="Sales" className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-sky-500" />
          </label>
          {error && <ErrorDisplay message={error} />}
          <button disabled={loading} type="submit" className="inline-flex items-center justify-center rounded-2xl bg-sky-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:opacity-50">
            {loading ? <LoadingSpinner /> : 'Run root cause analysis'}
          </button>
        </form>
      </div>
      {result && (
        <div className="space-y-6">
          {/* Root Cause Summary */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-card">
            <h2 className="text-2xl font-semibold text-white mb-4">Root Cause Analysis Results</h2>
            <div className="space-y-4">
              <div className="rounded-2xl bg-slate-950 p-4">
                <h3 className="text-lg font-semibold text-sky-400 mb-2">Primary Driver</h3>
                <p className="text-white text-xl font-bold">{result.rootCause?.feature}</p>
                <p className="text-slate-300 mt-2">{result.rootCause?.description}</p>
                <div className="mt-3 flex gap-4">
                  <span className="text-sm text-slate-400">Correlation: {result.rootCause?.correlation}</span>
                  <span className="text-sm text-slate-400">Impact: {result.rootCause?.impact}</span>
                </div>
              </div>
              
              <div className="rounded-2xl bg-slate-950 p-4">
                <h3 className="text-lg font-semibold text-sky-400 mb-2">Executive Summary</h3>
                <p className="text-slate-200">{result.summary}</p>
              </div>
            </div>
          </div>

          {/* Feature Importance */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-card">
            <h2 className="text-2xl font-semibold text-white mb-4">Feature Importance</h2>
            <div className="space-y-3">
              {Object.entries(result.importance || {}).map(([feature, score]) => (
                <div key={feature} className="flex items-center justify-between rounded-2xl bg-slate-950 p-3">
                  <span className="text-white font-medium">{feature}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 bg-slate-800 rounded-full h-2">
                      <div 
                        className="bg-sky-500 h-2 rounded-full" 
                        style={{ width: `${score * 100}%` }}
                      />
                    </div>
                    <span className="text-slate-300 text-sm w-12 text-right">{(score * 100).toFixed(0)}%</span>
                  </div>
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
            <h2 className="text-2xl font-semibold text-white mb-4">Recommendations</h2>
            <ul className="space-y-2">
              {(result.recommendations || []).map((rec, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="text-green-400 mt-1">✓</span>
                  <span className="text-slate-200">{rec}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Model Performance */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-card">
            <h2 className="text-2xl font-semibold text-white mb-4">Model Performance</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="rounded-2xl bg-slate-950 p-3 text-center">
                <p className="text-sky-400 text-sm">R² Score</p>
                <p className="text-white text-xl font-bold">{result.metadata?.model_performance?.r2_score || 'N/A'}</p>
              </div>
              <div className="rounded-2xl bg-slate-950 p-3 text-center">
                <p className="text-sky-400 text-sm">Data Points</p>
                <p className="text-white text-xl font-bold">{result.metadata?.data_points || 'N/A'}</p>
              </div>
              <div className="rounded-2xl bg-slate-950 p-3 text-center">
                <p className="text-sky-400 text-sm">Features</p>
                <p className="text-white text-xl font-bold">{result.metadata?.features_analyzed || 'N/A'}</p>
              </div>
              <div className="rounded-2xl bg-slate-950 p-3 text-center">
                <p className="text-sky-400 text-sm">Model</p>
                <p className="text-white text-xl font-bold">{result.regression?.model_used || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RootCausePage;
