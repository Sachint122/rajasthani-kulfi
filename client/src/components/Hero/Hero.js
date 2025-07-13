import React from 'react';
import './Hero.css';

const Hero = () => {
  return (
    <section className="hero" id="home">
      <div className="container">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              Taste the <span className="highlight">Authentic</span> Flavors of Rajasthan
            </h1>
            <p className="hero-description">
              Discover the rich heritage of traditional kulfi and premium ice creams, 
              crafted with love and authentic Rajasthani recipes passed down through generations at Shree Ram Rajasthan Kulfi House.
            </p>
            <div className="hero-features">
              <div className="feature">
                <span className="feature-icon">🍦</span>
                <span>Traditional Kulfi</span>
              </div>
              <div className="feature">
                <span className="feature-icon">🥛</span>
                <span>Fresh Ingredients</span>
              </div>
              <div className="feature">
                <span className="feature-icon">🌿</span>
                <span>Natural Flavors</span>
              </div>
            </div>
            <div className="hero-buttons">
              <button className="btn btn-primary">Explore Menu</button>
              <button className="btn btn-secondary">Learn More</button>
            </div>
          </div>
          <div className="hero-image">
            <div className="image-placeholder">
              <span>🍦</span>
              <p>Delicious Kulfi & Ice Cream</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero; 