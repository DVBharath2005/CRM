export type UserRole = 'Admin' | 'Sales' | 'Warehouse' | 'Accounts';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt?: string;
}

export type CustomerType = 'Retail' | 'Wholesale' | 'Distributor';
export type CustomerStatus = 'Lead' | 'Active' | 'Inactive';

export interface FollowUpNote {
  id: string;
  customerId: string;
  note: string;
  createdBy: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  customerName: string;
  mobileNumber: string;
  email: string;
  businessName: string;
  gstNumber?: string | null;
  customerType: CustomerType;
  address: string;
  status: CustomerStatus;
  followUpDate?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  followUps?: FollowUpNote[];
  _count?: {
    followUps: number;
    challans: number;
  };
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  unitPrice: number;
  currentStock: number;
  minStockAlert: number;
  location: string;
  createdAt: string;
  updatedAt: string;
}

export type MovementType = 'IN' | 'OUT';

export interface StockLog {
  id: string;
  productId: string;
  quantityChanged: number;
  movementType: MovementType;
  reason: string;
  createdBy: string;
  timestamp: string;
  product?: {
    name: string;
    sku: string;
    category: string;
  };
}

export type ChallanStatus = 'Draft' | 'Confirmed' | 'Cancelled';

export interface ProductSnapshot {
  id: string;
  name: string;
  sku: string;
  category: string;
  unitPrice: number;
  location: string;
}

export interface CustomerSnapshot {
  id: string;
  customerName: string;
  businessName: string;
  mobileNumber: string;
  email: string;
  gstNumber?: string | null;
  address: string;
  customerType: CustomerType;
}

export interface ChallanItem {
  id?: string;
  productId: string;
  productSnapshot?: ProductSnapshot;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface SalesChallan {
  id: string;
  challanNumber: string;
  customerId: string;
  customerSnapshot: CustomerSnapshot;
  totalQuantity: number;
  totalAmount: number;
  status: ChallanStatus;
  paymentStatus?: 'Unpaid' | 'Paid' | 'Overdue';
  dueDate?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  items: ChallanItem[];
  customer?: {
    customerName: string;
    businessName: string;
    mobileNumber: string;
    email: string;
  };
}

export interface DashboardStats {
  customers: {
    total: number;
    active: number;
    lead: number;
  };
  products: {
    total: number;
    lowStockAlerts: number;
  };
  challans: {
    total: number;
    confirmed: number;
    draft: number;
    totalRevenue: number;
  };
}
