import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import cookies from '../../utilities/Cookies';
import Toast from '../../components/Toast';
import Flexbox from '../../components/Flexbox';
import { Typography } from '@mui/material';
import Spacebox from '../../components/Spacebox';
import Button from '../../components/Button';
import requests from '../../handlers/requests';
import Company from '../../utilities/Company';

const VendorLogin = ({ title }) => {
  if (typeof document !== 'undefined' && document.querySelector('title')) {
    document.querySelector('title').innerHTML = title;
  }

  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [open, setOpen] = useState(false);
  const [severity, setSeverity] = useState('success');
  const [msg, setToastMsg] = useState('');
  const navigate = useNavigate();

  const submit = () => {
    if (email.includes('@') && password !== '') {
      setLoading(true);
      const url = `${process.env.REACT_APP_SERVER || ''}api/vendor/signin`;
      requests.makePost(
        url,
        { email, password },
        setOpen,
        setSeverity,
        setToastMsg,
        setLoading,
        (res) => {
          cookies.setCookies('vendor', JSON.stringify(res.vendor), 5);
          cookies.setCookies('vendor-token', res.token, 0.5);
          navigate('/vendor/dashboard');
        },
        null
      );
    } else {
      setToastMsg('Invalid entries');
      setSeverity('error');
      setOpen(true);
    }
  };

  useEffect(() => {
    const token = cookies.getCookies('vendor-token');
    if (token && token.length > 10) {
      navigate('/vendor/dashboard');
    }
  }, [navigate]);

  return (
    <div className="vendor-login-page">
      <Toast open={open} setOpen={setOpen} severity={severity} timer={4000}>
        {msg}
      </Toast>
      <Flexbox
        justifyContent="center"
        alignItems="center"
        style={{ height: '100vh', background: 'var(--primary-dark)', opacity: 0.95 }}
      >
        <div>
          <Flexbox justifyContent="center" alignItems="center">
            <Typography variant="h5" className="bold" style={{ color: '#2c3e50' }}>
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
              Vendor Sign In
            </Typography>
            <Spacebox padding="12px" />
            <small>Email</small>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="store@example.com" />
            <Spacebox padding="8px" />
            <small>Password</small>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
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
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </div>
        </div>
      </Flexbox>
    </div>
  );
};

export default VendorLogin;
