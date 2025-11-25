// frontend/src/services/tenantService.ts
import { api } from "../api/client";
import { demoTenants } from "../demoTenants";
import type { Tenant } from "../demoTenants";

// tries real API first, falls back to demoTenants if not ready
export async function fetchTenants(): Promise<Tenant[]> {
  try {
    const res = await api.get<Tenant[]>("/tenants");
    return res.data;
  } catch (err) {
    console.error("failed to load tenants from api, using demo data", err);
    return demoTenants;
  }
}

export async function fetchTenantById(
  id: number
): Promise<Tenant | undefined> {
  try {
    const res = await api.get<Tenant>(`/tenants/${id}`);
    return res.data;
  } catch (err) {
    console.error("failed to load tenant from api, using demo data", err);
    return demoTenants.find((t) => t.id === id);
  }
}
