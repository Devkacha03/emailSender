import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaEnvelope,
  FaBolt,
  FaShieldAlt,
  FaChartLine,
  FaCog,
  FaUsers,
  FaRocket,
  FaCheckCircle,
  FaStar,
  FaQuoteLeft,
  FaPlay,
  FaArrowRight,
  FaClock,
  FaAward
} from 'react-icons/fa';
import './Home.css';

const features = [
  {
    icon: <FaEnvelope />,
    title: 'Bulk Email Sending',
    description: 'Send thousands of emails efficiently with our advanced bulk email system'
  },
  {
    icon: <FaBolt />,
    title: 'Fast & Reliable',
    description: 'Lightning-fast delivery with high success rates and real-time tracking'
  },
  {
    icon: <FaShieldAlt />,
    title: 'Secure & Encrypted',
    description: 'Your data is protected with industry-standard encryption protocols'
  },
  {
    icon: <FaChartLine />,
    title: 'Analytics Dashboard',
    description: 'Track email performance with detailed analytics and insights'
  },
  {
    icon: <FaCog />,
    title: 'Easy Configuration',
    description: 'Simple setup with multiple email provider support (Gmail, Outlook, etc.)'
  },
  {
    icon: <FaUsers />,
    title: 'Contact Management',
    description: 'Organize and manage your email contacts efficiently'
  }
];

const pricingPlans = [
  {
    name: 'Starter',
    price: '$0',
    period: 'forever',
    description: 'Perfect for getting started',
    features: [
      'Up to 100 emails/month',
      'Basic analytics',
      'Email templates',
      '24/7 support'
    ],
    popular: false
  },
  {
    name: 'Professional',
    price: '$29',
    period: 'per month',
    description: 'For growing businesses',
    features: [
      'Up to 10,000 emails/month',
      'Advanced analytics',
      'AI content generation',
      'Priority support',
      'Custom integrations'
    ],
    popular: true
  },
  {
    name: 'Enterprise',
    price: '$99',
    period: 'per month',
    description: 'For large organizations',
    features: [
      'Unlimited emails',
      'White-label solution',
      'Dedicated account manager',
      'Custom features',
      'SLA guarantee'
    ],
    popular: false
  }
];

const stats = [
  { number: '10M+', label: 'Emails Sent', icon: <FaEnvelope /> },
  { number: '99.9%', label: 'Uptime', icon: <FaClock /> },
  { number: '5K+', label: 'Active Users', icon: <FaUsers /> },
  { number: '24/7', label: 'Support', icon: <FaAward /> }
];

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Marketing Director',
    company: 'TechCorp Inc.',
    rating: 5,
    content: 'EmailSender Pro has transformed how we handle our email campaigns. The AI-powered features save us hours every week!'
  },
  {
    name: 'Michael Chen',
    role: 'CEO',
    company: 'StartupHub',
    rating: 5,
    content: 'The best email platform we\'ve used. Easy to set up, powerful features, and excellent customer support.'
  },
  {
    name: 'Emily Rodriguez',
    role: 'Sales Manager',
    company: 'Global Solutions',
    rating: 5,
    content: 'We\'ve seen a 40% increase in email engagement since switching to EmailSender Pro. Highly recommended!'
  }
];

