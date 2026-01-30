import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import cookies from '../../utilities/Cookies';
import Toast from '../../components/Toast';
import Flexbox from '../../components/Flexbox';
import Spacebox from '../../components/Spacebox';
import { Typography, Container } from '@mui/material';
import requests from '../../handlers/requests';
import Company from '../../utilities/Company';
import Footer from '../../components/Footer';

const AdminDashboard = ({ title }) => {
  if (typeof document !== 'undefined' && document.querySelector('title')) {
    document.querySelector('title').innerHTML = title;
  }

  const [open, setOpen] = useState(false);
  const [severity, setSeverity] = useState('success');
  const [msg, setToastMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const navigate = useNavigate();
  const token = cookies.getCookies('admin-token');

  useEffect(() => {
    if (!token || token.length < 10) {
      navigate('/admin/login');
      return;
    }
    const url = `${process.env.REACT_APP_SERVER || ''}api/admin/dashboard?token=${token}`;
    requests.makeGet(url, setOpen, setSeverity, setToastMsg, setLoading, (res) => {
      setStats(res.stats);
    }, null);
  }, [navigate, token]);

  const handleLogout = () => {
    cookies.deleteCookies('admin-token');
    cookies.deleteCookies('admin');
    navigate('/admin/login');
  };

  const cards = [
    { label: 'Vendors', value: stats?.vendors ?? '—', to: '/admin/vendors', color: 'var(--primary-blue)' },
    { label: 'Customers', value: stats?.customers ?? '—', to: '/admin/customers', color: 'var(--primary-dark)' },
    { label: 'Transactions Today', value: stats?.transactionsToday ?? '—', to: '/admin/transactions', color: 'var(--accent-gold)' },
    { label: 'Points Awarded Today', value: stats?.pointsAwardedToday ?? '—', color: 'var(--secondary)' }
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-light)' }}>
      <Toast open={open} setOpen={setOpen} severity={severity} timer={4000}>
        {msg}
      </Toast>
      <div className="dashboard-header" style={{ background: 'var(--primary-dark)', padding: '16px 24px', boxShadow: '0 2px 10px rgba(0,0,0,0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" className="bold" style={{ color: 'var(--text-light)' }}>
          {Company.name} – Admin
        </Typography>
        <Flexbox style={{ gap: 16 }}>
          <Link to="/admin/vendors" style={{ color: 'var(--text-light)', opacity: 0.9 }}>Vendors</Link>
          <Link to="/admin/customers" style={{ color: 'var(--text-light)', opacity: 0.9 }}>Customers</Link>
          <Link to="/admin/transactions" style={{ color: 'var(--text-light)', opacity: 0.9 }}>Transactions</Link>
          <Link to="/admin/settings" style={{ color: 'var(--text-light)', opacity: 0.9 }}>Settings</Link>
          <button onClick={handleLogout} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-light)', opacity: 0.9 }}>
            Logout
          </button>
        </Flexbox>
      </div>
      <Container style={{ paddingTop: 32, paddingBottom: 32 }}>
        <Typography variant="h5" className="bold" style={{ marginBottom: 24 }}>
          Dashboard
        </Typography>
        {loading && <Typography>Loading...</Typography>}
        {!loading && stats && (
          <Flexbox style={{ flexWrap: 'wrap', gap: 16 }}>
            {cards.map((card, i) => (
              <Link key={i} to={card.to || '#'} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div
                  style={{
                    background: card.color,
                    borderRadius: 12,
                    padding: 24,
                    minWidth: 160,
                    opacity: 0.95
                  }}
                >
                  <Typography style={{ fontSize: 14, opacity: 0.9 }}>{card.label}</Typography>
                  <Typography variant="h4" className="bold">
                    {card.value}
                  </Typography>
                </div>
              </Link>
            ))}
          </Flexbox>
        )}
        <Spacebox padding="32px" />
        <Typography style={{ opacity: 0.8 }}>
          Manage vendors, view customers and transactions, and configure shared rewards in Settings.
        </Typography>
      </Container>
      <Footer />
    </div>
  );
};

export default AdminDashboard;
