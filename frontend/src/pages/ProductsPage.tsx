import React, { useState, useEffect } from 'react';
import { apiRequest } from '../services/api';
import { Product } from '../types';
import { useAuth } from '../context/AuthContext';
import { exportToCsv } from '../utils/exportCsv';
import {
  Plus,
  Search,
  AlertTriangle,
  Edit2,
  Sliders,
  X,
  Package,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  RefreshCw,
  ShoppingCart,
} from 'lucide-react';

export const ProductsPage: React.FC = () => {
  const { user } = useAuth();
  const canEdit = user?.role === 'Admin' || user?.role === 'Warehouse';

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showReorderModal, setShowReorderModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [adjustingProduct, setAdjustingProduct] = useState<Product | null>(null);
  const [reordering, setReordering] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: 'Hardware & Electronics',
    unitPrice: 0,
    currentStock: 0,
    minStockAlert: 5,
    location: 'Main Warehouse',
  });

  // Stock Adjust State
  const [adjustData, setAdjustData] = useState({
    quantityChanged: 1,
    movementType: 'IN' as 'IN' | 'OUT',
    reason: '',
  });

  const handleExportCsv = () => {
    const dataToExport = products.map((p) => ({
      'SKU': p.sku,
      'Product Name': p.name,
      'Category': p.category,
      'Unit Price (INR)': p.unitPrice,
      'Current Stock': p.currentStock,
      'Min Stock Alert': p.minStockAlert,
      'Low Stock Status': p.currentStock <= p.minStockAlert ? 'LOW STOCK' : 'OK',
      'Warehouse Location': p.location,
    }));
    exportToCsv('Anjali_Enterprise_Inventory', dataToExport);
  };

  const fetchProducts = async (page = 1) => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        search,
        category: categoryFilter,
        lowStock: lowStockOnly ? 'true' : 'false',
      }).toString();

      const res = await apiRequest<{ products: Product[]; pagination: any }>(`/products?${query}`);
      setProducts(res.products);
      setPagination(res.pagination);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(1);
  }, [search, categoryFilter, lowStockOnly]);

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      sku: `PRD-${Math.floor(100 + Math.random() * 900)}`,
      category: 'Hardware & Electronics',
      unitPrice: 1000,
      currentStock: 10,
      minStockAlert: 5,
      location: 'Main Warehouse - Shelf 1',
    });
    setShowAddModal(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      name: p.name,
      sku: p.sku,
      category: p.category,
      unitPrice: p.unitPrice,
      currentStock: p.currentStock,
      minStockAlert: p.minStockAlert,
      location: p.location,
    });
    setShowAddModal(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await apiRequest(`/products/${editingProduct.id}`, {
          method: 'PUT',
          body: formData,
        });
      } else {
        await apiRequest('/products', {
          method: 'POST',
          body: formData,
        });
      }
      setShowAddModal(false);
      fetchProducts(pagination.page);
    } catch (err: any) {
      alert(err.message || 'Failed to save product');
    }
  };

  const handleAdjustStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingProduct) return;
    try {
      await apiRequest(`/products/${adjustingProduct.id}/stock-adjust`, {
        method: 'POST',
        body: adjustData,
      });
      setAdjustingProduct(null);
      setAdjustData({ quantityChanged: 1, movementType: 'IN', reason: '' });
      fetchProducts(pagination.page);
    } catch (err: any) {
      alert(err.message || 'Failed to adjust stock');
    }
  };

  return (
    <div>
      {/* Search & Filter Header */}
      <div className="table-card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '1rem', flex: 1, minWidth: '280px', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
                placeholder="Search products by name, SKU, location..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', cursor: 'pointer', whiteSpace: 'nowrap' }}>
              <input
                type="checkbox"
                checked={lowStockOnly}
                onChange={(e) => setLowStockOnly(e.target.checked)}
              />
              <span style={{ color: lowStockOnly ? '#dc2626' : '#475569', fontWeight: 600 }}>Low Stock Only</span>
            </label>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <button className="btn btn-secondary" onClick={handleExportCsv} title="Export Inventory to CSV">
              <Download size={16} />
              <span>Export CSV</span>
            </button>
            {canEdit && (
              <>
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowReorderModal(true)}
                  style={{ backgroundColor: '#fffbeb', color: '#b45309', border: '1px solid #fde68a' }}
                >
                  <ShoppingCart size={16} />
                  <span>Auto Reorder ({products.filter((p) => p.currentStock <= p.minStockAlert).length})</span>
                </button>
                <button className="btn btn-primary" onClick={openCreateModal}>
                  <Plus size={18} />
                  <span>Add Product</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Product Data Table */}
      <div className="table-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Product Name</th>
              <th>Category</th>
              <th>Unit Price</th>
              <th>Current Stock</th>
              <th>Warehouse Location</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const isLowStock = p.currentStock <= p.minStockAlert;
              return (
                <tr key={p.id}>
                  <td style={{ fontWeight: 700, color: '#4f46e5' }}>{p.sku}</td>
                  <td>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>{p.name}</div>
                  </td>
                  <td>
                    <span className="badge" style={{ backgroundColor: '#f1f5f9', color: '#334155' }}>
                      {p.category}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600 }}>₹{p.unitPrice.toLocaleString('en-IN')}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span
                        style={{
                          fontWeight: 800,
                          fontSize: '1rem',
                          color: isLowStock ? '#dc2626' : '#059669',
                        }}
                      >
                        {p.currentStock}
                      </span>
                      {isLowStock && (
                        <span className="badge badge-cancelled" title={`Low Stock Alert! Threshold: ${p.minStockAlert}`}>
                          <AlertTriangle size={12} /> Low Stock
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Min Alert: {p.minStockAlert}</div>
                  </td>
                  <td style={{ fontSize: '0.85rem', color: '#64748b' }}>{p.location}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      {canEdit && (
                        <>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => openEditModal(p)}
                            title="Edit Product Details"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => {
                              setAdjustingProduct(p);
                              setAdjustData({ quantityChanged: 1, movementType: 'IN', reason: 'Manual Restock' });
                            }}
                            title="Adjust Stock (IN/OUT)"
                          >
                            <Sliders size={14} />
                            <span>Adjust Stock</span>
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {products.length === 0 && !loading && (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                  No products found matching criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Product Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowAddModal(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct}>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Product Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">SKU / Code *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Unit Price (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-input"
                    value={formData.unitPrice}
                    onChange={(e) => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) || 0 })}
                    required
                  />
                </div>

                {!editingProduct && (
                  <div className="form-group">
                    <label className="form-label">Initial Stock Qty *</label>
                    <input
                      type="number"
                      className="form-input"
                      value={formData.currentStock}
                      onChange={(e) => setFormData({ ...formData, currentStock: parseInt(e.target.value) || 0 })}
                      required
                    />
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Min Stock Alert Quantity *</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.minStockAlert}
                    onChange={(e) => setFormData({ ...formData, minStockAlert: parseInt(e.target.value) || 0 })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Warehouse Location / Shelf *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingProduct ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Adjust Stock Modal */}
      {adjustingProduct && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Adjust Stock Level</h3>
                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  {adjustingProduct.name} ({adjustingProduct.sku})
                </div>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => setAdjustingProduct(null)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAdjustStock}>
              <div className="form-group" style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '8px', marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.85rem', color: '#475569' }}>Current Stock: <strong style={{ color: '#0f172a' }}>{adjustingProduct.currentStock} units</strong></div>
              </div>

              <div className="form-group">
                <label className="form-label">Movement Type *</label>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="movementType"
                      value="IN"
                      checked={adjustData.movementType === 'IN'}
                      onChange={() => setAdjustData({ ...adjustData, movementType: 'IN' })}
                    />
                    <span className="badge badge-in"><ArrowUpRight size={14} /> Stock IN (Addition)</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="movementType"
                      value="OUT"
                      checked={adjustData.movementType === 'OUT'}
                      onChange={() => setAdjustData({ ...adjustData, movementType: 'OUT' })}
                    />
                    <span className="badge badge-out"><ArrowDownRight size={14} /> Stock OUT (Reduction)</span>
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Quantity Changed *</label>
                <input
                  type="number"
                  min="1"
                  className="form-input"
                  value={adjustData.quantityChanged}
                  onChange={(e) => setAdjustData({ ...adjustData, quantityChanged: parseInt(e.target.value) || 1 })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Reason / Audit Remarks *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Restock shipment received, Damaged stock write-off..."
                  value={adjustData.reason}
                  onChange={(e) => setAdjustData({ ...adjustData, reason: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setAdjustingProduct(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Confirm Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Smart Auto Reorder Assistant Modal */}
      {showReorderModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '650px' }}>
            <div className="modal-header">
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ShoppingCart size={20} color="#d97706" /> Smart Vendor Reorder Assistant
                </h3>
                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  Auto-calculated restocking order for products below minimum threshold
                </div>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowReorderModal(false)}>
                <X size={16} />
              </button>
            </div>

            {(() => {
              const lowStockItems = products.filter((p) => p.currentStock <= p.minStockAlert);
              if (lowStockItems.length === 0) {
                return (
                  <div style={{ padding: '2rem', textAlign: 'center', color: '#059669', fontWeight: 700 }}>
                    <AlertTriangle size={32} style={{ margin: '0 auto 0.5rem auto', display: 'block' }} />
                    All inventory levels are healthy! No items currently require restocking.
                  </div>
                );
              }

              const handleBulkRestock = async () => {
                setReordering(true);
                try {
                  for (const p of lowStockItems) {
                    const recQty = Math.max(10, (p.minStockAlert * 2) - p.currentStock);
                    await apiRequest(`/products/${p.id}/stock-adjust`, {
                      method: 'POST',
                      body: {
                        quantityChanged: recQty,
                        movementType: 'IN',
                        reason: 'Automated Vendor Reorder Restock',
                      },
                    });
                  }
                  setShowReorderModal(false);
                  fetchProducts(pagination.page);
                  alert('Bulk restocking completed successfully!');
                } catch (err: any) {
                  alert(err.message || 'Restock failed');
                } finally {
                  setReordering(false);
                }
              };

              return (
                <div>
                  <table className="data-table" style={{ marginBottom: '1.5rem' }}>
                    <thead>
                      <tr>
                        <th>Product / SKU</th>
                        <th>Current Stock</th>
                        <th>Min Threshold</th>
                        <th>Suggested Reorder Qty</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lowStockItems.map((p) => {
                        const recQty = Math.max(10, (p.minStockAlert * 2) - p.currentStock);
                        return (
                          <tr key={p.id}>
                            <td>
                              <div style={{ fontWeight: 700 }}>{p.name}</div>
                              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{p.sku}</div>
                            </td>
                            <td style={{ color: '#dc2626', fontWeight: 800 }}>{p.currentStock} units</td>
                            <td>{p.minStockAlert} units</td>
                            <td style={{ color: '#059669', fontWeight: 800 }}>+{recQty} units</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                    <button className="btn btn-secondary" onClick={() => setShowReorderModal(false)}>
                      Cancel
                    </button>
                    <button className="btn btn-success" disabled={reordering} onClick={handleBulkRestock}>
                      <RefreshCw size={16} />
                      <span>{reordering ? 'Restocking...' : 'Restock All Low Stock Items'}</span>
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};
