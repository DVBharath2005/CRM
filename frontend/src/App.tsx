import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { DashboardPage } from './pages/DashboardPage';
import { CustomersPage } from './pages/CustomersPage';
import { ProductsPage } from './pages/ProductsPage';
import { ChallansPage } from './pages/ChallansPage';
import { StockLogsPage } from './pages/StockLogsPage';

export const App: React.FC = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0f172a',
          color: '#ffffff',
          fontWeight: 700,
        }}
      >
        Initializing Mini ERP + CRM Portal...
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="app-layout">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="main-content">
        <Navbar activeTab={activeTab} />
        <main className="page-container">
          {activeTab === 'dashboard' && <DashboardPage setActiveTab={setActiveTab} />}
          {activeTab === 'customers' && <CustomersPage />}
          {activeTab === 'products' && <ProductsPage />}
          {activeTab === 'challans' && <ChallansPage />}
          {activeTab === 'stock-logs' && <StockLogsPage />}
        </main>
        <footer className="app-footer">
          <div>© {new Date().getFullYear()} Anjali Enterprise • Wholesale & Distribution Operations System</div>
          <div>Role: <strong>{user.role}</strong> ({user.name})</div>
        </footer>
      </div>
    </div>
  );
};

export default App;
