import { useEffect, useState } from "react";
import { api } from "../api/client";

type Ticket = {
  id: number;
  title: string;
  description: string;
  priority: string;
  status: string;
  createdAt: string;
  unit?: {
    unitNumber: string;
    property?: {
      id: number;
      name: string;
    };
  };
  tenant?: {
    id: number;
    name: string;
  };
  assignedTo?: {
    id: number;
    email: string;
    role: string;
  } | null;
};

const STATUS_OPTIONS = ["ALL", "OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"] as const;

function statusBadgeClasses(status: string) {
  switch (status) {
    case "OPEN":
      return "bg-[#E00490]/15 text-[#E00490]";
    case "IN_PROGRESS":
      return "bg-[#F7D002]/20 text-[#551900]";
    case "RESOLVED":
      return "bg-[#068460]/15 text-[#068460]";
    case "CLOSED":
      return "bg-[#333333]/10 text-[#333333]";
    default:
      return "bg-[#EEEEEE] text-[#333333]";
  }
}

function priorityBadgeClasses(priority: string) {
  switch (priority) {
    case "URGENT":
      return "bg-[#8B0E04]/15 text-[#8B0E04]";
    case "HIGH":
      return "bg-[#CF4240]/20 text-[#CF4240]";
    case "MEDIUM":
      return "bg-[#F7D002]/15 text-[#551900]";
    case "LOW":
      return "bg-[#A1CBC9]/30 text-[#038391]";
    default:
      return "bg-[#EEEEEE] text-[#333333]";
  }
}

function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [statusFilter, setStatusFilter] = useState<(typeof STATUS_OPTIONS)[number]>("ALL");
  const [loading, setLoading] = useState(true);

  const loadTickets = async (status?: string) => {
    setLoading(true);
    try {
      const params = status && status !== "ALL" ? { status } : undefined;
      const res = await api.get<Ticket[]>("/tickets", { params });
      setTickets(res.data);
    } catch (err) {
      console.error("Failed to load tickets", err);
      alert("Failed to load tickets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const handleStatusChange = (value: string) => {
    const typedValue = value as (typeof STATUS_OPTIONS)[number];
    setStatusFilter(typedValue);
    loadTickets(typedValue === "ALL" ? undefined : typedValue);
  };

  return (
    <div>
      {/* Title / filter card */}
      <div className="card tickets-header-card">
        <div className="tickets-header-main">
          <div>
            <h2 className="tickets-header-title">
              Maintenance Tickets
            </h2>
            <p className="tickets-header-subtitle">
              View maintenance requests across your properties. Filter by status
              to focus on what still needs attention.
            </p>
          </div>
        </div>

        <div className="tickets-header-filter">
          <select
            className="tickets-filter-select"
            value={statusFilter}
            onChange={(e) => handleStatusChange(e.target.value)}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s === "ALL" ? "All statuses" : s.replace("_", " ")}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Ticket list card */}
      <section className="card tickets-list-section">
        {loading ? (
          <p className="tickets-empty-text">Loading tickets...</p>
        ) : tickets.length === 0 ? (
          <p className="tickets-empty-text">
            No tickets found for this filter.
          </p>
        ) : (
          <div className="tickets-list-grid">
            {tickets.map((t) => {
              const propertyName = t.unit?.property?.name ?? "Unknown property";
              const unitLabel = t.unit?.unitNumber
                ? `Unit ${t.unit.unitNumber}`
                : "Unit N/A";
              const tenantName = t.tenant?.name ?? "Unassigned tenant";
              const assignedTo = t.assignedTo?.email ?? "Unassigned";
              const created = new Date(t.createdAt).toLocaleString();

              return (
                <article
                  key={t.id}
                  className="ticket-card"
                >
                  <div className="ticket-card-header">
                    <div className="ticket-card-title-block">
                      <h3 className="ticket-card-title">
                        {t.title}
                      </h3>
                      <p className="ticket-card-subtext">
                        {propertyName} · {unitLabel}
                      </p>
                      <p className="ticket-card-subtext">
                        Tenant: <span className="ticket-card-subtext-strong">{tenantName}</span>
                      </p>
                    </div>

                    <div className="ticket-card-badges">
                      <span
                        className={
                          "ticket-chip " + statusBadgeClasses(t.status)
                        }
                      >
                        {t.status.replace("_", " ")}
                      </span>
                      <span
                        className={
                          "ticket-chip " + priorityBadgeClasses(t.priority)
                        }
                      >
                        {t.priority}
                      </span>
                    </div>
                  </div>

                  <p className="ticket-card-description">
                    {t.description}
                  </p>

                  <div className="ticket-card-meta">
                    <span>Created: {created}</span>
                    <span>
                      Assigned to:{" "}
                      <span className="ticket-card-subtext-strong">{assignedTo}</span>
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

export default TicketsPage;
