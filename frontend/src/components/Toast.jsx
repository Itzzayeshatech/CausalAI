const Toast = ({ message, type = 'success' }) => {
  const color = type === 'error' ? 'bg-rose-600' : 'bg-emerald-500';
  return (
    <div className={`fixed bottom-6 right-6 z-50 rounded-2xl px-5 py-4 text-sm font-medium text-white shadow-xl ${color}`}>
      {message}
    </div>
  );
};

export default Toast;
