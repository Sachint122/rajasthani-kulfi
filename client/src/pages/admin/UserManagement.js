import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';

const API_BASE = 'http://localhost:5000/api';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ name: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const getAuthHeaders = () => {
    const token = sessionStorage.getItem('token');
    return token ? { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` } : { 'Content-Type': 'application/json' };
  };

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/users`, { headers: getAuthHeaders() });
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      setError('Failed to fetch users.');
    }
    setLoading(false);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchUsers();
  }, []);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const toTitleCase = str => str.replace(/\w\S*/g, w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const formattedForm = { ...form, name: toTitleCase(form.name) };
      const res = await fetch(`${API_BASE}/users`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(formattedForm),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to add user.');
      } else {
        setSuccess('User added successfully!');
        setForm({ name: '', phone: '' });
        await fetchUsers();
      }
    } catch (err) {
      setError('Failed to add user.');
    }
    setLoading(false);
  };

  const handleDelete = async id => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const token = sessionStorage.getItem('token');
      const res = await fetch(`${API_BASE}/users/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to delete user.');
      } else {
        setSuccess('User deleted successfully!');
        await fetchUsers();
      }
    } catch (err) {
      setError('Failed to delete user.');
    }
    setLoading(false);
  };

  // Fetch all sales for a user
  const fetchUserSales = async (phone) => {
    try {
      const token = sessionStorage.getItem('token');
      const res = await fetch(`${API_BASE}/sales?customerPhone=${encodeURIComponent(phone)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  };

  // Generate statement PDF in Khatabook style
  const handleStatementPdf = async (user) => {
    const sales = await fetchUserSales(user.phone);
    // Calculate summary
    let totalDebit = 0, totalCredit = 0, balance = 0;
    sales.forEach(s => {
      if (s.type === 'debit' || s.total > 0) {
        totalDebit += s.total;
        balance -= s.total;
      } else if (s.type === 'credit') {
        totalCredit += s.total;
        balance += s.total;
      }
    });
    // For demo, treat all sales as debit (purchase)
    totalDebit = sales.reduce((acc, s) => acc + (s.total || 0), 0);
    totalCredit = 0;
    balance = totalDebit;
    // PDF
    const doc = new jsPDF();
    // Header bar
    doc.setFillColor(10, 80, 160);
    doc.rect(0, 0, 210, 22, 'F');
    doc.setTextColor(255,255,255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Rajasthan Kulfi House', 14, 15);
    doc.setFontSize(10);
    doc.setTextColor(0,0,0);
    // Title
    doc.setFontSize(15);
    doc.setFont('helvetica', 'bold');
    doc.text(`${user.name} Statement`, 14, 32);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text(`Phone Number: ${user.phone}`, 14, 39);
    doc.text(`(01 Jan 2024 - 31 Dec 2024)`, 14, 45);
    // Summary box
    doc.setDrawColor(200,200,200);
    doc.setFillColor(245,245,245);
    doc.roundedRect(14, 50, 182, 22, 4, 4, 'FD');
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Opening Balance', 18, 58);
    doc.text('Total Debit(-)', 68, 58);
    doc.text('Total Credit(+)', 118, 58);
    doc.text('Net Balance', 168, 58);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text('0.00', 18, 66);
    doc.text(`${totalDebit.toLocaleString()}.00`, 68, 66);
    doc.text(`${totalCredit.toLocaleString()}.00`, 118, 66);
    doc.setTextColor(200,0,0);
    doc.text(`${balance.toLocaleString()}.00 Dr`, 168, 66);
    doc.setTextColor(0,0,0);
    // Table header
    let y = 80;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setFillColor(230,230,230);
    doc.rect(14, y, 182, 8, 'F');
    doc.text('Date', 16, y+6);
    doc.text('Details', 46, y+6);
    doc.text('Debit(-)', 96, y+6);
    doc.text('Credit(+)', 146, y+6);
    doc.text('Balance', 176, y+6);
    // Add more vertical space before first row
    y += 14;
    doc.setFont('helvetica', 'normal');
    let runningBalance = 0;
    sales.forEach(s => {
      if (y > 270) return; // avoid overflow for demo
      doc.text(new Date(s.date).toLocaleDateString(), 16, y);
      doc.text(s.productName || 'Purchase', 46, y);
      doc.text(`${s.total}`, 106, y, { align: 'right' });
      doc.text(``, 146, y, { align: 'right' });
      runningBalance += s.total;
      doc.text(`${runningBalance}`, 186, y, { align: 'right' });
      // Draw horizontal line under each row
      y += 4;
      doc.setDrawColor(200, 200, 200);
      doc.line(14, y, 196, y);
      // Add more vertical space after each row
      y += 8;
    });
    // Footer
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(10, 80, 160);
    doc.text('Thank you for your business!', 105, 285, { align: 'center' });
    doc.save(`Statement_${user.name}.pdf`);
  };

  return (
    <div>
      <h2 style={{ color: '#ff8800', marginBottom: '1rem' }}>User Management</h2>
      {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}
      {success && <div style={{ color: 'green', marginBottom: '1rem' }}>{success}</div>}
      <form onSubmit={handleSubmit} style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <input name="name" value={form.name} onChange={handleChange} placeholder="Name" required style={{ padding: '0.5rem', minWidth: '160px' }} />
        <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone Number" required style={{ padding: '0.5rem', minWidth: '160px' }} />
        <button type="submit" style={{ background: '#ff8800', color: '#fff', border: 'none', padding: '0.5rem 1.5rem', borderRadius: '4px', fontWeight: 600 }} disabled={loading}>{loading ? 'Adding...' : 'Add User'}</button>
      </form>
      <table style={{ width: '100%', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', overflow: 'hidden' }}>
        <thead style={{ background: '#ff8800', color: '#fff' }}>
          <tr>
            <th style={{ padding: '0.75rem' }}>Name</th>
            <th>Phone</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.filter(u => u.role !== 'admin').map(u => (
            <tr key={u._id || u.id}>
              <td style={{ padding: '0.75rem' }}>{u.name}</td>
              <td>{u.phone}</td>
              <td>
                <button onClick={() => handleDelete(u._id || u.id)} style={{ background: '#ff8800', color: '#fff', border: 'none', padding: '0.3rem 0.8rem', borderRadius: '4px', fontWeight: 600, cursor: 'pointer' }} disabled={loading}>Delete</button>
                <button onClick={() => handleStatementPdf(u)} style={{ background: '#0A50A0', color: '#fff', border: 'none', padding: '0.3rem 0.8rem', borderRadius: '4px', fontWeight: 600, cursor: 'pointer', marginLeft: '0.5rem' }}>Statement PDF Demo</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserManagement; 