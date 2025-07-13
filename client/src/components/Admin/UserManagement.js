import React, { useState, useEffect, useCallback } from 'react';
import './UserManagement.css';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    adminUsers: 0,
    regularUsers: 0
  });
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [notification, setNotification] = useState({
    show: false,
    message: '',
    type: 'info'
  });

  const showNotification = useCallback((message, type = 'info') => {
    setNotification({
      show: true,
      message,
      type
    });
    setTimeout(() => setNotification({ show: false, message: '', type: 'info' }), 3000);
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const token = sessionStorage.getItem('token');
      
      const response = await fetch('http://localhost:5000/api/users/admin/all', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        const errorData = await response.json();
        showNotification(errorData.error || 'Error fetching users', 'error');
      }
    } catch (error) {
      console.error('Fetch users error:', error);
      showNotification('Error fetching users', 'error');
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  const fetchStats = useCallback(async () => {
    try {
      const token = sessionStorage.getItem('token');
      
      // Try both endpoints to see which one works
      const response = await fetch('http://localhost:5000/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        // Try the user stats endpoint as fallback
        const userStatsResponse = await fetch('http://localhost:5000/api/users/admin/stats', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (userStatsResponse.ok) {
          const userStatsData = await userStatsResponse.json();
          setStats(userStatsData);
        } else {
          const errorData = await userStatsResponse.json();
          console.error('User stats error response:', errorData);
        }
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, [fetchUsers, fetchStats]);

  const handleEditUser = (user) => {
    setEditingUser(user);
    setShowEditModal(true);
  };

  const handleUpdateUser = async (updatedData) => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/users/admin/${editingUser._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedData)
      });

      if (response.ok) {
        showNotification('User updated successfully', 'success');
        fetchUsers();
        setShowEditModal(false);
        setEditingUser(null);
      } else {
        const data = await response.json();
        showNotification(data.error || 'Error updating user', 'error');
      }
    } catch (error) {
      showNotification('Error updating user', 'error');
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to delete user "${userName}"?`)) {
      return;
    }

    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/users/admin/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        showNotification('User deleted successfully', 'success');
        fetchUsers();
        fetchStats();
      } else {
        const data = await response.json();
        showNotification(data.error || 'Error deleting user', 'error');
      }
    } catch (error) {
      showNotification('Error deleting user', 'error');
    }
  };

  const handleToggleStatus = async (userId) => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/users/admin/${userId}/toggle-status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        showNotification(data.message, 'success');
        fetchUsers();
        fetchStats();
      } else {
        const data = await response.json();
        showNotification(data.error || 'Error toggling user status', 'error');
      }
    } catch (error) {
      showNotification('Error toggling user status', 'error');
    }
  };

  if (loading) {
    return <div className="loading">Loading users...</div>;
  }

  return (
    <div className="user-management">
      {notification.show && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      <div className="user-stats">
        <div className="stat-card">
          <h3>Total Users</h3>
          <p>{stats.totalUsers}</p>
        </div>
        <div className="stat-card">
          <h3>Active Users</h3>
          <p>{stats.activeUsers}</p>
        </div>
        <div className="stat-card">
          <h3>Admin Users</h3>
          <p>{stats.adminUsers}</p>
        </div>
        <div className="stat-card">
          <h3>Regular Users</h3>
          <p>{stats.regularUsers}</p>
        </div>
      </div>

      <div className="users-table-container">
        <h2>User Management</h2>
        
        <table className="users-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Role</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user._id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.phone}</td>
                <td>
                  <span className={`role-badge ${user.role}`}>
                    {user.role}
                  </span>
                </td>
                <td>
                  <span className={`status-badge ${user.isActive ? 'active' : 'inactive'}`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                <td className="actions">
                  <button 
                    onClick={() => handleEditUser(user)}
                    className="btn-edit"
                    title="Edit User"
                  >
                    ✏️
                  </button>
                  <button 
                    onClick={() => handleToggleStatus(user._id)}
                    className={`btn-toggle ${user.isActive ? 'deactivate' : 'activate'}`}
                    title={user.isActive ? 'Deactivate' : 'Activate'}
                  >
                    {user.isActive ? '🚫' : '✅'}
                  </button>
                  <button 
                    onClick={() => handleDeleteUser(user._id, user.name)}
                    className="btn-delete"
                    title="Delete User"
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showEditModal && editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={() => {
            setShowEditModal(false);
            setEditingUser(null);
          }}
          onUpdate={handleUpdateUser}
        />
      )}
    </div>
  );
};

// Edit User Modal Component
const EditUserModal = ({ user, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    isActive: user.isActive
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(formData);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3>Edit User</h3>
          <button onClick={onClose} className="modal-close">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Role</label>
            <select name="role" value={formData.role} onChange={handleChange}>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
              />
              <span>Active Account</span>
            </label>
          </div>
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Update User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserManagement; 