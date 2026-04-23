import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const RegisterPage = ({ showToast }) => {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', form);
      localStorage.setItem('causalai_token', data.token);
      localStorage.setItem('causalai_name', data.name);
      showToast('Account created');
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to register');
      showToast('Registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-card">
      <h1 className="text-3xl font-semibold text-white">Register</h1>
      <p className="mt-2 text-slate-400">Create your account to explore root cause analytics.</p>
      <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
        <label className="block">
          <span className="text-sm text-slate-300">Full name</span>
          <input value={form.name} onChange={handleChange} name="name" type="text" required className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-sky-500" />
        </label>
        <label className="block">
          <span className="text-sm text-slate-300">Email</span>
          <input value={form.email} onChange={handleChange} name="email" type="email" required className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-sky-500" />
        </label>
        <label className="block">
          <span className="text-sm text-slate-300">Password</span>
          <input value={form.password} onChange={handleChange} name="password" type="password" required className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-sky-500" />
        </label>
        {error && <p className="text-sm text-rose-300">{error}</p>}
        <button type="submit" disabled={loading} className="w-full rounded-2xl bg-sky-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:opacity-50">
          {loading ? <LoadingSpinner /> : 'Create Account'}
        </button>
      </form>
      <p className="mt-6 text-sm text-slate-400">Already registered? <Link to="/login" className="text-sky-400 hover:underline">Login</Link></p>
    </div>
  );
};

export default RegisterPage;
