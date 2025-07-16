import React, { Suspense, lazy } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';

const SHOP_NAME = 'Shree Ram Rajasthan Kulfi House';

const Dashboard = lazy(() => import('./admin/Dashboard'));
const ProductManagement = lazy(() => import('./admin/ProductManagement'));
const ExpenseManagement = lazy(() => import('./admin/ExpenseManagement'));
const SalesManagement = lazy(() => import('./admin/SalesManagement'));
const UserManagement = lazy(() => import('./admin/UserManagement'));

const sidebarLinks = [
  { label: 'Dashboard', icon: '📊', path: '/admin' },
  { label: 'Product Management', icon: '📦', path: '/admin/products' },
  { label: 'Expense Management', icon: '💸', path: '/admin/expenses' },
  { label: 'Sales Management', icon: '🛒', path: '/admin/sales' },
  { label: 'User Management', icon: '👤', path: '/admin/users' },
];

const COLORS = {
  green: '#2ecc40',
  orange: '#ff8800',
  white: '#fff',
  lightBg: '#f7f7f7',
  text: '#222',
  muted: '#888',
  sidebarBorder: '#ff880033',
};

const AdminPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif', background: COLORS.lightBg }}>
      {/* Sidebar */}
      <aside style={{
        width: '260px',
        background: COLORS.white,
        color: COLORS.text,
        display: 'flex',
        flexDirection: 'column',
        padding: '2rem 1rem',
        boxShadow: '2px 0 8px rgba(0,0,0,0.04)',
        borderRight: `3px solid ${COLORS.sidebarBorder}`,
      }}>
        <div style={{ fontWeight: 900, fontSize: '1.25rem', marginBottom: '1.5rem', letterSpacing: 1, color: COLORS.orange, textAlign: 'center', lineHeight: 1.3 }}>
          {SHOP_NAME}
        </div>
        <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '2rem', letterSpacing: 1, color: COLORS.green, textAlign: 'center' }}>
          Admin Panel
        </div>
        <nav style={{ flex: 1 }}>
          {sidebarLinks.map(link => (
            <div key={link.label} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              padding: '0.75rem 1rem',
              borderRadius: '6px',
              marginBottom: '0.5rem',
              cursor: 'pointer',
              transition: 'background 0.2s',
              fontWeight: 500,
              fontSize: '1.1rem',
              color: COLORS.text,
              background: location.pathname === link.path ? COLORS.orange + '22' : 'transparent',
            }}
            onClick={() => navigate(link.path)}
            onMouseOver={e => e.currentTarget.style.background = COLORS.orange + '22'}
            onMouseOut={e => e.currentTarget.style.background = location.pathname === link.path ? COLORS.orange + '22' : 'transparent'}
            >
              <span style={{ fontSize: '1.3rem', color: link.label === 'Dashboard' ? COLORS.green : COLORS.orange }}>{link.icon}</span>
              {link.label}
            </div>
          ))}
        </nav>
        <div style={{ marginTop: '2rem', fontSize: '0.95rem', color: COLORS.muted, textAlign: 'center' }}>
          &copy; {new Date().getFullYear()} {SHOP_NAME}
        </div>
      </aside>
      {/* Main Dashboard */}
      <main style={{ flex: 1, padding: '2.5rem 3rem', background: COLORS.lightBg }}>
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/products" element={<ProductManagement />} />
            <Route path="/expenses" element={<ExpenseManagement />} />
            <Route path="/sales" element={<SalesManagement />} />
            <Route path="/users" element={<UserManagement />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
};

export default AdminPage; 