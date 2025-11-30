import type { FormEvent } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('admin@leaselink.com');
  const [password, setPassword] = useState('demo123');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      navigate('/'); // send them to Overview after login
    } catch (err) {
      console.error('Login failed', err);
      alert('Login failed – check email or try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="crm-auth-shell">
      <div className="crm-auth-card">
        {/* Title section (matches app vibe) */}
        <div className="crm-auth-header">
          <div className="crm-auth-logo-pill">LL</div>
          <div>
            <h1 className="crm-auth-title">LeaseLink CRM</h1>
            <p className="crm-auth-subtitle">
              Sign in to access your properties and maintenance workspace.
            </p>
          </div>
        </div>

        {/* Demo hint */}
        <p className="crm-auth-hint">
          Demo login:&nbsp;
          <span className="font-mono">admin@leaselink.com</span> with any
          non-empty password (e.g. <span className="font-mono">demo123</span>).
        </p>

        {/* Form card body */}
        <form className="crm-auth-form" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <div className="space-y-1">
              <label className="crm-field-label">Email</label>
              <input
                className="crm-field"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>

            <div className="space-y-1">
              <label className="crm-field-label">Password</label>
              <input
                type="password"
                className="crm-field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="crm-primary-btn crm-auth-submit-btn"
          >
            {loading ? 'Logging in…' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
