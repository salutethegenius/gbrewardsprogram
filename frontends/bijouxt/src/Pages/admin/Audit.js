import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import cookies from '../../utilities/Cookies';
import Toast from '../../components/Toast';
import { Typography, Container } from '@mui/material';
import requests from '../../handlers/requests';
import Footer from '../../components/Footer';

const AdminAudit = ({ title }) => {
  if (typeof document !== 'undefined' && document.querySelector('title')) {
    document.querySelector('title').textContent = title;
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
    const url = `${process.env.REACT_APP_SERVER || '/'}api/admin/audit?limit=200`;
    requests.makeGet(url, setOpen, setSeverity, setToastMsg, setLoading, (res) => setData(res.data || []), null, token);
  }, [navigate, token]);

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
        <Link to="/admin/audit" style={{ color: 'var(--text-light)', opacity: 0.9, fontWeight: 700 }}>Audit</Link>
      </div>
      <Container style={{ paddingTop: 32, paddingBottom: 32 }}>
        <Typography variant="h5" className="bold" style={{ marginBottom: 8 }}>
          Audit log
        </Typography>
        <Typography style={{ fontSize: 14, opacity: 0.8, marginBottom: 24 }}>
          Compliance view: admin and key actions (Bahamas DPA).
        </Typography>
        {loading && <Typography>Loading...</Typography>}
        {!loading && (
          <div style={{ background: 'white', borderRadius: 12, overflow: 'auto', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <table>
              <thead>
                <tr>
                  <td>Time</td>
                  <td>Actor</td>
                  <td>Action</td>
                  <td>Resource</td>
                  <td>ID</td>
                  <td>IP</td>
                </tr>
              </thead>
              <tbody>
                {data.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: 24 }}>
                      No audit entries yet.
                    </td>
                  </tr>
                )}
                {data.map((row) => (
                  <tr key={row.id}>
                    <td>{row.created_at ? new Date(row.created_at).toLocaleString() : '—'}</td>
                    <td>{row.actor_type}{row.actor_id ? ` (${String(row.actor_id).slice(0, 8)}…)` : ''}</td>
                    <td>{row.action || '—'}</td>
                    <td>{row.resource_type || '—'}</td>
                    <td>{row.resource_id ? String(row.resource_id).slice(0, 8) + '…' : '—'}</td>
                    <td style={{ fontSize: 12 }}>{row.ip || '—'}</td>
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

export default AdminAudit;
