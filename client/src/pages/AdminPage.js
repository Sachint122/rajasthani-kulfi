import React, { Suspense, lazy } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';

const SHOP_NAME = 'Shree Ram Rajasthan Kulfi House';

const Dashboard = lazy(() => import('./admin/Dashboard'));
const ProductManagement = lazy(() => import('./admin/ProductManagement'));
const ExpenseManagement = lazy(() => import('./admin/ExpenseManagement'));
const SalesManagement = lazy(() => import('./admin/SalesManagement'));
const UserManagement = lazy(() => import('./admin/UserManagement'));

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