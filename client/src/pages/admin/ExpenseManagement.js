import React, { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:5000/api';

const ExpenseManagement = () => {
  const [expenses, setExpenses] = useState([]);
  const [form, setForm] = useState({ description: '', amount: '' });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch expenses from backend
  const fetchExpenses = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/expenses`);
      const data = await res.json();
      setExpenses(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Failed to fetch expenses.');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const today = new Date().toISOString().slice(0, 10);
      if (editingId) {
        // Update expense
        const res = await fetch(`${API_BASE}/expenses/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...form, amount: Number(form.amount), date: today }),
        });
        if (!res.ok) throw new Error('Failed to update expense');
      } else {
        // Add expense
        const res = await fetch(`${API_BASE}/expenses`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...form, amount: Number(form.amount), date: today }),
        });
        if (!res.ok) throw new Error('Failed to add expense');
      }
      setForm({ description: '', amount: '' });
      setEditingId(null);
      await fetchExpenses();
    } catch (err) {
      setError('Failed to save expense.');
    }
    setLoading(false);
  };

  const handleEdit = exp => {
    setForm({ description: exp.description, amount: exp.amount });
    setEditingId(exp._id);
  };

  const handleDelete = async id => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/expenses/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete expense');
      await fetchExpenses();
    } catch (err) {
      setError('Failed to delete expense.');
    }
    setLoading(false);
  };

  return (
    <div>
      <h2 style={{ color: '#ff8800', marginBottom: '1rem' }}>Expense Management</h2>
      {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}
      {loading && <div style={{ color: '#888', marginBottom: '1rem' }}>Loading...</div>}
      <form onSubmit={handleSubmit} style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <input name="description" value={form.description} onChange={handleChange} placeholder="Description" required style={{ padding: '0.5rem', minWidth: '160px' }} />
        <input name="amount" value={form.amount} onChange={handleChange} placeholder="Amount" type="number" required style={{ padding: '0.5rem', minWidth: '100px' }} />
        <button type="submit" style={{ background: '#ff8800', color: '#fff', border: 'none', padding: '0.5rem 1.5rem', borderRadius: '4px', fontWeight: 600 }}>{editingId ? 'Update' : 'Add'}</button>
        {editingId && <button type="button" onClick={() => { setForm({ description: '', amount: '' }); setEditingId(null); }} style={{ background: '#888', color: '#fff', border: 'none', padding: '0.5rem 1.5rem', borderRadius: '4px', fontWeight: 600 }}>Cancel</button>}
      </form>
      <table style={{
        borderTop: '3px solid #ff8800',
        borderBottom: '3px solid #ff8800',
        textAlign: 'left',
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
            <th style={{ padding: '1rem', borderRight: '2px solid #ffd699' }}>Description</th>
            <th style={{ padding: '1rem', borderRight: '2px solid #ffd699' }}>Amount</th>
            <th style={{ padding: '1rem', borderRight: '2px solid #ffd699' }}>Date</th>
            <th style={{ padding: '1rem' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((exp, idx) => (
            <tr key={exp._id}
              style={{
                background: idx % 2 === 0 ? '#f8f9fa' : '#fff',
                transition: 'background 0.2s',
                cursor: 'pointer',
              }}
              onMouseOver={e => e.currentTarget.style.background = '#ffe0b2'}
              onMouseOut={e => e.currentTarget.style.background = idx !== expenses.length - 1 ? '#f8f9fa' : '#fff'}
            >
              <td style={{ padding: '1rem', fontWeight: 500, borderRight: '2px solid #ffd699', borderBottom: idx !== expenses.length - 1 ? '3px solid #ff8800' : 'none' }}>{exp.description}</td>
              <td style={{ padding: '1rem', borderRight: '2px solid #ffd699', borderBottom: idx !== expenses.length - 1 ? '3px solid #ff8800' : 'none' }}>₹{exp.amount}</td>
              <td style={{ padding: '1rem', borderRight: '2px solid #ffd699', borderBottom: idx !== expenses.length - 1 ? '3px solid #ff8800' : 'none' }}>{exp.date ? new Date(exp.date).toLocaleDateString() : ''}</td>
              <td style={{ padding: '1rem', borderBottom: idx !== expenses.length - 1 ? '3px solid #ff8800' : 'none' }}>
                <button onClick={() => handleEdit(exp)} style={{ marginRight: '0.5rem', background: '#2ecc40', color: '#fff', border: 'none', padding: '0.3rem 0.8rem', borderRadius: '4px' }}>Edit</button>
                <button onClick={() => handleDelete(exp._id)} style={{ background: '#ff8800', color: '#fff', border: 'none', padding: '0.3rem 0.8rem', borderRadius: '4px' }}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ExpenseManagement; 