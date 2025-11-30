import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';

type Unit = {
  id: number;
  status: string;
};

type Property = {
  id: number;
  name: string;
  units: Unit[];
};

type Ticket = {
  id: number;
  title: string;
  status: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
};

function DashboardPage() {
  const [now, setNow] = useState(new Date());
  const [properties, setProperties] = useState<Property[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  // clock updates once a minute
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);

  // load properties + tickets
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [propsRes, ticketsRes] = await Promise.all([
          api.get<Property[]>('/properties'),
          api.get<Ticket[]>('/tickets'),
        ]);
        setProperties(propsRes.data);
        setTickets(ticketsRes.data);
      } catch (err) {
        console.error('Error loading dashboard data', err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  // Format date/time
  const dateString = now.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const timeString = now.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });

  // ---- Portfolio metrics ----
  const allUnits = properties.flatMap((p) => p.units || []);
  const totalProperties = properties.length;
  const totalUnits = allUnits.length;
  const occupiedUnits = allUnits.filter((u) => u.status === 'OCCUPIED').length;
  const vacantUnits = allUnits.filter((u) => u.status === 'VACANT').length;
  const occupancyPct =
    totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : null;

  // ---- Ticket metrics ----
  const openTickets = tickets.filter((t) => t.status === 'OPEN');
  const inProgressTickets = tickets.filter((t) => t.status === 'IN_PROGRESS');
  const highUrgentTickets = tickets.filter((t) =>
    ['HIGH', 'URGENT'].includes(t.priority),
  );

  // Recent activity: last 3 updated tickets
  const recentTickets = [...tickets]
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    )
    .slice(0, 3);
  return (
    <div>
      {/* Overview title card */}
      <div className="card dashboard-overview-card">
        <h2 className="page-title text-xl font-semibold text-[#333333]">
          Overview
        </h2>
        <p className="text-sm text-[#551900]/80 mb-3">
          Quick snapshot for your LeaseCRM workspace.
        </p>
        <div className="text-sm text-[#333333]/85 space-y-1">
          <div>
            <span className="font-semibold">Today:&nbsp;</span>
            {dateString}
          </div>
          <div>
            <span className="font-semibold">Current time:&nbsp;</span>
            {timeString}
          </div>
        </div>
      </div>

      {/* 2×2 grid of cards */}
      <section className="home-grid dashboard-grid">
        {/* Portfolio Snapshot */}
        <div className="card">
          <h3 className="text-sm font-semibold text-[#333333] mb-1">
            Portfolio Snapshot
          </h3>
          <p className="text-xs text-[#551900]/80 mb-3">
            High-level view of your properties and units.
          </p>
          <div className="space-y-1 text-sm text-[#333333]/90">
            <div>
              <span className="font-semibold">Properties:&nbsp;</span>
              {loading ? '—' : totalProperties}
            </div>
            <div>
              <span className="font-semibold">Units:&nbsp;</span>
              {loading ? '—' : totalUnits}
            </div>
            <div>
              <span className="font-semibold">Occupied:&nbsp;</span>
              {loading ? '—' : `${occupiedUnits}`}
              {occupancyPct !== null && !loading && (
                <span className="text-xs text-[#333333]/70">
                  {' '}
                  ({occupancyPct}%)
                </span>
              )}
            </div>
            <div>
              <span className="font-semibold">Vacant:&nbsp;</span>
              {loading ? '—' : vacantUnits}
            </div>
          </div>
        </div>

        {/* Maintenance Health */}
        <div className="card">
          <h3 className="text-sm font-semibold text-[#333333] mb-1">
            Maintenance Health
          </h3>
          <p className="text-xs text-[#551900]/80 mb-3">
            Snapshot of your current maintenance workload.
          </p>
          <div className="space-y-1 text-sm text-[#333333]/90">
            <div>
              <span className="font-semibold">Open tickets:&nbsp;</span>
              {loading ? '—' : openTickets.length}
            </div>
            <div>
              <span className="font-semibold">In progress:&nbsp;</span>
              {loading ? '—' : inProgressTickets.length}
            </div>
            <div>
              <span className="font-semibold">High / urgent:&nbsp;</span>
              {loading ? '—' : highUrgentTickets.length}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h3 className="text-sm font-semibold text-[#333333] mb-1">
            Quick Actions
          </h3>
          <p className="text-xs text-[#551900]/80 mb-1">
            Jump directly into common LeaseCRM workflows.
          </p>
          <div className="dash-actions-row">
            <Link to="/properties" className="dash-secondary-btn">
              <span>➕</span>
              <span>Add / Manage Properties</span>
            </Link>
            <Link to="/tickets" className="dash-secondary-btn">
              <span>🛠️</span>
              <span>View Maintenance Tickets</span>
            </Link>
            <Link to="/tenants" className="dash-secondary-btn">
              <span>👤</span>
              <span>View Tenants</span>
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <h3 className="text-sm font-semibold text-[#333333] mb-1">
            Recent Activity
          </h3>
          <p className="text-xs text-[#551900]/80 mb-3">
            Latest updates from your maintenance queue.
          </p>

          {loading ? (
            <p className="text-xs text-[#333333]/70">Loading activity…</p>
          ) : recentTickets.length === 0 ? (
            <p className="text-xs text-[#333333]/70">
              No recent ticket activity.
            </p>
          ) : (
            <ul className="space-y-2 text-xs text-[#333333]/90">
              {recentTickets.map((t) => {
                const updated = new Date(t.updatedAt);
                const updatedStr = updated.toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                });

                return (
                  <li key={t.id} className="border-l-2 border-[#A1CBC9] pl-2">
                    <div className="font-semibold truncate">{t.title}</div>
                    <div className="flex justify-between text-[11px] text-[#333333]/70">
                      <span>Status: {t.status}</span>
                      <span>{updatedStr}</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}

export default DashboardPage;
