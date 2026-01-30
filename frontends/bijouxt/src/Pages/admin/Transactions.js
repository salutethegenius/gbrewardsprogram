import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import cookies from '../../utilities/Cookies';
import Toast from '../../components/Toast';
import { Typography, Container } from '@mui/material';
import requests from '../../handlers/requests';
import Company from '../../utilities/Company';
import Footer from '../../components/Footer';

const AdminTransactions = ({ title }) => {
  if (typeof document !== 'undefined' && document.querySelector('title')) {
    document.querySelector('title').innerHTML = title;
  }

  const [open, setOpen] = useState(false);
  const [severity, setSeverity] = useState('success');
  const [msg, setToastMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const navigate = useNavigate();
  const token = cookies.getCookies('admin-token');

  useEffect(() => {
    if (!token || token.length < 10) {
      navigate('/admin/login');
      return;
    }
    setLoading(true);
    const url = `${process.env.REACT_APP_SERVER || ''}api/admin/transactions?token=${token}&limit=100`;
    requests.makeGet(url, setOpen, setSeverity, setToastMsg, setLoading, (res) => setData(res.data || []), null);
  }, [navigate, token]);

  const typeLabel = (t) => {
    if (t === 'earned') return 'Earned';
    if (t === 'shared_earned') return 'Shared earned';
    if (t === 'redeemed') return 'Redeemed';
    if (t === 'shared_redeemed') return 'Shared redeemed';
    return t;
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
        <Link to="/admin/settings" style={{ color: 'var(--text-light)', opacity: 0.9 }}>Settings</Link>
      </div>
      <Container style={{ paddingTop: 32, paddingBottom: 32 }}>
        <Typography variant="h5" className="bold" style={{ marginBottom: 24 }}>
          Transactions
        </Typography>
        {loading && <Typography>Loading...</Typography>}
        {!loading && (
          <div style={{ background: 'white', borderRadius: 12, overflow: 'auto', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <table>
              <thead>
                <tr>
                  <td>Date</td>
                  <td>Type</td>
                  <td>Customer</td>
                  <td>Vendor</td>
                  <td>Points</td>
                  <td>Amount</td>
                </tr>
              </thead>
              <tbody>
                {data.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: 24 }}>
                      No transactions yet.
                    </td>
                  </tr>
                )}
                {data.map((t) => (
                  <tr key={t.id}>
                    <td>{t.timestamp ? new Date(t.timestamp).toLocaleString() : '—'}</td>
                    <td>{typeLabel(t.type)}</td>
                    <td>{t.customer_phone || t.customer_name || '—'}</td>
                    <td>{t.vendor_name || '—'}</td>
                    <td>{t.points}</td>
                    <td>{t.amount != null ? t.amount : '—'}</td>
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

export default AdminTransactions;
