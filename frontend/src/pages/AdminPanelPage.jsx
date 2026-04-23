import { useEffect, useState } from 'react';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const AdminPanelPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get('/admin/users');
        setUsers(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-card">
        <h1 className="text-3xl font-semibold text-white">Admin Panel</h1>
        <p className="mt-2 text-slate-400">Admin access for user oversight and system settings.</p>
      </div>
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-card">
        <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 p-4">
          <table className="min-w-full text-left text-sm text-slate-100">
            <thead>
              <tr>
                <th className="px-4 py-3 text-slate-400">Name</th>
                <th className="px-4 py-3 text-slate-400">Email</th>
                <th className="px-4 py-3 text-slate-400">Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr key={index} className="border-t border-slate-800">
                  <td className="px-4 py-3">{user.name}</td>
                  <td className="px-4 py-3">{user.email}</td>
                  <td className="px-4 py-3">{user.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPanelPage;
