import { useState } from 'react';
import { Link } from 'react-router-dom';
import Company from '../utilities/Company';
import Button from './Button';
import '../css/button.css';

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    setMobileOpen(false);
  };

  const navLinks = [
    { label: 'How It Works', id: 'how-it-works' },
    { label: 'For Businesses', id: 'for-businesses' },
    { label: 'About', id: 'about' }
  ];

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'var(--primary-dark)',
        boxShadow: '0 2px 10px rgba(0,0,0,0.15)'
      }}
    >
      <div
        className="navbar-inner"
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '12px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Link to="/" style={{ display: 'flex', alignItems: 'center' }}>
          <span
            className="navbar-logo"
            style={{
              fontSize: '1.25rem',
              fontWeight: 800,
              color: 'var(--text-light)',
              letterSpacing: '0.02em'
            }}
          >
            {Company.name}
          </span>
        </Link>

        <nav className="hide-on-med-and-down" style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => scrollTo(link.id)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-light)',
                cursor: 'pointer',
                fontSize: '0.95rem',
                opacity: 0.9
              }}
            >
              {link.label}
            </button>
          ))}
          <Link to="/customer/login">
            <Button
              style={{
                background: 'var(--accent-gold)',
                color: 'var(--text-dark)',
                padding: '10px 20px',
                borderRadius: 6,
                fontWeight: 700,
                border: 'none'
              }}
              handleClick={() => {}}
            >
              Customer Login
            </Button>
          </Link>
          <Link to="/vendor/login">
            <Button
              style={{
                background: 'transparent',
                color: 'var(--text-light)',
                padding: '10px 20px',
                borderRadius: 6,
                fontWeight: 600,
                border: '2px solid var(--text-light)'
              }}
              handleClick={() => {}}
            >
              Vendor Login
            </Button>
          </Link>
        </nav>

        <button
          className="hide-on-large-only"
          onClick={() => setMobileOpen(!mobileOpen)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-light)',
            cursor: 'pointer',
            padding: 8
          }}
          aria-label="Menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            {mobileOpen ? (
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            ) : (
              <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
            )}
          </svg>
        </button>
      </div>

      {mobileOpen && (
        <div
          className="hide-on-large-only"
          style={{
            background: 'var(--bg-dark)',
            padding: '16px 24px',
            borderTop: '1px solid rgba(255,255,255,0.1)'
          }}
        >
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => scrollTo(link.id)}
              style={{
                display: 'block',
                width: '100%',
                background: 'none',
                border: 'none',
                color: 'var(--text-light)',
                cursor: 'pointer',
                padding: '12px 0',
                textAlign: 'left',
                fontSize: '1rem'
              }}
            >
              {link.label}
            </button>
          ))}
          <Link to="/customer/login" style={{ display: 'block', marginTop: 8 }} onClick={() => setMobileOpen(false)}>
            <Button
              style={{
                background: 'var(--accent-gold)',
                color: 'var(--text-dark)',
                padding: '12px 20px',
                borderRadius: 6,
                width: '100%',
                fontWeight: 700
              }}
              handleClick={() => {}}
            >
              Customer Login
            </Button>
          </Link>
          <Link to="/vendor/login" style={{ display: 'block', marginTop: 8 }} onClick={() => setMobileOpen(false)}>
            <Button
              style={{
                background: 'transparent',
                color: 'var(--text-light)',
                padding: '12px 20px',
                borderRadius: 6,
                width: '100%',
                border: '2px solid var(--text-light)'
              }}
              handleClick={() => {}}
            >
              Vendor Login
            </Button>
          </Link>
        </div>
      )}
    </header>
  );
};

export default Navbar;
