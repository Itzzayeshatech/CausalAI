import { useEffect, useState } from 'react';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/auth/profile');
        setProfile(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const logout = () => {
    localStorage.removeItem('causalai_token');
    localStorage.removeItem('causalai_name');
    window.location.href = '/login';
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="mx-auto max-w-2xl rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-card">
      <h1 className="text-3xl font-semibold text-white">Profile</h1>
      <div className="mt-6 space-y-4 rounded-3xl bg-slate-950 p-6">
        <p className="text-slate-300"><strong>Name:</strong> {profile?.name}</p>
        <p className="text-slate-300"><strong>Email:</strong> {profile?.email}</p>
        <p className="text-slate-300"><strong>Role:</strong> {profile?.role}</p>
        <button onClick={logout} className="rounded-2xl bg-rose-500 px-5 py-3 text-sm font-semibold text-white hover:bg-rose-400">Logout</button>
      </div>
    </div>
  );
};

export default ProfilePage;
