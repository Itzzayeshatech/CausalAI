import { useEffect, useState } from 'react';
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const DashboardPage = ({ showToast }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/datasets');
        setData(response.data.slice(0, 5).map((dataset, index) => ({
          name: dataset.name,
          size: Math.round(dataset.fileSize / 1024),
          rows: dataset.meta.rowCount || 0,
          id: dataset._id,
          rank: index + 1
        })));
      } catch (error) {
        showToast('Unable to load datasets', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-card">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-white">Analytics Dashboard</h1>
            <p className="mt-2 text-slate-400">Monitor dataset activity, trends, and model insights in one place.</p>
          </div>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl bg-slate-950 p-5">
            <h2 className="text-lg font-semibold text-slate-100">Recent Dataset Size</h2>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={data} margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="#1e293b" />
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="size" fill="#38bdf8" radius={[12, 12, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="rounded-3xl bg-slate-950 p-5">
            <h2 className="text-lg font-semibold text-slate-100">Row Count Trend</h2>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={data} margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="#1e293b" />
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="rows" stroke="#22c55e" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;
