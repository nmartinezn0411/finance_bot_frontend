export function SubcategoryProgressTable({ rows }) {
  if (!rows.length) return <div className="text-body-secondary">Sin datos.</div>;

  return (
    <div className="table-responsive">
      <table className="table table-sm align-middle">
        <thead>
          <tr>
            <th>Subcategoría</th>
            <th className="text-end">Tracked</th>
            <th className="text-end">Budget</th>
            <th className="text-end">% </th>
            <th className="text-end">Remaining</th>
            <th className="text-end">Excess</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, idx) => (
            <tr key={idx}>
              <td>{r.subcategory}</td>
              <td className="text-end">{r.tracked}</td>
              <td className="text-end">{r.budget}</td>
              <td className="text-end">{r.pct_completed}</td>
              <td className="text-end">{r.remaining}</td>
              <td className="text-end">{r.excess}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
