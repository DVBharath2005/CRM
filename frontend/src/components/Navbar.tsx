import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { LogOut, Sun, Moon, ShieldCheck, ChevronDown, Menu } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab }) => {
  const { user, logout, switchRole } = useAuth();
  const [isDark, setIsDark] = useState<boolean>(false);
  const [showRoleMenu, setShowRoleMenu] = useState<boolean>(false);

  useEffect(() => {
    if (isDark) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }, [isDark]);

  const tabTitles: Record<string, string> = {
    dashboard: 'Operations Dashboard',
    customers: 'Customer CRM Directory',
    products: 'Products & Inventory Management',
    challans: 'Sales Challans & Dispatch',
    'stock-logs': 'Stock Movement Audit Logs',
  };

  const roles: UserRole[] = ['Admin', 'Sales', 'Warehouse', 'Accounts'];

  return (
    <header className="topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <h1 className="page-title">{tabTitles[activeTab] || 'Dashboard'}</h1>
      </div>

      <div className="user-profile">
        {/* Feature 13: Quick Role Switcher Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', border: '1px solid #fbcfe8' }}
            title="Switch Active Role"
          >
            <ShieldCheck size={16} color="#ec4899" />
            <span className={`role-badge ${user?.role}`} style={{ padding: '0.2rem 0.5rem' }}>
              {user?.role}
            </span>
            <ChevronDown size={14} />
          </button>

          {showRoleMenu && (
            <div
              style={{
                position: 'absolute',
                top: '120%',
                right: 0,
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                zIndex: 100,
                width: '160px',
                padding: '0.5rem',
              }}
            >
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', padding: '0.35rem 0.5rem' }}>
                SWITCH ROLE:
              </div>
              {roles.map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    switchRole(r);
                    setShowRoleMenu(false);
                  }}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '0.4rem 0.6rem',
                    borderRadius: '6px',
                    border: 'none',
                    background: user?.role === r ? '#fdf2f8' : 'transparent',
                    color: user?.role === r ? '#ec4899' : '#334155',
                    fontWeight: user?.role === r ? 700 : 500,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                  }}
                >
                  {r}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Theme Switcher */}
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => setIsDark(!isDark)}
          title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          style={{ padding: '0.4rem 0.6rem' }}
        >
          {isDark ? <Sun size={16} color="#f59e0b" /> : <Moon size={16} color="#6366f1" />}
        </button>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{user?.name}</div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{user?.email}</div>
        </div>

        <button
          className="btn btn-secondary btn-sm"
          onClick={logout}
          title="Logout"
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
};
