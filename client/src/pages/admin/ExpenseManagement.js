import React, { useState, useEffect } from 'react';
import {
  Box, Button, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Alert, CircularProgress, IconButton, Stack, Dialog, DialogTitle, DialogContent, DialogActions, useTheme, useMediaQuery, AppBar, Toolbar
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AdminNavbar from '../../components/AdminNavbar';
import MenuIcon from '@mui/icons-material/Menu';

const API_BASE = 'http://localhost:5000/api';

const ExpenseManagement = () => {
  const [expenses, setExpenses] = useState([]);
  const [form, setForm] = useState({ description: '', amount: '' });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

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
    <>
      <AdminNavbar />
      <Box sx={{ paddingTop: { xs: '56px', md: '30px' } }}>
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
          <Box sx={{ flexGrow: 1, p: { xs: 1, md: 0 } }}>
          <Typography variant="h4" color="primary" sx={{ mb: 2, fontWeight: 700 }}>
            Expense Management
          </Typography>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {loading && <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}><CircularProgress size={24} sx={{ mr: 2 }} /> Loading...</Box>}
            <Box component="form" onSubmit={handleSubmit} sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
              <TextField
                name="description"
                value={form.description}
                onChange={handleChange}
                label="Description"
                required
                sx={{ minWidth: 180 }}
              />
              <TextField
                name="amount"
                value={form.amount}
                onChange={handleChange}
                label="Amount"
                type="number"
                required
                sx={{ minWidth: 120 }}
              />
              <Button type="submit" variant="contained" color="warning" sx={{ fontWeight: 600 }}>{editingId ? 'Update' : 'Add'}</Button>
              {editingId && <Button type="button" onClick={() => { setForm({ description: '', amount: '' }); setEditingId(null); }} variant="outlined" color="inherit">Cancel</Button>}
            </Box>
            <TableContainer component={Paper} sx={{ mt: 4, borderRadius: 3, boxShadow: 3 }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ background: '#ff8800' }}>
                    <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Description</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Amount</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Date</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {expenses.map((exp) => (
                    <TableRow key={exp._id} hover>
                      <TableCell sx={{ fontWeight: 500 }}>{exp.description}</TableCell>
                      <TableCell>₹{exp.amount}</TableCell>
                      <TableCell>{exp.date ? new Date(exp.date).toLocaleDateString() : ''}</TableCell>
                      <TableCell>
                        <IconButton color="success" onClick={() => handleEdit(exp)}><EditIcon /></IconButton>
                        <IconButton color="warning" onClick={() => handleDelete(exp._id)}><DeleteIcon /></IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default ExpenseManagement; 