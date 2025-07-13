import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './UserDashboard.css';

const UserDashboard = () => {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [showPhoneUpdate, setShowPhoneUpdate] = useState(false);
  const [newPhone, setNewPhone] = useState('');
  const [updatingPhone, setUpdatingPhone] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = sessionStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      console.log('User data from sessionStorage:', parsedUser);
      setUser(parsedUser);
      // Fetch fresh user data from backend to ensure we have complete information
      fetchCurrentUser();
    } else {
      navigate('/login');
    }
    fetchProducts();
    fetchOrders();
  }, [navigate]);

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/products');
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchOrders = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/orders/my-orders', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const userData = await response.json();
        console.log('Current user data from API:', userData);
        // Update user state with complete data from backend
        const updatedUser = {
          id: userData.id || userData._id,
          name: userData.name,
          email: userData.email,
          phone: userData.phone || 'Not provided',
          role: userData.role
        };
        setUser(updatedUser);
        sessionStorage.setItem('user', JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  };

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.product._id === product._id);
    if (existingItem) {
      setCart(cart.map(item => 
        item.product._id === product._id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.product._id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      setCart(cart.map(item => 
        item.product._id === productId 
          ? { ...item, quantity }
          : item
      ));
    }
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  const handleLogout = () => {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        window.location.href = '/';
  };

  const handleUpdatePhone = async () => {
    if (!newPhone.trim()) {
      alert('Please enter a valid phone number');
      return;
    }

    setUpdatingPhone(true);
    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/users/update-phone', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ phone: newPhone })
      });

      if (response.ok) {
        const data = await response.json();
        // Update local user state and session storage
        setUser(data.user);
        sessionStorage.setItem('user', JSON.stringify(data.user));
        setShowPhoneUpdate(false);
        setNewPhone('');
        alert('Phone number updated successfully!');
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to update phone number');
      }
    } catch (error) {
      console.error('Error updating phone number:', error);
      alert('Failed to update phone number');
    } finally {
      setUpdatingPhone(false);
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="user-dashboard">
      <div className="user-sidebar">
        <div className="user-header">
          <h2>Welcome, {user.name}!</h2>
          <p>Shree Ram Rajasthan Kulfi House</p>
        </div>
        
        <nav className="user-nav">
          <button 
            className={`nav-item ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            🍦 Products
          </button>
          <button 
            className={`nav-item ${activeTab === 'cart' ? 'active' : ''}`}
            onClick={() => setActiveTab('cart')}
          >
            🛒 Cart ({cart.length})
          </button>
          <button 
            className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            📋 My Orders
          </button>
          <button 
            className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            👤 Profile
          </button>
        </nav>

        <div className="user-footer">
          <button 
            onClick={() => window.location.href = '/'}
            className="home-btn"
            title="Go to Home Page"
          >
            🏠 Go to Home
          </button>
          <button onClick={handleLogout} className="logout-btn">
            🚪 Logout
          </button>
        </div>
      </div>

      <div className="user-content">
        {activeTab === 'products' && (
          <div className="products-section">
            <h2>Our Delicious Products</h2>
            <div className="products-grid">
              {products.map(product => (
                <div key={product._id} className="product-card">
                  <div className="product-image">
                    <span>🍦</span>
                  </div>
                  <div className="product-info">
                    <h3>{product.name}</h3>
                    <p>{product.description}</p>
                    <div className="product-price">₹{product.price}</div>
                    <button 
                      onClick={() => addToCart(product)}
                      className="btn btn-primary"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'cart' && (
          <div className="cart-section">
            <h2>Shopping Cart</h2>
            {cart.length === 0 ? (
              <p>Your cart is empty. Add some delicious kulfi!</p>
            ) : (
              <div className="cart-items">
                {cart.map(item => (
                  <div key={item.product._id} className="cart-item">
                    <div className="item-info">
                      <h3>{item.product.name}</h3>
                      <p>₹{item.product.price}</p>
                    </div>
                    <div className="item-quantity">
                      <button onClick={() => updateQuantity(item.product._id, item.quantity - 1)}>-</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.product._id, item.quantity + 1)}>+</button>
                    </div>
                    <div className="item-total">₹{item.product.price * item.quantity}</div>
                    <button 
                      onClick={() => removeFromCart(item.product._id)}
                      className="remove-btn"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <div className="cart-total">
                  <h3>Total: ₹{getCartTotal()}</h3>
                  <button className="btn btn-primary">Place Order</button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="orders-section">
            <h2>My Orders</h2>
            {orders.length === 0 ? (
              <p>No orders yet. Start shopping!</p>
            ) : (
              <div className="orders-list">
                {orders.map(order => (
                  <div key={order._id} className="order-card">
                    <div className="order-header">
                      <h3>Order #{order.orderNumber}</h3>
                      <span className={`status ${order.status}`}>{order.status}</span>
                    </div>
                    <div className="order-items">
                      {order.items.map(item => (
                        <div key={item._id} className="order-item">
                          <span>{item.product.name}</span>
                          <span>x{item.quantity}</span>
                          <span>₹{item.price}</span>
                        </div>
                      ))}
                    </div>
                    <div className="order-total">
                      <strong>Total: ₹{order.totalAmount}</strong>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="profile-section">
            <div className="profile-header">
              <h2>My Profile</h2>
            </div>
            <div className="profile-info">
              <div className="info-item">
                <label>User ID:</label>
                <span>{user.id || 'N/A'}</span>
              </div>
              <div className="info-item">
                <label>Name:</label>
                <span>{user.name || 'N/A'}</span>
              </div>
              <div className="info-item">
                <label>Email:</label>
                <span>{user.email || 'N/A'}</span>
              </div>
              <div className="info-item">
                <label>Phone:</label>
                <div className="phone-section">
                  <span>{user.phone || 'N/A'}</span>
                  {(user.phone === 'Not provided' || !user.phone || user.phone === 'N/A') && (
                    <button 
                      onClick={() => setShowPhoneUpdate(true)}
                      className="btn btn-secondary update-phone-btn"
                    >
                      Add Phone
                    </button>
                  )}
                </div>
              </div>
              <div className="info-item">
                <label>Account Type:</label>
                <span className={`role-badge ${user.role}`}>{user.role || 'N/A'}</span>
              </div>
              <div className="info-item">
                <label>Total Orders:</label>
                <span>{orders.length}</span>
              </div>
              <div className="info-item">
                <label>Cart Items:</label>
                <span>{cart.length}</span>
              </div>
            </div>

            {showPhoneUpdate && (
              <div className="phone-update-modal">
                <div className="modal-content">
                  <h3>Update Phone Number</h3>
                  <input
                    type="tel"
                    placeholder="Enter your phone number"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="phone-input"
                  />
                  <div className="modal-buttons">
                    <button 
                      onClick={handleUpdatePhone}
                      disabled={updatingPhone}
                      className="btn btn-primary"
                    >
                      {updatingPhone ? 'Updating...' : 'Update Phone'}
                    </button>
                    <button 
                      onClick={() => {
                        setShowPhoneUpdate(false);
                        setNewPhone('');
                      }}
                      className="btn btn-secondary"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard; 