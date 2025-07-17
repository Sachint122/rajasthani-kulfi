import React, { useState, useEffect } from 'react';
import { Typography, Grid, Card, CardContent, Paper, Box, CircularProgress } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';
import { addDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths, isWithinInterval, parseISO } from 'date-fns';
import AssessmentIcon from '@mui/icons-material/Assessment';
import PeopleIcon from '@mui/icons-material/People';
import InventoryIcon from '@mui/icons-material/Inventory';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import MoneyOffIcon from '@mui/icons-material/MoneyOff';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import { useTheme, useMediaQuery } from '@mui/material';
import AdminNavbar from '../../components/AdminNavbar';

const API_BASE = 'http://192.168.152.199:5000/api';
const COLORS = {
  green: '#2ecc40',
  orange: '#ff8800',
  white: '#fff',
  lightBg: '#f7f7f7',
  text: '#222',
  muted: '#888',
};

const statIcons = {
  'Total Users': <PeopleIcon fontSize="large" color="primary" />,
  'Total Products': <InventoryIcon fontSize="large" color="primary" />,
  'Total Orders': <ShoppingCartIcon fontSize="large" color="primary" />,
  'Expenses': <MoneyOffIcon fontSize="large" color="primary" />,
  'Sales': <MonetizationOnIcon fontSize="large" color="primary" />,
  'Profit': <AssessmentIcon fontSize="large" color="success" />,
  'Loss': <AssessmentIcon fontSize="large" color="error" />,
  'Break Even': <AssessmentIcon fontSize="large" color="disabled" />,
};

