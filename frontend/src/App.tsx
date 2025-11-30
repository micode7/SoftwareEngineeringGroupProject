import { Routes, Route, NavLink, Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState, type ReactNode } from 'react';

import DashboardPage from './pages/DashboardPage';
import PropertiesPage from './pages/PropertiesPage';
import PropertyDetailPage from './pages/PropertyDetailPage';
import TenantsPage from './pages/TenantsPage';
import TenantDetailPage from './pages/TenantDetailPage';
import TicketsPage from './pages/TicketsPage';
import LoginPage from './pages/LoginPage';
import AllPropertiesPage from './pages/AllPropertiesPage';
import { useAuth } from './auth/AuthContext';

/* ---------- Small wrapper to protect routes ---------- */

type RequireAuthProps = {
  children: ReactNode;
};

function RequireAuth({ children }: RequireAuthProps) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    // not logged in → send to /login
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <>{children}</>;
}

/* ---------------------- Main App ---------------------- */

function App() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-[#EEEEEE] flex">
      {/* Sidebar hugs the left, full height */}
      <Sidebar user={user} onLogout={logout} />

      {/* Main area */}
      <div className="flex-1">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <main className="rounded-3xl bg-white border border-[#E0E0E0] shadow-sm p-6 space-y-6 overflow-auto min-h-[calc(100vh-2rem)]">
            <Routes>
              {/* Public route */}
              <Route path="/login" element={<LoginPage />} />

              {/* Protected routes */}
              <Route
                path="/"
                element={
                  <RequireAuth>
                    <DashboardPage />
                  </RequireAuth>
                }
              />
              <Route
                path="/properties"
                element={
                  <RequireAuth>
                    <PropertiesPage />
                  </RequireAuth>
                }
              />
              <Route
                path="/properties/all"
                element={
                  <RequireAuth>
                    <AllPropertiesPage />
                  </RequireAuth>
                }
              />
              <Route
                path="/properties/:id"
                element={
                  <RequireAuth>
                    <PropertyDetailPage />
                  </RequireAuth>
                }
              />
              <Route
                path="/tenants"
                element={
                  <RequireAuth>
                    <TenantsPage />
                  </RequireAuth>
                }
              />
              <Route
                path="/tenants/:id"
                element={
                  <RequireAuth>
                    <TenantDetailPage />
                  </RequireAuth>
                }
              />
              <Route
                path="/tickets"
                element={
                  <RequireAuth>
                    <TicketsPage />
                  </RequireAuth>
                }
              />

              {/* Fallback: anything unknown → login */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </div>
  );
}

/* -------- Sidebar component using your CSS classes -------- */

type SidebarProps = {
  user: { email: string; role: string } | null;
  onLogout: () => void | Promise<void>;
};

function Sidebar({ user, onLogout }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (collapsed) {
      document.body.classList.add('sidebar-collapsed');
    } else {
      document.body.classList.remove('sidebar-collapsed');
    }
  }, [collapsed]);

  return (
    <aside id="sidebar">
      {/* header */}
      <div className="sidebar-header">
        <div className="app-title">LeaseCRM</div>
        <button
          type="button"
          className="sidebar-toggle-btn"
          onClick={() => setCollapsed((c) => !c)}
        >
          ☰
        </button>
      </div>

      {/* menu */}
      <nav className="sidebar-menu">
        <SidebarLink to="/" label="Home" icon="🏠" />
        <SidebarLink to="/properties" label="Manage Properties" icon="🏢" />
        <SidebarLink to="/tickets" label="View Maintenance Tickets" icon="🛠️" />
        <SidebarLink to="/tenants" label="View Tenants" icon="👤" />
      </nav>

      {/* footer / user (simple for now) */}
      <div className="sidebar-footer">
        {user ? (
          <>
            <div className="font-semibold text-xs truncate">{user.email}</div>
            <div className="text-[10px] uppercase tracking-wide text-[#333333]/70">
              {user.role}
            </div>
            <button
              type="button"
              onClick={onLogout}
              className="mt-2 px-3 py-1 rounded-full bg-white/80 text-[#CF4240] border border-[#CF4240]/40 text-[11px]"
            >
              Logout
            </button>
          </>
        ) : (
          <div className="text-xs text-[#333333]/80">
            Employee?{' '}
            <NavLink to="/login" className="underline">
              Sign in
            </NavLink>
          </div>
        )}
      </div>
    </aside>
  );
}

type SidebarLinkProps = {
  to: string;
  label: string;
  icon: string;
};

function SidebarLink({ to, label, icon }: SidebarLinkProps) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        'sidebar-link' + (isActive ? ' sidebar-link-active' : '')
      }
    >
      <span className="sidebar-link-icon">{icon}</span>
      <span className="sidebar-link-text">{label}</span>
    </NavLink>
  );
}

export default App;
