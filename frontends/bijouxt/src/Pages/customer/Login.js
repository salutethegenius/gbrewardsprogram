import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import cookies from '../../utilities/Cookies';
import Toast from '../../components/Toast';
import Flexbox from '../../components/Flexbox';
import { Typography } from '@mui/material';
import Spacebox from '../../components/Spacebox';
import Button from '../../components/Button';
import requests from '../../handlers/requests';
import Company from '../../utilities/Company';

const CustomerLogin = ({ title }) => {
  if (typeof document !== 'undefined' && document.querySelector('title')) {
    if (typeof document !== 'undefined' && document.querySelector('title')) document.querySelector('title').textContent = title;
  }

  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState('');
  const [open, setOpen] = useState(false);
  const [severity, setSeverity] = useState('success');
  const [msg, setToastMsg] = useState('');
  const navigate = useNavigate();

  const submit = () => {
    const trimmed = (phone || '').trim().replace(/\D/g, '');
    if (trimmed.length < 6) {
      setToastMsg('Enter a valid phone number');
      setSeverity('error');
      setOpen(true);
      return;
    }
    setLoading(true);
    const url = `${process.env.REACT_APP_SERVER || '/'}api/customer/login`;
    requests.makePost(
      url,
      { phone: trimmed },
      setOpen,
      setSeverity,
      setToastMsg,
      setLoading,
      (res) => {
        cookies.setCookies('customer', JSON.stringify(res.customer), 5);
        cookies.setCookies('customer-token', res.token, 0.5);
        navigate('/customer/dashboard');
      },
      null
    );
  };

  useEffect(() => {
    const token = cookies.getCookies('customer-token');
    if (token && token.length > 10) {
      navigate('/customer/dashboard');
    }
  }, [navigate]);

  return (
    <div className="customer-login-page">
      <Toast open={open} setOpen={setOpen} severity={severity} timer={4000}>
        {msg}
      </Toast>
      <Flexbox
        justifyContent="center"
        alignItems="center"
        style={{ height: '100vh', background: 'var(--primary-dark)', opacity: 0.95 }}
      >
        <div>
          <Flexbox justifyContent="center" alignItems="center" style={{ flexDirection: 'column', gap: 8 }}>
            <Link to="/" style={{ color: 'var(--text-light)', fontSize: 14, opacity: 0.9 }}>← Back to home page</Link>
            <Typography variant="h5" className="bold" style={{ color: 'var(--text-light)' }}>
              {Company.name}
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
              View your rewards
            </Typography>
            <Typography textAlign="center" style={{ fontSize: 14, opacity: 0.8, marginTop: 8 }}>
              Enter your phone number to see your points
            </Typography>
            <Spacebox padding="20px" />
            <small>Phone number</small>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 2425551234"
            />
            <Spacebox padding="20px" />
            <Button
              style={{
                background: 'var(--primary-blue)',
                color: '#2c3e50',
                width: '100%',
                padding: '15px 20px',
                borderRadius: 8
              }}
              handleClick={() => submit()}
            >
              {loading ? 'Loading...' : 'Continue'}
            </Button>
          </div>
        </div>
      </Flexbox>
    </div>
  );
};

export default CustomerLogin;
