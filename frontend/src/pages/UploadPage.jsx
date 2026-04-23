import { useState } from 'react';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorDisplay from '../components/ErrorDisplay';

const UploadPage = ({ showToast }) => {
  const [file, setFile] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    if (!file) {
      setError('Please choose a CSV or Excel file');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', name);
    formData.append('description', description);
    setLoading(true);

    try {
      await api.post('/datasets/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      showToast('Dataset uploaded');
      setFile(null);
      setName('');
      setDescription('');
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
      showToast('Upload failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-card">
      <h2 className="text-3xl font-semibold text-white">Upload Dataset</h2>
      <p className="mt-2 text-slate-400">Upload CSV or Excel data to power root cause analytics.</p>
      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        <label className="block">
          <span className="text-sm text-slate-300">Dataset name</span>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Sales performance" className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-sky-500" />
        </label>
        <label className="block">
          <span className="text-sm text-slate-300">Description</span>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows="4" className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-sky-500" />
        </label>
        <label className="block">
          <span className="text-sm text-slate-300">File</span>
          <input onChange={(e) => setFile(e.target.files?.[0] ?? null)} type="file" accept=".csv, .xls, .xlsx" className="mt-2 w-full text-slate-100" />
        </label>
        {error && <ErrorDisplay message={error} />}
        <button type="submit" disabled={loading} className="inline-flex items-center justify-center rounded-2xl bg-sky-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:opacity-50">
          {loading ? <LoadingSpinner /> : 'Upload dataset'}
        </button>
      </form>
    </div>
  );
};

export default UploadPage;
