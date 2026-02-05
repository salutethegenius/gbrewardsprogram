import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import cookies from '../../utilities/Cookies';
import Toast from '../../components/Toast';
import Flexbox from '../../components/Flexbox';
import { Typography } from '@mui/material';
import Company from '../../utilities/Company';

const CustomerVerify = ({ title }) => {
  if (typeof document !== 'undefined' && document.querySelector('title')) {
    document.querySelector('title').textContent = title || `Signing you in | ${Company.name}`;
  }

  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [open, setOpen] = useState(false);
  const [severity, setSeverity] = useState('error');
  const [msg, setToastMsg] = useState('');
  const [status, setStatus] = useState('loading'); // loading | ok | error
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      setToastMsg('Invalid link');
      setSeverity('error');
      setOpen(true);
      setStatus('error');
      setTimeout(() => navigate('/customer/login'), 2000);
      return;
    }

    const url = `${process.env.REACT_APP_SERVER || '/'}api/customer/verify`;
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.customer && data.token) {
          cookies.setCookies('customer', JSON.stringify(data.customer), 5);
          cookies.setCookies('customer-token', data.token, 0.5);
          setStatus('ok');
          window.location.href = '/customer/dashboard';
        } else {
          setToastMsg(data.msg || 'Invalid or expired link.');
          setSeverity('error');
          setOpen(true);
          setStatus('error');
          setTimeout(() => navigate('/customer/login'), 3000);
        }
      })
      .catch(() => {
        setToastMsg('Something went wrong. Try again.');
        setSeverity('error');
        setOpen(true);
        setStatus('error');
        setTimeout(() => navigate('/customer/login'), 3000);
      });
  }, [token, navigate]);

  return (
    <div className="customer-verify-page">
      <Toast open={open} setOpen={setOpen} severity={severity} timer={5000}>
        {msg}
      </Toast>
      <Flexbox
        justifyContent="center"
        alignItems="center"
        style={{ minHeight: '100vh', background: 'var(--primary-dark)', opacity: 0.95 }}
      >
        <Typography style={{ color: 'var(--text-light)' }}>
          {status === 'loading' && 'Signing you in...'}
          {status === 'ok' && 'Redirecting...'}
          {status === 'error' && 'Redirecting to login...'}
        </Typography>
      </Flexbox>
    </div>
  );
};

export default CustomerVerify;