const Home = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="home-container">
      {/* Header */}
      <header className={`home-header ${isScrolled ? 'scrolled' : ''}`}>
        <div className="header-content">
          <div className="logo" onClick={() => navigate('/')}>
            <FaEnvelope className="logo-icon" />
            <span>EmailSender Pro</span>
          </div>
          <nav className="header-nav">
            <button onClick={() => scrollToSection('features')} className="nav-link">
              Features
            </button>
            <button onClick={() => scrollToSection('pricing')} className="nav-link">
              Pricing
            </button>
            <button onClick={() => navigate('/login')} className="btn-login">
              Sign In
            </button>
            <button onClick={() => navigate('/signup')} className="btn-signup">
              <FaRocket className="btn-icon" />
              Get Started
            </button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">
            <FaCheckCircle className="badge-icon" />
            <span>Trusted by 5,000+ businesses worldwide</span>
          </div>
          <h1 className="hero-title">
            Send Emails at <span className="highlight">Scale</span> with 
            <span className="highlight-gradient"> AI-Powered Precision</span>
          </h1>
          <p className="hero-description">
            The most powerful and intuitive email sending platform for modern businesses. 
            Send personalized bulk campaigns, track performance in real-time, and leverage 
            AI to create compelling content that converts.
          </p>
          <div className="hero-buttons">
            <button onClick={() => navigate('/signup')} className="btn-primary">
              <FaRocket className="btn-icon" />
              Start Free Trial
            </button>
            <button onClick={() => scrollToSection('features')} className="btn-secondary">
              <FaPlay className="btn-icon" />
              Learn More
            </button>
          </div>
          <div className="hero-trust">
            <div className="trust-item">
              <FaCheckCircle className="trust-icon" />
              <span>No credit card required</span>
            </div>
            <div className="trust-item">
              <FaCheckCircle className="trust-icon" />
              <span>14-day free trial</span>
            </div>
            <div className="trust-item">
              <FaCheckCircle className="trust-icon" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
        <div className="hero-image">
          <div className="email-illustration">
            <div className="email-card">
              <div className="email-header"></div>
              <div className="email-body">
                <div className="email-line"></div>
                <div className="email-line short"></div>
                <div className="email-line"></div>
              </div>
            </div>
            <div className="floating-icon icon-1">✉️</div>
            <div className="floating-icon icon-2">📧</div>
            <div className="floating-icon icon-3">📨</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="section-header">
          <h2>Why Choose EmailSender Pro?</h2>
          <p>Everything you need to manage your email campaigns effectively</p>
        </div>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stats-grid">
          {stats.map((stat, index) => (
            <div key={index} className="stat-card">
              <div className="stat-icon">{stat.icon}</div>
              <h3>{stat.number}</h3>
              <p>{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works">
        <div className="section-header">
          <h2>How It Works</h2>
          <p>Get started in minutes, not hours</p>
        </div>
        <div className="steps-container">
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">1</div>
              <h3>Sign Up</h3>
              <p>Create your free account in under 30 seconds</p>
            </div>
            <div className="step-connector"></div>
            <div className="step-card">
              <div className="step-number">2</div>
              <h3>Configure Email</h3>
              <p>Connect Gmail, Outlook, or any SMTP provider</p>
            </div>
            <div className="step-connector"></div>
            <div className="step-card">
              <div className="step-number">3</div>
              <h3>Send Emails</h3>
              <p>Use AI to craft perfect emails and send instantly</p>
            </div>
            <div className="step-connector"></div>
            <div className="step-card">
              <div className="step-number">4</div>
              <h3>Track Results</h3>
              <p>Monitor performance and improve with insights</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="pricing-section">
        <div className="section-header">
          <h2>Simple, Transparent Pricing</h2>
          <p>Choose the plan that fits your business needs</p>
        </div>
        <div className="pricing-grid">
          {pricingPlans.map((plan, index) => (
            <div key={index} className={`pricing-card ${plan.popular ? 'popular' : ''}`}>
              {plan.popular && <div className="popular-badge">Most Popular</div>}
              <div className="pricing-header">
                <h3>{plan.name}</h3>
                <div className="pricing-price">
                  <span className="price">{plan.price}</span>
                  <span className="period">/{plan.period}</span>
                </div>
                <p className="pricing-description">{plan.description}</p>
              </div>
              <ul className="pricing-features">
                {plan.features.map((feature, i) => (
                  <li key={i}>
                    <FaCheckCircle className="feature-check" />
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                className={`pricing-button ${plan.popular ? 'popular-btn' : ''}`}
                onClick={() => navigate('/signup')}
              >
                {plan.name === 'Starter' ? 'Get Started Free' : 'Start Free Trial'}
                <FaArrowRight className="btn-arrow" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <div className="section-header">
          <h2>Loved by Businesses Worldwide</h2>
          <p>See what our customers have to say</p>
        </div>
        <div className="testimonials-grid">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="testimonial-card">
              <FaQuoteLeft className="quote-icon" />
              <div className="stars">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <FaStar key={i} className="star-icon" />
                ))}
              </div>
              <p className="testimonial-content">{testimonial.content}</p>
              <div className="testimonial-author">
                <div className="author-avatar">{testimonial.name.charAt(0)}</div>
                <div className="author-info">
                  <h4>{testimonial.name}</h4>
                  <p>{testimonial.role} at {testimonial.company}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-background">
          <div className="cta-circle cta-circle-1"></div>
          <div className="cta-circle cta-circle-2"></div>
          <div className="cta-circle cta-circle-3"></div>
        </div>
        <div className="cta-content">
          <FaRocket className="cta-icon" />
          <h2>Ready to Transform Your Email Campaigns?</h2>
          <p>Join 5,000+ businesses using EmailSender Pro to reach and engage their audience effectively</p>
          <div className="cta-buttons">
            <button onClick={() => navigate('/signup')} className="btn-cta-primary">
              <FaRocket className="btn-icon" />
              Start Your Free Trial
            </button>
            <button onClick={() => navigate('/login')} className="btn-cta-secondary">
              Sign In to Dashboard
            </button>
          </div>
          <p className="cta-note">✓ No credit card required • ✓ 14-day free trial • ✓ Cancel anytime</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <div className="footer-content">
          <div className="footer-section">
            <div className="footer-logo">
              <FaEnvelope className="logo-icon" />
              <span>EmailSender Pro</span>
            </div>
            <p>The most powerful email sending platform for businesses</p>
          </div>
          <div className="footer-section">
            <h4>Product</h4>
            <ul>
              <li onClick={() => scrollToSection('features')}>Features</li>
              <li onClick={() => scrollToSection('pricing')}>Pricing</li>
              <li>API</li>
              <li>Documentation</li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Company</h4>
            <ul>
              <li>About Us</li>
              <li>Blog</li>
              <li>Careers</li>
              <li>Contact</li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Support</h4>
            <ul>
              <li>Help Center</li>
              <li>Privacy Policy</li>
              <li>Terms of Service</li>
              <li>Status</li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Admin</h4>
            <ul>
              <li onClick={() => setShowAdminModal(true)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FaShieldAlt />
                <span>Admin Panel</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2025 EmailSender Pro. All rights reserved.</p>
        </div>
      </footer>

      {/* Admin Access Modal */}
      {showAdminModal && (
        <div className="admin-modal-overlay" onClick={() => setShowAdminModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowAdminModal(false)}>×</button>
            <div className="modal-header">
              <FaShieldAlt className="modal-icon" />
              <h2>Admin Panel Access</h2>
              <p>Sign in or create an account to access the admin panel</p>
            </div>
            <div className="modal-actions">
              <button 
                className="modal-btn modal-btn-primary" 
                onClick={() => {
                  setShowAdminModal(false);
                  navigate('/admin/login');
                }}
              >
                <FaArrowRight />
                Sign In to Admin Panel
              </button>
              <button 
                className="modal-btn modal-btn-secondary" 
                onClick={() => {
                  setShowAdminModal(false);
                  navigate('/admin/signup');
                }}
              >
                <FaUsers />
                Create Admin Account
              </button>
            </div>
            <div className="modal-footer">
              <p>
                <FaCheckCircle style={{ color: '#10b981', marginRight: '8px' }} />
                Admin accounts have full access to manage users, emails, templates, and analytics
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
