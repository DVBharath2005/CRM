import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { LogIn, AlertCircle, UserCheck, Shield } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole | ''>('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const roleOptions: { role: UserRole; email: string; label: string; name: string }[] = [
    { role: 'Admin', email: 'amit.verma@anjalienterprise.com', label: 'Admin', name: 'Amit Verma' },
    { role: 'Sales', email: 'rahul.sharma@anjalienterprise.com', label: 'Sales', name: 'Rahul Sharma' },
    { role: 'Warehouse', email: 'vikram.singh@anjalienterprise.com', label: 'Warehouse', name: 'Vikram Singh' },
    { role: 'Accounts', email: 'priya.patel@anjalienterprise.com', label: 'Accounts', name: 'Priya Patel' },
  ];

  const handleRoleSelect = (role: UserRole, roleEmail: string) => {
    setSelectedRole(role);
    setEmail(roleEmail);
    setPassword('password123');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ffffff',
        padding: '1.5rem',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '480px',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '2px solid #fbcfe8',
          boxShadow: '0 10px 25px -5px rgba(236, 72, 153, 0.1)',
          overflow: 'hidden',
        }}
      >
        {/* Light Pink Header Banner */}
        <div
          style={{
            backgroundColor: '#fdf2f8',
            borderBottom: '2px solid #fbcfe8',
            padding: '1.75rem 2rem',
            textAlign: 'center',
          }}
        >
          <img
            src="/logo.svg"
            alt="Anjali Enterprise Logo"
            style={{ width: '64px', height: '64px', objectFit: 'contain', margin: '0 auto 0.75rem auto', display: 'block' }}
          />
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>Anjali Enterprise</h2>
          <p style={{ fontSize: '0.85rem', color: '#9d174d', marginTop: '0.2rem', fontWeight: 500 }}>
            Wholesale & Distribution Operations Portal
          </p>
        </div>

        <div style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1rem', color: '#1e293b' }}>
            Sign In to Portal
          </h3>

          {/* Role Options Selector */}
          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <UserCheck size={15} color="#4f46e5" />
              <span>Select Access Role (Quick Option)</span>
            </label>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '0.5rem',
              }}
            >
              {roleOptions.map((opt) => (
                <button
                  key={opt.role}
                  type="button"
                  onClick={() => handleRoleSelect(opt.role, opt.email)}
                  style={{
                    padding: '0.6rem 0.75rem',
                    borderRadius: '8px',
                    border: selectedRole === opt.role ? '2px solid #4f46e5' : '1px solid #e2e8f0',
                    backgroundColor: selectedRole === opt.role ? '#eef2ff' : '#ffffff',
                    color: selectedRole === opt.role ? '#4f46e5' : '#334155',
                    fontWeight: selectedRole === opt.role ? 700 : 600,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Shield size={14} />
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div
              style={{
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#dc2626',
                padding: '0.75rem',
                borderRadius: '8px',
                fontSize: '0.85rem',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setSelectedRole('');
                }}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', marginTop: '0.75rem', padding: '0.75rem' }}
              disabled={submitting}
            >
              <LogIn size={18} />
              <span>{submitting ? 'Authenticating...' : 'Sign In'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};


