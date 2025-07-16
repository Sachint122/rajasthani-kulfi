import React, { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:5000/api';

// Helper to title-case a string
const toTitleCase = str => str.replace(/\w\S*/g, w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ name: '', price: '', stock: '', category: '', unit: '' });
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [productNames, setProductNames] = useState([]);
  const [categories, setCategories] = useState([]); // [{name, units}]
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [newCategoryUnit, setNewCategoryUnit] = useState('');
  const [showProductNameForm, setShowProductNameForm] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [unitForms, setUnitForms] = useState({}); // { [categoryName]: { show: bool, value: string } }

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const getAuthHeaders = () => {
    const token = sessionStorage.getItem('token');
    return token ? { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` } : { 'Content-Type': 'application/json' };
  };

  // Fetch products, categories, and product names on mount
  useEffect(() => {
    fetchAll();
    fetchProductNames();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    setError('');
    try {
      const prodRes = await fetch(`${API_BASE}/products`);
      const prodData = await prodRes.json();
      setProducts(prodData);
      // setProductNames([...new Set(prodData.map(p => p.name))]); // This line is no longer needed as productNames are fetched from backend
      const catRes = await fetch(`${API_BASE}/categories`);
      const catData = await catRes.json();
      setCategories(catData); // [{name, units}]
    } catch (err) {
      setError('Failed to fetch data from server.');
    }
    setLoading(false);
  };

  // Fetch product names for selected category
  const fetchProductNames = async (category) => {
    try {
      let url = `${API_BASE}/products/names`;
      if (category) url += `?category=${encodeURIComponent(category)}`;
      const res = await fetch(url);
      const data = await res.json();
      setProductNames(data.map(n => n.name));
    } catch (err) {
      setProductNames([]);
    }
  };

  // When category changes in the product form, fetch product names for that category
  useEffect(() => {
    if (form.category) {
      fetchProductNames(form.category);
    } else {
      setProductNames([]);
    }
  }, [form.category]);

  // Product CRUD
  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const productData = { ...form, unit };
      productData.name = toTitleCase(productData.name);
      productData.category = toTitleCase(productData.category);
      productData.unit = toTitleCase(productData.unit);
      if (editingId) {
        await fetch(`${API_BASE}/products/${editingId}`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify(productData),
        });
      } else {
        await fetch(`${API_BASE}/products`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(productData),
        });
      }
      setForm({ name: '', price: '', stock: '', category: '', unit: '' });
      setShowForm(false);
      setEditingId(null);
      await fetchAll();
    } catch (err) {
      setError('Failed to save product.');
    }
    setLoading(false);
  };

  const handleEdit = p => {
    setForm({ name: p.name, price: p.price, stock: p.stock, category: p.category, unit: p.unit || '' });
    setEditingId(p._id);
    setShowForm(true);
    setShowCategoryForm(false);
    setShowProductNameForm(false);
  };

  const handleDelete = async id => {
    setLoading(true);
    setError('');
    try {
      await fetch(`${API_BASE}/products/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
      await fetchAll();
    } catch (err) {
      setError('Failed to delete product.');
    }
    setLoading(false);
  };

  const handleAddClick = () => {
    setForm({ name: '', price: '', stock: '', category: '', unit: '' });
    setEditingId(null);
    setShowForm(true);
    setShowCategoryForm(false);
    setShowProductNameForm(false);
  };

  // Category CRUD
  const handleAddCategory = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await fetch(`${API_BASE}/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: toTitleCase(newCategory), unit: toTitleCase(newCategoryUnit) }),
      });
      setNewCategory('');
      setNewCategoryUnit('');
      setShowCategoryForm(false);
      await fetchAll();
      if (showForm) setForm(f => ({ ...f, category: toTitleCase(newCategory) }));
    } catch (err) {
      setError('Failed to add category.');
    }
    setLoading(false);
  };
  const handleRemoveCategory = async cat => {
    setLoading(true);
    setError('');
    try {
      const catRes = await fetch(`${API_BASE}/categories`);
      const catData = await catRes.json();
      const found = catData.find(c => c.name === cat);
      if (found) {
        await fetch(`${API_BASE}/categories/${found._id}`, { method: 'DELETE' });
        await fetchAll();
        setForm(f => f.category === cat ? { ...f, category: '' } : f);
      }
    } catch (err) {
      setError('Failed to delete category.');
    }
    setLoading(false);
  };
  const openCategoryForm = () => {
    setShowCategoryForm(true);
    setShowForm(false);
    setShowProductNameForm(false);
  };

  // Unit management per category
  const openUnitForm = catName => {
    setUnitForms(prev => ({ ...prev, [catName]: { show: true, value: '' } }));
  };
  const closeUnitForm = catName => {
    setUnitForms(prev => ({ ...prev, [catName]: { show: false, value: '' } }));
  };
  const handleUnitInputChange = (catName, value) => {
    setUnitForms(prev => ({ ...prev, [catName]: { ...prev[catName], value } }));
  };
  const handleAddUnit = async (catName) => {
    const cat = categories.find(c => c.name === catName);
    const value = (unitForms[catName] && unitForms[catName].value) || '';
    if (!cat || !value) return;
    setLoading(true);
    setError('');
    try {
      await fetch(`${API_BASE}/categories/${cat._id}/units`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ unit: toTitleCase(value) }),
      });
      await fetchAll();
      closeUnitForm(catName);
    } catch (err) {
      setError('Failed to add unit.');
    }
    setLoading(false);
  };
  const handleRemoveUnit = async (catName, unit) => {
    const cat = categories.find(c => c.name === catName);
    if (!cat) return;
    setLoading(true);
    setError('');
    try {
      await fetch(`${API_BASE}/categories/${cat._id}/units`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ unit: toTitleCase(unit) }),
      });
      await fetchAll();
    } catch (err) {
      setError('Failed to delete unit.');
    }
    setLoading(false);
  };

  // Product name management (persistent)
  const [newProductNameCategory, setNewProductNameCategory] = useState('');
  const handleAddProductName = async e => {
    e.preventDefault();
    if (!newProductName || !newProductNameCategory) return;
    setLoading(true);
    setError('');
    try {
      const token = sessionStorage.getItem('token');
      await fetch(`${API_BASE}/products/names`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ name: toTitleCase(newProductName), category: toTitleCase(newProductNameCategory) }),
      });
      setNewProductName('');
      setShowProductNameForm(false);
      await fetchProductNames(form.category);
    } catch (err) {
      setError('Failed to add product name.');
    }
    setLoading(false);
  };
  const handleRemoveProductName = async name => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/products/names`, { method: 'GET' });
      const data = await res.json();
      const found = data.find(n => n.name === name);
      if (found) {
        const token = sessionStorage.getItem('token');
        await fetch(`${API_BASE}/products/names/${found._id}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        });
        await fetchProductNames();
      }
      setForm(f => f.name === name ? { ...f, name: '' } : f);
    } catch (err) {
      setError('Failed to delete product name.');
    }
    setLoading(false);
  };
  const openProductNameForm = () => {
    setShowProductNameForm(true);
    setShowForm(false);
    setShowCategoryForm(false);
  };

  // Get units for selected category
  const selectedCategory = categories.find(c => c.name === form.category);
  const unit = selectedCategory ? selectedCategory.unit : '';

  return (
    <div>
      <h2 style={{ color: '#ff8800', marginBottom: '1rem' }}>Product Management</h2>
      {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}
      {loading && <div style={{ color: '#888', marginBottom: '1rem' }}>Loading...</div>}
      <button onClick={handleAddClick} style={{ background: '#ff8800', color: '#fff', border: 'none', padding: '0.5rem 1.5rem', borderRadius: '4px', fontWeight: 600, marginBottom: '1.5rem' }}>Add Product</button>
      <button onClick={openCategoryForm} style={{ background: '#2ecc40', color: '#fff', border: 'none', padding: '0.5rem 1.5rem', borderRadius: '4px', fontWeight: 600, marginLeft: '1rem', marginBottom: '1.5rem' }}>Add Category/Type</button>
      <button onClick={openProductNameForm} style={{ background: '#1976d2', color: '#fff', border: 'none', padding: '0.5rem 1.5rem', borderRadius: '4px', fontWeight: 600, marginLeft: '1rem', marginBottom: '1.5rem' }}>Add Product Name</button>
      {/* Category management area */}
      <div style={{ margin: '1rem 0', display: 'flex', gap: '2rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Categories/Types:</div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {categories.map(cat => (
              <span key={cat.name} style={{ background: '#eee', padding: '0.3rem 0.8rem', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                {cat.name}
                <button onClick={() => handleRemoveCategory(cat.name)} style={{ background: '#ff8800', color: '#fff', border: 'none', borderRadius: '50%', width: '1.5em', height: '1.5em', fontWeight: 700, cursor: 'pointer', marginLeft: '0.3rem' }}>×</button>
                {/* Unit management for this category */}
                <span style={{ marginLeft: '0.5em', display: 'flex', alignItems: 'center', gap: '0.3em' }}>
                  {cat.units && cat.units.map(unit => (
                    <span key={unit} style={{ background: '#2ecc40', color: '#fff', borderRadius: '2em', padding: '0.1em 0.7em', marginRight: '0.2em', display: 'inline-flex', alignItems: 'center' }}>
                      {unit}
                      <button onClick={() => handleRemoveUnit(cat.name, unit)} style={{ background: '#ff8800', color: '#fff', border: 'none', borderRadius: '50%', width: '1.2em', height: '1.2em', fontWeight: 700, cursor: 'pointer', marginLeft: '0.2em', fontSize: '0.9em' }}>×</button>
                    </span>
                  ))}
                  {unitForms[cat.name]?.show ? (
                    <>
                      <input value={unitForms[cat.name].value} onChange={e => handleUnitInputChange(cat.name, e.target.value)} placeholder="New Unit" style={{ padding: '0.2em 0.5em', minWidth: '70px' }} />
                      <button onClick={() => handleAddUnit(cat.name)} style={{ background: '#2ecc40', color: '#fff', border: 'none', borderRadius: '4px', padding: '0.2em 0.7em', fontWeight: 600, marginLeft: '0.2em' }}>Add</button>
                      <button onClick={() => closeUnitForm(cat.name)} style={{ background: '#888', color: '#fff', border: 'none', borderRadius: '4px', padding: '0.2em 0.7em', fontWeight: 600, marginLeft: '0.2em' }}>Cancel</button>
                    </>
                  ) : (
                    <button onClick={() => openUnitForm(cat.name)} style={{ background: '#2ecc40', color: '#fff', border: 'none', borderRadius: '4px', padding: '0.2em 0.7em', fontWeight: 600, marginLeft: '0.2em' }}>+ Unit</button>
                  )}
                </span>
              </span>
            ))}
          </div>
          {showCategoryForm && (
            <form onSubmit={handleAddCategory} style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-start' }}>
              <input value={newCategory} onChange={e => setNewCategory(e.target.value)} placeholder="New Category/Type" required style={{ padding: '0.5rem', minWidth: '120px' }} />
              <input value={newCategoryUnit} onChange={e => setNewCategoryUnit(e.target.value)} placeholder="Unit (e.g. per unit, kg)" required style={{ padding: '0.5rem', minWidth: '120px' }} />
              <button type="submit" style={{ background: '#ff8800', color: '#fff', border: 'none', padding: '0.3rem 1rem', borderRadius: '4px', fontWeight: 600 }}>Add Category</button>
              <button type="button" onClick={() => { setShowCategoryForm(false); setNewCategory(''); setNewCategoryUnit(''); }} style={{ background: '#888', color: '#fff', border: 'none', padding: '0.3rem 1rem', borderRadius: '4px', fontWeight: 600 }}>Cancel</button>
            </form>
          )}
        </div>
        {/* Product name management area (local only) */}
        <div>
          <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Product Names:</div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {productNames.map(name => (
              <span key={name} style={{ background: '#eee', padding: '0.3rem 0.8rem', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                {name}
                <button onClick={() => handleRemoveProductName(name)} style={{ background: '#1976d2', color: '#fff', border: 'none', borderRadius: '50%', width: '1.5em', height: '1.5em', fontWeight: 700, cursor: 'pointer', marginLeft: '0.3rem' }}>×</button>
              </span>
            ))}
          </div>
          {showProductNameForm && (
            <form onSubmit={handleAddProductName} style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <select value={newProductNameCategory} onChange={e => setNewProductNameCategory(e.target.value)} required style={{ padding: '0.5rem', minWidth: '120px' }}>
                <option value="">Select Category</option>
                {categories.map(cat => <option key={cat.name} value={cat.name}>{cat.name}</option>)}
              </select>
              <input value={newProductName} onChange={e => setNewProductName(e.target.value)} placeholder="New Product Name" required style={{ padding: '0.5rem', minWidth: '120px' }} />
              <button type="submit" style={{ background: '#1976d2', color: '#fff', border: 'none', padding: '0.3rem 1rem', borderRadius: '4px', fontWeight: 600 }}>Add</button>
              <button type="button" onClick={() => { setShowProductNameForm(false); setNewProductName(''); setNewProductNameCategory(''); }} style={{ background: '#888', color: '#fff', border: 'none', padding: '0.3rem 1rem', borderRadius: '4px', fontWeight: 600 }}>Cancel</button>
            </form>
          )}
        </div>
      </div>
      {showForm && (
        <form onSubmit={handleSubmit} style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <select name="name" value={form.name} onChange={handleChange} required style={{ padding: '0.5rem', minWidth: '160px' }}>
            <option value="">Select Product Name</option>
            {productNames.map(name => <option key={name} value={name}>{name}</option>)}
          </select>
          <input name="price" value={form.price} onChange={handleChange} placeholder="Price" type="number" required style={{ padding: '0.5rem', minWidth: '100px' }} />
          <input name="stock" value={form.stock} onChange={handleChange} placeholder="Stock" type="number" required style={{ padding: '0.5rem', minWidth: '100px' }} />
          <select name="category" value={form.category} onChange={handleChange} required style={{ padding: '0.5rem', minWidth: '140px' }}>
            <option value="">Select Category/Type</option>
            {categories.map(cat => <option key={cat.name} value={cat.name}>{cat.name}</option>)}
          </select>
          {/* Show unit as read-only */}
          <input name="unit" value={unit} readOnly placeholder="Unit" style={{ padding: '0.5rem', minWidth: '100px', background: '#f5f5f5', color: '#888' }} />
          <button type="submit" style={{ background: '#ff8800', color: '#fff', border: 'none', padding: '0.5rem 1.5rem', borderRadius: '4px', fontWeight: 600 }}>{editingId ? 'Update' : 'Add'}</button>
          <button type="button" onClick={() => { setShowForm(false); setEditingId(null); setForm({ name: '', price: '', stock: '', category: '', unit: '' }); }} style={{ background: '#888', color: '#fff', border: 'none', padding: '0.5rem 1.5rem', borderRadius: '4px', fontWeight: 600 }}>Cancel</button>
        </form>
      )}
      <table style={{
        borderTop: '3px solid #ff8800',
        borderBottom: '3px solid #ff8800',
        textAlign:'left',
        width: '100%',
        background: '#fff',
        borderRadius: '16px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
        overflow: 'hidden',
        marginTop: '2rem',
        borderCollapse: 'separate',
        borderSpacing: 0,
        border: '3px solid #ff8800',
      }}>
        <thead style={{ background: '#ff8800', color: '#fff', fontWeight: 700, position: 'sticky', top: 0, zIndex: 1 }}>
          <tr>
            <th style={{ padding: '1rem', borderRight: '2px solid #ffd699' }}>Name</th>
            <th style={{ padding: '1rem', borderRight: '2px solid #ffd699' }}>Price</th>
            <th style={{ padding: '1rem', borderRight: '2px solid #ffd699' }}>Stock</th>
            <th style={{ padding: '1rem', borderRight: '2px solid #ffd699' }}>Category/Type</th>
            <th style={{ padding: '1rem', borderRight: '2px solid #ffd699' }}>Unit</th>
            <th style={{ padding: '1rem' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p, idx) => (
            <tr key={p._id || p.id}
              style={{
                background: idx % 2 === 0 ? '#f8f9fa' : '#fff',
                transition: 'background 0.2s',
                cursor: 'pointer',
              }}
              onMouseOver={e => e.currentTarget.style.background = '#ffe0b2'}
              onMouseOut={e => e.currentTarget.style.background = idx % 2 === 0 ? '#f8f9fa' : '#fff'}
            >
              <td style={{ padding: '1rem', fontWeight: 500, borderRight: '2px solid #ffd699', borderBottom: idx !== products.length - 1 ? '3px solid #ff8800' : 'none' }}>{p.name}</td>
              <td style={{ padding: '1rem', borderRight: '2px solid #ffd699', borderBottom: idx !== products.length - 1 ? '3px solid #ff8800' : 'none' }}>₹{p.price}</td>
              <td style={{ padding: '1rem', borderRight: '2px solid #ffd699', borderBottom: idx !== products.length - 1 ? '3px solid #ff8800' : 'none' }}>{p.stock}</td>
              <td style={{ padding: '1rem', borderRight: '2px solid #ffd699', borderBottom: idx !== products.length - 1 ? '3px solid #ff8800' : 'none' }}>{p.category}</td>
              <td style={{ padding: '1rem', borderRight: '2px solid #ffd699', borderBottom: idx !== products.length - 1 ? '3px solid #ff8800' : 'none' }}>{p.unit || '-'}</td>
              <td style={{ padding: '1rem', borderBottom: idx !== products.length - 1 ? '3px solid #ff8800' : 'none' }}>
                <button onClick={() => handleEdit(p)} style={{ marginRight: '0.5rem', background: '#2ecc40', color: '#fff', border: 'none', padding: '0.3rem 0.8rem', borderRadius: '4px' }}>Edit</button>
                <button onClick={() => handleDelete(p._id || p.id)} style={{ background: '#ff8800', color: '#fff', border: 'none', padding: '0.3rem 0.8rem', borderRadius: '4px' }}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductManagement; 