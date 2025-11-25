import { useState } from "react";
import { Link } from "react-router-dom";
import { demoTenants } from "../demoTenants";
import type { Tenant } from "../demoTenants";

function TenantsPage() {
  const [search, setSearch] = useState("");

  const filtered: Tenant[] = demoTenants.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <section className="bg-white rounded-3xl border-2 border-[#A1CBC9] shadow-lg p-6 space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-[#333333] mb-1">
              Tenants
            </h2>
            <p className="text-sm text-[#551900]/80">
              View tenants, their units, and lease status.
            </p>
          </div>

          <input
            className="border border-[#A1CBC9] focus:border-[#038391] focus:ring-2 focus:ring-[#038391]/30 rounded-full px-4 py-1.5 text-sm w-full sm:w-64 outline-none"
            placeholder="search by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto border border-[#EEEEEE] rounded-2xl bg-white">
          <table className="min-w-full text-sm border-collapse">
            <thead className="bg-[#A1CBC9]/30">
              <tr className="text-left text-xs uppercase tracking-wide text-gray-600">
                <th className="py-2.5 px-4">Name</th>
                <th className="py-2.5 px-4">Unit</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4">Lease end</th>
                <th className="py-2.5 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => {
                const lastLease = t.leases[t.leases.length - 1];
                return (
                  <tr
                    key={t.id}
                    className="border-t border-[#EEEEEE] even:bg-[#A1CBC9]/10"
                  >
                    <td className="py-2.5 px-4">{t.name}</td>
                    <td className="py-2.5 px-4">{t.unitLabel || "-"}</td>
                    <td className="py-2.5 px-4 capitalize">
                      {lastLease?.status?.replace("_", " ") || "active"}
                    </td>
                    <td className="py-2.5 px-4">
                      {lastLease?.endDate || "-"}
                    </td>
                    <td className="py-2.5 px-4">
                      <Link
                        to={`/tenants/${t.id}`}
                        className="inline-flex items-center text-xs font-medium px-3 py-1.5 rounded-full bg-[#038391] text-white hover:bg-[#CF4240] transition"
                      >
                        View details →
                      </Link>
                    </td>
                  </tr>
                );
              })}

              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="py-4 px-4 text-center text-sm text-[#551900]/70"
                  >
                    no tenants match that search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default TenantsPage;
