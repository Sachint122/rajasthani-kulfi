import React, { useState } from 'react';
import './AdminDashboard.css';
import ProductManagement from './ProductManagement';
import OrderManagement from './OrderManagement';
import UserManagement from './UserManagement';
import Overview from './Overview';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const handleLogout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    window.location.href = '/';
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <Overview onTabChange={handleTabChange} />;
      case 'products':
        return <ProductManagement />;
      case 'orders':
        return <OrderManagement />;
      case 'users':
        return <UserManagement />;
      case 'reports':
        return <ReportsSection />;
      default:
        return <Overview onTabChange={handleTabChange} />;
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>Admin Panel</h2>
          <p>Shree Ram Rajasthan Kulfi House</p>
        </div>
        
        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            📊 Overview
          </button>
          <button 
            className={`nav-item ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            🍦 Products
          </button>
          <button 
            className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            📋 Orders
          </button>
          <button 
            className={`nav-item ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            👥 Users
          </button>
          <button 
            className={`nav-item ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => setActiveTab('reports')}
          >
            📊 Reports
          </button>
        </nav>

        <div className="sidebar-footer">
          <button 
            className="home-btn"
            onClick={() => window.location.href = '/'}
            title="Go to Home Page"
          >
            🏠 Go to Home
          </button>
          <button className="logout-btn" onClick={handleLogout}>
            🚪 Logout
          </button>
        </div>
      </div>

      <div className="main-content">
        <header className="content-header">
          <h1>
            {activeTab === 'overview' && 'Dashboard Overview'}
            {activeTab === 'products' && 'Product Management'}
            {activeTab === 'orders' && 'Order Management'}
            {activeTab === 'users' && 'User Management'}
            {activeTab === 'reports' && 'Reports & Analytics'}
          </h1>
        </header>
        
        <div className="content-body">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

// Reports Section Component
const ReportsSection = () => {
  return (
    <div className="reports-section">
      <div className="reports-header">
        <h2>Reports & Analytics</h2>
        <p>Generate detailed reports and view business analytics</p>
      </div>
      
      <div className="reports-grid">
        <div className="report-card">
          <div className="report-icon">📈</div>
          <div className="report-content">
            <h3>Sales Report</h3>
            <p>Generate comprehensive sales reports with revenue analysis</p>
            <button className="report-btn">Generate Sales Report</button>
          </div>
        </div>
        
        <div className="report-card">
          <div className="report-icon">👥</div>
          <div className="report-content">
            <h3>Customer Report</h3>
            <p>View customer demographics and behavior analysis</p>
            <button className="report-btn">Generate Customer Report</button>
          </div>
        </div>
        
        <div className="report-card">
          <div className="report-icon">🍦</div>
          <div className="report-content">
            <h3>Product Report</h3>
            <p>Analyze product performance and popularity</p>
            <button className="report-btn">Generate Product Report</button>
          </div>
        </div>
        
        <div className="report-card">
          <div className="report-icon">📊</div>
          <div className="report-content">
            <h3>Analytics Dashboard</h3>
            <p>View real-time analytics and business insights</p>
            <button className="report-btn">View Analytics</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 