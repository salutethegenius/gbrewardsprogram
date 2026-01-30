import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import cookies from '../../utilities/Cookies';
import Toast from '../../components/Toast';
import Flexbox from '../../components/Flexbox';
import Spacebox from '../../components/Spacebox';
import { Typography, Container } from '@mui/material';
import Button from '../../components/Button';
import requests from '../../handlers/requests';
import Company from '../../utilities/Company';
import Footer from '../../components/Footer';

const VendorSettings = ({ title }) => {
  if (typeof document !== 'undefined' && document.querySelector('title')) {
    document.querySelector('title').innerHTML = title;
  }

  const [open, setOpen] = useState(false);
  const [severity, setSeverity] = useState('success');
  const [msg, setToastMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [vendor, setVendor] = useState(null);
  const [form, setForm] = useState({ name: '', phone: '', address: '', points_per_dollar: 1 });
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const token = cookies.getCookies('vendor-token');

  useEffect(() => {
    if (!token || token.length < 10) {
      navigate('/vendor/login');
      return;
    }
    setLoading(true);
    const url = `${process.env.REACT_APP_SERVER || '/'}api/vendor/settings?token=${token}`;
    requests.makeGet(url, setOpen, setSeverity, setToastMsg, setLoading, (res) => {
      setVendor(res.vendor);
      setForm({
        name: res.vendor?.name || '',
        phone: res.vendor?.phone || '',
        address: res.vendor?.address || '',
        points_per_dollar: res.vendor?.points_per_dollar ?? 1
      });
    }, null);
  }, [navigate, token]);

  const handleSave = () => {
    setSaving(true);
    const url = `${process.env.REACT_APP_SERVER || '/'}api/vendor/settings?token=${token}`;
    requests.makePut(
      url,
      { name: form.name, phone: form.phone, address: form.address, points_per_dollar: form.points_per_dollar },
      setOpen,
      setSeverity,
      setToastMsg,
      setSaving,
      () => {
        setToastMsg('Settings saved');
        setSeverity('success');
        setOpen(true);
      },
      'Settings saved'
    );
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-light)' }}>
      <Toast open={open} setOpen={setOpen} severity={severity} timer={4000}>
        {msg}
      </Toast>
      <div className="dashboard-header" style={{ background: 'var(--primary-dark)', padding: '16px 24px', boxShadow: '0 2px 10px rgba(0,0,0,0.15)', display: 'flex', gap: 16 }}>
        <Link to="/vendor/dashboard" style={{ color: 'var(--text-light)', opacity: 0.9 }}>Dashboard</Link>
        <Link to="/vendor/transactions" style={{ color: 'var(--text-light)', opacity: 0.9 }}>Transactions</Link>
      </div>
      <Container style={{ paddingTop: 32, paddingBottom: 32 }}>
        <Typography variant="h5" className="bold" style={{ marginBottom: 24 }}>
          Store Settings
        </Typography>
        {loading && <Typography>Loading...</Typography>}
        {!loading && vendor && (
          <div style={{ background: 'white', padding: 24, borderRadius: 12, maxWidth: 480, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <div style={{ marginBottom: 16 }}>
              <small>Store name</small>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Store name" style={{ width: '100%' }} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <small>Email (read-only)</small>
              <input value={vendor.email} readOnly disabled style={{ width: '100%', opacity: 0.8 }} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <small>Phone</small>
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone" style={{ width: '100%' }} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <small>Address</small>
              <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Address" style={{ width: '100%' }} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <small>Points per dollar</small>
              <input type="number" step="0.1" value={form.points_per_dollar} onChange={(e) => setForm({ ...form, points_per_dollar: parseFloat(e.target.value) || 1 })} style={{ width: '100%' }} />
            </div>
            <Button style={{ background: 'var(--accent-gold)', color: 'var(--text-dark)', padding: '12px 24px', borderRadius: 8 }} handleClick={handleSave}>
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        )}
      </Container>
      <Footer />
    </div>
  );
};

export default VendorSettings;
