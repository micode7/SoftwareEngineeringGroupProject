import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import type { Tenant } from "../demoTenants";
import { fetchTenantById } from "../services/tenantService";

function getCurrentLease(tenant: Tenant | null) {
  if (!tenant || !tenant.leases.length) return undefined;
  return tenant.leases[tenant.leases.length - 1];
}

function daysUntil(dateStr: string | undefined) {
  if (!dateStr) return null;
  const today = new Date();
  const target = new Date(dateStr);
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.round((target.getTime() - today.getTime()) / msPerDay);
}

function TenantDetailPage() {
  const { id } = useParams();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const numericId = Number(id);
    if (!numericId || Number.isNaN(numericId)) {
      setTenant(null);
      setLoading(false);
      return;
    }

    async function load() {
      setLoading(true);
      const t = await fetchTenantById(numericId);
      setTenant(t ?? null);
      setLoading(false);
    }

    load();
  }, [id]);

  const lease = getCurrentLease(tenant);
  const daysLeft = daysUntil(lease?.endDate);
  const showLeaseWarning =
    daysLeft !== null && daysLeft >= 0 && daysLeft <= 60;

  if (loading) {
    return <p className="tenant-detail-loading">Loading tenant...</p>;
  }

  if (!tenant) {
    return (
      <div className="tenant-detail-notfound">
        <Link to="/tenants" className="tenant-detail-backlink">
          ← Back to tenants
        </Link>
        <p className="tenant-detail-error">Tenant not found.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header card */}
      <div className="card tenant-detail-header-card">
        <div className="tenant-detail-header-main">
          <h2 className="tenant-detail-title">{tenant.name}</h2>
          <p className="tenant-detail-subtitle">
            Unit {tenant.unitLabel || "N/A"}
          </p>

          {lease && (
            <div className="tenant-detail-status-row">
              <span className="tenant-detail-status-pill">
                {lease.status.replace("_", " ")}
              </span>
              {showLeaseWarning && (
                <span className="tenant-detail-lease-warning">
                  Lease ending in {daysLeft} days
                </span>
              )}
            </div>
          )}
        </div>

        <div className="tenant-detail-header-actions">
          <Link to="/tenants" className="tenant-detail-backlink">
            ← Back to tenants
          </Link>
        </div>
      </div>

      {/* Info cards grid */}
      <section className="tenant-detail-grid">
        <div className="card tenant-detail-info-card">
          <h3 className="tenant-detail-info-title">Contact</h3>
          <p className="tenant-detail-info-text">
            <span className="tenant-detail-info-label">Email:</span>{" "}
            {tenant.email || "n/a"}
          </p>
          <p className="tenant-detail-info-text">
            <span className="tenant-detail-info-label">Phone:</span>{" "}
            {tenant.phone || "n/a"}
          </p>
        </div>

        <div className="card tenant-detail-info-card">
          <h3 className="tenant-detail-info-title">Current lease</h3>
          {lease ? (
            <>
              <p className="tenant-detail-info-text">
                <span className="tenant-detail-info-label">Dates:</span>{" "}
                {lease.startDate} → {lease.endDate}
              </p>
              <p className="tenant-detail-info-text">
                <span className="tenant-detail-info-label">Rent:</span>{" "}
                ${lease.rent}
              </p>
              <p className="tenant-detail-info-text">
                <span className="tenant-detail-info-label">Status:</span>{" "}
                {lease.status.replace("_", " ")}
              </p>
            </>
          ) : (
            <p className="tenant-detail-info-text tenant-detail-no-lease">
              No active lease on file.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

export default TenantDetailPage;
