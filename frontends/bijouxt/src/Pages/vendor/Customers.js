import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import cookies from '../../utilities/Cookies';
import Toast from '../../components/Toast';
import { Typography, Container } from '@mui/material';
import requests from '../../handlers/requests';
import Footer from '../../components/Footer';

const VendorCustomers = ({ title }) => {
  if (typeof document !== 'undefined' && document.querySelector('title')) {
    document.querySelector('title').textContent = title;
  }

  const [open, setOpen] = useState(false);
  const [severity, setSeverity] = useState('success');
  const [msg, setToastMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const navigate = useNavigate();
  const token = cookies.getCookies('vendor-token');

  useEffect(() => {
    if (!token || token.length < 10) {
      navigate('/vendor/login');
      return;
    }
    setLoading(true);
    const url = `${process.env.REACT_APP_SERVER || '/'}api/vendor/customers?limit=500`;
    requests.makeGet(url, setOpen, setSeverity, setToastMsg, setLoading, (res) => setData(res.customers || []), null, token);
  }, [navigate, token]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-light)' }}>
      <Toast open={open} setOpen={setOpen} severity={severity} timer={4000}>
        {msg}
      </Toast>
      <div className="dashboard-header" style={{ background: 'var(--primary-dark)', padding: '16px 24px', boxShadow: '0 2px 10px rgba(0,0,0,0.15)', display: 'flex', gap: 16 }}>
        <Link to="/vendor/dashboard" style={{ color: 'var(--text-light)', opacity: 0.9 }}>Dashboard</Link>
        <Link to="/vendor/customers" style={{ color: 'var(--text-light)', opacity: 0.9, fontWeight: 700 }}>Customers</Link>
        <Link to="/vendor/transactions" style={{ color: 'var(--text-light)', opacity: 0.9 }}>Transactions</Link>
        <Link to="/vendor/settings" style={{ color: 'var(--text-light)', opacity: 0.9 }}>Settings</Link>
      </div>
      <Container style={{ paddingTop: 32, paddingBottom: 32 }}>
        <Typography variant="h5" className="bold" style={{ marginBottom: 8 }}>
          My customers
        </Typography>
        <Typography style={{ fontSize: 14, opacity: 0.8, marginBottom: 24 }}>
          Everyone who has joined your rewards program (via QR scan or added manually).
        </Typography>
        {loading && <Typography>Loading...</Typography>}
        {!loading && (
          <div style={{ background: 'white', borderRadius: 12, overflow: 'auto', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <table>
              <thead>
                <tr>
                  <td>Phone</td>
                  <td>Name</td>
                  <td>Points (at your store)</td>
                </tr>
              </thead>
              <tbody>
                {data.length === 0 && (
                  <tr>
                    <td colSpan={3} style={{ textAlign: 'center', padding: 24 }}>
                      No customers yet. Share your QR code or add customers manually on the dashboard.
                    </td>
                  </tr>
                )}
                {data.map((row) => (
                  <tr key={row.id}>
                    <td>{row.phone || '—'}</td>
                    <td>{row.fullname || '—'}</td>
                    <td>{row.points != null ? row.points : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Container>
      <Footer />
    </div>
  );
};

export default VendorCustomers;
