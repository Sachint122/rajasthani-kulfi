import React, { useState, useEffect } from 'react';
import {
  Box, Button, TextField, Select, MenuItem, InputLabel, FormControl, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Alert, CircularProgress, IconButton, Chip, Stack, Dialog, DialogTitle, DialogContent, DialogActions, useTheme, useMediaQuery, IconButton as MuiIconButton, AppBar, Toolbar
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CategoryIcon from '@mui/icons-material/Category';
import LabelIcon from '@mui/icons-material/Label';
import AdminNavbar from '../../components/AdminNavbar';
import MenuIcon from '@mui/icons-material/Menu';
import { useNotification } from '../../components/NotificationProvider';

const API_BASE = 'https://rajasthani-kulfi.onrender.com/api';

// Helper to title-case a string
const toTitleCase = str => str.replace(/\w\S*/g, w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ name: '', price: '', stock: '', category: '', unit: '' });
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [productNames, setProductNames] = useState([]);
  const [categories, setCategories] = useState([]); // [{name, units}]
  const [newCategory, setNewCategory] = useState('');
  const [newCategoryUnit, setNewCategoryUnit] = useState('');
  const [showProductNameForm, setShowProductNameForm] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const [loading, setLoading] = useState(false);
  const [unitForms, setUnitForms] = useState({}); // { [categoryName]: { show: bool, value: string } }
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isXs = useMediaQuery(theme.breakpoints.down('sm'));
  const { showNotification } = useNotification();

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
    try {
      const prodRes = await fetch(`${API_BASE}/products`);
      const prodData = await prodRes.json();
      setProducts(prodData);
      // setProductNames([...new Set(prodData.map(p => p.name))]); // This line is no longer needed as productNames are fetched from backend
      const catRes = await fetch(`${API_BASE}/categories`);
      const catData = await catRes.json();
      setCategories(catData); // [{name, units}]
    } catch (err) {
      showNotification('Failed to fetch data from server.', 'error');
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
    try {
      const productData = { ...form, unit };
      productData.name = toTitleCase(productData.name);
      productData.category = toTitleCase(productData.category);
      productData.unit = toTitleCase(productData.unit);
      // Prevent duplicate product (same name and category)
      if (!editingId) {
        const duplicate = products.find(p =>
          p.name.toLowerCase() === productData.name.toLowerCase() &&
          p.category.toLowerCase() === productData.category.toLowerCase()
        );
        if (duplicate) {
          showNotification('Product with this name and category already exists.', 'error');
          setLoading(false);
          return;
        }
      }
      if (editingId) {
        await fetch(`${API_BASE}/products/${editingId}`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify(productData),
        });
        showNotification('Product updated successfully!', 'success');
      } else {
        await fetch(`${API_BASE}/products`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(productData),
        });
        showNotification('Product added successfully!', 'success');
      }
      setForm({ name: '', price: '', stock: '', category: '', unit: '' });
      setShowForm(false);
      setEditingId(null);
      await fetchAll();
    } catch (err) {
      showNotification('Failed to save product.', 'error');
    }
    setLoading(false);
  };

  const handleEdit = p => {
    setForm({ name: p.name, price: p.price, stock: p.stock, category: p.category, unit: p.unit || '' });
    setEditingId(p._id);
    setShowForm(true);
    setShowProductNameForm(false);
  };

  const handleDelete = async id => {
    setLoading(true);
    try {
      await fetch(`${API_BASE}/products/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
      showNotification('Product deleted successfully!', 'success');
      await fetchAll();
    } catch (err) {
      showNotification('Failed to delete product.', 'error');
    }
    setLoading(false);
  };

  const handleAddClick = () => {
    setForm({ name: '', price: '', stock: '', category: '', unit: '' });
    setEditingId(null);
    setShowForm(true);
    setShowProductNameForm(false);
  };

  // Category CRUD
  const handleAddCategory = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch(`${API_BASE}/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: toTitleCase(newCategory), unit: toTitleCase(newCategoryUnit) }),
      });
      setNewCategory('');
      setNewCategoryUnit('');
      await fetchAll();
      if (showForm) setForm(f => ({ ...f, category: toTitleCase(newCategory) }));
    } catch (err) {
      showNotification('Failed to add category.', 'error');
    }
    setLoading(false);
  };
  const handleRemoveCategory = async cat => {
    setLoading(true);
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
      showNotification('Failed to delete category.', 'error');
    }
    setLoading(false);
  };
  const openCategoryForm = () => {
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
    try {
      await fetch(`${API_BASE}/categories/${cat._id}/units`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ unit: toTitleCase(value) }),
      });
      await fetchAll();
      closeUnitForm(catName);
    } catch (err) {
      showNotification('Failed to add unit.', 'error');
    }
    setLoading(false);
  };
  const handleRemoveUnit = async (catName, unit) => {
    const cat = categories.find(c => c.name === catName);
    if (!cat) return;
    setLoading(true);
    try {
      await fetch(`${API_BASE}/categories/${cat._id}/units`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ unit: toTitleCase(unit) }),
      });
      await fetchAll();
    } catch (err) {
      showNotification('Failed to delete unit.', 'error');
    }
    setLoading(false);
  };

  // Product name management (persistent)
  const [newProductNameCategory, setNewProductNameCategory] = useState('');
  const handleAddProductName = async e => {
    e.preventDefault();
    if (!newProductName || !newProductNameCategory) return;
    setLoading(true);
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
      showNotification('Failed to add product name.', 'error');
    }
    setLoading(false);
  };
  const handleRemoveProductName = async name => {
    setLoading(true);
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
      showNotification('Failed to delete product name.', 'error');
    }
    setLoading(false);
  };
  const openProductNameForm = () => {
    setShowProductNameForm(true);
    setShowForm(false);
  };

  // Get units for selected category
  const selectedCategory = categories.find(c => c.name === form.category);
  const unit = selectedCategory ? selectedCategory.unit : '';

  return (
    <>
      <AdminNavbar />
      <Box sx={{ paddingTop: { xs: '56px', md: '60px' }, px: { xs: '0.5rem', md: '0.5rem' } }}>
        <Typography variant="h4" color="primary" sx={{ mb: { xs: 2, md: 3 }, fontWeight: 700, fontSize: { xs: '1.5rem', md: '2.125rem' } }}>
          Product Management
        </Typography>
        {loading && <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}><CircularProgress size={24} sx={{ mr: 2 }} /> Loading...</Box>}
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 3 }}>
          <Button variant="contained" color="warning" startIcon={<AddIcon />} onClick={handleAddClick} fullWidth={isMobile}>Add Product</Button>
          <Button variant="contained" color="success" startIcon={<CategoryIcon />} onClick={() => setShowCategoryDialog(true)} fullWidth={isMobile}>Add Category/Type</Button>
          <Button variant="contained" color="info" startIcon={<LabelIcon />} onClick={openProductNameForm} fullWidth={isMobile}>Add Product Name</Button>
        </Stack>
        {/* Category management area */}
        <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap', mb: 3 }}>
          <Box>
            <Typography fontWeight={600} mb={1}>Categories/Types:</Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {categories.map(cat => (
                <Chip
                  key={cat.name}
                  label={cat.name}
                  onDelete={() => handleRemoveCategory(cat.name)}
                  deleteIcon={<DeleteIcon />}
                  color="default"
                  sx={{ mb: 1 }}
                />
              ))}
            </Stack>
          </Box>
          {/* Product name management area */}
          <Box>
            <Typography fontWeight={600} mb={1}>Product Names:</Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {productNames.map(name => (
                <Chip
                  key={name}
                  label={name}
                  onDelete={() => handleRemoveProductName(name)}
                  deleteIcon={<DeleteIcon />}
                  color="info"
                  sx={{ mb: 1 }}
                />
              ))}
            </Stack>
            {/* Add Product Name Dialog */}
            <Dialog open={showProductNameForm} onClose={() => setShowProductNameForm(false)}>
              <DialogTitle>Add Product Name</DialogTitle>
              <DialogContent>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Select Category</InputLabel>
                  <Select
                    value={newProductNameCategory}
                    onChange={e => setNewProductNameCategory(e.target.value)}
                    label="Select Category"
                  >
                    <MenuItem value=""><em>Select Category</em></MenuItem>
                    {categories.map(cat => <MenuItem key={cat.name} value={cat.name}>{cat.name}</MenuItem>)}
                  </Select>
                </FormControl>
                <TextField
                  label="New Product Name"
                  value={newProductName}
                  onChange={e => setNewProductName(e.target.value)}
                  fullWidth
                />
              </DialogContent>
              <DialogActions>
                <Button onClick={() => { setShowProductNameForm(false); setNewProductName(''); setNewProductNameCategory(''); }}>Cancel</Button>
                <Button onClick={handleAddProductName} variant="contained" color="info">Add</Button>
              </DialogActions>
            </Dialog>
          </Box>
        </Box>
        {/* Product Form Dialog */}
        <Dialog open={showForm} onClose={() => { setShowForm(false); setEditingId(null); setForm({ name: '', price: '', stock: '', category: '', unit: '' }); }} maxWidth="md" fullWidth>
          <DialogTitle>{editingId ? 'Edit Product' : 'Add Product'}</DialogTitle>
          <DialogContent>
            <Stack direction="row" spacing={2} flexWrap="wrap" sx={{ mt: 1 }}>
              <FormControl sx={{ minWidth: 180 }} fullWidth>
                <InputLabel>Select Product Name</InputLabel>
                <Select
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  label="Select Product Name"
                  required
                  fullWidth
                >
                  <MenuItem value=""><em>Select Product Name</em></MenuItem>
                  {productNames.map(name => <MenuItem key={name} value={name}>{name}</MenuItem>)}
                </Select>
              </FormControl>
              <TextField
                name="price"
                value={form.price}
                onChange={handleChange}
                label="Price"
                type="number"
                required
                sx={{ minWidth: 120 }}
                fullWidth
              />
              <TextField
                name="stock"
                value={form.stock}
                onChange={handleChange}
                label="Stock"
                type="number"
                required
                sx={{ minWidth: 120 }}
                fullWidth
              />
              <FormControl sx={{ minWidth: 160 }} fullWidth>
                <InputLabel>Select Category/Type</InputLabel>
                <Select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  label="Select Category/Type"
                  required
                  fullWidth
                >
                  <MenuItem value=""><em>Select Category/Type</em></MenuItem>
                  {categories.map(cat => <MenuItem key={cat.name} value={cat.name}>{cat.name}</MenuItem>)}
                </Select>
              </FormControl>
              <TextField
                name="unit"
                value={unit}
                label="Unit"
                InputProps={{ readOnly: true }}
                sx={{ minWidth: 100, background: '#f5f5f5' }}
                fullWidth
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => { setShowForm(false); setEditingId(null); setForm({ name: '', price: '', stock: '', category: '', unit: '' }); }}>Cancel</Button>
            <Button onClick={handleSubmit} variant="contained" color="warning">{editingId ? 'Update' : 'Add'}</Button>
          </DialogActions>
        </Dialog>
        {/* Add Category/Type Dialog */}
        <Dialog open={showCategoryDialog} onClose={() => setShowCategoryDialog(false)}>
          <DialogTitle>Add Category/Type</DialogTitle>
          <DialogContent>
            <TextField
              label="New Category/Type"
              value={newCategory}
              onChange={e => setNewCategory(e.target.value)}
              fullWidth
              sx={{ mb: 2 }}
            />
            <TextField
              label="Unit (e.g. per unit, kg)"
              value={newCategoryUnit}
              onChange={e => setNewCategoryUnit(e.target.value)}
              fullWidth
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => { setShowCategoryDialog(false); setNewCategory(''); setNewCategoryUnit(''); }}>Cancel</Button>
            <Button onClick={async () => {
              if (!newCategory || !newCategoryUnit) return;
              setLoading(true);
              try {
                await fetch(`${API_BASE}/categories`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ name: toTitleCase(newCategory), unit: toTitleCase(newCategoryUnit) }),
                });
                setNewCategory('');
                setNewCategoryUnit('');
                setShowCategoryDialog(false);
                await fetchAll();
                if (showForm) setForm(f => ({ ...f, category: toTitleCase(newCategory) }));
              } catch (err) {
                showNotification('Failed to add category.', 'error');
              }
              setLoading(false);
            }} variant="contained" color="warning">Add Category</Button>
          </DialogActions>
        </Dialog>
        {/* Product Table/Card View */}
        {isXs ? (
          <Stack spacing={2} sx={{ mt: 4 }}>
            {products.map((p) => (
              <Paper key={p._id || p.id} elevation={3} sx={{ p: 2, borderRadius: 2 }}>
                <Typography variant="h6" fontWeight={700} sx={{ fontSize: 22, color: '#ff8800' }}>{p.name}</Typography>
                <Typography variant="body1" sx={{ fontSize: 20 }}>Price: ₹{p.price}</Typography>
                <Typography variant="body1" sx={{ fontSize: 20 }}>Category/Type: {p.category}</Typography>
                <Typography variant="body1" sx={{ fontSize: 20 }}>Stock: {p.stock}</Typography>
                <Typography variant="body1" sx={{ fontSize: 20 }}>Unit: {p.unit || '-'}</Typography>
                <Box mt={2}>
                  <Button variant="contained" color="success" sx={{ fontSize: 20, py: 1.5, mr: 2 }} onClick={() => handleEdit(p)}>Edit</Button>
                  <Button variant="contained" color="warning" sx={{ fontSize: 20, py: 1.5 }} onClick={() => handleDelete(p._id || p.id)}>Delete</Button>
                </Box>
              </Paper>
            ))}
          </Stack>
        ) : (
          <TableContainer component={Paper} sx={{ mt: 4, borderRadius: 3, boxShadow: 3, overflowX: 'auto' }}>
            <Table size={isMobile ? 'small' : 'medium'} sx={{ minWidth: 0, width: '100%' }}>
              <TableHead>
                <TableRow sx={{ background: '#ff8800' }}>
                  <TableCell sx={{ color: '#fff', fontWeight: 700, px: { xs: 1, md: 2 }, fontSize: { xs: '0.9rem', md: '1rem' } }}>Name</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 700, px: { xs: 1, md: 2 }, fontSize: { xs: '0.9rem', md: '1rem' } }}>Price</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 700, px: { xs: 1, md: 2 }, fontSize: { xs: '0.9rem', md: '1rem' } }}>Category/Type</TableCell>
                  {!isXs && (
                    <TableCell sx={{ color: '#fff', fontWeight: 700, px: { xs: 1, md: 2 }, fontSize: { xs: '0.9rem', md: '1rem' } }}>Stock</TableCell>
                  )}
                  {!isXs && (
                    <TableCell sx={{ color: '#fff', fontWeight: 700, px: { xs: 1, md: 2 }, fontSize: { xs: '0.9rem', md: '1rem' } }}>Unit</TableCell>
                  )}
                  {!isXs && (
                    <TableCell sx={{ color: '#fff', fontWeight: 700, px: { xs: 1, md: 2 }, fontSize: { xs: '0.9rem', md: '1rem' } }}>Actions</TableCell>
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {products.map((p) => (
                  <TableRow key={p._id || p.id} hover>
                    <TableCell sx={{ fontWeight: 500, px: { xs: 1, md: 2 }, fontSize: { xs: '0.9rem', md: '1rem' } }}>{p.name}</TableCell>
                    <TableCell sx={{ px: { xs: 1, md: 2 }, fontSize: { xs: '0.9rem', md: '1rem' } }}>₹{p.price}</TableCell>
                    <TableCell sx={{ px: { xs: 1, md: 2 }, fontSize: { xs: '0.9rem', md: '1rem' } }}>{p.category}</TableCell>
                    {!isXs && (
                      <TableCell sx={{ px: { xs: 1, md: 2 }, fontSize: { xs: '0.9rem', md: '1rem' } }}>{p.stock}</TableCell>
                    )}
                    {!isXs && (
                      <TableCell sx={{ px: { xs: 1, md: 2 }, fontSize: { xs: '0.9rem', md: '1rem' } }}>{p.unit || '-'}</TableCell>
                    )}
                    {!isXs && (
                      <TableCell sx={{ px: { xs: 1, md: 2 } }}>
                        <IconButton color="success" onClick={() => handleEdit(p)} size={isMobile ? 'small' : 'medium'}><EditIcon fontSize={isMobile ? 'small' : 'medium'} /></IconButton>
                        <IconButton color="warning" onClick={() => handleDelete(p._id || p.id)} size={isMobile ? 'small' : 'medium'}><DeleteIcon fontSize={isMobile ? 'small' : 'medium'} /></IconButton>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </>
  );
};

export default ProductManagement; 