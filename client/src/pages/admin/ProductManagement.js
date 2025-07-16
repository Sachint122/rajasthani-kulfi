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
  const [newCategory, setNewCategory] = useState('');
  const [newCategoryUnit, setNewCategoryUnit] = useState('');
  const [showProductNameForm, setShowProductNameForm] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [unitForms, setUnitForms] = useState({}); // { [categoryName]: { show: bool, value: string } }
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

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
      // Prevent duplicate product (same name and category)
      if (!editingId) {
        const duplicate = products.find(p =>
          p.name.toLowerCase() === productData.name.toLowerCase() &&
          p.category.toLowerCase() === productData.category.toLowerCase()
        );
        if (duplicate) {
          setError('Product with this name and category already exists.');
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
  };

  // Get units for selected category
  const selectedCategory = categories.find(c => c.name === form.category);
  const unit = selectedCategory ? selectedCategory.unit : '';

  return (
    <><AdminNavbar />
      <Box sx={{ paddingTop: { xs: '56px', md: '30px' } }}></Box>
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        <Box sx={{ flexGrow: 1, p: { xs: 1, md: 0 } }}>
          <Typography variant="h4" color="primary" sx={{ mb: 2, fontWeight: 700 }}>
            Product Management
          </Typography>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {loading && <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}><CircularProgress size={24} sx={{ mr: 2 }} /> Loading...</Box>}
          <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
            <Button variant="contained" color="warning" startIcon={<AddIcon />} onClick={handleAddClick}>Add Product</Button>
            <Button variant="contained" color="success" startIcon={<CategoryIcon />} onClick={() => setShowCategoryDialog(true)}>Add Category/Type</Button>
            <Button variant="contained" color="info" startIcon={<LabelIcon />} onClick={openProductNameForm}>Add Product Name</Button>
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
                <FormControl sx={{ minWidth: 180 }}>
                  <InputLabel>Select Product Name</InputLabel>
                  <Select
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    label="Select Product Name"
                    required
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
                />
                <TextField
                  name="stock"
                  value={form.stock}
                  onChange={handleChange}
                  label="Stock"
                  type="number"
                  required
                  sx={{ minWidth: 120 }}
                />
                <FormControl sx={{ minWidth: 160 }}>
                  <InputLabel>Select Category/Type</InputLabel>
                  <Select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    label="Select Category/Type"
                    required
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
                setError('');
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
                  setError('Failed to add category.');
                }
                setLoading(false);
              }} variant="contained" color="warning">Add Category</Button>
            </DialogActions>
          </Dialog>
          {/* Product Table */}
          <TableContainer component={Paper} sx={{ mt: 4, borderRadius: 3, boxShadow: 3 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ background: '#ff8800' }}>
                  <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Name</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Price</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Stock</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Category/Type</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Unit</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {products.map((p) => (
                  <TableRow key={p._id || p.id} hover>
                    <TableCell sx={{ fontWeight: 500 }}>{p.name}</TableCell>
                    <TableCell>₹{p.price}</TableCell>
                    <TableCell>{p.stock}</TableCell>
                    <TableCell>{p.category}</TableCell>
                    <TableCell>{p.unit || '-'}</TableCell>
                    <TableCell>
                      <IconButton color="success" onClick={() => handleEdit(p)}><EditIcon /></IconButton>
                      <IconButton color="warning" onClick={() => handleDelete(p._id || p.id)}><DeleteIcon /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Box>
    </>
  );
};

export default ProductManagement; 