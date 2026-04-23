import { useEffect, useState } from 'react';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { Download, Calendar, TrendingUp, BarChart3 } from 'lucide-react';

const ReportsPage = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedItem, setExpandedItem] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get('/analysis/history');
        setHistory(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const exportReport = (item) => {
    const reportData = {
      ...item,
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${item.type}-analysis-${new Date(item.createdAt).toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const toggleExpanded = (itemId) => {
    setExpandedItem(expandedItem === itemId ? null : itemId);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-card">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-white">Analysis Reports</h1>
            <p className="mt-2 text-slate-400">Review analysis history and export insights.</p>
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <Calendar className="w-5 h-5" />
            <span className="text-sm">{history.length} analyses</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {history.map((item) => (
          <div key={item._id} className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-card">
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  item.type === 'root-cause' ? 'bg-blue-900 text-blue-300' : 'bg-green-900 text-green-300'
                }`}>
                  {item.type === 'root-cause' ? <TrendingUp className="w-5 h-5" /> : <BarChart3 className="w-5 h-5" />}
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    {item.type === 'root-cause' ? 'Root Cause Analysis' : 'What-If Analysis'}
                  </h2>
                  <p className="text-sm text-slate-400">{item.query}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-slate-800 px-4 py-2 text-sm text-slate-300">
                  {new Date(item.createdAt).toLocaleDateString()}
                </span>
                <button
                  onClick={() => exportReport(item)}
                  className="rounded-lg bg-slate-800 p-2 text-slate-300 hover:bg-slate-700 transition-colors"
                  title="Export Report"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Summary */}
            <div className="rounded-2xl bg-slate-950 p-4">
              <h3 className="text-sm font-semibold text-slate-300 mb-2">Summary</h3>
              <p className="text-slate-200">{item.result.summary}</p>
            </div>

            {/* Key Metrics */}
            {item.type === 'root-cause' && item.result.rootCause && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-2xl bg-slate-950 p-4">
                  <p className="text-sm text-slate-400">Primary Driver</p>
                  <p className="text-lg font-semibold text-white">{item.result.rootCause.feature}</p>
                </div>
                <div className="rounded-2xl bg-slate-950 p-4">
                  <p className="text-sm text-slate-400">Correlation</p>
                  <p className="text-lg font-semibold text-white">{(item.result.rootCause.correlation * 100).toFixed(0)}%</p>
                </div>
                <div className="rounded-2xl bg-slate-950 p-4">
                  <p className="text-sm text-slate-400">Impact Level</p>
                  <p className="text-lg font-semibold text-white">{item.result.rootCause.impact}</p>
                </div>
              </div>
            )}

            {item.type === 'what-if' && item.result.simulation && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-2xl bg-slate-950 p-4">
                  <p className="text-sm text-slate-400">Baseline</p>
                  <p className="text-lg font-semibold text-white">{item.result.simulation.baseline?.toFixed(2)}</p>
                </div>
                <div className="rounded-2xl bg-slate-950 p-4">
                  <p className="text-sm text-slate-400">Best Case</p>
                  <p className="text-lg font-semibold text-green-400">
                    {item.result.simulation.bestScenario?.predicted?.toFixed(2)}
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-950 p-4">
                  <p className="text-sm text-slate-400">Impact</p>
                  <p className="text-lg font-semibold text-white">
                    +{item.result.simulation.bestScenario?.impactPercent?.toFixed(1)}%
                  </p>
                </div>
              </div>
            )}

            {/* Expandable Details */}
            <div>
              <button
                onClick={() => toggleExpanded(item._id)}
                className="text-sm text-slate-400 hover:text-slate-300 transition-colors"
              >
                {expandedItem === item._id ? 'Hide Details' : 'Show Details'}
              </button>
              
              {expandedItem === item._id && (
                <div className="mt-4 space-y-4">
                  {/* Insights */}
                  <div className="rounded-2xl bg-slate-950 p-4">
                    <h3 className="text-sm font-semibold text-slate-300 mb-2">Key Insights</h3>
                    <ul className="space-y-1">
                      {(item.result.insights || []).map((insight, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-slate-200">
                          <span className="text-sky-400 mt-1">•</span>
                          <span>{insight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Recommendations */}
                  <div className="rounded-2xl bg-slate-950 p-4">
                    <h3 className="text-sm font-semibold text-slate-300 mb-2">Recommendations</h3>
                    <ul className="space-y-1">
                      {(item.result.recommendations || []).map((rec, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-slate-200">
                          <span className="text-green-400 mt-1">✓</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Model Performance */}
                  {item.result.metadata && (
                    <div className="rounded-2xl bg-slate-950 p-4">
                      <h3 className="text-sm font-semibold text-slate-300 mb-2">Model Performance</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div>
                          <p className="text-slate-400">Data Points</p>
                          <p className="text-white font-medium">{item.result.metadata.data_points}</p>
                        </div>
                        <div>
                          <p className="text-slate-400">Features</p>
                          <p className="text-white font-medium">{item.result.metadata.features_analyzed}</p>
                        </div>
                        <div>
                          <p className="text-slate-400">R² Score</p>
                          <p className="text-white font-medium">
                            {item.result.metadata.model_performance?.r2_score?.toFixed(3)}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-400">MAE</p>
                          <p className="text-white font-medium">
                            {item.result.metadata.model_performance?.mae?.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReportsPage;
