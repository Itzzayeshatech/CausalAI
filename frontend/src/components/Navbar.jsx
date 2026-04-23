import { Link } from 'react-router-dom';

const Navbar = ({ onMenuClick }) => {
  const name = localStorage.getItem('causalai_name') || 'Guest';

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <button onClick={onMenuClick} className="rounded-lg border border-slate-700 px-3 py-2 text-slate-200 hover:border-slate-500">
          Menu
        </button>
        <div className="flex items-center gap-4">
          <Link to="/" className="text-xl font-semibold text-slate-100">CausalAI</Link>
          <span className="rounded-full bg-slate-800 px-3 py-1 text-sm text-slate-300">{name}</span>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
