import React, { useEffect } from 'react';
import Navbar from '../components/Navbar/Navbar';
import './About.css';

const About = () => {
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

  return (
    <div className="about-page">
      <Navbar />
      
      {/* Hero Section */}
      <section className="about-hero">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title animate-fade-in">About Us</h1>
            <p className="hero-subtitle animate-fade-in-delay">
              Discover the story behind Shree Ram Rajasthan Kulfi House
            </p>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="about-section">
        <div className="container">
          <div className="about-content">
            <div className="about-text">
              <h2 className="section-title">Our Story</h2>
              <p className="about-description">
                Shree Ram Rajasthan Kulfi House has been serving authentic Rajasthani kulfi and premium ice creams for over two decades. 
                Our journey began with a simple mission: to bring the traditional flavors of Rajasthan to every household.
              </p>
              <p className="about-description">
                Today, we continue to uphold the same values of quality, tradition, and customer satisfaction that our founders established.
                Every scoop tells a story of heritage, passion, and dedication to excellence.
              </p>
              <div className="about-stats">
                <div className="stat">
                  <h3>20+</h3>
                  <p>Years of Experience</p>
                </div>
                <div className="stat">
                  <h3>50+</h3>
                  <p>Unique Flavors</p>
                </div>
                <div className="stat">
                  <h3>1000+</h3>
                  <p>Happy Customers</p>
                </div>
              </div>
            </div>
            <div className="about-image">
              <div className="image-placeholder">
                <span>🏪</span>
                <p>Our Kulfi House</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="mission-section">
        <div className="container">
          <div className="mission-content">
            <div className="mission-card animate-on-scroll">
              <div className="mission-icon">🎯</div>
              <h3>Our Mission</h3>
              <p>To preserve and promote the authentic taste of Rajasthani kulfi while bringing joy to every customer through our traditional recipes and modern innovations.</p>
            </div>
            <div className="mission-card animate-on-scroll">
              <div className="mission-icon">👁️</div>
              <h3>Our Vision</h3>
              <p>To become the most trusted name in traditional Indian desserts, known for quality, authenticity, and customer satisfaction across the nation.</p>
            </div>
            <div className="mission-card animate-on-scroll">
              <div className="mission-icon">💎</div>
              <h3>Our Values</h3>
              <p>Quality, Tradition, Innovation, Customer Satisfaction, and Community - these core values guide everything we do.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="team-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Meet Our Team</h2>
            <p className="section-subtitle">The passionate people behind our delicious creations</p>
          </div>
          <div className="team-grid">
            <div className="team-member animate-on-scroll">
              <div className="member-avatar">👨‍🍳</div>
              <h3>Ram Singh</h3>
              <p className="member-role">Master Chef</p>
              <p className="member-desc">20+ years of experience in traditional kulfi making</p>
            </div>
            <div className="team-member animate-on-scroll">
              <div className="member-avatar">👩‍💼</div>
              <h3>Priya Sharma</h3>
              <p className="member-role">Quality Manager</p>
              <p className="member-desc">Ensuring every product meets our high standards</p>
            </div>
            <div className="team-member animate-on-scroll">
              <div className="member-avatar">👨‍💻</div>
              <h3>Arjun Patel</h3>
              <p className="member-role">Operations Head</p>
              <p className="member-desc">Managing smooth operations and customer service</p>
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

export default About; 