const Dashboard = () => {
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [view, setView] = useState('month');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError('');
      try {
        const userToken = sessionStorage.getItem('token');
        const userRes = await fetch(`${API_BASE}/users`, { headers: userToken ? { 'Authorization': `Bearer ${userToken}` } : {} });
        const userData = await userRes.json();
        setUsers(Array.isArray(userData) ? userData : []);
        const prodRes = await fetch(`${API_BASE}/products`);
        const prodData = await prodRes.json();
        setProducts(Array.isArray(prodData) ? prodData : []);
        const salesRes = await fetch(`${API_BASE}/sales`, { headers: userToken ? { 'Authorization': `Bearer ${userToken}` } : {} });
        const salesData = await salesRes.json();
        setSales(Array.isArray(salesData) ? salesData : []);
        const expenseRes = await fetch(`${API_BASE}/expenses`);
        const expenseData = await expenseRes.json();
        setExpenses(Array.isArray(expenseData) ? expenseData : []);
      } catch (err) {
        setError('Failed to fetch dashboard data.');
      }
      setLoading(false);
    };
    fetchAll();
  }, []);

  const totalUsers = users.filter(u => u.role !== 'admin').length;
  const totalProducts = products.length;
  const totalOrders = sales.length;
  const totalRevenue = sales.reduce((sum, s) => sum + (s.total || 0), 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const totalSales = totalRevenue;
  const profit = totalSales - totalExpenses;

  const salesByDate = {};
  sales.forEach(s => {
    const date = s.date ? new Date(s.date).toISOString().slice(0, 10) : '';
    if (!salesByDate[date]) salesByDate[date] = 0;
    salesByDate[date] += s.total || 0;
  });
  const expensesByDate = {};
  expenses.forEach(e => {
    const date = e.date ? new Date(e.date).toISOString().slice(0, 10) : '';
    if (!expensesByDate[date]) expensesByDate[date] = 0;
    expensesByDate[date] += e.amount || 0;
  });
  const allDates = Array.from(new Set([
    ...Object.keys(salesByDate),
    ...Object.keys(expensesByDate)
  ])).sort();
  const chartData = allDates.map(date => ({
    date,
    Sales: salesByDate[date] || 0,
    Expenses: expensesByDate[date] || 0,
  }));

  const filterChartDataByView = (data, view) => {
    const now = new Date();
    let start, end;
    switch (view) {
      case 'today':
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        end = addDays(start, 1);
        break;
      case 'week':
        start = startOfWeek(now, { weekStartsOn: 1 });
        end = endOfWeek(now, { weekStartsOn: 1 });
        break;
      case 'month':
        start = startOfMonth(now);
        end = endOfMonth(now);
        break;
      case 'lastMonth':
        const lastMonthDate = subMonths(now, 1);
        start = startOfMonth(lastMonthDate);
        end = endOfMonth(lastMonthDate);
        break;
      case 'halfYear':
        start = subMonths(now, 6);
        end = now;
        break;
      case 'year':
        start = startOfYear(now);
        end = endOfYear(now);
        break;
      default:
        return data;
    }
    return data.filter(d => {
      if (!d.date) return false;
      const dateObj = parseISO(d.date);
      return isWithinInterval(dateObj, { start, end });
    });
  };

  const filteredChartData = filterChartDataByView(chartData, view);

  const statCards = [
    { label: 'Total Users', value: totalUsers, color: COLORS.orange },
    { label: 'Total Products', value: totalProducts, color: COLORS.orange },
    { label: 'Total Orders', value: totalOrders, color: COLORS.orange },
    { label: 'Expenses', value: `₹${totalExpenses.toLocaleString()}`, color: COLORS.orange },
    { label: 'Sales', value: `₹${totalSales.toLocaleString()}`, color: COLORS.orange },
    profit > 0
      ? { label: 'Profit', value: `₹${profit.toLocaleString()}`, color: COLORS.green }
      : profit < 0
        ? { label: 'Loss', value: `₹${Math.abs(profit).toLocaleString()}`, color: COLORS.orange }
        : { label: 'Break Even', value: '₹0', color: COLORS.muted },
  ];
  return (
    <>
      <AdminNavbar />
      <Box sx={{ paddingTop: { xs: '56px', md: '60px' }, px: { xs: '0.5rem', md: '0.5rem' } }}>
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: COLORS.lightBg }}>
          <Box sx={{ flexGrow: 1, p: { xs: 1, md: 0 } }}>
            <Box sx={{ p: { xs: 2, md: 0 } }}>
              {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
                  <CircularProgress color="warning" />
                </Box>
              ) : (
                <>
                  <Box sx={{ mb: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <Typography variant="h4" color="primary" sx={{ mb: 2, fontWeight: 700 }}>
                        Dashboard Overview
                      </Typography>
                    </Box>
                    <Grid container spacing={3} sx={{ mb: 2 }} alignItems="flex-start" justifyContent="flex-start">
                      {statCards.map(card => (
                        <Grid item xs={12} sm={6} md={4} lg={2} key={card.label}>
                          <Card sx={{ borderTop: `5px solid ${card.color}`, borderRadius: 2, boxShadow: 2 }}>
                            <CardContent sx={{ textAlign: 'center' }}>
                              <Box sx={{ mb: 1 }}>{statIcons[card.label]}</Box>
                              <Typography variant="h5" sx={{ fontWeight: 700, color: card.color }}>{card.value}</Typography>
                              <Typography variant="subtitle2" color="text.secondary">{card.label}</Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                  <Paper elevation={3} sx={{ p: 3, borderRadius: 3, mb: 4 }}>
                    <Typography variant="h6" sx={{ color: COLORS.orange, fontWeight: 600, mb: 2 }}>
                      Sales & Expenses Graph
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                      {[
                        { label: 'Today', value: 'today' },
                        { label: 'This Week', value: 'week' },
                        { label: 'This Month', value: 'month' },
                        { label: 'Last Month', value: 'lastMonth' },
                        { label: 'Half Year', value: 'halfYear' },
                        { label: '1 Year', value: 'year' },
                      ].map(btn => (
                        <Box
                          key={btn.value}
                          component="button"
                          onClick={() => setView(btn.value)}
                          sx={{
                            background: view === btn.value ? COLORS.orange : '#fff',
                            color: view === btn.value ? '#fff' : COLORS.orange,
                            border: `2px solid ${COLORS.orange}`,
                            borderRadius: 1,
                            px: 2,
                            py: 0.5,
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            boxShadow: view === btn.value ? '0 2px 8px rgba(255,136,0,0.10)' : 'none',
                            outline: 'none',
                            fontSize: '1rem',
                            mr: 1,
                            mb: 1,
                          }}
                        >
                          {btn.label}
                        </Box>
                      ))}
                    </Box>
                    {Array.isArray(filteredChartData) && filteredChartData.length > 0 ? (
                      <Box sx={{ width: '100%', height: 340 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={filteredChartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="Sales" fill={COLORS.green} barSize={30} />
                            <Bar dataKey="Expenses" fill={COLORS.orange} barSize={30} />
                          </BarChart>
                        </ResponsiveContainer>
                      </Box>
                    ) : (
                      <Typography color="text.secondary" sx={{ fontWeight: 500, fontSize: '1.1rem', my: 4, textAlign: 'center' }}>
                        No data available for chart.
                      </Typography>
                    )}
                  </Paper>
                </>
              )}
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default Dashboard; 