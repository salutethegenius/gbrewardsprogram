import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Toast from '../../components/Toast';
import Flexbox from '../../components/Flexbox';
import Spacebox from '../../components/Spacebox';
import { Typography } from '@mui/material';
import Button from '../../components/Button';
import requests from '../../handlers/requests';
import Company from '../../utilities/Company';

const VendorSignup = ({ title }) => {
  if (typeof document !== 'undefined' && document.querySelector('title')) {
    document.querySelector('title').innerHTML = title;
  }

  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [severity, setSeverity] = useState('success');
  const [msg, setToastMsg] = useState('');
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: ''
  });
  const navigate = useNavigate();

  const submit = () => {
    if (!form.name.trim() || !form.email.trim() || !form.password) {
      setToastMsg('Name, email and password required');
      setSeverity('error');
      setOpen(true);
      return;
    }
    if (form.password.length < 8) {
      setToastMsg('Password must be at least 8 characters');
      setSeverity('error');
      setOpen(true);
      return;
    }
    setLoading(true);
    const url = `${process.env.REACT_APP_SERVER || '/'}api/vendor/signup`;
    requests.makePost(
      url,
      {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        phone: (form.phone || '').trim(),
        address: (form.address || '').trim()
      },
      setOpen,
      setSeverity,
      setToastMsg,
      setLoading,
      (res) => {
        setToastMsg(res.msg || 'Account created. Pending admin approval.');
        setSeverity('success');
        setOpen(true);
        setTimeout(() => navigate('/vendor/login'), 2000);
      },
      null
    );
  };

  return (
    <div className="vendor-signup-page">
      <Toast open={open} setOpen={setOpen} severity={severity} timer={5000}>
        {msg}
      </Toast>
      <Flexbox
        justifyContent="center"
        alignItems="center"
        style={{ minHeight: '100vh', background: 'var(--primary-dark)', opacity: 0.95 }}
      >
        <div>
          <Flexbox justifyContent="center" alignItems="center" style={{ flexDirection: 'column', gap: 8 }}>
            <Link to="/" style={{ color: 'var(--text-light)', fontSize: 14, opacity: 0.9 }}>← Back to home page</Link>
            <Typography variant="h5" className="bold" style={{ color: 'var(--text-light)' }}>
              {Company.name} – Vendor
            </Typography>
          </Flexbox>
          <Spacebox padding="16px" />
          <div
            style={{
              borderRadius: 16,
              padding: 40,
              boxShadow: '0px 0px 30px rgba(0,0,0,0.1)',
              minWidth: 380,
              background: 'white'
            }}
          >
            <Typography textAlign="center" className="bold">
              Create vendor account
            </Typography>
            <Typography textAlign="center" style={{ fontSize: 14, opacity: 0.8, marginTop: 8 }}>
              Your account will appear under Pending until an admin approves it.
            </Typography>
            <Spacebox padding="20px" />
            <small>Business name *</small>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Store name"
              style={{ width: '100%', marginTop: 4, marginBottom: 12 }}
            />
            <small>Email *</small>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="store@example.com"
              style={{ width: '100%', marginTop: 4, marginBottom: 12 }}
            />
            <small>Password * (min 8 characters)</small>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
              style={{ width: '100%', marginTop: 4, marginBottom: 12 }}
            />
            <small>Phone</small>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="Optional"
              style={{ width: '100%', marginTop: 4, marginBottom: 12 }}
            />
            <small>Address</small>
            <input
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="Optional"
              style={{ width: '100%', marginTop: 4, marginBottom: 20 }}
            />
            <Button
              style={{
                background: 'var(--primary-blue)',
                color: '#fff',
                width: '100%',
                padding: '15px 20px',
                borderRadius: 8
              }}
              handleClick={submit}
            >
              {loading ? 'Creating...' : 'Create account'}
            </Button>
            <Spacebox padding="16px" />
            <Typography textAlign="center" style={{ fontSize: 14 }}>
              <Link to="/vendor/login" style={{ color: 'var(--primary-blue)' }}>
                Already have an account? Sign in
              </Link>
            </Typography>
          </div>
        </div>
      </Flexbox>
    </div>
  );
};

export default VendorSignup;
