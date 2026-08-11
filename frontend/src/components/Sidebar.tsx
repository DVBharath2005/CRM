import React from 'react';
import {
  LayoutDashboard,
  Users,
  Package,
  FileSpreadsheet,
  History,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { user } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['Admin', 'Sales', 'Warehouse', 'Accounts'] },
    { id: 'customers', label: 'Customer CRM', icon: Users, roles: ['Admin', 'Sales', 'Accounts', 'Warehouse'] },
    { id: 'products', label: 'Products & Inventory', icon: Package, roles: ['Admin', 'Warehouse', 'Sales', 'Accounts'] },
    { id: 'challans', label: 'Sales Challans', icon: FileSpreadsheet, roles: ['Admin', 'Sales', 'Accounts', 'Warehouse'] },
    { id: 'stock-logs', label: 'Stock Movement Logs', icon: History, roles: ['Admin', 'Warehouse', 'Sales', 'Accounts'] },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <img src="/logo.svg" alt="Anjali Enterprise Logo" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
        <div>
          <div className="brand-title">Anjali Enterprise</div>
          <div className="brand-subtitle">Wholesale & Distribution</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isAllowed = user && item.roles.includes(user.role);
          if (!isAllowed) return null;

          return (
            <button
              key={item.id}
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div style={{ padding: '1rem', borderTop: '2px solid #fbcfe8', fontSize: '0.85rem', color: '#334155' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
          <ShieldCheck size={16} color="#059669" />
          <span style={{ color: '#0f172a', fontWeight: 800, fontSize: '0.9rem' }}>Role-Based Access</span>
        </div>
        <span style={{ fontWeight: 700, color: '#334155' }}>Active Role: </span>
        <strong style={{ color: '#9d174d', fontWeight: 900, fontSize: '0.925rem' }}>{user?.role}</strong>
      </div>
    </aside>
  );
};
