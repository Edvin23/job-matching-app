import React, { useState } from 'react';
import './HomePage.css';
import { signInWithGoogle } from '../googleAuth';

const HomePage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      await signInWithGoogle();
      // Redirect or update UI after successful login
    } catch (err) {
      setError('Failed to sign in with Google. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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
          <button 
            className="nav-button login" 
            onClick={handleGoogleSignIn}
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Login with Google'}
          </button>
          <button className="nav-button signup">Sign Up</button>
        </nav>
        {error && <div className="error-message">{error}</div>}
      </header>
      
      <main className="landing-main">
        <section className="hero-section">
          <h2 className="hero-title">Your Career Journey Starts Here</h2>
          <p className="hero-description">
            Connect with opportunities that match your skills, experience, and aspirations.
            Let Job Matcher guide you to your next career milestone.
          </p>
          <button className="cta-button" onClick={handleGoogleSignIn} disabled={loading}>
            {loading ? 'Signing in...' : 'Get Started'}
          </button>
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
