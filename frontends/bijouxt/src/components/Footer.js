import { Link } from 'react-router-dom';
import Company from '../utilities/Company';

const footerCol = (title, links) => (
  <div style={{ minWidth: 140 }}>
    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-light)', opacity: 0.9, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
      {title}
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {links.map((item) =>
        item.to != null ? (
          <Link
            key={item.label}
            to={item.to}
            style={{ color: 'var(--text-light)', opacity: 0.85, fontSize: '0.9rem' }}
          >
            {item.label}
          </Link>
        ) : (
          <a
            key={item.label}
            href={item.href || '#'}
            style={{ color: 'var(--text-light)', opacity: 0.85, fontSize: '0.9rem' }}
          >
            {item.label}
          </a>
        )
      )}
    </div>
  </div>
);

const Footer = () => {
  const quickLinks = [
    { label: 'Home', to: '/' },
    { label: 'How It Works', href: '/#how-it-works' },
    { label: 'For Businesses', href: '/#for-businesses' },
    { label: 'About', href: '/#about' }
  ];

  const resources = [
    { label: 'Customer Portal', to: '/customer/login' },
    { label: 'Vendor Portal', to: '/vendor/login' },
    { label: 'Admin (DFBA)', to: '/admin/login' }
  ];

  const company = [
    { label: 'About DFBA', href: 'https://gbpa.com/' },
    { label: 'Vision', href: '/#about' },
    { label: 'Contact', href: Company.email ? `mailto:${Company.email}` : '#' },
    { label: 'Terms of Service', to: '/terms' },
    { label: 'Privacy Policy', to: '/privacy' },
    { label: 'Data Handling', to: '/data-handling' }
  ];

  return (
    <footer
      className="footer-light"
      style={{
        background: 'var(--primary-dark)',
        color: 'var(--text-light)',
        marginTop: 'auto'
      }}
    >
      <div
        className="footer-inner"
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '48px 24px 24px'
        }}
      >
        <div
          className="footer-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: 32,
            marginBottom: 32
          }}
        >
          {footerCol('Quick Links', quickLinks)}
          {footerCol('Resources', resources)}
          {footerCol('Company', company)}
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-light)', opacity: 0.9, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Get in Touch
            </div>
            <div style={{ color: 'var(--text-light)', opacity: 0.9, fontSize: '0.9rem', lineHeight: 1.6 }}>
              {Company.address && <div>{Company.address}</div>}
              {Company.email && <div><a href={`mailto:${Company.email}`} style={{ color: '#fff' }}>{Company.email}</a></div>}
              {Company.phone && <div><a href={`tel:${Company.phone.replace(/\D/g, '')}`} style={{ color: '#fff' }}>{Company.phone}</a></div>}
              {!Company.address && !Company.email && !Company.phone && <div>Downtown Freeport, Grand Bahama</div>}
            </div>
          </div>
        </div>
        <div
          style={{
            borderTop: '1px solid rgba(255,255,255,0.15)',
            paddingTop: 24,
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 16
          }}
        >
          <small style={{ opacity: 0.8, fontSize: '0.85rem' }}>
            © {new Date().getFullYear()} {Company.name}. All rights reserved.
            <span style={{ margin: '0 8px' }}>|</span>
            <Link to="/terms" style={{ color: 'inherit' }}>Terms</Link>
            <span style={{ margin: '0 8px' }}>|</span>
            <Link to="/privacy" style={{ color: 'inherit' }}>Privacy</Link>
            <span style={{ margin: '0 8px' }}>|</span>
            <Link to="/data-handling" style={{ color: 'inherit' }}>Data Handling</Link>
          </small>
          <small style={{ opacity: 0.85, fontSize: '0.85rem' }}>
            Made with <span style={{ color: '#e74c3c' }}>♥</span>{' '}
            <a href="https://kemisdigital.com" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'underline' }}>
              KemisDigital
            </a>
          </small>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
