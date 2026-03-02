import { getTableRows, getTables } from "@/lib/db";

export default async function DbAdminPage({ searchParams }) {
  const resolved = await searchParams;
  const tables = await getTables();
  const table = resolved?.table && tables.includes(resolved.table)
    ? resolved.table
    : tables[0];
  const limit = Number(resolved?.limit || "50");

  const { columns, rows } = table
    ? await getTableRows(table, Number.isFinite(limit) ? limit : 50)
    : { columns: [], rows: [] };

  return (
    <section className="hero-card">
      <h1>Database Viewer</h1>
      <p className="muted">
        Read-only view of the hosted database (Turso). Use for quick inspection.
      </p>

      <div className="db-controls">
        <div className="db-tabs">
          {tables.map((name) => (
            <a
              key={name}
              className={name === table ? "db-tab active" : "db-tab"}
              href={`/admin/db?table=${name}`}
            >
              {name}
            </a>
          ))}
        </div>
        <div className="db-limit">
          <span className="muted">Showing {rows.length} rows</span>
        </div>
      </div>

      {rows.length === 0 ? (
        <p className="muted">No rows found.</p>
      ) : (
        <div className="db-table-wrap">
          <table className="db-table">
            <thead>
              <tr>
                {columns.map((col) => (
                  <th key={col}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={index}>
                  {columns.map((col) => (
                    <td key={col}>
                      {row[col] == null ? "—" : String(row[col])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
