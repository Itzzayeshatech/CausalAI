import { Link } from 'react-router-dom';

const items = [
  { label: 'Dashboard', path: '/' },
  { label: 'Upload Dataset', path: '/upload' },
  { label: 'Analytics', path: '/analytics' },
  { label: 'Root Cause', path: '/root-cause' },
  { label: 'What-If Simulator', path: '/what-if' },
  { label: 'Reports', path: '/reports' },
  { label: 'Admin Panel', path: '/admin' }
];

const Sidebar = ({ open }) => {
  return (
    <aside className={`fixed inset-y-0 left-0 z-30 w-64 transform bg-slate-900 shadow-card transition-transform duration-300 md:static md:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="h-full overflow-y-auto p-5">
        <div className="mb-8 text-slate-300">
          <h2 className="text-2xl font-semibold">CausalAI</h2>
          <p className="text-sm text-slate-500">Root cause and simulation workspace</p>
        </div>
        <nav className="space-y-2">
          {items.map((item) => (
            <Link key={item.path} to={item.path} className="block rounded-xl px-4 py-3 text-slate-200 transition hover:bg-slate-800">
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
