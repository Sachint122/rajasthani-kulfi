import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import {
  Box, Button, TextField, Select, MenuItem, InputLabel, FormControl, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Alert, CircularProgress, Stack, useTheme, useMediaQuery, IconButton, AppBar, Toolbar
} from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import AdminNavbar from '../../components/AdminNavbar';
import MenuIcon from '@mui/icons-material/Menu';

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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

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
    doc.text('Last Total Value:', 14, y);
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
    <>
      <AdminNavbar />
      <Box sx={{ paddingTop: { xs: '56px', md: '30px' } }}>
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
          <Box sx={{ flexGrow: 1, p: { xs: 1, md: 0 } }}>
            <Typography variant="h4" color="primary" sx={{ mb: 2, fontWeight: 700 }}>
              Sales Management
            </Typography>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
            <Box component="form" onSubmit={handleSubmit} sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
              <FormControl sx={{ minWidth: 140 }}>
                <InputLabel>Select Category</InputLabel>
                <Select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  label="Select Category"
                  required
                >
                  <MenuItem value=""><em>Select Category</em></MenuItem>
                  {categories.map(c => (
                    <MenuItem key={c._id} value={c.name}>{c.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl sx={{ minWidth: 180 }} disabled={!form.category}>
                <InputLabel>Select Product Name</InputLabel>
                <Select
                  name="productName"
                  value={form.productName}
                  onChange={handleChange}
                  label="Select Product Name"
                  required
                  disabled={!form.category}
                >
                  <MenuItem value=""><em>{form.category ? 'Select Product Name' : 'Select Category First'}</em></MenuItem>
                  {products
                    .filter(p => p.category && p.category.trim().toLowerCase() === form.category.trim().toLowerCase())
                    .map(p => p.name)
                    .filter((name, idx, arr) => arr.indexOf(name) === idx)
                    .map(name => (
                      <MenuItem key={name} value={name}>{name}</MenuItem>
                    ))}
                </Select>
              </FormControl>
              <TextField
                name="quantity"
                value={form.quantity}
                onChange={handleChange}
                label="Quantity"
                type="number"
                min={1}
                max={selectedProduct ? selectedProduct.stock : undefined}
                required
                sx={{ minWidth: 100 }}
              />
              <FormControl sx={{ minWidth: 160 }}>
                <InputLabel>Select Customer (optional)</InputLabel>
                <Select
                  name="customerName"
                  value={form.customerName}
                  onChange={handleChange}
                  label="Select Customer (optional)"
                >
                  <MenuItem value=""><em>Select Customer (optional)</em></MenuItem>
                  {users.map(u => (
                    <MenuItem key={u._id || u.id} value={u.name}>{u.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                name="customerPhone"
                value={form.customerPhone}
                onChange={handleChange}
                label="Customer Phone (optional)"
                InputProps={{ readOnly: !!form.customerName }}
                sx={{ minWidth: 160 }}
              />
              <Button type="submit" variant="contained" color="warning" sx={{ fontWeight: 600 }}
                disabled={loading || !form.productId || !form.quantity || Number(form.quantity) < 1}>
                {loading ? 'Saving...' : 'Record Sale'}
              </Button>
            </Box>
            <TableContainer component={Paper} sx={{ mt: 4, borderRadius: 3, boxShadow: 3 }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ background: '#ff8800' }}>
                    <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Product Name</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Price</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Unit</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Quantity</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Total</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Customer Phone</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Send PDF</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sales.map((s) => (
                    <TableRow key={s._id} hover>
                      <TableCell sx={{ fontWeight: 500 }}>{s.productName}</TableCell>
                      <TableCell>₹{s.price}</TableCell>
                      <TableCell>{s.unit}</TableCell>
                      <TableCell>{s.quantity}</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#388e3c' }}>₹{s.total}</TableCell>
                      <TableCell>{s.customerPhone}</TableCell>
                      <TableCell>
                        <IconButton color="success" onClick={() => handleSendPdf(s)}>
                          <PictureAsPdfIcon />
                        </IconButton>
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

export default SalesManagement; 