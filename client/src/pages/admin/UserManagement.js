import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import {
  Box, Button, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Alert, CircularProgress, Stack, Dialog, DialogTitle, DialogContent, DialogActions, useTheme, useMediaQuery, IconButton, AppBar, Toolbar
} from '@mui/material';
import AdminNavbar from '../../components/AdminNavbar';
import MenuIcon from '@mui/icons-material/Menu';

const API_BASE = 'http://localhost:5000/api';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ name: '', phone: '', lastValue: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [userRecords, setUserRecords] = useState({}); // { phone: { sales: [], transactions: [] } }
  const [modalOpen, setModalOpen] = useState(false);
  const [modalUser, setModalUser] = useState(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentForm, setPaymentForm] = useState({ amount: '', note: '' });
  const [paymentUser, setPaymentUser] = useState(null);
  const [showAddUser, setShowAddUser] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

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

  const fetchUserRecords = async (phone) => {
    try {
      const token = sessionStorage.getItem('token');
      const res = await fetch(`${API_BASE}/users/records?phone=${encodeURIComponent(phone)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) return { sales: [], transactions: [] };
      return await res.json();
    } catch {
      return { sales: [], transactions: [] };
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const fetchAllRecords = async () => {
      const userList = await (async () => {
        setLoading(true);
        setError('');
        try {
          const res = await fetch(`${API_BASE}/users`, { headers: getAuthHeaders() });
          const data = await res.json();
          setUsers(data);
          return data;
        } catch (err) {
          setError('Failed to fetch users.');
          return [];
        } finally {
          setLoading(false);
        }
      })();
      const records = {};
      for (const u of userList.filter(u => u.role !== 'admin')) {
        records[u.phone] = await fetchUserRecords(u.phone);
      }
      setUserRecords(records);
    };
    fetchAllRecords();
  }, []);

  const calculateLastValue = (phone) => {
    const rec = userRecords[phone];
    if (!rec) return 0;
    const salesTotal = rec.sales.reduce((sum, s) => sum + (s.total || 0), 0);
    const paymentsTotal = rec.transactions.reduce((sum, t) => sum + (t.amount || 0), 0);
    return salesTotal - paymentsTotal;
  };

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const toTitleCase = str => str.replace(/\w\S*/g, w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const formattedForm = { ...form, name: toTitleCase(form.name), lastValue: Number(form.lastValue) || 0 };
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
        setForm({ name: '', phone: '', lastValue: '' });
        await fetchUsers();
        setShowAddUser(false);
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
    // Fetch both sales and payments
    const token = sessionStorage.getItem('token');
    const res = await fetch(`${API_BASE}/users/records?phone=${encodeURIComponent(user.phone)}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    let sales = [], payments = [];
    if (res.ok) {
      const data = await res.json();
      sales = data.sales || [];
      payments = data.transactions || [];
    }
    // Merge and sort by date
    const allRecords = [
      ...sales.map(s => ({
        type: 'debit',
        date: new Date(s.date),
        details: s.productName || 'Purchase',
        debit: s.total,
        credit: 0,
        note: ''
      })),
      ...payments.map(p => ({
        type: 'credit',
        date: new Date(p.date),
        details: p.note ? `Payment - ${p.note}` : 'Payment',
        debit: 0,
        credit: p.amount,
        note: p.note || ''
      }))
    ].sort((a, b) => a.date - b.date);
    // Calculate summary
    const totalDebit = allRecords.reduce((sum, r) => sum + (r.debit || 0), 0);
    const totalCredit = allRecords.reduce((sum, r) => sum + (r.credit || 0), 0);
    const balance = totalDebit - totalCredit;
    // PDF
    const doc = new jsPDF();
    // Header bar
    doc.setFillColor(10, 80, 160);
    doc.rect(0, 0, 210, 22, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Rajasthan Kulfi House', 14, 15);
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    // Title
    doc.setFontSize(15);
    doc.setFont('helvetica', 'bold');
    doc.text(`${user.name} Statement`, 14, 32);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text(`Phone Number: ${user.phone}`, 14, 39);
    doc.text(`(01 Jan 2024 - 31 Dec 2024)`, 14, 45);
    // Summary box
    doc.setDrawColor(200, 200, 200);
    doc.setFillColor(245, 245, 245);
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
    // Show balance as Dr (red) or Cr (green)
    if (balance >= 0) {
      doc.setTextColor(200, 0, 0); // red
      doc.text(`${balance.toLocaleString()}.00 Rup`, 168, 66);
    } else {
      doc.setTextColor(0, 150, 0); // green
      doc.text(`${Math.abs(balance).toLocaleString()}.00 Rup (Advance)`, 158, 66);
    }
    doc.setTextColor(0, 0, 0);
    // Table header
    let y = 80;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setFillColor(230, 230, 230);
    doc.rect(14, y, 182, 8, 'F');
    doc.text('Date', 16, y + 6);
    doc.text('Details', 46, y + 6);
    doc.text('Debit(-)', 96, y + 6);
    doc.text('Credit(+)', 146, y + 6);
    doc.text('Balance', 176, y + 6);
    // Add more vertical space before first row
    y += 14;
    doc.setFont('helvetica', 'normal');
    let runningBalance = 0;
    allRecords.forEach(r => {
      if (y > 270) return; // avoid overflow for demo
      doc.text(r.date.toLocaleDateString(), 16, y);
      doc.text(r.details, 46, y);
      if (r.debit) doc.text(`${r.debit}`, 106, y, { align: 'right' });
      else doc.text(``, 106, y, { align: 'right' });
      if (r.credit) doc.text(`${r.credit}`, 146, y, { align: 'right' });
      else doc.text(``, 146, y, { align: 'right' });
      runningBalance += (r.debit || 0) - (r.credit || 0);
      // Show running balance as Dr or Cr
      if (runningBalance >= 0) {
        doc.setTextColor(200, 0, 0); // red
        doc.text(`${runningBalance} Ru`, 186, y, { align: 'right' });
      } else {
        doc.setTextColor(0, 150, 0); // green
        doc.text(`${Math.abs(runningBalance)} Ru`, 186, y, { align: 'right' });
      }
      doc.setTextColor(0, 0, 0);
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

  const handleEditClick = (user) => {
    setEditingId(user._id || user.id);
    setEditValue(user.lastValue ?? 0);
  };

  const handleEditSave = async (user) => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const token = sessionStorage.getItem('token');
      const res = await fetch(`${API_BASE}/users/${user._id || user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ lastValue: Number(editValue) || 0 }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to update last value.');
      } else {
        setSuccess('Last value updated!');
        await fetchUsers();
        setEditingId(null);
      }
    } catch (err) {
      setError('Failed to update last value.');
    }
    setLoading(false);
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditValue('');
  };

  const handleOpenModal = (user) => {
    setModalUser(user);
    setModalOpen(true);
  };
  const handleCloseModal = () => {
    setModalOpen(false);
    setModalUser(null);
  };

  const handleOpenPaymentDialog = (user) => {
    setPaymentUser(user);
    setPaymentForm({ amount: '', note: '' });
    setPaymentDialogOpen(true);
  };
  const handleClosePaymentDialog = () => {
    setPaymentDialogOpen(false);
    setPaymentUser(null);
  };
  const handlePaymentFormChange = (e) => {
    setPaymentForm({ ...paymentForm, [e.target.name]: e.target.value });
  };
  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const token = sessionStorage.getItem('token');
      const res = await fetch(`${API_BASE}/users/transaction`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          customerPhone: paymentUser.phone,
          amount: Number(paymentForm.amount),
          note: paymentForm.note
        })
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to record payment.');
      } else {
        setSuccess('Payment recorded!');
        // Refresh records
        const rec = await fetchUserRecords(paymentUser.phone);
        setUserRecords(prev => ({ ...prev, [paymentUser.phone]: rec }));
        handleClosePaymentDialog();
      }
    } catch (err) {
      setError('Failed to record payment.');
    }
    setLoading(false);
  };

  return (
    <><AdminNavbar />
      <Box sx={{ paddingTop: { xs: '56px', md: '30px' } }}>
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
          <Box sx={{ flexGrow: 1, p: { xs: 1, md: 0 } }}>
            <Typography variant="h4" color="primary" sx={{ mb: { xs: 2, md: 3 }, fontWeight: 700, fontSize: { xs: 22, md: 32 }, textAlign: { xs: 'center', md: 'left' } }}>
              User Management
            </Typography>
            {error && <Alert severity="error" sx={{ mb: { xs: 2, md: 3 } }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: { xs: 2, md: 3 } }}>{success}</Alert>}
            {loading && <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, justifyContent: { xs: 'center', md: 'flex-start' } }}><CircularProgress size={24} sx={{ mr: 2 }} /> Loading...</Box>}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: { xs: 2, md: 3 }, alignItems: { xs: 'stretch', sm: 'center' } }}>
              <Button variant="contained" color="warning" onClick={() => setShowAddUser(true)} sx={{ width: { xs: '100%', sm: 'auto' }, fontSize: { xs: 16, md: 18 } }}>Add User</Button>
            </Stack>
            {/* Add User Dialog */}
            <Dialog open={showAddUser} onClose={() => setShowAddUser(false)} maxWidth="sm" fullWidth>
              <DialogTitle sx={{ fontSize: { xs: 18, md: 22 } }}>Add User</DialogTitle>
              <DialogContent>
                <Stack spacing={2} sx={{ mt: 1 }}>
                  <TextField name="name" value={form.name} onChange={handleChange} label="Name" required fullWidth size="small" inputProps={{ style: { fontSize: 16 } }} />
                  <TextField name="phone" value={form.phone} onChange={handleChange} label="Phone Number" required fullWidth size="small" inputProps={{ style: { fontSize: 16 } }} />
                </Stack>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setShowAddUser(false)} fullWidth={true} sx={{ fontSize: { xs: 16, md: 18 } }}>Cancel</Button>
                <Button onClick={handleSubmit} variant="contained" color="warning" fullWidth={true} sx={{ fontSize: { xs: 16, md: 18 } }}>Add</Button>
              </DialogActions>
            </Dialog>
            {/* User Table */}
            <TableContainer component={Paper} sx={{ mt: 4, borderRadius: 3, boxShadow: 3, overflowX: 'auto', maxWidth: '100%' }}>
              <Table size="small" sx={{ minWidth: 600 }}>
                <TableHead>
                  <TableRow sx={{ background: '#ff8800' }}>
                    <TableCell sx={{ color: '#fff', fontWeight: 700, minWidth: 120, fontSize: { xs: 14, md: 16 } }}>Name</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 700, minWidth: 120, fontSize: { xs: 14, md: 16 } }}>Phone</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 700, minWidth: 120, fontSize: { xs: 14, md: 16 } }}>Last Value (Rup)</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 700, minWidth: 220, fontSize: { xs: 14, md: 16 } }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.filter(u => u.role !== 'admin').map(u => (
                    <TableRow key={u._id || u.id} hover>
                      <TableCell sx={{ fontWeight: 500, fontSize: { xs: 14, md: 16 } }}>
                        <span style={{ color: '#0A50A0', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => handleOpenModal(u)}>{u.name}</span>
                      </TableCell>
                      <TableCell sx={{ fontSize: { xs: 14, md: 16 } }}>{u.phone}</TableCell>
                      <TableCell sx={{ fontSize: { xs: 14, md: 16 } }}>{calculateLastValue(u.phone)}</TableCell>
                      <TableCell sx={{ fontSize: { xs: 14, md: 16 } }}>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                          <Button variant="outlined" size="small" onClick={() => handleOpenPaymentDialog(u)} fullWidth={true} sx={{ fontSize: { xs: 14, md: 16 } }}>Record Payment</Button>
                          <Button variant="outlined" size="small" color="error" onClick={() => handleDelete(u._id || u.id)} fullWidth={true} sx={{ fontSize: { xs: 14, md: 16 } }}>Delete</Button>
                          <Button variant="contained" size="small" color="info" onClick={() => handleStatementPdf(u)} fullWidth={true} sx={{ fontSize: { xs: 14, md: 16 } }}>Statement PDF</Button>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            {/* User Details Modal */}
            <Dialog open={modalOpen} onClose={handleCloseModal} maxWidth="md" fullWidth>
              <DialogTitle>User Details: {modalUser?.name}</DialogTitle>
              <DialogContent>
                <Typography variant="h6" sx={{ mt: 2 }}>Sales</Typography>
                <TableContainer component={Paper} sx={{ mb: 2, overflowX: 'auto' }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell>Product</TableCell>
                        <TableCell>Amount (Rup)</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {modalUser && userRecords[modalUser.phone]?.sales.map(s => (
                        <TableRow key={s._id}>
                          <TableCell>{new Date(s.date).toLocaleDateString()}</TableCell>
                          <TableCell>{s.productName}</TableCell>
                          <TableCell>{s.total}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <Typography variant="h6">Payments</Typography>
                <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell>Note</TableCell>
                        <TableCell>Amount (Rup)</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {modalUser && userRecords[modalUser.phone]?.transactions.map(t => (
                        <TableRow key={t._id}>
                          <TableCell>{new Date(t.date).toLocaleDateString()}</TableCell>
                          <TableCell>{t.note || '-'}</TableCell>
                          <TableCell>{t.amount}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseModal} fullWidth={true}>Close</Button>
              </DialogActions>
            </Dialog>
            {/* Payment Dialog */}
            <Dialog open={paymentDialogOpen} onClose={handleClosePaymentDialog} maxWidth="xs" fullWidth>
              <DialogTitle>Record Payment for {paymentUser?.name}</DialogTitle>
              <DialogContent>
                <form onSubmit={handlePaymentSubmit}>
                  <Stack spacing={2} sx={{ mt: 1 }}>
                    <TextField label="Amount" name="amount" value={paymentForm.amount} onChange={handlePaymentFormChange} type="number" fullWidth required />
                    <TextField label="Note" name="note" value={paymentForm.note} onChange={handlePaymentFormChange} fullWidth />
                  </Stack>
                  <DialogActions>
                    <Button onClick={handleClosePaymentDialog} fullWidth={true}>Cancel</Button>
                    <Button type="submit" variant="contained" color="primary" disabled={loading} fullWidth={true}>{loading ? 'Saving...' : 'Save Payment'}</Button>
                  </DialogActions>
                </form>
              </DialogContent>
            </Dialog>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default UserManagement; 