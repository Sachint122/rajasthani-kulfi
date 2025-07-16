import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';

const API_BASE = 'http://localhost:5000/api';

const SalesManagement = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [sales, setSales] = useState([]);
  const [form, setForm] = useState({
    category: '',
    productName: '',
    productId: '',
    quantity: '',
    customerName: '',
    customerPhone: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const getAuthHeaders = () => {
    const token = sessionStorage.getItem('token');
    return token ? { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` } : { 'Content-Type': 'application/json' };
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_BASE}/categories`);
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      setCategories([]);
    }
  };

  // Fetch all products (for stock, price, etc.)
  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_BASE}/products`);
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      setProducts([]);
    }
  };

  // Fetch users (customers)
  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_BASE}/users`, { headers: getAuthHeaders() });
      const data = await res.json();
      setUsers(data.filter(u => u.role !== 'admin'));
    } catch (err) {
      setUsers([]);
    }
  };

  // Fetch sales
  const fetchSales = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/sales`, { headers: getAuthHeaders() });
      const data = await res.json();
      setSales(data);
    } catch (err) {
      setError('Failed to fetch sales.');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
    fetchProducts();
    fetchUsers();
    fetchSales();
  }, []); // Only run once on mount

  // When category changes, fetch product names
  // Removed useEffect for productNames

  // When product name changes, set productId
  useEffect(() => {
    if (form.productName && form.category) {
      const prod = products.find(
        p =>
          p.name.trim().toLowerCase() === form.productName.trim().toLowerCase() &&
          p.category.trim().toLowerCase() === form.category.trim().toLowerCase()
      );
      setForm(f => ({ ...f, productId: prod ? prod._id : '' }));
    } else {
      setForm(f => ({ ...f, productId: '' }));
    }
  }, [form.productName, form.category, products]);

  // When customer name changes, auto-fill phone
  useEffect(() => {
    if (form.customerName) {
      const user = users.find(u => u.name === form.customerName);
      setForm(f => ({ ...f, customerPhone: user ? user.phone : '' }));
    } else {
      setForm(f => ({ ...f, customerPhone: '' }));
    }
  }, [form.customerName, users]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    if (!form.productId || !form.quantity || Number(form.quantity) < 1) {
      setError('Please select a valid product and enter a valid quantity.');
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/sales`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          productId: form.productId,
          quantity: Number(form.quantity),
          customerName: form.customerName,
          customerPhone: form.customerPhone,
          date: new Date().toISOString(),
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to record sale.');
      } else {
        setSuccess('Sale recorded successfully!');
        setForm({
          category: '',
          productName: '',
          productId: '',
          quantity: '',
          customerName: '',
          customerPhone: '',
        });
        await fetchProducts(); // update stock
        await fetchSales();
      }
    } catch (err) {
      setError('Failed to record sale.');
    }
    setLoading(false);
  };

  const selectedProduct = products.find(p => p._id === form.productId);

  // Handler for sending PDF to WhatsApp (placeholder)
  const handleSendPdf = (sale) => {
    const customerSales = sales.filter(s => s.customerPhone === sale.customerPhone);
    const lastTotalBookValue = customerSales
      .filter(s => s._id !== sale._id)
      .reduce((acc, s) => acc + (s.total || 0), 0);
    const lastValueCompleted = lastTotalBookValue === 0;

    const doc = new jsPDF();
    // --- HEADER ---
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(32);
    doc.text('INVOICE', 14, 36);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.text('Date:', 14, 46);
    doc.setFont('helvetica', 'bold');
    doc.text(`${new Date(sale.date).toLocaleDateString()}`, 30, 46);
    doc.setFont('helvetica', 'normal');

    // --- BILL TO / FROM ---
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Billed to:', 14, 56);
    doc.text('From:', 110, 56);
    doc.setFont('helvetica', 'normal');
    doc.text(`${sale.customerName || 'N/A'}`, 14, 62);
    doc.text(`${sale.customerPhone || ''}`, 14, 68);
    doc.text('Shree Ram Rajasthan Kulfi House', 110, 62);
    doc.text('KareliBagh, Vadodara ,Gujarat', 110, 68);
    doc.text('Phone: +918733888407', 110, 74);

    // --- TABLE HEADER ---
    let y = 90;
    doc.setFillColor(240, 240, 240);
    doc.rect(14, y, 182, 10, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Item', 18, y + 7);
    doc.text('Quantity', 80, y + 7);
    doc.text('Price', 120, y + 7);
    doc.text('Amount', 170, y + 7);

    // Add more vertical space before product row
    y += 14;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.text(`${sale.productName}`, 18, y);
    doc.text(`${sale.quantity}`, 85, y, { align: 'right' });
    doc.text(`${sale.price}`, 125, y, { align: 'right' });
    doc.text(`${sale.total}`, 175, y, { align: 'right' });
    // Draw horizontal line under product row
    y += 4;
    doc.setDrawColor(200, 200, 200);
    doc.line(14, y, 196, y);

    // --- TOTAL ROW ---
    y += 8;
    doc.setFont('helvetica', 'bold');
    doc.text('Total', 120, y);
    doc.text(`${sale.total}`, 175, y, { align: 'right' });

    // --- PAYMENT METHOD & NOTE ---
    y += 14;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    y += 8;
    doc.setFont('helvetica', 'bold');
    doc.text('Note:', 14, y);
    doc.setFont('helvetica', 'normal');
    doc.text('Thank you for choosing us!', 32, y);

    // --- LAST VALUE STATUS ---
    y += 12;
    doc.setFont('helvetica', 'bold');
    doc.text('Last Total Book Value:', 14, y);
    doc.setFont('helvetica', 'normal');
    doc.text(`${lastTotalBookValue}`, 70, y);
    y += 8;
    doc.setFont('helvetica', 'bold');
    doc.text('Last Value Status:', 14, y);
    if (lastValueCompleted) {
      doc.setTextColor(56, 142, 60);
      doc.text('Completed', 60, y);
    } else {
      doc.setTextColor(255, 136, 0);
      doc.text('Not Completed', 60, y);
    }
    doc.setTextColor(0, 0, 0);

    // --- WAVY FOOTER ---
    doc.setFillColor(220, 220, 220);
    doc.ellipse(105, 295, 120, 20, 'F');
    doc.setFillColor(56, 142, 60);
    doc.ellipse(105, 305, 120, 20, 'F');
    doc.setFillColor(255, 136, 0);
    doc.ellipse(105, 315, 120, 20, 'F');

    doc.save(`Bill_${sale.customerName || 'Customer'}_${sale._id}.pdf`);
  };

  return (
    <div>
      <h2 style={{ color: '#ff8800', marginBottom: '1rem' }}>Sales Management</h2>
      {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}
      {success && <div style={{ color: 'green', marginBottom: '1rem' }}>{success}</div>}
      <form onSubmit={handleSubmit} style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <select name="category" value={form.category} onChange={handleChange} required style={{ padding: '0.5rem', minWidth: '140px' }}>
          <option value="">Select Category</option>
          {categories.map(c => (
            <option key={c._id} value={c.name}>{c.name}</option>
          ))}
        </select>
        <select
          name="productName"
          value={form.productName}
          onChange={handleChange}
          required
          style={{ padding: '0.5rem', minWidth: '180px' }}
          disabled={!form.category}
        >
          <option value="">{form.category ? 'Select Product Name' : 'Select Category First'}</option>
          {products
            .filter(p => p.category && p.category.trim().toLowerCase() === form.category.trim().toLowerCase())
            .map(p => p.name)
            .filter((name, idx, arr) => arr.indexOf(name) === idx) // unique names
            .map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
        </select>
        <input
          name="quantity"
          value={form.quantity}
          onChange={handleChange}
          placeholder="Quantity"
          type="number"
          min="1"
          max={selectedProduct ? selectedProduct.stock : undefined}
          required
          style={{ padding: '0.5rem', minWidth: '100px' }}
        />
        <select
          name="customerName"
          value={form.customerName}
          onChange={handleChange}
          style={{ padding: '0.5rem', minWidth: '160px' }}
        >
          <option value="">Select Customer (optional)</option>
          {users.map(u => (
            <option key={u._id || u.id} value={u.name}>{u.name}</option>
          ))}
        </select>
        <input
          name="customerPhone"
          value={form.customerPhone}
          onChange={handleChange}
          placeholder="Customer Phone (optional)"
          style={{ padding: '0.5rem', minWidth: '160px' }}
          readOnly={!!form.customerName}
        />
        <button type="submit" style={{ background: '#ff8800', color: '#fff', border: 'none', padding: '0.5rem 1.5rem', borderRadius: '4px', fontWeight: 600 }}
          disabled={loading || !form.productId || !form.quantity || Number(form.quantity) < 1}>
          {loading ? 'Saving...' : 'Record Sale'}
        </button>
      </form>
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
        <thead style={{
          background: '#ff8800',
          color: '#fff',
          fontWeight: 700,
          position: 'sticky',
          top: 0,
          zIndex: 1,
        }}>
          <tr>
            <th style={{ padding: '1rem', borderRight: '2px solid #ffd699' }}>Product Name</th>
            <th style={{ padding: '1rem', borderRight: '2px solid #ffd699' }}>Price</th>
            <th style={{ padding: '1rem', borderRight: '2px solid #ffd699' }}>Unit</th>
            <th style={{ padding: '1rem', borderRight: '2px solid #ffd699' }}>Quantity</th>
            <th style={{ padding: '1rem', borderRight: '2px solid #ffd699' }}>Total</th>
            <th style={{ padding: '1rem', borderRight: '2px solid #ffd699' }}>Customer Phone</th>
            <th style={{ padding: '1rem' }}>Send PDF</th>
          </tr>
        </thead>
        <tbody>
          {sales.map((s, idx) => (
            <tr key={s._id}
              style={{
                background: idx % 2 === 0 ? '#f8f9fa' : '#fff',
                transition: 'background 0.2s',
                cursor: 'pointer',
              }}
              onMouseOver={e => e.currentTarget.style.background = '#ffe0b2'}
              onMouseOut={e => e.currentTarget.style.background = idx % 2 === 0 ? '#f8f9fa' : '#fff'}
            >
              <td style={{ padding: '1rem', fontWeight: 500, borderRight: '2px solid #ffd699', borderBottom: idx !== sales.length - 1 ? '3px solid #ff8800' : 'none' }}>{s.productName}</td>
              <td style={{ padding: '1rem', borderRight: '2px solid #ffd699', borderBottom: idx !== sales.length - 1 ? '3px solid #ff8800' : 'none' }}>₹{s.price}</td>
              <td style={{ padding: '1rem', borderRight: '2px solid #ffd699', borderBottom: idx !== sales.length - 1 ? '3px solid #ff8800' : 'none' }}>{s.unit}</td>
              <td style={{ padding: '1rem', borderRight: '2px solid #ffd699', borderBottom: idx !== sales.length - 1 ? '3px solid #ff8800' : 'none' }}>{s.quantity}</td>
              <td style={{ padding: '1rem', fontWeight: 600, color: '#388e3c', borderRight: '2px solid #ffd699', borderBottom: idx !== sales.length - 1 ? '3px solid #ff8800' : 'none' }}>₹{s.total}</td>
              <td style={{ padding: '1rem', borderRight: '2px solid #ffd699', borderBottom: idx !== sales.length - 1 ? '3px solid #ff8800' : 'none' }}>{s.customerPhone}</td>
              <td style={{ padding: '1rem', borderBottom: idx !== sales.length - 1 ? '3px solid #ff8800' : 'none' }}>
                <button onClick={() => handleSendPdf(s)} style={{ background: '#25D366', color: '#fff', border: 'none', padding: '0.5rem 1.2rem', borderRadius: '6px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 6px rgba(37,211,102,0.15)', letterSpacing: 1 }}>
                  Send PDF
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SalesManagement; 