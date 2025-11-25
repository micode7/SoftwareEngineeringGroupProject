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

  if (loading) {
    return <p className="text-sm text-[#333333]">Loading tenant...</p>;
  }

  if (!tenant) {
    return (
      <div className="space-y-3">
        <Link
          to="/tenants"
          className="text-sm text-[#038391] hover:text-[#CF4240] font-medium"
        >
          ← Back to tenants
        </Link>
        <p className="text-sm text-red-600">Tenant not found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-2xl font-semibold text-[#333333]">
            {tenant.name}
          </h2>
          <p className="text-sm text-[#333333]/80">
            Unit {tenant.unitLabel || "N/A"}
          </p>
          {lease && (
            <div className="mt-1 flex items-center gap-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#F7D002]/20 text-[#551900] capitalize">
                {lease.status.replace("_", " ")}
              </span>
              {daysLeft !== null && daysLeft >= 0 && daysLeft <= 60 && (
                <span className="ml-4 text-xs text-[#CF4240] font-medium">
                  Lease ending in {daysLeft} days
                </span>
              )}
            </div>
          )}
        </div>
        <Link
          to="/tenants"
          className="text-sm text-[#038391] hover:text-[#CF4240] font-medium"
        >
          ← Back to tenants
        </Link>
      </div>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="bg-white rounded-2xl border border-[#A1CBC9] shadow-md p-5 space-y-2">
          <h3 className="font-semibold text-sm text-[#333333]">Contact</h3>
          <p className="text-sm text-[#333333]/80">
            Email: {tenant.email || "n/a"}
          </p>
          <p className="text-sm text-[#333333]/80">
            Phone: {tenant.phone || "n/a"}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-[#A1CBC9] shadow-md p-5 space-y-2">
          <h3 className="font-semibold text-sm text-[#333333]">Current lease</h3>
          {lease ? (
            <>
              <p className="text-sm text-[#333333]/80">
                {lease.startDate} → {lease.endDate}
              </p>
              <p className="text-sm text-[#333333]/80">
                Rent: ${lease.rent}
              </p>
              <p className="text-sm text-[#333333]/80 capitalize">
                Status: {lease.status.replace("_", " ")}
              </p>
            </>
          ) : (
            <p className="text-sm text-[#551900]/70">No active lease on file.</p>
          )}
        </div>
      </section>
    </div>
  );
}

export default TenantDetailPage;
