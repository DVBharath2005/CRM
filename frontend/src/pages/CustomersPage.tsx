import React, { useState, useEffect } from 'react';
import { apiRequest } from '../services/api';
import { Customer, CustomerType, CustomerStatus } from '../types';
import { useAuth } from '../context/AuthContext';
import { exportToCsv } from '../utils/exportCsv';
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit2,
  Calendar,
  MessageSquare,
  Building,
  Phone,
  Mail,
  MapPin,
  FileText,
  X,
  Download,
} from 'lucide-react';

export const CustomersPage: React.FC = () => {
  const { user } = useAuth();
  const canEdit = user?.role === 'Admin' || user?.role === 'Sales';

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [newFollowUpNote, setNewFollowUpNote] = useState('');
  const [nextFollowUpDate, setNextFollowUpDate] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    customerName: '',
    mobileNumber: '',
    email: '',
    businessName: '',
    gstNumber: '',
    customerType: 'Retail' as CustomerType,
    address: '',
    status: 'Lead' as CustomerStatus,
    followUpDate: '',
    notes: '',
  });

  const fetchCustomers = async (page = 1) => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        search,
        status: statusFilter,
        type: typeFilter,
      }).toString();

      const res = await apiRequest<{ customers: Customer[]; pagination: any }>(`/customers?${query}`);
      setCustomers(res.customers);
      setPagination(res.pagination);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers(1);
  }, [search, statusFilter, typeFilter]);

  const handleExportCsv = () => {
    const dataToExport = customers.map((c) => ({
      'Customer Name': c.customerName,
      'Business Name': c.businessName,
      'Mobile Number': c.mobileNumber,
      'Email': c.email,
      'GSTIN': c.gstNumber || 'N/A',
      'Type': c.customerType,
      'Status': c.status,
      'Address': c.address,
      'FollowUp Date': c.followUpDate ? c.followUpDate.split('T')[0] : 'None',
      'Notes': c.notes || '',
    }));
    exportToCsv('Anjali_Enterprise_Customers', dataToExport);
  };

  const openCreateModal = () => {
    setEditingCustomer(null);
    setFormData({
      customerName: '',
      mobileNumber: '',
      email: '',
      businessName: '',
      gstNumber: '',
      customerType: 'Retail',
      address: '',
      status: 'Lead',
      followUpDate: '',
      notes: '',
    });
    setShowAddModal(true);
  };

  const openEditModal = (c: Customer) => {
    setEditingCustomer(c);
    setFormData({
      customerName: c.customerName,
      mobileNumber: c.mobileNumber,
      email: c.email,
      businessName: c.businessName,
      gstNumber: c.gstNumber || '',
      customerType: c.customerType,
      address: c.address,
      status: c.status,
      followUpDate: c.followUpDate ? c.followUpDate.split('T')[0] : '',
      notes: c.notes || '',
    });
    setShowAddModal(true);
  };

  const handleSaveCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCustomer) {
        await apiRequest(`/customers/${editingCustomer.id}`, {
          method: 'PUT',
          body: formData,
        });
      } else {
        await apiRequest('/customers', {
          method: 'POST',
          body: formData,
        });
      }
      setShowAddModal(false);
      fetchCustomers(pagination.page);
    } catch (err: any) {
      alert(err.message || 'Failed to save customer');
    }
  };

  const viewCustomerDetail = async (id: string) => {
    try {
      const res = await apiRequest<{ customer: Customer }>(`/customers/${id}`);
      setSelectedCustomer(res.customer);
    } catch (err: any) {
      alert(err.message || 'Failed to fetch customer detail');
    }
  };

  const handleAddFollowUpNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || !newFollowUpNote.trim()) return;

    try {
      await apiRequest(`/customers/${selectedCustomer.id}/notes`, {
        method: 'POST',
        body: {
          note: newFollowUpNote,
          nextFollowUpDate: nextFollowUpDate || null,
        },
      });

      setNewFollowUpNote('');
      setNextFollowUpDate('');
      viewCustomerDetail(selectedCustomer.id);
      fetchCustomers(pagination.page);
    } catch (err: any) {
      alert(err.message || 'Failed to add follow-up note');
    }
  };

  return (
    <div>
      {/* Search & Filter Header */}
      <div className="table-card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '1rem', flex: 1, minWidth: '280px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
                placeholder="Search by name, business, email, phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <select className="form-select" style={{ width: '160px' }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All Statuses</option>
              <option value="Lead">Lead</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>

            <select className="form-select" style={{ width: '160px' }} value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option value="">All Types</option>
              <option value="Retail">Retail</option>
              <option value="Wholesale">Wholesale</option>
              <option value="Distributor">Distributor</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <button className="btn btn-secondary" onClick={handleExportCsv} title="Export Customer List to CSV">
              <Download size={16} />
              <span>Export CSV</span>
            </button>
            {canEdit && (
              <button className="btn btn-primary" onClick={openCreateModal}>
                <Plus size={18} />
                <span>Add Customer</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Customer Data Table */}
      <div className="table-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Customer Name</th>
              <th>Business Name</th>
              <th>Contact Details</th>
              <th>Type</th>
              <th>Status</th>
              <th>Next Follow-up</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id}>
                <td>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>{c.customerName}</div>
                  {c.gstNumber && <div style={{ fontSize: '0.75rem', color: '#64748b' }}>GST: {c.gstNumber}</div>}
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}>
                    <Building size={14} color="#64748b" />
                    <span>{c.businessName}</span>
                  </div>
                </td>
                <td>
                  <div style={{ fontSize: '0.85rem' }}>{c.mobileNumber}</div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{c.email}</div>
                </td>
                <td>
                  <span className="badge" style={{ backgroundColor: '#f1f5f9', color: '#334155' }}>
                    {c.customerType}
                  </span>
                </td>
                <td>
                  <span className={`badge badge-${c.status.toLowerCase()}`}>{c.status}</span>
                </td>
                <td>
                  {c.followUpDate ? (
                    <div style={{ fontSize: '0.825rem', color: '#4f46e5', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Calendar size={13} />
                      {new Date(c.followUpDate).toLocaleDateString()}
                    </div>
                  ) : (
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>None</span>
                  )}
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => viewCustomerDetail(c.id)}
                      title="View Details & Notes"
                    >
                      <Eye size={14} />
                    </button>
                    {canEdit && (
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => openEditModal(c)}
                        title="Edit Customer"
                      >
                        <Edit2 size={14} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {customers.length === 0 && !loading && (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                  No customers found matching search criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Customer Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
              </h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowAddModal(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveCustomer}>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Customer Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Business Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Mobile Number *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.mobileNumber}
                    onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address *</label>
                  <input
                    type="email"
                    className="form-input"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">GST Number (Optional)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.gstNumber}
                    onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Customer Type *</label>
                  <select
                    className="form-select"
                    value={formData.customerType}
                    onChange={(e) => setFormData({ ...formData, customerType: e.target.value as CustomerType })}
                  >
                    <option value="Retail">Retail</option>
                    <option value="Wholesale">Wholesale</option>
                    <option value="Distributor">Distributor</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Status *</label>
                  <select
                    className="form-select"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as CustomerStatus })}
                  >
                    <option value="Lead">Lead</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Next Follow-up Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={formData.followUpDate}
                    onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Address *</label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Notes</label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingCustomer ? 'Update Customer' : 'Create Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer Detail Drawer / Modal */}
      {selectedCustomer && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '750px' }}>
            <div className="modal-header">
              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>{selectedCustomer.customerName}</h3>
                <span className={`badge badge-${selectedCustomer.status.toLowerCase()}`}>
                  {selectedCustomer.status}
                </span>
                <span className="badge" style={{ marginLeft: '0.5rem', backgroundColor: '#e2e8f0' }}>
                  {selectedCustomer.customerType}
                </span>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => setSelectedCustomer(null)}>
                <X size={16} />
              </button>
            </div>

            {/* Info Grid */}
            <div className="form-grid" style={{ marginBottom: '1.5rem', background: '#f8fafc', padding: '1rem', borderRadius: '10px' }}>
              <div>
                <strong style={{ fontSize: '0.8rem', color: '#64748b' }}>Business:</strong>
                <div>{selectedCustomer.businessName}</div>
              </div>
              <div>
                <strong style={{ fontSize: '0.8rem', color: '#64748b' }}>GST Number:</strong>
                <div>{selectedCustomer.gstNumber || 'N/A'}</div>
              </div>
              <div>
                <strong style={{ fontSize: '0.8rem', color: '#64748b' }}>Phone & Email:</strong>
                <div>{selectedCustomer.mobileNumber}</div>
                <div style={{ fontSize: '0.8rem', color: '#4f46e5' }}>{selectedCustomer.email}</div>
              </div>
              <div>
                <strong style={{ fontSize: '0.8rem', color: '#64748b' }}>Address:</strong>
                <div style={{ fontSize: '0.85rem' }}>{selectedCustomer.address}</div>
              </div>
            </div>

            {/* Follow-up Notes Timeline */}
            <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MessageSquare size={18} color="#4f46e5" />
              Follow-Up Activity History
            </h4>

            {canEdit && (
              <form onSubmit={handleAddFollowUpNote} style={{ marginBottom: '1.5rem', background: '#f1f5f9', padding: '1rem', borderRadius: '10px' }}>
                <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                  <textarea
                    className="form-textarea"
                    rows={2}
                    placeholder="Log new interaction or follow-up note..."
                    value={newFollowUpNote}
                    onChange={(e) => setNewFollowUpNote(e.target.value)}
                    required
                  />
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}>Next Follow-up Date:</label>
                    <input
                      type="date"
                      className="form-input"
                      style={{ padding: '0.4rem 0.6rem' }}
                      value={nextFollowUpDate}
                      onChange={(e) => setNextFollowUpDate(e.target.value)}
                    />
                  </div>
                  <button type="submit" className="btn btn-primary btn-sm" style={{ marginTop: '1rem' }}>
                    <Plus size={14} /> Add Note
                  </button>
                </div>
              </form>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '280px', overflowY: 'auto', paddingRight: '0.5rem' }}>
              {selectedCustomer.followUps?.map((f, idx) => (
                <div key={f.id} style={{ display: 'flex', gap: '0.85rem', position: 'relative' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ec4899', border: '2px solid #ffffff', boxShadow: '0 0 0 2px #fbcfe8', zIndex: 2 }} />
                    {idx !== (selectedCustomer.followUps?.length || 0) - 1 && (
                      <div style={{ width: '2px', flex: 1, backgroundColor: '#fbcfe8', marginTop: '2px' }} />
                    )}
                  </div>
                  <div style={{ flex: 1, backgroundColor: '#fdf2f8', border: '1px solid #fbcfe8', borderRadius: '8px', padding: '0.75rem' }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0f172a' }}>{f.note}</div>
                    <div style={{ fontSize: '0.75rem', color: '#9d174d', marginTop: '0.3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>👤 {f.createdBy}</span>
                      <span>🕒 {new Date(f.createdAt).toLocaleDateString()} at {new Date(f.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                </div>
              ))}
              {(!selectedCustomer.followUps || selectedCustomer.followUps.length === 0) && (
                <div style={{ color: '#94a3b8', fontSize: '0.85rem', fontStyle: 'italic', textAlign: 'center', padding: '1rem' }}>
                  No follow-up activity recorded yet.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
