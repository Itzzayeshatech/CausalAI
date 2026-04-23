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
      setResult(res.data.result);
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
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-card">
          <h2 className="text-2xl font-semibold text-white">Simulation result</h2>
          <pre className="mt-4 whitespace-pre-wrap rounded-3xl bg-slate-950 p-5 text-sm text-slate-200">{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default WhatIfPage;
