import { useEffect, useState } from 'react';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import DataTable from '../components/DataTable';

const AnalyticsPage = () => {
  const [datasets, setDatasets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDatasets = async () => {
      try {
        const res = await api.get('/datasets');
        setDatasets(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDatasets();
  }, []);

  if (loading) return <LoadingSpinner />;

  const columns = ['Name', 'Rows', 'Last updated'];
  const rows = datasets.map((dataset) => ({
    Name: dataset.name,
    Rows: dataset.meta?.rowCount || 0,
    'Last updated': new Date(dataset.uploadDate).toLocaleDateString()
  }));

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-card">
        <h1 className="text-3xl font-semibold text-white">Analytics Hub</h1>
        <p className="mt-2 text-slate-400">Choose data to run root cause and scenario experiments.</p>
      </div>
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-card">
        <h2 className="text-xl font-semibold text-white">Uploaded datasets</h2>
        <div className="mt-5">
          <DataTable columns={columns} rows={rows} />
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
