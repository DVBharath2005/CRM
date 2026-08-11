# Anjali Enterprise - Full-Stack Mini ERP + CRM Operations Portal

> A comprehensive, modern Full-Stack Operations Portal designed for **Anjali Enterprise** (Wholesale & Distribution). Built with Node.js, Express, TypeScript, Prisma ORM, React, and Vite, featuring Role-Based Access Control (RBAC), Customer CRM management, Product & Stock tracking, Sales Challan generation with automatic atomic stock reduction, instant WhatsApp sharing, smart vendor reorder assistant, and printable Invoice PDF rendering.

---

## 🌟 Demo Test Login Credentials

| Role | Employee Name | Login Email | Password | Allowed Permissions |
| :--- | :--- | :--- | :--- | :--- |
| **Admin** | **Amit Verma** | `amit.verma@anjalienterprise.com` | `password123` | Full system administrative access, all modules & stats |
| **Sales** | **Rahul Sharma** | `rahul.sharma@anjalienterprise.com` | `password123` | Manage Customers, Add Follow-ups, Create & Confirm Sales Challans |
| **Warehouse** | **Vikram Singh** | `vikram.singh@anjalienterprise.com` | `password123` | Manage Inventory, Stock Adjustments (IN/OUT), View Audit Trail |
| **Accounts** | **Priya Patel** | `priya.patel@anjalienterprise.com` | `password123` | Customer Directory, View Sales Challans, View Revenue Reports |

*Note: Legacy alias credentials (`admin@anjalienterprise.com`, `sales@anjalienterprise.com`, `admin@company.com`, etc.) are also supported.*

---

## 🔥 Key System Features

### 1. 🛡️ Role-Based Access Control (RBAC) & Dynamic Topbar Role Switcher
- Strict JWT middleware enforcing role permissions across Admin, Sales, Warehouse, and Accounts.
- One-click **Quick Role Switcher dropdown** directly in top navigation bar for seamless testing.

### 2. 👥 Customer CRM & Visual Activity Timeline
- Comprehensive directory for Retail, Wholesale, and Distributor clients with GSTIN tracking.
- Interactive **Vertical Follow-up Timeline** displaying interaction logs, date stamps, and staff tags.

### 3. 📦 Product Inventory & Low-Stock Alerts
- Real-time stock level tracking, warehouse location mapping, and minimum alert thresholds.
- Visual badges for low-stock items requiring replenishment.

### 4. 🛒 Smart Vendor Reorder Assistant & 1-Click Bulk Restocking
- Automatically calculates recommended reorder quantities (`minStockAlert * 2 - currentStock`) for low-stock items.
- 1-Click bulk restocking action for warehouse managers.

### 5. 📄 Sales Challan Engine with Atomic Stock Deduction
- Auto-generated sequential Challan numbering (`CH-2026-0001`, `CH-2026-0002`).
- Prevents stock overselling with atomic stock deduction upon confirmation.
- 18% GST Breakdown (CGST 9% + SGST 9%) and subtotal calculations.

### 6. 🏷️ Official Authorised Signatory Stamp & Signature Seal
- High-res vector rubber stamp seal (`ANJALI ENTERPRISE ★ OFFICIAL SEAL ★ VERIFIED & DISPATCHED`).
- Cursive digital signature block and Receiver's Acknowledgement line on printable PDF invoices.

### 7. 📱 Instant WhatsApp Invoice & Dispatch Sharing
- One-click button in Challan View launching pre-formatted WhatsApp dispatch alerts directly to customer phone numbers.

### 8. 📊 Universal 1-Click CSV Data Exporter
- Download CSV export button across Customer Directory, Product Inventory, and Sales Challan Registers.

### 9. 🌙 Seamless Dark / Light Theme Switcher & Micro-Animations
- Topbar theme toggle button (`Sun` / `Moon`) switching between Light Pink and Dark Slate Themes.
- Hover lift, tactile press scale down (`scale(0.96)`), glass shimmer sweeps, and animated buttons.

---

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js v20+ with TypeScript
- **Framework**: Express.js
- **ORM & Database**: Prisma ORM with SQLite (PostgreSQL compatible)
- **Authentication**: JWT (JSON Web Tokens) & Bcrypt password hashing
- **Testing**: Built-in Automated API Integration Test Suite

### Frontend
- **Framework**: React 18 with TypeScript & Vite
- **Styling**: Vanilla CSS Design System with CSS Variables & Glassmorphic effects
- **Icons**: Lucide React

---

## 🚀 Quick Start & Installation

### 1. Clone & Set Up Backend

```bash
cd backend

# Install dependencies
npm install

# Run database migration & schema push
npx prisma db push

# Seed database with 15 stock items, 15 customers & demo users
npx tsx prisma/seed.ts

# Start backend dev server (runs on http://localhost:5000)
npm run dev
```

### 2. Set Up Frontend

```bash
cd ../frontend

# Install dependencies
npm install

# Start frontend dev server (runs on http://localhost:3000)
npm run dev
```

---

## 🧪 Running Automated Tests

The backend includes an automated API verification test suite testing health checks, auth endpoints, CRUD operations, stock deduction, and low-stock error validations:

```bash
cd backend
npx tsx src/tests/api.test.ts
```

---

## 🌐 Deployment Guide (Vercel + Render)

### 1. 🚀 Backend Deployment to Render (Render.com)

The repository includes a `render.yaml` file pre-configured for Render.

#### Step-by-Step Render Setup:
1. Go to [dashboard.render.com](https://dashboard.render.com) and click **New +** -> **Web Service**.
2. Connect your GitHub repository: `DVBharath2005/CRM`.
3. Configure the service settings:
   - **Name**: `crm-mini-erp-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npx prisma generate && npx prisma db push && npx tsx prisma/seed.ts && npm run build`
   - **Start Command**: `node dist/server.js`
4. Add Environment Variables:
   - `PORT`: `5000`
   - `NODE_ENV`: `production`
   - `JWT_SECRET`: `super-secret-jwt-key-for-mini-erp-crm-2026`
   - `DATABASE_URL`: `file:./dev.db`
5. Click **Create Web Service**. Render will deploy your live API endpoint (e.g. `https://crm-mini-erp-backend.onrender.com`).

---

### 2. ⚡ Frontend Deployment to Vercel (Vercel.com)

1. Go to [vercel.com/new](https://vercel.com/new).
2. Click **Import Repository** and select `DVBharath2005/CRM`.
3. Set **Root Directory** to `frontend`.
4. Click **Deploy**. Vercel will automatically build and publish your live production URL.

