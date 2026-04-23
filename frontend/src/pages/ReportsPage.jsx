import { useEffect, useState } from 'react';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const ReportsPage = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-card">
        <h1 className="text-3xl font-semibold text-white">Reports</h1>
        <p className="mt-2 text-slate-400">Review analysis history and export insights.</p>
      </div>
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-card">
        <div className="grid gap-4">
          {history.map((item) => (
            <div key={item._id} className="rounded-3xl border border-slate-800 bg-slate-950 p-5">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-white">{item.type === 'root-cause' ? 'Root Cause' : 'What-If'}</h2>
                  <p className="text-sm text-slate-400">{item.query}</p>
                </div>
                <span className="rounded-full bg-slate-800 px-4 py-2 text-sm text-slate-300">{new Date(item.createdAt).toLocaleString()}</span>
              </div>
              <pre className="mt-4 whitespace-pre-wrap rounded-3xl bg-slate-900 p-4 text-sm text-slate-200">{JSON.stringify(item.result, null, 2)}</pre>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
