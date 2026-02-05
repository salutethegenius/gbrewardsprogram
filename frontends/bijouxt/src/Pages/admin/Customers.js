import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import cookies from '../../utilities/Cookies';
import Toast from '../../components/Toast';
import { Typography, Container } from '@mui/material';
import requests from '../../handlers/requests';
import Footer from '../../components/Footer';

const AdminCustomers = ({ title }) => {
  if (typeof document !== 'undefined' && document.querySelector('title')) {
    if (typeof document !== 'undefined' && document.querySelector('title')) document.querySelector('title').textContent = title;
  }

  const [open, setOpen] = useState(false);
  const [severity, setSeverity] = useState('success');
  const [msg, setToastMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState([]);
  const navigate = useNavigate();
  const token = cookies.getCookies('admin-token');

  useEffect(() => {
    if (!token || token.length < 10) {
      navigate('/admin/login');
      return;
    }
    setLoading(true);
    const url = `${process.env.REACT_APP_SERVER || '/'}api/admin/customers`;
    requests.makeGet(url, setOpen, setSeverity, setToastMsg, setLoading, (res) => setCustomers(res.data || []), null, token);
  }, [navigate, token]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-light)' }}>
      <Toast open={open} setOpen={setOpen} severity={severity} timer={4000}>
        {msg}
      </Toast>
      <div className="dashboard-header" style={{ background: 'var(--primary-dark)', padding: '16px 24px', boxShadow: '0 2px 10px rgba(0,0,0,0.15)', display: 'flex', gap: 16 }}>
        <Link to="/admin/dashboard" style={{ color: 'var(--text-light)', opacity: 0.9 }}>Dashboard</Link>
        <Link to="/admin/vendors" style={{ color: 'var(--text-light)', opacity: 0.9 }}>Vendors</Link>
        <Link to="/admin/transactions" style={{ color: 'var(--text-light)', opacity: 0.9 }}>Transactions</Link>
        <Link to="/admin/settings" style={{ color: 'var(--text-light)', opacity: 0.9 }}>Settings</Link>
        <Link to="/admin/audit" style={{ color: 'var(--text-light)', opacity: 0.9 }}>Audit</Link>
      </div>
      <Container style={{ paddingTop: 32, paddingBottom: 32 }}>
        <Typography variant="h5" className="bold" style={{ marginBottom: 24 }}>
          Customers
        </Typography>
        {loading && <Typography>Loading...</Typography>}
        {!loading && (
          <div style={{ background: 'white', borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <table>
              <thead>
                <tr>
                  <td>Phone</td>
                  <td>Name</td>
                  <td>Email</td>
                  <td>Joined</td>
                </tr>
              </thead>
              <tbody>
                {customers.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: 24 }}>
                      No customers yet.
                    </td>
                  </tr>
                )}
                {customers.map((c) => (
                  <tr key={c.id}>
                    <td>{c.phone}</td>
                    <td>{c.fullname || '—'}</td>
                    <td>{c.email || '—'}</td>
                    <td>{c.created_at ? new Date(c.created_at).toLocaleDateString() : '—'}</td>
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

export default AdminCustomers;
