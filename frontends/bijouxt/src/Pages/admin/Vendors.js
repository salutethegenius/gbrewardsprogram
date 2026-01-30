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

const AdminVendors = ({ title }) => {
  if (typeof document !== 'undefined' && document.querySelector('title')) {
    document.querySelector('title').innerHTML = title;
  }

  const [open, setOpen] = useState(false);
  const [severity, setSeverity] = useState('success');
  const [msg, setToastMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [vendors, setVendors] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', address: '', points_per_dollar: 1 });
  const [submitting, setSubmitting] = useState(false);
  const [approvingId, setApprovingId] = useState(null);
  const navigate = useNavigate();
  const token = cookies.getCookies('admin-token');

  const load = () => {
    if (!token || token.length < 10) {
      navigate('/admin/login');
      return;
    }
    setLoading(true);
    const url = `${process.env.REACT_APP_SERVER || ''}api/admin/vendors?token=${token}`;
    requests.makeGet(url, setOpen, setSeverity, setToastMsg, setLoading, (res) => setVendors(res.data || []), null);
  };

  const handleApprove = (id) => {
    setApprovingId(id);
    const url = `${process.env.REACT_APP_SERVER || ''}api/admin/vendors/${id}?token=${token}`;
    requests.makePut(
      url,
      { is_active: 1 },
      setOpen,
      setSeverity,
      setToastMsg,
      (v) => { if (v === false) setApprovingId(null); },
      () => load(),
      'Vendor approved'
    );
  };

  useEffect(() => {
    load();
  }, [navigate, token]);

  const pendingVendors = (vendors || []).filter((v) => !v.is_active);
  const activeVendors = (vendors || []).filter((v) => v.is_active);

  const handleCreate = () => {
    if (!form.name || !form.email || !form.password) {
      setToastMsg('Name, email and password required');
      setSeverity('error');
      setOpen(true);
      return;
    }
    setSubmitting(true);
    const url = `${process.env.REACT_APP_SERVER || ''}api/admin/vendors?token=${token}`;
    requests.makePost(
      url,
      {
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone || '',
        address: form.address || '',
        points_per_dollar: form.points_per_dollar || 1
      },
      setOpen,
      setSeverity,
      setToastMsg,
      setSubmitting,
      () => {
        setToastMsg('Vendor created');
        setSeverity('success');
        setOpen(true);
        setForm({ name: '', email: '', password: '', phone: '', address: '', points_per_dollar: 1 });
        setShowForm(false);
        load();
      },
      'Vendor created'
    );
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-light)' }}>
      <Toast open={open} setOpen={setOpen} severity={severity} timer={4000}>
        {msg}
      </Toast>
      <div className="dashboard-header" style={{ background: 'var(--primary-dark)', padding: '16px 24px', boxShadow: '0 2px 10px rgba(0,0,0,0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" className="bold" style={{ color: 'var(--text-light)' }}>
          {Company.name} – Admin
        </Typography>
        <Flexbox style={{ gap: 16 }}>
          <Link to="/admin/dashboard" style={{ color: 'var(--text-light)', opacity: 0.9 }}>Dashboard</Link>
          <Link to="/admin/customers" style={{ color: 'var(--text-light)', opacity: 0.9 }}>Customers</Link>
          <Link to="/admin/transactions" style={{ color: 'var(--text-light)', opacity: 0.9 }}>Transactions</Link>
          <Link to="/admin/settings" style={{ color: 'var(--text-light)', opacity: 0.9 }}>Settings</Link>
        </Flexbox>
      </div>
      <Container style={{ paddingTop: 32, paddingBottom: 32 }}>
        <Flexbox justifyContent="space-between" alignItems="center" style={{ marginBottom: 24 }}>
          <Typography variant="h5" className="bold">
            Vendors
          </Typography>
          <Button
            style={{ background: 'var(--primary-blue)', color: '#fff', padding: '10px 20px', borderRadius: 8 }}
            handleClick={() => setShowForm(!showForm)}
          >
            {showForm ? 'Cancel' : 'Add Vendor'}
          </Button>
        </Flexbox>

        {pendingVendors.length > 0 && (
          <div style={{ background: 'white', padding: 24, borderRadius: 12, marginBottom: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <Typography className="bold" style={{ marginBottom: 16 }}>Pending approval</Typography>
            <div style={{ overflowX: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <td>Name</td>
                    <td>Email</td>
                    <td>Phone</td>
                    <td>Address</td>
                    <td></td>
                  </tr>
                </thead>
                <tbody>
                  {pendingVendors.map((v) => (
                    <tr key={v.id}>
                      <td>{v.name}</td>
                      <td>{v.email}</td>
                      <td>{v.phone || '—'}</td>
                      <td>{v.address || '—'}</td>
                      <td>
                        <Button
                          style={{ background: 'var(--accent-gold)', color: 'var(--text-dark)', padding: '8px 16px', borderRadius: 8 }}
                          handleClick={() => handleApprove(v.id)}
                        >
                          {approvingId === v.id ? 'Approving...' : 'Approve'}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {showForm && (
          <div style={{ background: 'white', padding: 24, borderRadius: 12, marginBottom: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <Typography className="bold" style={{ marginBottom: 16 }}>New Vendor</Typography>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, maxWidth: 500 }}>
              <div>
                <small>Name *</small>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Store name" />
              </div>
              <div>
                <small>Email *</small>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="store@example.com" />
              </div>
              <div>
                <small>Password *</small>
                <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Min 8 characters" />
              </div>
              <div>
                <small>Phone</small>
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone" />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <small>Address</small>
                <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Address" />
              </div>
              <div>
                <small>Points per dollar</small>
                <input type="number" step="0.1" value={form.points_per_dollar} onChange={(e) => setForm({ ...form, points_per_dollar: parseFloat(e.target.value) || 1 })} />
              </div>
            </div>
            <Spacebox padding="16px" />
            <Button style={{ background: 'var(--accent-gold)', color: 'var(--text-dark)', padding: '10px 24px', borderRadius: 8 }} handleClick={handleCreate}>
              {submitting ? 'Creating...' : 'Create Vendor'}
            </Button>
          </div>
        )}

        {loading && <Typography>Loading...</Typography>}
        {!loading && (
          <div style={{ background: 'white', borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <table>
              <thead>
                <tr>
                  <td>Name</td>
                  <td>Email</td>
                  <td>Phone</td>
                  <td>Points/$</td>
                  <td>Status</td>
                  <td></td>
                </tr>
              </thead>
              <tbody>
                {vendors.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: 24 }}>
                      No vendors yet. Add one above or wait for pending signups.
                    </td>
                  </tr>
                )}
                {vendors.map((v) => (
                  <tr key={v.id}>
                    <td>{v.name}</td>
                    <td>{v.email}</td>
                    <td>{v.phone || '—'}</td>
                    <td>{v.points_per_dollar}</td>
                    <td>{v.is_active ? 'Active' : 'Pending'}</td>
                    <td>
                      {!v.is_active && (
                        <Button
                          style={{ background: 'var(--accent-gold)', color: 'var(--text-dark)', padding: '6px 12px', borderRadius: 6 }}
                          handleClick={() => handleApprove(v.id)}
                        >
                          {approvingId === v.id ? '...' : 'Approve'}
                        </Button>
                      )}
                    </td>
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

export default AdminVendors;
