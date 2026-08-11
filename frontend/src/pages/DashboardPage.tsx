import React, { useEffect, useState } from 'react';
import { apiRequest } from '../services/api';
import { DashboardStats, StockLog, SalesChallan } from '../types';
import {
  Users,
  Package,
  AlertTriangle,
  FileSpreadsheet,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  PlusCircle,
  Activity,
} from 'lucide-react';

interface DashboardPageProps {
  setActiveTab: (tab: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ setActiveTab }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentLogs, setRecentLogs] = useState<StockLog[]>([]);
  const [recentChallans, setRecentChallans] = useState<SalesChallan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await apiRequest<{
          stats: DashboardStats;
          recentStockLogs: StockLog[];
          recentChallans: SalesChallan[];
        }>('/dashboard/stats');
        setStats(res.stats);
        setRecentLogs(res.recentStockLogs);
        setRecentChallans(res.recentChallans);
      } catch (err: any) {
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Loading dashboard metrics...</div>;
  }

  if (error) {
    return <div style={{ padding: '2rem', color: '#ef4444' }}>Error: {error}</div>;
  }

  return (
    <div>
      {/* Top Banner / Quick Actions */}
      <div
        style={{
          backgroundColor: '#fdf2f8',
          border: '2px solid #fbcfe8',
          color: '#0f172a',
          borderRadius: '16px',
          padding: '1.75rem 2rem',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          boxShadow: '0 4px 12px rgba(251, 207, 232, 0.4)',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>Anjali Enterprise - Operations Control Centre</h2>
          <p style={{ fontSize: '0.9rem', color: '#9d174d', marginTop: '0.2rem', fontWeight: 500 }}>
            Wholesale distribution, customer follow-ups & automated inventory tracking.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            className="btn btn-primary"
            onClick={() => setActiveTab('challans')}
          >
            <PlusCircle size={16} />
            <span>Create Sales Challan</span>
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => setActiveTab('customers')}
          >
            <Users size={16} />
            <span>Add Customer</span>
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#eef2ff', color: '#4f46e5' }}>
            <Users size={26} />
          </div>
          <div>
            <div className="stat-value">{stats?.customers.total || 0}</div>
            <div className="stat-label">Total Customers ({stats?.customers.active} Active, {stats?.customers.lead} Leads)</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#fffbeb', color: '#d97706' }}>
            <AlertTriangle size={26} />
          </div>
          <div>
            <div className="stat-value" style={{ color: (stats?.products.lowStockAlerts || 0) > 0 ? '#dc2626' : '#0f172a' }}>
              {stats?.products.lowStockAlerts || 0}
            </div>
            <div className="stat-label">Low Stock Alerts (out of {stats?.products.total} products)</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#e0f2fe', color: '#0284c7' }}>
            <FileSpreadsheet size={26} />
          </div>
          <div>
            <div className="stat-value">{stats?.challans.total || 0}</div>
            <div className="stat-label">Sales Challans ({stats?.challans.confirmed} Confirmed, {stats?.challans.draft} Draft)</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#ecfdf5', color: '#059669' }}>
            <TrendingUp size={26} />
          </div>
          <div>
            <div className="stat-value" style={{ fontSize: '1.5rem' }}>
              ₹{(stats?.challans.totalRevenue || 0).toLocaleString('en-IN')}
            </div>
            <div className="stat-label">Total Confirmed Revenue</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#fdf2f8', color: '#db2777' }}>
            <Activity size={26} />
          </div>
          <div>
            <div className="stat-value" style={{ fontSize: '1.4rem' }}>
              ₹{((stats?.challans.confirmed || 0) > 0
                ? Math.round((stats?.challans.totalRevenue || 0) / (stats?.challans.confirmed || 1))
                : 0
              ).toLocaleString('en-IN')}
            </div>
            <div className="stat-label">Avg Order Value (AOV)</div>
          </div>
        </div>
      </div>

      {/* 2 Column Layout for Recent Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.5rem' }}>
        {/* Recent Challans Widget */}
        <div className="table-card">
          <div className="table-header">
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Recent Sales Challans</h3>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setActiveTab('challans')}
            >
              View All
            </button>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Challan #</th>
                <th>Customer</th>
                <th>Status</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {recentChallans.map((c) => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 700, color: '#4f46e5' }}>{c.challanNumber}</td>
                  <td>{c.customerSnapshot?.businessName || c.customerSnapshot?.customerName}</td>
                  <td>
                    <span className={`badge badge-${c.status.toLowerCase()}`}>{c.status}</span>
                  </td>
                  <td style={{ fontWeight: 600 }}>₹{c.totalAmount.toLocaleString('en-IN')}</td>
                </tr>
              ))}
              {recentChallans.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', color: '#94a3b8' }}>
                    No recent challans found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Recent Stock Movement Logs Widget */}
        <div className="table-card">
          <div className="table-header">
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Recent Stock Movement Logs</h3>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setActiveTab('stock-logs')}
            >
              Audit Trail
            </button>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Product</th>
                <th>Qty</th>
                <th>Reason</th>
              </tr>
            </thead>
            <tbody>
              {recentLogs.map((log) => (
                <tr key={log.id}>
                  <td>
                    <span className={`badge badge-${log.movementType.toLowerCase()}`}>
                      {log.movementType === 'IN' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                      {log.movementType}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600 }}>{log.product?.name}</td>
                  <td style={{ fontWeight: 700 }}>{log.quantityChanged}</td>
                  <td style={{ fontSize: '0.8rem', color: '#64748b' }}>{log.reason}</td>
                </tr>
              ))}
              {recentLogs.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', color: '#94a3b8' }}>
                    No stock logs recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
