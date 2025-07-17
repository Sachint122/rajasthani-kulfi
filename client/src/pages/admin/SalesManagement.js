import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import {
  Box, Button, TextField, Select, MenuItem, InputLabel, FormControl, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Alert, CircularProgress, Stack, useTheme, useMediaQuery, IconButton, AppBar, Toolbar
} from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import AdminNavbar from '../../components/AdminNavbar';
import MenuIcon from '@mui/icons-material/Menu';
import { useNotification } from '../../components/NotificationProvider';

const API_BASE = 'http://192.168.152.199:5000/api';

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
  const isXs = useMediaQuery(theme.breakpoints.down('sm'));
  const { showNotification } = useNotification();

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
      showNotification('Please select a valid product and enter a valid quantity.', 'error');
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
        showNotification(data.error || 'Failed to record sale.', 'error');
      } else {
        showNotification('Sale recorded successfully!', 'success');
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
      showNotification('Failed to record sale.', 'error');
    }
    setLoading(false);
  };

  const selectedProduct = products.find(p => p._id === form.productId);

  // Handler for sending PDF to WhatsApp (placeholder)
  const handleSendPdf = (sale) => {
    // Get today's date in YYYY-MM-DD
    const todayStr = new Date().toISOString().slice(0, 10);
    // Filter all sales for this customer for today
    const todaysSales = sales.filter(s =>
      s.customerPhone === sale.customerPhone &&
      s.date && new Date(s.date).toISOString().slice(0, 10) === todayStr
    );
    if (todaysSales.length === 0) {
      showNotification('No sales found for this customer today.', 'info');
      return;
    }
    // Calculate last value (all sales for this customer except today's)
    const previousSales = sales.filter(s =>
      s.customerPhone === sale.customerPhone &&
      s.date && new Date(s.date).toISOString().slice(0, 10) !== todayStr
    );
    const lastTotalBookValue = previousSales.reduce((acc, s) => acc + (s.total || 0), 0);
    const lastValueCompleted = lastTotalBookValue === 0;
    const doc = new jsPDF();
    // --- HEADER ---
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(32);
    doc.text('INVOICE', 14, 36);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.text('Date:', 14, 46);
    doc.setFont('helvetica', 'bold');
    doc.text(`${new Date().toLocaleDateString()}`, 30, 46);
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
    // --- TABLE ROWS ---
    y += 14;
    let totalSum = 0;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    todaysSales.forEach(s => {
      doc.text(`${s.productName}`, 18, y);
      doc.text(`${s.quantity}`, 85, y, { align: 'right' });
      doc.text(`${s.price}`, 125, y, { align: 'right' });
      doc.text(`${s.total}`, 175, y, { align: 'right' });
      totalSum += s.total || 0;
      y += 8;
    });
    // --- TOTAL ROW ---
    y += 4;
    doc.setFont('helvetica', 'bold');
    doc.text('Total', 120, y);
    doc.text(`${totalSum}`, 175, y, { align: 'right' });
    // --- FOOTER ---
    y += 14;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
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
    doc.save(`Bill_${sale.customerName || 'Customer'}_${sale.customerPhone}_${todayStr}.pdf`);
  };

  return (
    <>
      <AdminNavbar />
      <Box sx={{ paddingTop: { xs: '56px', md: '60px' }, px: { xs: '0.5rem', md: '0.5rem' } }}>
        <Box sx={{ minHeight: 0, m: 0, p: 0 }}>
          <Box sx={{ flexGrow: 1, m: 0, p: 0 }}>
            <Typography variant="h4" color="primary" sx={{ fontWeight: 700, fontSize: { xs: '1.5rem', md: '2.125rem' }, mb: 0 }}>
              Sales Management
            </Typography>
            {error && <Alert severity="error" sx={{ mb: 0 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 0 }}>{success}</Alert>}
            <Box component="form" onSubmit={handleSubmit} sx={{ mb: 0, m: 0, p: 0 }}>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }}>
                <FormControl sx={{ minWidth: { xs: '100%', md: 140 }, flex: 1 }} fullWidth={isMobile}>
                  <InputLabel>Select Category</InputLabel>
                  <Select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    label="Select Category"
                    required
                    fullWidth
                  >
                    <MenuItem value=""><em>Select Category</em></MenuItem>
                    {categories.map(c => (
                      <MenuItem key={c._id} value={c.name}>{c.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl sx={{ minWidth: { xs: '100%', md: 180 }, flex: 1 }} fullWidth={isMobile} disabled={!form.category}>
                  <InputLabel>Select Product Name</InputLabel>
                  <Select
                    name="productName"
                    value={form.productName}
                    onChange={handleChange}
                    label="Select Product Name"
                    required
                    disabled={!form.category}
                    fullWidth
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
                  sx={{ minWidth: { xs: '100%', md: 100 }, flex: 1 }}
                  fullWidth={isMobile}
                />
                <FormControl sx={{ minWidth: { xs: '100%', md: 160 }, flex: 1 }} fullWidth={isMobile}>
                  <InputLabel>Select Customer (optional)</InputLabel>
                  <Select
                    name="customerName"
                    value={form.customerName}
                    onChange={handleChange}
                    label="Select Customer (optional)"
                    fullWidth
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
                  sx={{ minWidth: { xs: '100%', md: 160 }, flex: 1 }}
                  fullWidth={isMobile}
                />
                <Button type="submit" variant="contained" color="warning" sx={{ fontWeight: 600, minWidth: { xs: '100%', md: 140 }, height: 48 }}
                  disabled={loading || !form.productId || !form.quantity || Number(form.quantity) < 1}
                  fullWidth={isMobile}
                >
                  {loading ? 'Saving...' : 'Record Sale'}
                </Button>
              </Stack>
            </Box>
            {isXs ? (
              <Stack spacing={2} sx={{ mt: 4 }}>
                {sales.map((s) => (
                  <Paper key={s._id} elevation={3} sx={{ p: 2, borderRadius: 2 }}>
                    <Typography variant="h6" fontWeight={700} sx={{ fontSize: 22, color: '#ff8800' }}>{s.productName}</Typography>
                    <Typography variant="body1" sx={{ fontSize: 20 }}>Price: ₹{s.price}</Typography>
                    <Typography variant="body1" sx={{ fontSize: 20 }}>Unit: {s.unit}</Typography>
                    <Typography variant="body1" sx={{ fontSize: 20 }}>Quantity: {s.quantity}</Typography>
                    <Typography variant="body1" fontWeight={600} color="#388e3c" sx={{ fontSize: 20 }}>Total: ₹{s.total}</Typography>
                    <Typography variant="body1" sx={{ fontSize: 20 }}>Customer Phone: {s.customerPhone}</Typography>
                    <Box mt={2}>
                      <Button
                        variant="contained"
                        color="success"
                        size="large"
                        sx={{ fontSize: 20, py: 1.5 }}
                        startIcon={<PictureAsPdfIcon fontSize="large" />}
                        onClick={() => handleSendPdf(s)}
                      >
                        Send PDF
                      </Button>
                    </Box>
                  </Paper>
                ))}
              </Stack>
            ) : (
              <TableContainer component={Paper} sx={{ mt: 4, borderRadius: 3, boxShadow: 3 }}>
                <Table size={isMobile ? 'small' : 'medium'} sx={{ minWidth: 0, width: '100%' }}>
                  <TableHead>
                    <TableRow sx={{ background: '#ff8800' }}>
                      <TableCell sx={{ color: '#fff', fontWeight: 700, px: { xs: 1, md: 2 }, fontSize: { xs: '0.9rem', md: '1rem' }, minWidth: 80 }}>Product Name</TableCell>
                      <TableCell sx={{ color: '#fff', fontWeight: 700, px: { xs: 1, md: 2 }, fontSize: { xs: '0.9rem', md: '1rem' }, minWidth: 60 }}>Price</TableCell>
                      <TableCell sx={{ color: '#fff', fontWeight: 700, px: { xs: 1, md: 2 }, fontSize: { xs: '0.9rem', md: '1rem' }, minWidth: 50 }}>Unit</TableCell>
                      <TableCell sx={{ color: '#fff', fontWeight: 700, px: { xs: 1, md: 2 }, fontSize: { xs: '0.9rem', md: '1rem' }, minWidth: 60 }}>Quantity</TableCell>
                      <TableCell sx={{ color: '#fff', fontWeight: 700, px: { xs: 1, md: 2 }, fontSize: { xs: '0.9rem', md: '1rem' }, minWidth: 70 }}>Total</TableCell>
                      <TableCell sx={{ color: '#fff', fontWeight: 700, px: { xs: 1, md: 2 }, fontSize: { xs: '0.9rem', md: '1rem' }, minWidth: 120 }}>Customer Phone</TableCell>
                      <TableCell sx={{ color: '#fff', fontWeight: 700, px: { xs: 1, md: 2 }, fontSize: { xs: '0.9rem', md: '1rem' }, minWidth: 80 }}>Send PDF</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sales.map((s) => (
                      <TableRow key={s._id} hover>
                        <TableCell sx={{ fontWeight: 500, px: { xs: 1, md: 2 }, fontSize: { xs: '0.9rem', md: '1rem' }, minWidth: 80 }}>{s.productName}</TableCell>
                        <TableCell sx={{ px: { xs: 1, md: 2 }, fontSize: { xs: '0.9rem', md: '1rem' }, minWidth: 60 }}>₹{s.price}</TableCell>
                        <TableCell sx={{ px: { xs: 1, md: 2 }, fontSize: { xs: '0.9rem', md: '1rem' }, minWidth: 50 }}>{s.unit}</TableCell>
                        <TableCell sx={{ px: { xs: 1, md: 2 }, fontSize: { xs: '0.9rem', md: '1rem' }, minWidth: 60 }}>{s.quantity}</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: '#388e3c', px: { xs: 1, md: 2 }, fontSize: { xs: '0.9rem', md: '1rem' }, minWidth: 70 }}>₹{s.total}</TableCell>
                        <TableCell sx={{ px: { xs: 1, md: 2 }, fontSize: { xs: '0.9rem', md: '1rem' }, minWidth: 120 }}>{s.customerPhone}</TableCell>
                        <TableCell sx={{ px: { xs: 1, md: 2 }, minWidth: 80 }}>
                          <IconButton color="success" onClick={() => handleSendPdf(s)} size={isMobile ? 'small' : 'medium'}>
                            <PictureAsPdfIcon fontSize={isMobile ? 'small' : 'medium'} />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default SalesManagement; 