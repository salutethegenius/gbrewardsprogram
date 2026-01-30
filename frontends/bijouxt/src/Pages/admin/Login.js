import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import cookies from '../../utilities/Cookies';
import Toast from '../../components/Toast';
import Flexbox from '../../components/Flexbox';
import { Typography } from '@mui/material';
import Spacebox from '../../components/Spacebox';
import Button from '../../components/Button';
import requests from '../../handlers/requests';
import { updateuser } from '../../features/users';
import { useDispatch } from 'react-redux';
import Company from '../../utilities/Company';

const AdminLogin = ({ title }) => {
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
  const dispatch = useDispatch();

  const submit = () => {
    if (email.includes('@') && password !== '') {
      setLoading(true);
      const url = `${process.env.REACT_APP_SERVER || '/'}api/admin/signin`;
      // #region agent log
      console.log('[DEBUG] Admin login URL:', url, '| REACT_APP_SERVER:', process.env.REACT_APP_SERVER);
      // #endregion
      requests.makePost(
        url,
        { email, password },
        setOpen,
        setSeverity,
        setToastMsg,
        setLoading,
        (res) => {
          cookies.setCookies('admin', JSON.stringify(res.admin), 5);
          cookies.setCookies('admin-token', res.token, 0.5);
          dispatch(updateuser(res.admin));
          navigate('/admin/dashboard');
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
    const token = cookies.getCookies('admin-token');
    if (token && token.length > 10) {
      navigate('/admin/dashboard');
    }
  }, [navigate]);

  return (
    <div className="admin-login-page">
      <Toast open={open} setOpen={setOpen} severity={severity} timer={4000}>
        {msg}
      </Toast>
      <Flexbox
        justifyContent="center"
        alignItems="center"
        style={{ height: '100vh', background: 'var(--primary-blue)', opacity: 0.95 }}
      >
        <div>
          <Flexbox justifyContent="center" alignItems="center" style={{ flexDirection: 'column', gap: 8 }}>
            <Link to="/" style={{ color: 'var(--text-light)', fontSize: 14, opacity: 0.9 }}>← Back to home page</Link>
            <Typography variant="h4" className="bold" style={{ color: 'var(--text-light)' }}>
              {Company.name}
            </Typography>
          </Flexbox>
          <Spacebox padding="10px" />
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
              Admin Sign In (DFBA)
            </Typography>
            <Spacebox padding="10px" />
            <small>Email</small>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@dfba.org"
            />
            <Spacebox padding="8px" />
            <small>Password</small>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Spacebox padding="16px" />
            <Button
              style={{
                background: 'var(--primary)',
                color: 'white',
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

export default AdminLogin;
