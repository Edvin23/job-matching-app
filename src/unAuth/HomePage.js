import React from 'react';
import './HomePage.css';

const HomePage = () => {
  return (
    <div className="landing-container">
      <header className="landing-header">
        <div className="logo-container">
          <div className="logo-wrapper">
            <img src="/logo192.png" alt="Job Matcher Logo" className="logo-image" />
            <h1 className="logo">Job Matcher</h1>
          </div>
          <p className="tagline">Find your perfect career match</p>
        </div>
        <nav className="landing-nav">
          <button className="nav-button login">Login</button>
          <button className="nav-button signup">Sign Up</button>
        </nav>
      </header>
      
      <main className="landing-main">
        <section className="hero-section">
          <h2 className="hero-title">Your Career Journey Starts Here</h2>
          <p className="hero-description">
            Connect with opportunities that match your skills, experience, and aspirations.
            Let Job Matcher guide you to your next career milestone.
          </p>
          <button className="cta-button">Get Started</button>
        </section>
        
        <section className="features-section">
          <div className="feature-card">
            <div className="feature-icon">🎯</div>
            <h3>Smart Matching</h3>
            <p>Our AI-powered algorithm finds jobs that truly match your profile</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Quick Apply</h3>
            <p>Apply to multiple positions with a single click</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📈</div>
            <h3>Career Growth</h3>
            <p>Track your applications and monitor your career progress</p>
          </div>
        </section>
      </main>
      
      <footer className="landing-footer">
        <img src="/logo192.png" alt="Job Matcher Logo" className="footer-logo" />
        <p>&copy; 2023 Job Matcher. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default HomePage;
