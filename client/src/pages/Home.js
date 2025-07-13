import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar/Navbar';
import './Home.css';

const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    // Auto-slide for hero section
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 3);
    }, 5000);

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
      clearInterval(interval);
      observer.disconnect();
    };
  }, []);

  const heroSlides = [
    {
      title: "Authentic Rajasthani Kulfi",
      subtitle: "Taste the Tradition",
      description: "Experience the rich flavors of traditional kulfi, crafted with love and authentic recipes passed down through generations.",
      image: "🍦",
      color: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
    },
    {
      title: "Premium Ice Creams",
      subtitle: "Modern Delights",
      description: "Discover our premium ice cream collection, made with the finest ingredients and innovative flavors.",
      image: "🍨",
      color: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
    },
    {
      title: "Fresh & Natural",
      subtitle: "Pure Ingredients",
      description: "Every scoop is made with fresh, natural ingredients, ensuring the best taste and quality for our customers.",
      image: "🥛",
      color: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
    }
  ];

  return (
    <div className="home">
      <Navbar />
      
      {/* Hero Section with Slider */}
      <section className="hero-section" id="home">
        <div className="hero-slider">
          {heroSlides.map((slide, index) => (
            <div 
              key={index}
              className={`hero-slide ${index === currentSlide ? 'active' : ''}`}
              style={{ background: slide.color }}
            >
              <div className="container">
                <div className="hero-content">
                  <div className="hero-text">
                    <h1 className="hero-title animate-fade-in">
                      {slide.title}
                    </h1>
                    <h2 className="hero-subtitle animate-fade-in-delay">
                      {slide.subtitle}
                    </h2>
                    <p className="hero-description animate-fade-in-delay-2">
                      {slide.description}
                    </p>
                    <div className="hero-buttons animate-fade-in-delay-3">
                      <button className="btn btn-primary">Order Now</button>
                      <button className="btn btn-secondary">View Menu</button>
                    </div>
                  </div>
                  <div className="hero-image animate-float">
                    <div className="hero-icon">
                      {slide.image}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          <div className="slider-dots">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                className={`dot ${index === currentSlide ? 'active' : ''}`}
                onClick={() => setCurrentSlide(index)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Why Choose Us</h2>
            <p className="section-subtitle">Experience the difference with our unique offerings</p>
          </div>
          <div className="features-grid">
            <div className="feature-card animate-on-scroll">
              <div className="feature-icon">🏺</div>
              <h3>Traditional Recipes</h3>
              <p>Authentic Rajasthani recipes passed down through generations</p>
            </div>
            <div className="feature-card animate-on-scroll">
              <div className="feature-icon">🌿</div>
              <h3>Natural Ingredients</h3>
              <p>Made with fresh, natural ingredients for the best taste</p>
            </div>
            <div className="feature-card animate-on-scroll">
              <div className="feature-icon">⚡</div>
              <h3>Fast Delivery</h3>
              <p>Quick and reliable delivery to your doorstep</p>
            </div>
            <div className="feature-card animate-on-scroll">
              <div className="feature-icon">💎</div>
              <h3>Premium Quality</h3>
              <p>Highest quality standards in every product</p>
            </div>
          </div>
        </div>
      </section>

      {/* Products Preview */}
      <section className="products-preview">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Popular Flavors</h2>
            <p className="section-subtitle">Discover our most loved kulfi and ice cream flavors</p>
          </div>
          <div className="products-grid">
            {[
              { name: "Kesar Pista Kulfi", price: "₹80", icon: "🍦", color: "#FFD700" },
              { name: "Mango Ice Cream", price: "₹120", icon: "🥭", color: "#FFA500" },
              { name: "Chocolate Fudge", price: "₹150", icon: "🍫", color: "#8B4513" },
              { name: "Vanilla Delight", price: "₹100", icon: "🍨", color: "#F5F5DC" },
              { name: "Strawberry Blast", price: "₹130", icon: "🍓", color: "#FF69B4" },
              { name: "Butterscotch", price: "₹140", icon: "🍯", color: "#DAA520" }
            ].map((product, index) => (
              <div key={index} className="product-card animate-on-scroll">
                <div className="product-icon" style={{ backgroundColor: product.color }}>
                  {product.icon}
                </div>
                <h3>{product.name}</h3>
                <p className="price">{product.price}</p>
                <button className="btn btn-outline">Add to Cart</button>
              </div>
            ))}
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
                <div className="contact-item">
                  <span className="contact-icon">📍</span>
                  <div>
                    <h4>Address</h4>
                    <p>123 Kulfi Street, Rajasthan<br />India - 302001</p>
                  </div>
                </div>
                <div className="contact-item">
                  <span className="contact-icon">📞</span>
                  <div>
                    <h4>Phone</h4>
                    <p>+91 98765 43210</p>
                  </div>
                </div>
                <div className="contact-item">
                  <span className="contact-icon">✉️</span>
                  <div>
                    <h4>Email</h4>
                    <p>info@rajasthanikulfi.com</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="contact-form">
              <h3>Get in Touch</h3>
              <form>
                <input type="text" placeholder="Your Name" />
                <input type="email" placeholder="Your Email" />
                <textarea placeholder="Your Message"></textarea>
                <button type="submit" className="btn btn-primary">Send Message</button>
              </form>
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

export default Home; 