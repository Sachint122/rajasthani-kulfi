import React from 'react';
import './About.css';

const About = () => {
  return (
    <section className="about section" id="about">
      <div className="container">
        <h2 className="section-title">About Shree Ram Rajasthan Kulfi House</h2>
        <p className="section-subtitle">A legacy of authentic flavors since 1995</p>
        
        <div className="about-content">
          <div className="about-text">
            <div className="about-item">
              <h3>Our Story</h3>
              <p>
                Founded in the heart of Rajasthan, Shree Ram Rajasthan Kulfi House has been serving 
                authentic traditional kulfi and premium ice creams for over 25 years. 
                Our recipes have been passed down through generations, preserving the 
                rich culinary heritage of Rajasthan.
              </p>
            </div>
            
            <div className="about-item">
              <h3>Traditional Methods</h3>
              <p>
                We use age-old techniques and traditional methods to create our kulfi, 
                ensuring every bite carries the authentic taste of Rajasthan. Our kulfi 
                is made using pure milk, natural ingredients, and traditional spices.
              </p>
            </div>
            
            <div className="about-item">
              <h3>Quality Ingredients</h3>
              <p>
                We source only the finest ingredients - from locally produced milk to 
                hand-picked nuts and natural flavorings. Every ingredient is carefully 
                selected to maintain the highest quality standards.
              </p>
            </div>
          </div>
          
          <div className="about-stats">
            <div className="stat-item">
              <div className="stat-number">25+</div>
              <div className="stat-label">Years of Experience</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">50+</div>
              <div className="stat-label">Unique Flavors</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">1000+</div>
              <div className="stat-label">Happy Customers</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">5</div>
              <div className="stat-label">Locations</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About; 