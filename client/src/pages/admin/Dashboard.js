import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';
import { addDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths, isWithinInterval, parseISO } from 'date-fns';

const API_BASE = 'http://localhost:5000/api';
const COLORS = {
  green: '#2ecc40',
  orange: '#ff8800',
  white: '#fff',
  lightBg: '#f7f7f7',
  text: '#222',
  muted: '#888',
};

const Dashboard = () => {
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [view, setView] = useState('month'); // 'today' | 'week' | 'month' | 'lastMonth' | 'halfYear' | 'year'

  // Fetch all data on mount
  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError('');
      try {
        // Users
        const userToken = sessionStorage.getItem('token');
        const userRes = await fetch(`${API_BASE}/users`, { headers: userToken ? { 'Authorization': `Bearer ${userToken}` } : {} });
        const userData = await userRes.json();
        setUsers(Array.isArray(userData) ? userData : []);
        // Products
        const prodRes = await fetch(`${API_BASE}/products`);
        const prodData = await prodRes.json();
        setProducts(Array.isArray(prodData) ? prodData : []);
        // Sales
        const salesRes = await fetch(`${API_BASE}/sales`, { headers: userToken ? { 'Authorization': `Bearer ${userToken}` } : {} });
        const salesData = await salesRes.json();
        setSales(Array.isArray(salesData) ? salesData : []);
        // Expenses (from backend)
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

  // Calculations
  const totalUsers = users.filter(u => u.role !== 'admin').length;
  const totalProducts = products.length;
  const totalOrders = sales.length;
  const totalRevenue = sales.reduce((sum, s) => sum + (s.total || 0), 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const totalSales = totalRevenue;
  const profit = totalSales - totalExpenses;

  // Prepare data for graph: group sales and expenses by date (YYYY-MM-DD)
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
  // Combine dates
  const allDates = Array.from(new Set([
    ...Object.keys(salesByDate),
    ...Object.keys(expensesByDate)
  ])).sort();
  const chartData = allDates.map(date => ({
    date,
    Sales: salesByDate[date] || 0,
    Expenses: expensesByDate[date] || 0,
  }));

  // Helper to filter chartData by date range
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

  return (
    <div>
      <h1 style={{ color: COLORS.orange, marginBottom: '0.5rem', fontWeight: 700 }}>Dashboard Overview</h1>
      <div style={{ color: COLORS.muted, fontWeight: 500, marginBottom: '2rem', fontSize: '1.1rem' }}>Shree Ram Rajasthan Kulfi House</div>
      {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}
      {loading ? (
        <div style={{ color: COLORS.muted, fontWeight: 500, marginBottom: '2rem' }}>Loading dashboard data...</div>
      ) : (
        <div style={{ display: 'flex', gap: '2rem', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
          <StatCard label="Total Users" value={totalUsers} color={COLORS.orange} />
          <StatCard label="Total Products" value={totalProducts} color={COLORS.orange} />
          <StatCard label="Total Orders" value={totalOrders} color={COLORS.orange} />
          <StatCard label="Expenses" value={`₹${totalExpenses.toLocaleString()}`} color={COLORS.orange} />
          <StatCard label="Sales" value={`₹${totalSales.toLocaleString()}`} color={COLORS.orange} />
          {profit > 0 ? (
            <StatCard label="Profit" value={`₹${profit.toLocaleString()}`} color={COLORS.green} />
          ) : profit < 0 ? (
            <StatCard label="Loss" value={`₹${Math.abs(profit).toLocaleString()}`} color={COLORS.orange} />
          ) : (
            <StatCard label="Break Even" value="₹0" color={COLORS.muted} />
          )}
        </div>
      )}
      <div style={{
        background: COLORS.white,
        borderRadius: '12px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
        padding: '2rem',
        minHeight: '320px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '2rem',
      }}>
        <div style={{ fontWeight: 600, fontSize: '1.2rem', color: COLORS.orange, marginBottom: '1rem' }}>
          Sales & Expenses Graph
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          {[
            { label: 'Today', value: 'today' },
            { label: 'This Week', value: 'week' },
            { label: 'This Month', value: 'month' },
            { label: 'Last Month', value: 'lastMonth' },
            { label: 'Half Year', value: 'halfYear' },
            { label: '1 Year', value: 'year' },
          ].map(btn => (
            <button
              key={btn.value}
              onClick={() => setView(btn.value)}
              style={{
                background: view === btn.value ? COLORS.orange : '#fff',
                color: view === btn.value ? '#fff' : COLORS.orange,
                border: `2px solid ${COLORS.orange}`,
                borderRadius: '6px',
                padding: '0.4rem 1.2rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: view === btn.value ? '0 2px 8px rgba(255,136,0,0.10)' : 'none',
              }}
            >
              {btn.label}
            </button>
          ))}
        </div>
        {Array.isArray(filteredChartData) && filteredChartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={filteredChartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Sales" fill="#2ecc40" barSize={30} />
              <Bar dataKey="Expenses" fill="#ff8800" barSize={30} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ color: COLORS.muted, fontWeight: 500, fontSize: '1.1rem', margin: '2rem 0' }}>No data available for chart.</div>
        )}
      </div>
    </div>
  );
};

function StatCard({ label, value, color }) {
  return (
    <div style={{
      background: '#fff',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
      padding: '1.5rem',
      minWidth: '160px',
      flex: '1 1 160px',
      textAlign: 'center',
      borderTop: `4px solid ${color}`,
    }}>
      <div style={{ fontSize: '2rem', fontWeight: 700, color }}>{value}</div>
      <div style={{ color: '#666', marginTop: '0.5rem' }}>{label}</div>
    </div>
  );
}
export default Dashboard; 