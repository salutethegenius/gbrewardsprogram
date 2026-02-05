import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import cookies from '../../utilities/Cookies';
import Toast from '../../components/Toast';
import Flexbox from '../../components/Flexbox';
import Spacebox from '../../components/Spacebox';
import { Typography, Container } from '@mui/material';
import Button from '../../components/Button';
import requests from '../../handlers/requests';
import Footer from '../../components/Footer';

const AdminSettings = ({ title }) => {
  if (typeof document !== 'undefined' && document.querySelector('title')) {
    if (typeof document !== 'undefined' && document.querySelector('title')) document.querySelector('title').textContent = title;
  }

  const [open, setOpen] = useState(false);
  const [severity, setSeverity] = useState('success');
  const [msg, setToastMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [, setSettings] = useState({});
  const [sharedPct, setSharedPct] = useState(20);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const token = cookies.getCookies('admin-token');

  useEffect(() => {
    if (!token || token.length < 10) {
      navigate('/admin/login');
      return;
    }
    setLoading(true);
    const url = `${process.env.REACT_APP_SERVER || '/'}api/admin/settings`;
    requests.makeGet(url, setOpen, setSeverity, setToastMsg, setLoading, (res) => {
      setSettings(res.settings || {});
      setSharedPct(parseFloat(res.settings?.shared_rewards_pct) || 20);
    }, null, token);
  }, [navigate, token]);

  const handleSave = () => {
    setSaving(true);
    const url = `${process.env.REACT_APP_SERVER || '/'}api/admin/settings`;
    requests.makePut(
      url,
      { shared_rewards_pct: Math.max(0, Math.min(100, sharedPct)) },
      setOpen,
      setSeverity,
      setToastMsg,
      setSaving,
      () => {},
      'Settings saved',
      token
    );
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-light)' }}>
      <Toast open={open} setOpen={setOpen} severity={severity} timer={4000}>
        {msg}
      </Toast>
      <div className="dashboard-header" style={{ background: 'var(--primary-dark)', padding: '16px 24px', boxShadow: '0 2px 10px rgba(0,0,0,0.15)', display: 'flex', gap: 16 }}>
        <Link to="/admin/dashboard" style={{ color: 'var(--text-light)', opacity: 0.9 }}>Dashboard</Link>
        <Link to="/admin/vendors" style={{ color: 'var(--text-light)', opacity: 0.9 }}>Vendors</Link>
        <Link to="/admin/customers" style={{ color: 'var(--text-light)', opacity: 0.9 }}>Customers</Link>
        <Link to="/admin/transactions" style={{ color: 'var(--text-light)', opacity: 0.9 }}>Transactions</Link>
        <Link to="/admin/settings" style={{ color: 'var(--text-light)', opacity: 0.9 }}>Settings</Link>
        <Link to="/admin/audit" style={{ color: 'var(--text-light)', opacity: 0.9 }}>Audit</Link>
      </div>
      <Container style={{ paddingTop: 32, paddingBottom: 32 }}>
        <Typography variant="h5" className="bold" style={{ marginBottom: 24 }}>
          Settings
        </Typography>
        {loading && <Typography>Loading...</Typography>}
        {!loading && (
          <div style={{ background: 'white', padding: 24, borderRadius: 12, maxWidth: 400, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <Typography className="bold" style={{ marginBottom: 8 }}>Shared Rewards</Typography>
            <Typography style={{ fontSize: 14, opacity: 0.8, marginBottom: 16 }}>
              Percentage of earned points that go to the shared pool (redeemable at any vendor).
            </Typography>
            <Flexbox alignItems="center" style={{ gap: 12 }}>
              <input
                type="number"
                min={0}
                max={100}
                step={1}
                value={sharedPct}
                onChange={(e) => setSharedPct(parseFloat(e.target.value) || 0)}
                style={{ width: 80, padding: 8 }}
              />
              <span>%</span>
            </Flexbox>
            <Spacebox padding="20px" />
            <Button style={{ background: 'var(--accent-gold)', color: 'var(--text-dark)', padding: '10px 24px', borderRadius: 8 }} handleClick={handleSave}>
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        )}
      </Container>
      <Footer />
    </div>
  );
};

export default AdminSettings;
