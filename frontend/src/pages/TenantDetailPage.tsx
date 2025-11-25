import { Link, useParams } from "react-router-dom";
import { demoTenants } from "../demoTenants";

function TenantDetailPage() {
  const { id } = useParams();
  const tenantId = Number(id);
  const tenant = demoTenants.find((t) => t.id === tenantId);

  if (!tenant || !tenantId) {
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

  const currentLease = tenant.leases[tenant.leases.length - 1];

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
          <p className="text-xs text-[#551900]/80 mt-1">
            Status:{" "}
            <span className="capitalize">
              {currentLease?.status?.replace("_", " ") || "active"}
            </span>
          </p>
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
          {currentLease ? (
            <>
              <p className="text-sm text-[#333333]/80">
                {currentLease.startDate} → {currentLease.endDate}
              </p>
              <p className="text-sm text-[#333333]/80">
                Rent: ${currentLease.rent}
              </p>
              <p className="text-sm text-[#333333]/80 capitalize">
                Status: {currentLease.status.replace("_", " ")}
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
