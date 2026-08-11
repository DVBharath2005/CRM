import React, { useState, useEffect } from 'react';
import { apiRequest } from '../services/api';
import { SalesChallan, Customer, Product, ChallanStatus } from '../types';
import { useAuth } from '../context/AuthContext';
import { exportToCsv } from '../utils/exportCsv';
import {
  Plus,
  Search,
  Eye,
  Printer,
  X,
  FileSpreadsheet,
  Trash2,
  AlertCircle,
  CheckCircle,
  Clock,
  Ban,
  Building,
  Download,
  Share2,
  MessageCircle,
} from 'lucide-react';

export const ChallansPage: React.FC = () => {
  const { user } = useAuth();
  const canCreate = user?.role === 'Admin' || user?.role === 'Sales';

  const [challans, setChallans] = useState<SalesChallan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Creation Modal States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [lineItems, setLineItems] = useState<{ productId: string; quantity: number; unitPrice: number }[]>([]);
  const [createError, setCreateError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // View / Print Modal
  const [selectedChallan, setSelectedChallan] = useState<SalesChallan | null>(null);

  const fetchChallans = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        search,
        status: statusFilter,
      }).toString();

      const res = await apiRequest<{ challans: SalesChallan[] }>(`/challans?${query}`);
      setChallans(res.challans);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallans();
  }, [search, statusFilter]);

  const handleExportCsv = () => {
    const dataToExport = challans.map((ch) => ({
      'Challan Number': ch.challanNumber,
      'Customer Name': ch.customerSnapshot?.customerName,
      'Business Name': ch.customerSnapshot?.businessName,
      'Status': ch.status,
      'Total Amount (INR)': ch.totalAmount,
      'Items Count': ch.items?.length || 0,
      'Created By': ch.createdBy,
      'Date': new Date(ch.createdAt).toLocaleDateString(),
    }));
    exportToCsv('Anjali_Enterprise_Sales_Challans', dataToExport);
  };

  const handleShareWhatsApp = (challan: SalesChallan) => {
    const custName = challan.customerSnapshot?.customerName || 'Customer';
    const mobile = challan.customerSnapshot?.mobileNumber || '';
    const text = `Hello ${custName},\n\nYour Sales Challan *${challan.challanNumber}* of Total Amount *₹${challan.totalAmount.toLocaleString(
      'en-IN'
    )}* has been *${challan.status.toUpperCase()}* by Anjali Enterprise.\n\nThank you for doing business with us!`;

    const cleanMobile = mobile.replace(/[^0-9]/g, '');
    const url = cleanMobile
      ? `https://wa.me/91${cleanMobile}?text=${encodeURIComponent(text)}`
      : `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const openCreateModal = async () => {
    try {
      const [custRes, prodRes] = await Promise.all([
        apiRequest<{ customers: Customer[] }>('/customers?limit=100'),
        apiRequest<{ products: Product[] }>('/products?limit=100'),
      ]);
      setCustomers(custRes.customers);
      setProducts(prodRes.products);

      if (custRes.customers.length > 0) {
        setSelectedCustomerId(custRes.customers[0].id);
      }

      if (prodRes.products.length > 0) {
        setLineItems([{ productId: prodRes.products[0].id, quantity: 1, unitPrice: prodRes.products[0].unitPrice }]);
      }

      setCreateError(null);
      setErrorDetails([]);
      setShowCreateModal(true);
    } catch (err: any) {
      alert('Failed to load customer/product options');
    }
  };

  const handleProductChange = (index: number, productId: string) => {
    const prod = products.find((p) => p.id === productId);
    const updated = [...lineItems];
    updated[index].productId = productId;
    if (prod) {
      updated[index].unitPrice = prod.unitPrice;
    }
    setLineItems(updated);
  };

  const handleQuantityChange = (index: number, qty: number) => {
    const updated = [...lineItems];
    updated[index].quantity = Math.max(1, qty);
    setLineItems(updated);
  };

  const addLineItem = () => {
    if (products.length === 0) return;
    setLineItems([...lineItems, { productId: products[0].id, quantity: 1, unitPrice: products[0].unitPrice }]);
  };

  const removeLineItem = (index: number) => {
    if (lineItems.length <= 1) return;
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const calculateTotals = () => {
    let qty = 0;
    let amount = 0;
    lineItems.forEach((item) => {
      qty += item.quantity;
      amount += item.quantity * item.unitPrice;
    });
    return { qty, amount };
  };

  const handleCreateChallan = async (status: 'Draft' | 'Confirmed') => {
    setCreateError(null);
    setErrorDetails([]);
    setSubmitting(true);

    try {
      await apiRequest('/challans', {
        method: 'POST',
        body: {
          customerId: selectedCustomerId,
          status,
          items: lineItems,
        },
      });

      setShowCreateModal(false);
      fetchChallans();
    } catch (err: any) {
      setCreateError(err.message || 'Failed to create sales challan');
      if (err.details && Array.isArray(err.details)) {
        setErrorDetails(err.details);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (challanId: string, newStatus: ChallanStatus) => {
    try {
      await apiRequest(`/challans/${challanId}/status`, {
        method: 'PATCH',
        body: { status: newStatus },
      });
      fetchChallans();
      if (selectedChallan && selectedChallan.id === challanId) {
        setSelectedChallan({ ...selectedChallan, status: newStatus });
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update challan status');
    }
  };

  const totals = calculateTotals();

  return (
    <div>
      {/* Search & Filter Bar */}
      <div className="table-card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '1rem', flex: 1, minWidth: '280px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
                placeholder="Search challan number, customer name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <select className="form-select" style={{ width: '160px' }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All Statuses</option>
              <option value="Draft">Draft</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <button className="btn btn-secondary" onClick={handleExportCsv} title="Export Challan List to CSV">
              <Download size={16} />
              <span>Export CSV</span>
            </button>
            {canCreate && (
              <button className="btn btn-primary" onClick={openCreateModal}>
                <Plus size={18} />
                <span>Create Sales Challan</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Challan List Table */}
      <div className="table-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Challan Number</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Items Count</th>
              <th>Total Qty</th>
              <th>Total Value</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {challans.map((c) => (
              <tr key={c.id}>
                <td style={{ fontWeight: 800, color: '#4f46e5' }}>{c.challanNumber}</td>
                <td>
                  <div style={{ fontWeight: 700 }}>{c.customerSnapshot?.customerName}</div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{c.customerSnapshot?.businessName}</div>
                </td>
                <td style={{ fontSize: '0.85rem' }}>{new Date(c.createdAt).toLocaleDateString()}</td>
                <td>{c.items.length} line items</td>
                <td style={{ fontWeight: 600 }}>{c.totalQuantity}</td>
                <td style={{ fontWeight: 700 }}>₹{c.totalAmount.toLocaleString('en-IN')}</td>
                <td>
                  <span className={`badge badge-${c.status.toLowerCase()}`}>{c.status}</span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => setSelectedChallan(c)}
                      title="View & Print Invoice"
                    >
                      <Eye size={14} /> View / Print
                    </button>
                    {c.status === 'Draft' && (
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => handleStatusChange(c.id, 'Confirmed')}
                        title="Confirm & Deduct Stock"
                      >
                        <CheckCircle size={14} /> Confirm
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {challans.length === 0 && !loading && (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                  No sales challans recorded.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create Sales Challan Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '800px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Create New Sales Challan</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowCreateModal(false)}>
                <X size={16} />
              </button>
            </div>

            {createError && (
              <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '0.85rem', borderRadius: '8px', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
                  <AlertCircle size={18} />
                  <span>{createError}</span>
                </div>
                {errorDetails.length > 0 && (
                  <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem', fontSize: '0.85rem' }}>
                    {errorDetails.map((det, idx) => (
                      <li key={idx}>{det}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Select Customer *</label>
              <select
                className="form-select"
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.customerName} ({c.businessName}) - [{c.customerType}]
                  </option>
                ))}
              </select>
            </div>

            <div style={{ margin: '1.5rem 0 0.5rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4 style={{ fontWeight: 700, fontSize: '0.95rem' }}>Line Items & Quantities</h4>
              <button className="btn btn-secondary btn-sm" onClick={addLineItem}>
                <Plus size={14} /> Add Product Row
              </button>
            </div>

            <table className="data-table" style={{ marginBottom: '1rem' }}>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Stock Avail.</th>
                  <th>Unit Price (₹)</th>
                  <th>Quantity</th>
                  <th>Subtotal (₹)</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {lineItems.map((item, idx) => {
                  const currentProd = products.find((p) => p.id === item.productId);
                  const subtotal = item.quantity * item.unitPrice;
                  const isInsufficient = currentProd && currentProd.currentStock < item.quantity;

                  return (
                    <tr key={idx}>
                      <td>
                        <select
                          className="form-select"
                          value={item.productId}
                          onChange={(e) => handleProductChange(idx, e.target.value)}
                        >
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} ({p.sku})
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        {currentProd ? (
                          <span style={{ fontWeight: 700, color: isInsufficient ? '#dc2626' : '#059669' }}>
                            {currentProd.currentStock} units
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td>
                        <input
                          type="number"
                          step="0.01"
                          className="form-input"
                          style={{ width: '100px' }}
                          value={item.unitPrice}
                          onChange={(e) => {
                            const updated = [...lineItems];
                            updated[idx].unitPrice = parseFloat(e.target.value) || 0;
                            setLineItems(updated);
                          }}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          min="1"
                          className="form-input"
                          style={{ width: '80px' }}
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(idx, parseInt(e.target.value) || 1)}
                        />
                      </td>
                      <td style={{ fontWeight: 700 }}>₹{subtotal.toLocaleString('en-IN')}</td>
                      <td>
                        {lineItems.length > 1 && (
                          <button className="btn btn-danger btn-sm" onClick={() => removeLineItem(idx)}>
                            <Trash2 size={14} />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Summary Box */}
            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>Total Quantity: <strong>{totals.qty} units</strong></div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#4f46e5' }}>
                Total Order Value: ₹{totals.amount.toLocaleString('en-IN')}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                disabled={submitting}
                onClick={() => handleCreateChallan('Draft')}
              >
                Save as Draft
              </button>
              <button
                type="button"
                className="btn btn-primary"
                disabled={submitting}
                onClick={() => handleCreateChallan('Confirmed')}
              >
                Confirm & Dispatch (Auto-Deduct Stock)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Printable Invoice / Challan PDF View Modal */}
      {selectedChallan && (
        <div className="modal-overlay">
          <div className="modal-content printable-invoice" style={{ maxWidth: '850px', background: '#ffffff', color: '#0f172a' }}>
            <div className="modal-header" style={{ borderBottom: '2px solid #0f172a' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <img src="/logo.svg" alt="Anjali Enterprise Logo" style={{ width: '48px', height: '48px', objectFit: 'contain' }} />
                <div>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#4f46e5' }}>ANJALI ENTERPRISE - SALES CHALLAN / INVOICE</h2>
                  <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Challan No: <strong>{selectedChallan.challanNumber}</strong></div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleShareWhatsApp(selectedChallan)}
                  style={{ backgroundColor: '#25d366', color: '#ffffff', border: 'none' }}
                  title="Share Invoice summary via WhatsApp"
                >
                  <MessageCircle size={14} /> WhatsApp Share
                </button>
                <button className="btn btn-primary btn-sm" onClick={() => window.print()}>
                  <Printer size={14} /> Print / Export PDF
                </button>
                <button className="btn btn-secondary btn-sm" onClick={() => setSelectedChallan(null)}>
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Header info */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2rem', margin: '1.5rem 0' }}>
              <div>
                <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>ISSUED TO:</h4>
                <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{selectedChallan.customerSnapshot?.customerName}</div>
                <div>{selectedChallan.customerSnapshot?.businessName}</div>
                <div style={{ fontSize: '0.85rem', color: '#475569' }}>{selectedChallan.customerSnapshot?.address}</div>
                <div style={{ fontSize: '0.85rem', marginTop: '0.3rem' }}>GSTIN: {selectedChallan.customerSnapshot?.gstNumber || 'N/A'}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>DISPATCH DETAILS:</h4>
                <div>Date: <strong>{new Date(selectedChallan.createdAt).toLocaleDateString()}</strong></div>
                <div>Status: <span className={`badge badge-${selectedChallan.status.toLowerCase()}`}>{selectedChallan.status}</span></div>
                <div>Created By: <strong>{selectedChallan.createdBy}</strong></div>
              </div>
            </div>

            {/* Itemized Table */}
            <table className="data-table" style={{ marginBottom: '1.5rem', border: '1px solid #e2e8f0' }}>
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Item Description</th>
                  <th>Qty</th>
                  <th>Unit Price</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {selectedChallan.items.map((item, idx) => (
                  <tr key={idx}>
                    <td>{item.productSnapshot?.sku}</td>
                    <td style={{ fontWeight: 600 }}>{item.productSnapshot?.name}</td>
                    <td>{item.quantity}</td>
                    <td>₹{item.unitPrice.toLocaleString('en-IN')}</td>
                    <td style={{ fontWeight: 700 }}>₹{item.subtotal.toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Total Payable Summary */}
            <div style={{ textAlign: 'right', fontSize: '1.25rem', fontWeight: 900, color: '#4f46e5', borderTop: '2px solid #e2e8f0', paddingTop: '1rem' }}>
              Total Amount Payable: ₹{selectedChallan.totalAmount.toLocaleString('en-IN')}
            </div>

            {/* Official Stamp & Signature Block */}
            <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '2px dashed #cbd5e1', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2rem', alignItems: 'end' }}>
              {/* Receiver's Acknowledgement */}
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#475569', marginBottom: '3rem', letterSpacing: '0.05em' }}>
                  CUSTOMER ACKNOWLEDGEMENT:
                </div>
                <div style={{ borderTop: '1px solid #94a3b8', width: '220px', paddingTop: '0.35rem', fontSize: '0.8rem', color: '#334155', fontWeight: 700 }}>
                  Received Goods in Good Condition
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Receiver's Signature & Stamp</div>
              </div>

              {/* Company Authorised Stamp & Signature */}
              <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                  {/* Official Blue Rubber Stamp SVG */}
                  <svg width="95" height="95" viewBox="0 0 120 120" style={{ opacity: 0.85, transform: 'rotate(-6deg)' }}>
                    <circle cx="60" cy="60" r="54" fill="none" stroke="#1e40af" strokeWidth="3" strokeDasharray="5 2"/>
                    <circle cx="60" cy="60" r="47" fill="none" stroke="#1e40af" strokeWidth="2"/>
                    <path id="stampArcTop" d="M 20,60 A 40,40 0 0,1 100,60" fill="none"/>
                    <path id="stampArcBottom" d="M 100,60 A 40,40 0 0,1 20,60" fill="none"/>
                    <text fill="#1e40af" fontSize="8" fontWeight="900" letterSpacing="0.5">
                      <textPath href="#stampArcTop" startOffset="50%" textAnchor="middle">
                        ANJALI ENTERPRISE
                      </textPath>
                    </text>
                    <text fill="#1e40af" fontSize="7" fontWeight="800" letterSpacing="0.5">
                      <textPath href="#stampArcBottom" startOffset="50%" textAnchor="middle">
                        ★ OFFICIAL SEAL ★
                      </textPath>
                    </text>
                    <g transform="translate(60, 60)" textAnchor="middle" fill="#1e40af">
                      <text y="-4" fontSize="9" fontWeight="900" letterSpacing="1">VERIFIED</text>
                      <line x1="-30" y1="2" x2="30" y2="2" stroke="#1e40af" strokeWidth="1.5"/>
                      <text y="13" fontSize="8" fontWeight="800">DISPATCHED</text>
                    </g>
                  </svg>

                  {/* Cursive Signature SVG */}
                  <div style={{ textAlign: 'center' }}>
                    <svg width="130" height="45" viewBox="0 0 200 60" fill="none" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round">
                      <path d="M 10,40 Q 30,10 50,35 T 80,20 T 110,45 T 140,15 T 170,35 Q 185,20 195,30" />
                      <path d="M 30,25 L 170,25" stroke="#0f172a" strokeWidth="1.5" strokeDasharray="3 2"/>
                    </svg>
                  </div>
                </div>

                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>
                  For ANJALI ENTERPRISE
                </div>
                <div style={{ borderTop: '1.5px solid #0f172a', width: '220px', marginTop: '0.4rem', paddingTop: '0.25rem', fontSize: '0.78rem', color: '#334155', fontWeight: 700, textAlign: 'center' }}>
                  Authorised Signatory & Stamp
                </div>
              </div>
            </div>

            {/* Status action buttons inside view */}
            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              {selectedChallan.status === 'Draft' && (
                <button
                  className="btn btn-success"
                  onClick={() => handleStatusChange(selectedChallan.id, 'Confirmed')}
                >
                  <CheckCircle size={16} /> Confirm & Deduct Stock
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
