import React, { useState, useEffect } from 'react';
import { apiRequest } from '../services/api';
import { StockLog } from '../types';
import { exportToCsv } from '../utils/exportCsv';
import { History, ArrowUpRight, ArrowDownRight, Search, Filter, Download } from 'lucide-react';

export const StockLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<StockLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [movementFilter, setMovementFilter] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        movementType: movementFilter,
      }).toString();

      const res = await apiRequest<{ logs: StockLog[] }>(`/products/stock-logs?${query}`);
      setLogs(res.logs);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [movementFilter]);

  const handleExportCsv = () => {
    const dataToExport = logs.map((log) => ({
      'Timestamp': new Date(log.timestamp).toLocaleString(),
      'Movement Type': log.movementType,
      'Product Name': log.product?.name,
      'SKU': log.product?.sku,
      'Quantity Changed': log.movementType === 'IN' ? `+${log.quantityChanged}` : `-${log.quantityChanged}`,
      'Reason': log.reason,
      'Performed By': log.createdBy,
    }));
    exportToCsv('Anjali_Enterprise_Stock_Audit_Logs', dataToExport);
  };

  return (
    <div>
      {/* Filter Header */}
      <div className="table-card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1rem' }}>
            <History size={20} color="#ec4899" />
            <span>Inventory Audit Trail & Stock Movement Logs</span>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '0.25rem', backgroundColor: '#f1f5f9', padding: '0.25rem', borderRadius: '8px' }}>
              <button
                onClick={() => setMovementFilter('')}
                className="btn btn-sm"
                style={{
                  backgroundColor: movementFilter === '' ? '#ffffff' : 'transparent',
                  color: movementFilter === '' ? '#0f172a' : '#64748b',
                  boxShadow: movementFilter === '' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  fontWeight: 700,
                }}
              >
                All Logs
              </button>
              <button
                onClick={() => setMovementFilter('IN')}
                className="btn btn-sm"
                style={{
                  backgroundColor: movementFilter === 'IN' ? '#ffffff' : 'transparent',
                  color: movementFilter === 'IN' ? '#059669' : '#64748b',
                  boxShadow: movementFilter === 'IN' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  fontWeight: 700,
                }}
              >
                <ArrowUpRight size={14} color="#059669" /> Stock IN
              </button>
              <button
                onClick={() => setMovementFilter('OUT')}
                className="btn btn-sm"
                style={{
                  backgroundColor: movementFilter === 'OUT' ? '#ffffff' : 'transparent',
                  color: movementFilter === 'OUT' ? '#dc2626' : '#64748b',
                  boxShadow: movementFilter === 'OUT' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  fontWeight: 700,
                }}
              >
                <ArrowDownRight size={14} color="#dc2626" /> Stock OUT
              </button>
            </div>

            <button className="btn btn-secondary" onClick={handleExportCsv} title="Export Stock Logs to CSV">
              <Download size={16} />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stock Logs Table */}
      <div className="table-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Movement</th>
              <th>Product Name</th>
              <th>SKU</th>
              <th>Quantity Changed</th>
              <th>Reason / Remarks</th>
              <th>Performed By</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id}>
                <td style={{ fontSize: '0.825rem', color: '#64748b' }}>
                  {new Date(log.timestamp).toLocaleString()}
                </td>
                <td>
                  <span className={`badge badge-${log.movementType.toLowerCase()}`}>
                    {log.movementType === 'IN' ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                    {log.movementType}
                  </span>
                </td>
                <td style={{ fontWeight: 700, color: '#0f172a' }}>{log.product?.name}</td>
                <td style={{ fontWeight: 600, color: '#4f46e5' }}>{log.product?.sku}</td>
                <td style={{ fontWeight: 800, fontSize: '1rem', color: log.movementType === 'IN' ? '#059669' : '#dc2626' }}>
                  {log.movementType === 'IN' ? `+${log.quantityChanged}` : `-${log.quantityChanged}`}
                </td>
                <td>{log.reason}</td>
                <td style={{ fontSize: '0.85rem', fontWeight: 600 }}>{log.createdBy}</td>
              </tr>
            ))}
            {logs.length === 0 && !loading && (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                  No stock logs recorded.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
