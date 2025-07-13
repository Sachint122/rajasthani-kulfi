import React, { useState, useEffect } from 'react';
import './Overview.css';

const Overview = ({ onTabChange }) => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalRevenue: 0,
    totalUsers: 0,
    activeUsers: 0,
    totalProducts: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = sessionStorage.getItem('token');
      
      const response = await fetch('http://localhost:5000/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        // Try user stats as fallback for user counts
        try {
          const userStatsResponse = await fetch('http://localhost:5000/api/users/admin/stats', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (userStatsResponse.ok) {
            const userStatsData = await userStatsResponse.json();
            // Merge user stats with existing stats
            setStats(prevStats => ({
              ...prevStats,
              totalUsers: userStatsData.totalUsers || 0,
              activeUsers: userStatsData.activeUsers || 0
            }));
          }
        } catch (fallbackError) {
          console.error('Fallback stats error:', fallbackError);
        }
      }
    } catch (error) {
      console.error('Error fetching admin stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = (action) => {
    if (onTabChange) {
      onTabChange(action);
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="overview">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <h3>Total Orders</h3>
            <p className="stat-number">{stats.totalOrders}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <h3>Pending Orders</h3>
            <p className="stat-number">{stats.pendingOrders}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>Completed Orders</h3>
            <p className="stat-number">{stats.completedOrders}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>Total Revenue</h3>
            <p className="stat-number">₹{stats.totalRevenue}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>Total Users</h3>
            <p className="stat-number">{stats.totalUsers}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">🟢</div>
          <div className="stat-content">
            <h3>Active Users</h3>
            <p className="stat-number">{stats.activeUsers}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">🍦</div>
          <div className="stat-content">
            <h3>Total Products</h3>
            <p className="stat-number">{stats.totalProducts}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <h3>Conversion Rate</h3>
            <p className="stat-number">
              {stats.totalUsers > 0 ? Math.round((stats.totalOrders / stats.totalUsers) * 100) : 0}%
            </p>
          </div>
        </div>
      </div>

      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="actions-grid">
          <div className="action-card">
            <h3>➕ Add New Product</h3>
            <p>Create a new kulfi or ice cream product</p>
            <button 
              className="action-btn"
              onClick={() => handleQuickAction('products')}
            >
              ➕ Add Product
            </button>
          </div>
          
          <div className="action-card">
            <h3>📋 View Orders</h3>
            <p>Check and manage customer orders</p>
            <button 
              className="action-btn"
              onClick={() => handleQuickAction('orders')}
            >
              📋 View Orders
            </button>
          </div>
          
          <div className="action-card">
            <h3>👥 Manage Users</h3>
            <p>View and manage user accounts</p>
            <button 
              className="action-btn"
              onClick={() => handleQuickAction('users')}
            >
              👥 Manage Users
            </button>
          </div>
          
          <div className="action-card">
            <h3>📊 Generate Report</h3>
            <p>Create sales and analytics reports</p>
            <button 
              className="action-btn"
              onClick={() => handleQuickAction('reports')}
            >
              📊 Generate Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview; 