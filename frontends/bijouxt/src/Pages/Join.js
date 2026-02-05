import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Toast from '../components/Toast';
import Flexbox from '../components/Flexbox';
import Spacebox from '../components/Spacebox';
import { Typography } from '@mui/material';
import Button from '../components/Button';
import Company from '../utilities/Company';

const Join = ({ title }) => {
  if (typeof document !== 'undefined' && document.querySelector('title')) {
    if (typeof document !== 'undefined' && document.querySelector('title')) document.querySelector('title').textContent = title;
  }

  const [searchParams] = useSearchParams();
  const vendorId = searchParams.get('vendor') || '';
  const [phone, setPhone] = useState('');
  const [fullname, setFullname] = useState('');
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [severity, setSeverity] = useState('success');
  const [msg, setToastMsg] = useState('');
  const [joined, setJoined] = useState(false);

  const submit = () => {
    const trimmed = (phone || '').trim().replace(/\D/g, '');
    if (trimmed.length < 6) {
      setToastMsg('Enter a valid phone number');
      setSeverity('error');
      setOpen(true);
      return;
    }
    if (!vendorId) {
      setToastMsg('Invalid link. Scan the store\'s QR code again.');
      setSeverity('error');
      setOpen(true);
      return;
    }
    setLoading(true);
    const url = `${process.env.REACT_APP_SERVER || '/'}api/join`;
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vendor_id: vendorId, phone: trimmed, fullname: (fullname || '').trim() })
    })
      .then((res) => res.json())
      .then((data) => {
        setLoading(false);
        if (data.success) {
          setJoined(true);
          setToastMsg("You're added! You can now earn rewards at this store.");
          setSeverity('success');
          setOpen(true);
        } else {
          setToastMsg(data.msg || 'Something went wrong');
          setSeverity('error');
          setOpen(true);
        }
      })
      .catch(() => {
        setLoading(false);
        setToastMsg('Connection error. Try again.');
        setSeverity('error');
        setOpen(true);
      });
  };

  if (!vendorId) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--primary-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <Typography style={{ color: 'var(--text-light)', textAlign: 'center' }}>
          Invalid join link. Please scan the store&apos;s QR code to join.
        </Typography>
      </div>
    );
  }

  if (joined) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--primary-dark)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <Toast open={open} setOpen={setOpen} severity={severity} timer={4000}>{msg}</Toast>
        <Typography variant="h5" className="bold" style={{ color: 'var(--text-light)', textAlign: 'center', marginBottom: 16 }}>
          You&apos;re in!
        </Typography>
        <Typography style={{ color: 'var(--text-light)', opacity: 0.9, textAlign: 'center' }}>
          You can now earn and redeem rewards at this store. Give your phone number at the counter when you shop.
        </Typography>
      </div>
    );
  }

  return (
    <div className="join-page" style={{ minHeight: '100vh', background: 'var(--primary-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <Toast open={open} setOpen={setOpen} severity={severity} timer={4000}>{msg}</Toast>
      <Flexbox justifyContent="center" alignItems="center" style={{ width: '100%' }}>
        <div style={{ maxWidth: 400, width: '100%' }}>
          <Typography variant="h5" className="bold" style={{ color: 'var(--text-light)', textAlign: 'center', marginBottom: 8 }}>
            {Company.name}
          </Typography>
          <Typography style={{ color: 'var(--text-light)', opacity: 0.9, textAlign: 'center', marginBottom: 24, fontSize: 14 }}>
            Join this store&apos;s rewards program
          </Typography>
          <div
            style={{
              borderRadius: 16,
              padding: 32,
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
              background: 'white'
            }}
          >
            <Typography className="bold" style={{ marginBottom: 16 }}>Your details</Typography>
            <small>Phone number (required)</small>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 2425551234"
              style={{ width: '100%', marginBottom: 16, marginTop: 4 }}
            />
            <small>Name (optional)</small>
            <input
              type="text"
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
              placeholder="Your name"
              style={{ width: '100%', marginBottom: 20, marginTop: 4 }}
            />
            <Button
              style={{ background: 'var(--primary-blue)', color: '#fff', width: '100%', padding: 14, borderRadius: 8 }}
              handleClick={submit}
            >
              {loading ? 'Adding...' : 'Join rewards'}
            </Button>
          </div>
          <Spacebox padding="16px" />
          <Typography style={{ color: 'var(--text-light)', opacity: 0.8, fontSize: 12, textAlign: 'center' }}>
            No phone? Ask staff to add you manually at the counter.
          </Typography>
        </div>
      </Flexbox>
    </div>
  );
};

export default Join;
