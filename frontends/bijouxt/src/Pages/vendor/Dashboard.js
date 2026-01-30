import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import cookies from '../../utilities/Cookies';
import Toast from '../../components/Toast';
import Flexbox from '../../components/Flexbox';
import Spacebox from '../../components/Spacebox';
import { Typography, Container } from '@mui/material';
import Button from '../../components/Button';
import requests from '../../handlers/requests';
import Company from '../../utilities/Company';
import Footer from '../../components/Footer';

const VendorDashboard = ({ title }) => {
  if (typeof document !== 'undefined' && document.querySelector('title')) {
    document.querySelector('title').innerHTML = title;
  }

  const [open, setOpen] = useState(false);
  const [severity, setSeverity] = useState('success');
  const [msg, setToastMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [recentTx, setRecentTx] = useState([]);
  const [phone, setPhone] = useState('');
  const [customer, setCustomer] = useState(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [amount, setAmount] = useState('');
  const [awardLoading, setAwardLoading] = useState(false);
  const [redeemPts, setRedeemPts] = useState('');
  const [useShared, setUseShared] = useState(false);
  const [redeemLoading, setRedeemLoading] = useState(false);
  const [joinUrl, setJoinUrl] = useState('');
  const [vendorName, setVendorName] = useState('');
  const [manualPhone, setManualPhone] = useState('');
  const [manualFullname, setManualFullname] = useState('');
  const [manualLoading, setManualLoading] = useState(false);
  const navigate = useNavigate();
  const token = cookies.getCookies('vendor-token');

  const load = () => {
    if (!token || token.length < 10) {
      navigate('/vendor/login');
      return;
    }
    setLoading(true);
    const url = `${process.env.REACT_APP_SERVER || ''}api/vendor/dashboard?token=${token}`;
    // #region agent log
    fetch('http://127.0.0.1:7254/ingest/e16fbffe-9c0e-4a07-81be-22b06d107449', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'vendor/Dashboard.js:load', message: 'Dashboard fetch', data: { urlSnippet: url.slice(-55), hasToken: !!token }, timestamp: Date.now(), sessionId: 'debug-session', hypothesisId: 'B' }) }).catch(() => {});
    // #endregion
    requests.makeGet(url, setOpen, setSeverity, setToastMsg, setLoading, (res) => {
      // #region agent log
      fetch('http://127.0.0.1:7254/ingest/e16fbffe-9c0e-4a07-81be-22b06d107449', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'vendor/Dashboard.js:load:success', message: 'Dashboard loaded', data: { success: !!res.success, hasStats: !!res.stats }, timestamp: Date.now(), sessionId: 'debug-session', hypothesisId: 'B' }) }).catch(() => {});
      // #endregion
      setStats(res.stats);
      setRecentTx(res.recentTransactions || []);
    }, null);
  };

  const loadJoinInfo = () => {
    if (!token || token.length < 10) return;
    const url = `${process.env.REACT_APP_SERVER || ''}api/vendor/join-info?token=${token}`;
    // #region agent log
    fetch('http://127.0.0.1:7254/ingest/e16fbffe-9c0e-4a07-81be-22b06d107449', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'vendor/Dashboard.js:joinInfo', message: 'Join-info fetch', data: { urlSnippet: url.slice(-50) }, timestamp: Date.now(), sessionId: 'debug-session', hypothesisId: 'E' }) }).catch(() => {});
    // #endregion
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        // #region agent log
        fetch('http://127.0.0.1:7254/ingest/e16fbffe-9c0e-4a07-81be-22b06d107449', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'vendor/Dashboard.js:joinInfo:res', message: 'Join-info response', data: { success: !!data.success, hasJoinUrl: !!data.joinUrl }, timestamp: Date.now(), sessionId: 'debug-session', hypothesisId: 'E' }) }).catch(() => {});
        // #endregion
        if (data.success && data.joinUrl) {
          setJoinUrl(data.joinUrl);
          setVendorName(data.vendorName || '');
        }
      })
      .catch(() => {});
  };

  const handleManualAdd = () => {
    const trimmed = (manualPhone || '').trim().replace(/\D/g, '');
    if (trimmed.length < 6) {
      setToastMsg('Enter a valid phone number');
      setSeverity('error');
      setOpen(true);
      return;
    }
    setManualLoading(true);
    const url = `${process.env.REACT_APP_SERVER || ''}api/vendor/customers?token=${token}`;
    requests.makePost(
      url,
      { phone: trimmed, fullname: (manualFullname || '').trim() },
      setOpen,
      setSeverity,
      setToastMsg,
      setManualLoading,
      () => {
        setManualPhone('');
        setManualFullname('');
        load();
      },
      'Customer added'
    );
  };

  useEffect(() => {
    load();
  }, [navigate, token]);

  useEffect(() => {
    loadJoinInfo();
  }, [token]);

  const handleLookup = () => {
    if (!phone.trim()) {
      setToastMsg('Enter phone number');
      setSeverity('error');
      setOpen(true);
      return;
    }
    setLookupLoading(true);
    setCustomer(null);
    const url = `${process.env.REACT_APP_SERVER || ''}api/vendor/customer?token=${token}&phone=${encodeURIComponent(phone.trim())}`;
    requests.makeGet(url, setOpen, setSeverity, setToastMsg, setLookupLoading, (res) => setCustomer(res.customer), null);
  };

  const handleAward = () => {
    if (!customer || !amount || parseFloat(amount) <= 0) {
      setToastMsg('Enter purchase amount');
      setSeverity('error');
      setOpen(true);
      return;
    }
    setAwardLoading(true);
    const url = `${process.env.REACT_APP_SERVER || ''}api/vendor/award?token=${token}`;
    requests.makePost(
      url,
      { phone: customer.phone, amount: parseFloat(amount) },
      setOpen,
      setSeverity,
      setToastMsg,
      setAwardLoading,
      () => {
        setToastMsg('Points awarded');
        setSeverity('success');
        setOpen(true);
        setAmount('');
        handleLookup();
        load();
      },
      'Points awarded'
    );
  };

  const handleRedeem = () => {
    const pts = parseFloat(redeemPts);
    if (!customer || isNaN(pts) || pts <= 0) {
      setToastMsg('Enter points to redeem');
      setSeverity('error');
      setOpen(true);
      return;
    }
    setRedeemLoading(true);
    const url = `${process.env.REACT_APP_SERVER || ''}api/vendor/redeem?token=${token}`;
    requests.makePost(
      url,
      { phone: customer.phone, points: pts, use_shared: !!useShared },
      setOpen,
      setSeverity,
      setToastMsg,
      setRedeemLoading,
      () => {
        setToastMsg('Points redeemed');
        setSeverity('success');
        setOpen(true);
        setRedeemPts('');
        handleLookup();
        load();
      },
      'Points redeemed'
    );
  };

  const handleLogout = () => {
    cookies.deleteCookies('vendor-token');
    cookies.deleteCookies('vendor');
    navigate('/vendor/login');
  };

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
      <div className="dashboard-header" style={{ background: 'var(--primary-dark)', padding: '16px 24px', boxShadow: '0 2px 10px rgba(0,0,0,0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" className="bold" style={{ color: 'var(--text-light)' }}>
          {Company.name} – Vendor
        </Typography>
        <Flexbox style={{ gap: 16 }}>
          <Link to="/vendor/transactions" style={{ color: 'var(--text-light)', opacity: 0.9 }}>Transactions</Link>
          <Link to="/vendor/settings" style={{ color: 'var(--text-light)', opacity: 0.9 }}>Settings</Link>
          <button onClick={handleLogout} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-light)', opacity: 0.9 }}>
            Logout
          </button>
        </Flexbox>
      </div>
      <Container style={{ paddingTop: 24, paddingBottom: 32 }}>
        {loading && <Typography>Loading...</Typography>}
        {!loading && stats && (
          <>
            <Flexbox style={{ flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
              <div style={{ background: 'var(--primary-blue)', borderRadius: 12, padding: 20, minWidth: 140 }}>
                <Typography style={{ fontSize: 14, opacity: 0.9, color: '#fff' }}>Customers</Typography>
                <Typography variant="h5" className="bold" style={{ color: '#fff' }}>{stats.customers}</Typography>
              </div>
              <div style={{ background: 'var(--primary-dark)', borderRadius: 12, padding: 20, minWidth: 140 }}>
                <Typography style={{ fontSize: 14, opacity: 0.9, color: '#fff' }}>Points Today</Typography>
                <Typography variant="h5" className="bold" style={{ color: '#fff' }}>{stats.pointsAwardedToday}</Typography>
              </div>
              <div style={{ background: 'var(--accent-gold)', borderRadius: 12, padding: 20, minWidth: 140 }}>
                <Typography style={{ fontSize: 14, opacity: 0.9 }}>Transactions Today</Typography>
                <Typography variant="h5" className="bold">{stats.transactionsToday}</Typography>
              </div>
            </Flexbox>

            <Flexbox style={{ gap: 24, flexWrap: 'wrap', marginBottom: 24 }}>
              <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', minWidth: 260 }}>
                <Typography className="bold" style={{ marginBottom: 12 }}>QR code – add customers by scan</Typography>
                <Typography style={{ fontSize: 14, opacity: 0.8, marginBottom: 16 }}>Customers scan this to join your rewards program.</Typography>
                {joinUrl ? (
                  <div style={{ display: 'inline-block', padding: 12, background: '#fff', borderRadius: 8 }}>
                    <QRCodeSVG value={joinUrl} size={180} level="M" />
                  </div>
                ) : (
                  <Typography style={{ fontSize: 14, opacity: 0.7 }}>Loading QR…</Typography>
                )}
              </div>
              <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', minWidth: 260, flex: 1 }}>
                <Typography className="bold" style={{ marginBottom: 12 }}>Add customer manually</Typography>
                <Typography style={{ fontSize: 14, opacity: 0.8, marginBottom: 16 }}>For customers without a phone to scan.</Typography>
                <div style={{ marginBottom: 12 }}>
                  <small>Phone number (required)</small>
                  <input
                    type="tel"
                    value={manualPhone}
                    onChange={(e) => setManualPhone(e.target.value)}
                    placeholder="e.g. 2425551234"
                    style={{ width: '100%', marginTop: 4 }}
                  />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <small>Name (optional)</small>
                  <input
                    type="text"
                    value={manualFullname}
                    onChange={(e) => setManualFullname(e.target.value)}
                    placeholder="Customer name"
                    style={{ width: '100%', marginTop: 4 }}
                  />
                </div>
                <Button
                  style={{ background: 'var(--primary-blue)', color: '#fff', padding: '10px 20px', borderRadius: 8 }}
                  handleClick={handleManualAdd}
                >
                  {manualLoading ? 'Adding...' : 'Add customer'}
                </Button>
              </div>
            </Flexbox>

            <div style={{ background: 'white', borderRadius: 12, padding: 24, marginBottom: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <Typography className="bold" style={{ marginBottom: 16 }}>Look up customer (by phone)</Typography>
              <Flexbox style={{ gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                <div>
                  <small>Phone</small>
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g. 2425551234" style={{ minWidth: 180 }} />
                </div>
                <Button style={{ background: 'var(--primary-blue)', color: '#fff', padding: '10px 20px', borderRadius: 8 }} handleClick={handleLookup}>
                  {lookupLoading ? 'Looking up...' : 'Look up'}
                </Button>
              </Flexbox>
              {customer && (
                <>
                  <Spacebox padding="16px" />
                  <div style={{ padding: 16, background: 'var(--bg-light)', borderRadius: 8 }}>
                    <Typography className="bold">{customer.fullname || 'Customer'}</Typography>
                    <Typography style={{ fontSize: 14 }}>Phone: {customer.phone}</Typography>
                    <Typography style={{ fontSize: 14 }}>Store points: {customer.vendorPoints ?? 0}</Typography>
                    <Typography style={{ fontSize: 14 }}>Shared points: {customer.sharedPoints ?? 0}</Typography>
                  </div>
                  <Spacebox padding="16px" />
                  <Flexbox style={{ gap: 16, flexWrap: 'wrap' }}>
                    <div>
                      <small>Award points (purchase amount $)</small>
                      <input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount" style={{ width: 100 }} />
                      <Spacebox padding="8px" />
                      <Button style={{ background: 'var(--accent-gold)', color: 'var(--text-dark)', padding: '8px 16px', borderRadius: 8 }} handleClick={handleAward}>
                        {awardLoading ? 'Awarding...' : 'Award points'}
                      </Button>
                    </div>
                    <div>
                      <small>Redeem points</small>
                      <input type="number" step="1" value={redeemPts} onChange={(e) => setRedeemPts(e.target.value)} placeholder="Points" style={{ width: 80 }} />
                      <label style={{ marginLeft: 8, fontSize: 14 }}>
                        <input type="checkbox" checked={useShared} onChange={(e) => setUseShared(e.target.checked)} /> Use shared pool
                      </label>
                      <Spacebox padding="8px" />
                      <Button style={{ background: 'var(--primary-blue)', color: '#fff', padding: '8px 16px', borderRadius: 8 }} handleClick={handleRedeem}>
                        {redeemLoading ? 'Redeeming...' : 'Redeem'}
                      </Button>
                    </div>
                  </Flexbox>
                </>
              )}
            </div>

            <Typography className="bold" style={{ marginBottom: 12 }}>Recent transactions</Typography>
            <div style={{ background: 'white', borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <table>
                <thead>
                  <tr>
                    <td>Date</td>
                    <td>Type</td>
                    <td>Customer</td>
                    <td>Points</td>
                    <td>Amount</td>
                  </tr>
                </thead>
                <tbody>
                  {recentTx.length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: 24 }}>No transactions yet.</td>
                    </tr>
                  )}
                  {recentTx.map((t) => (
                    <tr key={t.id}>
                      <td>{t.timestamp ? new Date(t.timestamp).toLocaleString() : '—'}</td>
                      <td>{typeLabel(t.type)}</td>
                      <td>{t.phone || t.fullname || '—'}</td>
                      <td>{t.points}</td>
                      <td>{t.amount != null ? t.amount : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </Container>
      <Footer />
    </div>
  );
};

export default VendorDashboard;
