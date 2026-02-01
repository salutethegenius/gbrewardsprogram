import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import cookies from '../../utilities/Cookies';
import Toast from '../../components/Toast';
import Flexbox from '../../components/Flexbox';
import Spacebox from '../../components/Spacebox';
import { Typography, Container } from '@mui/material';
import Button from '../../components/Button';
import requests from '../../handlers/requests';
import Company from '../../utilities/Company';
import Footer from '../../components/Footer';

const CustomerDashboard = ({ title }) => {
  if (typeof document !== 'undefined' && document.querySelector('title')) {
    document.querySelector('title').innerHTML = title;
  }

  const [open, setOpen] = useState(false);
  const [severity, setSeverity] = useState('success');
  const [msg, setToastMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [vendorBalances, setVendorBalances] = useState([]);
  const [sharedPoints, setSharedPoints] = useState(0);
  const [sharedPointsValue, setSharedPointsValue] = useState(0);
  const [pointRedemptionValue, setPointRedemptionValue] = useState(0.1);
  const [txLoading, setTxLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const navigate = useNavigate();
  const token = cookies.getCookies('customer-token');

  useEffect(() => {
    if (!token || token.length < 10) {
      navigate('/customer/login');
      return;
    }
    setLoading(true);
    const url = `${process.env.REACT_APP_SERVER || '/'}api/customer/balances?token=${token}`;
    requests.makeGet(url, setOpen, setSeverity, setToastMsg, setLoading, (res) => {
      setVendorBalances(res.vendorBalances || []);
      setSharedPoints(res.sharedPoints ?? 0);
      setSharedPointsValue(res.sharedPointsValue ?? 0);
      setPointRedemptionValue(res.pointRedemptionValue ?? 0.1);
    }, null);
    setTxLoading(true);
    const txUrl = `${process.env.REACT_APP_SERVER || '/'}api/customer/transactions?token=${token}&limit=50`;
    requests.makeGet(txUrl, setOpen, setSeverity, setToastMsg, setTxLoading, (res) => setTransactions(res.data || []), null);
  }, [navigate, token]);

  const handleLogout = () => {
    cookies.deleteCookies('customer-token');
    cookies.deleteCookies('customer');
    navigate('/customer/login');
  };

  const typeLabel = (t) => {
    if (t === 'earned') return 'Earned';
    if (t === 'shared_earned') return 'Shared earned';
    if (t === 'redeemed') return 'Redeemed';
    if (t === 'shared_redeemed') return 'Shared redeemed';
    return t;
  };

  const totalVendorPoints = vendorBalances.reduce((s, b) => s + (b.points || 0), 0);
  const totalVendorPointsValue = vendorBalances.reduce((s, b) => s + (b.pointsValue ?? 0), 0);
  const totalAvailableValue = totalVendorPointsValue + sharedPointsValue;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-light)' }}>
      <Toast open={open} setOpen={setOpen} severity={severity} timer={4000}>
        {msg}
      </Toast>
      <div className="dashboard-header" style={{ background: 'var(--primary-dark)', padding: '16px 24px', boxShadow: '0 2px 10px rgba(0,0,0,0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" className="bold" style={{ color: 'var(--text-light)' }}>
          {Company.name}
        </Typography>
        <button onClick={handleLogout} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-light)', opacity: 0.9 }}>
          Sign out
        </button>
      </div>
      <Container style={{ paddingTop: 24, paddingBottom: 32 }}>
        <Typography variant="h5" className="bold" style={{ marginBottom: 24 }}>
          Your rewards
        </Typography>
        {loading && <Typography>Loading...</Typography>}
        {!loading && (
          <>
            <Flexbox style={{ flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
              <div style={{ background: 'var(--primary-blue)', borderRadius: 12, padding: 24, minWidth: 160 }}>
                <Typography style={{ fontSize: 14, opacity: 0.9, color: '#fff' }}>Store points</Typography>
                <Typography variant="h4" className="bold" style={{ color: '#fff' }}>{totalVendorPoints.toFixed(1)}</Typography>
                <Typography style={{ fontSize: 14, color: '#fff' }}>${totalVendorPointsValue.toFixed(2)} value</Typography>
                <Typography style={{ fontSize: 12, opacity: 0.8, color: '#fff' }}>Redeem at each store</Typography>
              </div>
              <div style={{ background: 'var(--accent-gold)', borderRadius: 12, padding: 24, minWidth: 160 }}>
                <Typography style={{ fontSize: 14, opacity: 0.9 }}>Shared points</Typography>
                <Typography variant="h4" className="bold">{sharedPoints.toFixed(1)}</Typography>
                <Typography style={{ fontSize: 14 }}>${sharedPointsValue.toFixed(2)} value</Typography>
                <Typography style={{ fontSize: 12, opacity: 0.8 }}>Redeem anywhere in the network</Typography>
              </div>
            </Flexbox>
            <Typography style={{ fontSize: 14, opacity: 0.85, marginBottom: 16 }}>
              Total available: ${totalAvailableValue.toFixed(2)} (1 point = ${pointRedemptionValue.toFixed(2)} everywhere)
            </Typography>

            <Typography className="bold" style={{ marginBottom: 12 }}>Points by store</Typography>
            <div style={{ background: 'white', borderRadius: 12, overflow: 'hidden', marginBottom: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              {vendorBalances.length === 0 && (
                <div style={{ padding: 24, textAlign: 'center', opacity: 0.8 }}>
                  No store points yet. Shop at participating Downtown Freeport businesses to earn!
                </div>
              )}
              {vendorBalances.map((b) => (
                <div
                  key={b.vendor_id}
                  style={{
                    padding: 16,
                    borderBottom: '1px solid #eee',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <Typography className="bold">{b.vendor_name || 'Store'}</Typography>
                  <Typography>{b.points?.toFixed(1) ?? 0} pts = ${(b.pointsValue ?? 0).toFixed(2)}</Typography>
                </div>
              ))}
            </div>

            <Typography className="bold" style={{ marginBottom: 12 }}>Recent activity</Typography>
            {txLoading && <Typography>Loading...</Typography>}
            {!txLoading && (
              <div style={{ background: 'white', borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                {transactions.length === 0 && (
                  <div style={{ padding: 24, textAlign: 'center', opacity: 0.8 }}>No transactions yet.</div>
                )}
                {transactions.length > 0 && (
                  <table>
                    <thead>
                      <tr>
                        <td>Date</td>
                        <td>Type</td>
                        <td>Store</td>
                        <td>Points</td>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((t) => (
                        <tr key={t.id}>
                          <td>{t.timestamp ? new Date(t.timestamp).toLocaleString() : '—'}</td>
                          <td>{typeLabel(t.type)}</td>
                          <td>{t.vendor_name || '—'}</td>
                          <td>{t.points}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </>
        )}
      </Container>
      <Footer />
    </div>
  );
};

export default CustomerDashboard;
