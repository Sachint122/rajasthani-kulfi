import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar/Navbar';
import './Contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  useEffect(() => {
    // Scroll animation observer
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.1 });

    const elements = document.querySelectorAll('.animate-on-scroll');
    elements.forEach(el => observer.observe(el));

    return () => {
      observer.disconnect();
    };
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send the form data to your backend
    console.log('Form submitted:', formData);
    alert('Thank you for your message! We will get back to you soon.');
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <div className="contact-page">
      <Navbar />
      
      {/* Hero Section */}
      <section className="contact-hero">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title animate-fade-in">Contact Us</h1>
            <p className="hero-subtitle animate-fade-in-delay">
              Get in touch with us for any questions or feedback
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="contact-section">
        <div className="container">
          <div className="contact-content">
            <div className="contact-info">
              <h2 className="section-title">Visit Us</h2>
              <div className="contact-details">
                <div className="contact-item animate-on-scroll">
                  <span className="contact-icon">📍</span>
                  <div>
                    <h4>Address</h4>
                    <p>123 Kulfi Street, Rajasthan<br />India - 302001</p>
                  </div>
                </div>
                <div className="contact-item animate-on-scroll">
                  <span className="contact-icon">📞</span>
                  <div>
                    <h4>Phone</h4>
                    <p>+91 98765 43210</p>
                  </div>
                </div>
                <div className="contact-item animate-on-scroll">
                  <span className="contact-icon">✉️</span>
                  <div>
                    <h4>Email</h4>
                    <p>info@rajasthanikulfi.com</p>
                  </div>
                </div>
                <div className="contact-item animate-on-scroll">
                  <span className="contact-icon">🕒</span>
                  <div>
                    <h4>Business Hours</h4>
                    <p>Monday - Sunday<br />10:00 AM - 10:00 PM</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="contact-form">
              <h3>Get in Touch</h3>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <input 
                    type="text" 
                    name="name"
                    placeholder="Your Name" 
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <input 
                    type="email" 
                    name="email"
                    placeholder="Your Email" 
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <textarea 
                    name="message"
                    placeholder="Your Message" 
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                  ></textarea>
                </div>
                <button type="submit" className="btn btn-primary">Send Message</button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="map-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Find Us</h2>
            <p className="section-subtitle">Visit our location to experience the authentic taste</p>
          </div>
          <div className="map-container animate-on-scroll">
            <div className="map-placeholder">
              <span>🗺️</span>
              <h3>Interactive Map</h3>
              <p>123 Kulfi Street, Rajasthan, India - 302001</p>
              <button className="btn btn-outline">Get Directions</button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Frequently Asked Questions</h2>
            <p className="section-subtitle">Find answers to common questions about our services</p>
          </div>
          <div className="faq-grid">
            <div className="faq-item animate-on-scroll">
              <h3>What are your delivery hours?</h3>
              <p>We deliver from 10:00 AM to 10:00 PM, seven days a week. Orders placed after 9:30 PM will be delivered the next day.</p>
            </div>
            <div className="faq-item animate-on-scroll">
              <h3>Do you offer catering services?</h3>
              <p>Yes, we provide catering services for events and parties. Please contact us at least 24 hours in advance for large orders.</p>
            </div>
            <div className="faq-item animate-on-scroll">
              <h3>Are your products vegetarian?</h3>
              <p>Most of our products are vegetarian. We have a wide range of vegetarian options including traditional kulfi and fruit-based ice creams.</p>
            </div>
            <div className="faq-item animate-on-scroll">
              <h3>What is your return policy?</h3>
              <p>Due to the nature of our products, we cannot accept returns. However, if you're not satisfied with your order, please contact us immediately.</p>
            </div>
            <div className="faq-item animate-on-scroll">
              <h3>Do you have gluten-free options?</h3>
              <p>Yes, we offer several gluten-free options. Please ask our staff for recommendations when you visit or call us for details.</p>
            </div>
            <div className="faq-item animate-on-scroll">
              <h3>Can I place bulk orders?</h3>
              <p>Absolutely! We welcome bulk orders for events and celebrations. Please contact us at least 48 hours in advance for bulk orders.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h3>Shree Ram Rajasthan Kulfi House</h3>
              <p>Bringing authentic Rajasthani flavors to your doorstep since 2000.</p>
            </div>
            <div className="footer-section">
              <h4>Quick Links</h4>
              <ul>
                <li><a href="/">Home</a></li>
                <li><a href="/about">About</a></li>
                <li><a href="/contact">Contact</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Follow Us</h4>
              <div className="social-links">
                <a href="#" className="social-link">📘</a>
                <a href="#" className="social-link">📷</a>
                <a href="#" className="social-link">🐦</a>
                <a href="#" className="social-link">📺</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 Shree Ram Rajasthan Kulfi House. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Contact; 