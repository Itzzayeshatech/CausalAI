const ErrorDisplay = ({ message }) => (
  <div className="rounded-2xl border border-rose-700 bg-rose-950/70 p-4 text-rose-100">
    <strong className="block text-sm font-semibold">Error</strong>
    <p className="mt-2 text-sm">{message}</p>
  </div>
);

export default ErrorDisplay;
