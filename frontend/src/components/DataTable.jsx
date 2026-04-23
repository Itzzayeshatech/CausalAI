const DataTable = ({ columns, rows }) => {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 shadow-card">
      <table className="min-w-full divide-y divide-slate-800 text-left text-sm">
        <thead className="bg-slate-900 text-slate-300">
          <tr>
            {columns.map((col) => (
              <th key={col} className="px-4 py-3 font-semibold uppercase tracking-wide text-slate-400">{col}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800 bg-slate-950 text-slate-100">
          {rows.map((row, index) => (
            <tr key={index} className="hover:bg-slate-900/60">
              {columns.map((col) => (
                <td key={col} className="px-4 py-3 align-top">{row[col] ?? '-'}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
