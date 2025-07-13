import React, { useState, useEffect, useCallback } from 'react';
import './ProductManagement.css';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
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

  const fetchProducts = useCallback(async () => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/products', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      showNotification('Error fetching products', 'error');
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleAddProduct = async (productData) => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(productData)
      });

      if (response.ok) {
        showNotification('Product added successfully', 'success');
        fetchProducts();
        setShowAddModal(false);
      } else {
        const data = await response.json();
        showNotification(data.error || 'Error adding product', 'error');
      }
    } catch (error) {
      showNotification('Error adding product', 'error');
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setShowEditModal(true);
  };

  const handleUpdateProduct = async (updatedData) => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/products/${editingProduct._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedData)
      });

      if (response.ok) {
        showNotification('Product updated successfully', 'success');
        fetchProducts();
        setShowEditModal(false);
        setEditingProduct(null);
      } else {
        const data = await response.json();
        showNotification(data.error || 'Error updating product', 'error');
      }
    } catch (error) {
      showNotification('Error updating product', 'error');
    }
  };

  const handleDeleteProduct = async (productId, productName) => {
    if (!window.confirm(`Are you sure you want to delete "${productName}"?`)) {
      return;
    }

    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        showNotification('Product deleted successfully', 'success');
        fetchProducts();
      } else {
        const data = await response.json();
        showNotification(data.error || 'Error deleting product', 'error');
      }
    } catch (error) {
      showNotification('Error deleting product', 'error');
    }
  };

  if (loading) {
    return <div className="loading">Loading products...</div>;
  }

  return (
    <div className="product-management">
      {notification.show && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      <div className="product-header">
        <h2>Product Management</h2>
        <button 
          className="btn-add-product"
          onClick={() => setShowAddModal(true)}
        >
          ➕ Add New Product
        </button>
      </div>

      <div className="products-grid">
        {products.map(product => (
          <div key={product._id} className="product-card">
            <div className="product-image">
              <img src={product.image} alt={product.name} />
              <div className={`status-badge ${product.isAvailable ? 'available' : 'unavailable'}`}>
                {product.isAvailable ? 'Available' : 'Unavailable'}
              </div>
            </div>
            <div className="product-info">
              <h3>{product.name}</h3>
              <p className="product-description">{product.description}</p>
              <div className="product-details">
                <span className="product-category">{product.category}</span>
                <span className="product-price">₹{product.price}</span>
              </div>
            </div>
            <div className="product-actions">
              <button 
                onClick={() => handleEditProduct(product)}
                className="btn-edit"
                title="Edit Product"
              >
                ✏️
              </button>
              <button 
                onClick={() => handleDeleteProduct(product._id, product.name)}
                className="btn-delete"
                title="Delete Product"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>

      {showAddModal && (
        <ProductModal
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddProduct}
          title="Add New Product"
        />
      )}

      {showEditModal && editingProduct && (
        <ProductModal
          product={editingProduct}
          onClose={() => {
            setShowEditModal(false);
            setEditingProduct(null);
          }}
          onSubmit={handleUpdateProduct}
          title="Edit Product"
        />
      )}
    </div>
  );
};

// Product Modal Component
const ProductModal = ({ product, onClose, onSubmit, title }) => {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price || '',
    category: product?.category || 'kulfi',
    image: product?.image || '',
    isAvailable: product?.isAvailable ?? true
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
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
          <h3>{title}</h3>
          <button onClick={onClose} className="modal-close">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Product Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows="3"
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Price (₹)</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
              />
            </div>
            <div className="form-group">
              <label>Category</label>
              <select name="category" value={formData.category} onChange={handleChange}>
                <option value="kulfi">Kulfi</option>
                <option value="ice-cream">Ice Cream</option>
                <option value="milkshake">Milkshake</option>
                <option value="dessert">Dessert</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Image URL</label>
            <input
              type="url"
              name="image"
              value={formData.image}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="isAvailable"
                checked={formData.isAvailable}
                onChange={handleChange}
              />
              <span>Available for Order</span>
            </label>
          </div>
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {product ? 'Update Product' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductManagement; 