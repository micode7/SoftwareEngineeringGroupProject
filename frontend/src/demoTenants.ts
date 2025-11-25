// frontend/src/demoTenants.ts
export type Lease = {
  id: number;
  unitLabel: string;
  startDate: string;
  endDate: string;
  rent: number;
  status: "active" | "pending_renewal" | "expired" | "past_due";
};

export type Tenant = {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  unitLabel?: string;
  leases: Lease[];
};

export const demoTenants: Tenant[] = [
  {
    id: 1,
    name: "Jane Doe",
    email: "jane@example.com",
    phone: "555-123-4567",
    unitLabel: "A101",
    leases: [
      {
        id: 1,
        unitLabel: "A101",
        startDate: "2025-06-01",
        endDate: "2026-05-31",
        rent: 1200,
        status: "active",
      },
    ],
  },
  {
    id: 2,
    name: "John Smith",
    email: "john@example.com",
    phone: "555-987-6543",
    unitLabel: "B203",
    leases: [
      {
        id: 2,
        unitLabel: "B203",
        startDate: "2025-01-01",
        endDate: "2025-12-31",
        rent: 1100,
        status: "past_due",
      },
    ],
  },
  {
    id: 3,
    name: "Alex Johnson",
    email: "alex@example.com",
    phone: "555-000-1111",
    unitLabel: "C305",
    leases: [
      {
        id: 3,
        unitLabel: "C305",
        startDate: "2024-09-01",
        endDate: "2025-08-31",
        rent: 950,
        status: "expired",
      },
    ],
  },
];
