import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { Tenant } from "../demoTenants";
import { fetchTenants } from "../services/tenantService";

function getCurrentLease(tenant: Tenant) {
  if (!tenant.leases.length) return undefined;
  return tenant.leases[tenant.leases.length - 1];
}

function TenantsPage() {
  const [search, setSearch] = useState("");
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await fetchTenants();
      setTenants(data);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = tenants.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* Title / search card */}
      <div className="card tenants-header-card">
        <div className="tenants-header-main">
          <h2 className="tenants-header-title">Tenants</h2>
          <p className="tenants-header-subtitle">
            View tenants, their units, and current lease status.
          </p>
        </div>

        <div className="tenants-header-search">
          <input
            className="tenants-search-input"
            placeholder="Search by name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table card */}
      <section className="card tenants-table-section">
        {loading ? (
          <p className="tenants-empty-text">Loading…</p>
        ) : (
          <div className="tenants-table-wrapper">
            <table className="tenants-table">
              <thead className="tenants-table-head">
                <tr>
                  <th className="tenants-table-header-cell">Name</th>
                  <th className="tenants-table-header-cell">Unit</th>
                  <th className="tenants-table-header-cell">Status</th>
                  <th className="tenants-table-header-cell">Lease end</th>
                  <th className="tenants-table-header-cell">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => {
                  const lease = getCurrentLease(t);
                  return (
                    <tr key={t.id} className="tenants-table-row">
                      <td className="tenants-table-cell">{t.name}</td>
                      <td className="tenants-table-cell">
                        {t.unitLabel || "-"}
                      </td>
                      <td className="tenants-table-cell">
                        {lease ? (
                          <span className="tenants-status-pill">
                            {lease.status.replace("_", " ")}
                          </span>
                        ) : (
                          <span className="tenants-no-lease-text">
                            no lease
                          </span>
                        )}
                      </td>
                      <td className="tenants-table-cell">
                        {lease?.endDate || "-"}
                      </td>
                      <td className="tenants-table-cell">
                        <Link
                          to={`/tenants/${t.id}`}
                          className="tenants-action-btn"
                        >
                          View details →
                        </Link>
                      </td>
                    </tr>
                  );
                })}

                {!filtered.length && !loading && (
                  <tr>
                    <td
                      colSpan={5}
                      className="tenants-table-empty-row"
                    >
                      No tenants match that search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default TenantsPage;
