import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './AuthModern.css';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('https://rajasthani-kulfi.onrender.com/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, role: 'admin' }),
      });
      const data = await response.json();
      if (response.ok) {
        sessionStorage.setItem('token', data.token);
        sessionStorage.setItem('user', JSON.stringify(data.user));
        setTimeout(() => {
          navigate('/admin');
        }, 500);
      } else {
        alert(data.error || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      alert('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-bg-animated">
      <div className="auth-center">
        <div className="auth-card-modern">
          <div className="auth-header-modern">
            <h2>Welcome Back</h2>
            <p>Sign in to your account</p>
          </div>
          {/* Removed user/admin toggle buttons */}
          <form onSubmit={handleSubmit} className="auth-form-modern">
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="password-input-container" style={{ display: 'flex', alignItems: 'center' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  required
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={togglePasswordVisibility}
                  style={{ marginLeft: '0.5em', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2em' }}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>
            <div className="form-options" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1em' }}>
              <label className="checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5em' }}>
                <input type="checkbox" />
                <span>Remember me</span>
              </label>
              <button type="button" className="forgot-password" style={{ background: 'none', border: 'none', color: '#ff8800', cursor: 'pointer', fontWeight: 600 }}>Forgot Password?</button>
            </div>
            <button 
              type="submit" 
              className={`auth-btn-modern ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
          <div className="auth-footer-modern">
            <p>
              Don't have an account? 
              <Link to="/register" className="auth-link">Sign up here</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 