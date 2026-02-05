import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Company from '../utilities/Company';
import Flexbox from '../components/Flexbox';
import Button from '../components/Button';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Typography } from '@mui/material';
import StoreIcon from '@mui/icons-material/Store';
import StarIcon from '@mui/icons-material/Star';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import '../css/button.css';

const Section = ({ id, children, background = 'white' }) => (
  <section
    id={id}
    className="landing-section"
    style={{
      background: background === 'gray' ? 'var(--bg-light)' : '#fff',
      padding: '64px 24px'
    }}
  >
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>{children}</div>
  </section>
);

const Landing = ({ title }) => {
  if (typeof document !== 'undefined' && document.querySelector('title')) {
    if (typeof document !== 'undefined' && document.querySelector('title')) document.querySelector('title').textContent = title;
  }

  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      if (window.sessionStorage.getItem('gb_confetti_shown')) return;
      setShowConfetti(true);
      window.sessionStorage.setItem('gb_confetti_shown', '1');
      const timer = window.setTimeout(() => setShowConfetti(false), 4000);
      return () => window.clearTimeout(timer);
    } catch {
      // Fallback if sessionStorage is unavailable
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 4000);
      return () => clearTimeout(timer);
    }
  }, []);

  const heroVideoSrc = '/assets/gbpa-hero.mp4';

  return (
    <div className="landing-page" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-light)' }}>
      <Navbar />

      {/* Hero */}
      <div
        className="landing-hero"
        style={{
          position: 'relative',
          minHeight: '75vh',
          background: 'var(--primary-dark)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 40,
          overflow: 'hidden',
          boxSizing: 'border-box'
        }}
      >
        <video
          className="landing-hero-video"
          autoPlay
          muted
          loop
          playsInline
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            zIndex: 0
          }}
          src={heroVideoSrc}
        />
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(30, 41, 59, 0.45)',
            zIndex: 1
          }}
        />
        {showConfetti && (
          <div className="confetti-layer">
            {Array.from({ length: 80 }).map((_, i) => (
              <span
                key={i}
                className="confetti-piece"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  backgroundColor: ['#38bdf8', '#0ea5e9', '#1d4ed8', '#a5b4fc'][i % 4]
                }}
              />
            ))}
          </div>
        )}
        <Flexbox flexDirection="column" alignItems="center" style={{ flexDirection: 'column', textAlign: 'center', position: 'relative', zIndex: 2 }}>
          <Typography
            variant="h1"
            component="h1"
            className="hero-title-shimmer"
            style={{
              fontSize: '3.75rem',
              color: 'var(--text-light)',
              marginBottom: 12,
              fontWeight: 800,
              letterSpacing: '0.04em'
            }}
          >
            {Company.name}
          </Typography>
          <Typography className="hero-tagline" style={{ fontSize: '1.35rem', color: 'var(--text-light)', opacity: 0.95, fontWeight: 600, marginBottom: 40 }}>
            {Company.tagline}
          </Typography>
          <Flexbox style={{ gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link to="/customer/login">
              <Button
                style={{
                  background: '#38bdf8',
                  color: '#ffffff',
                  padding: '16px 32px',
                  borderRadius: 8,
                  fontWeight: 700
                }}
                handleClick={() => {}}
              >
                Get Started
              </Button>
            </Link>
            <a href="#for-businesses" style={{ textDecoration: 'none', flex: '1 1 auto', minWidth: 140 }}>
              <Button
                style={{
                  background: 'transparent',
                  color: 'var(--text-light)',
                  padding: '16px 32px',
                  borderRadius: 8,
                  fontWeight: 600,
                  border: '2px solid var(--text-light)'
                }}
                handleClick={() => {}}
              >
                For Businesses
              </Button>
            </a>
          </Flexbox>
        </Flexbox>
      </div>

      {/* How It Works */}
      <Section id="how-it-works" background="gray">
        <Typography variant="h2" className="section-heading" style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-dark)', textAlign: 'center', marginBottom: 12 }}>
          How It Works
        </Typography>
        <Typography style={{ textAlign: 'center', fontSize: 18, opacity: 0.85, marginBottom: 32 }}>
          In <strong>three quick moves</strong>: shop, earn, save. Just give your phone number – no app, no card.
        </Typography>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 32 }}>
          {[
            { icon: StoreIcon, title: 'Shop', text: 'Look for the GB Rewards sign and shop like normal.' },
            { icon: StarIcon, title: 'Give your phone', text: 'At checkout, say your phone number once. Points go to your account.' },
            { icon: CardGiftcardIcon, title: 'Save cash', text: 'Next time, use your points to lower your bill at any rewards store.' }
          ].map((step, index) => (
            <div
              key={step.title}
              style={{
                background: '#fff',
                padding: 32,
                borderRadius: 12,
                boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                textAlign: 'center'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
                <div className="how-step-badge">{index + 1}</div>
              </div>
              <step.icon style={{ fontSize: 48, color: 'var(--primary-blue)', marginBottom: 16 }} />
              <Typography style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: 8 }}>{step.title}</Typography>
              <Typography style={{ color: 'var(--text-dark)', opacity: 0.92, lineHeight: 1.6, fontSize: 18 }}>
                {step.text}
              </Typography>
            </div>
          ))}
        </div>
      </Section>

      {/* For Businesses */}
      <Section id="for-businesses" background="gray">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 32, alignItems: 'stretch' }}>
          <div
            style={{
              background: '#fff',
              padding: 32,
              borderRadius: 12,
              boxShadow: '0 4px 20px rgba(0,0,0,0.06)'
            }}
          >
            <Typography variant="h2" style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-dark)', marginBottom: 16 }}>
              For Businesses
            </Typography>
            <Typography style={{ color: 'var(--text-dark)', opacity: 0.9, lineHeight: 1.7, marginBottom: 16, fontSize: 18 }}>
              GB Rewards is a simple way to bring shoppers back. When people buy, they earn points. When they return, they use points to save, and you make more sales.
            </Typography>
            <Typography style={{ color: 'var(--text-dark)', opacity: 0.9, lineHeight: 1.7, marginBottom: 24, fontSize: 18 }}>
              No new machines, no cards. Staff just type in a phone number, and you manage everything in a clean web dashboard.
            </Typography>
            <Link to="/vendor/login">
              <Button
                style={{
                  background: 'var(--primary-blue)',
                  color: '#fff',
                  padding: '14px 28px',
                  borderRadius: 8,
                  fontWeight: 700
                }}
                handleClick={() => {}}
              >
                Become a Partner
              </Button>
            </Link>
          </div>
          <div
            style={{
              background: '#fff',
              padding: 32,
              borderRadius: 12,
              boxShadow: '0 4px 20px rgba(0,0,0,0.06)'
            }}
          >
            <Typography variant="h2" style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-dark)', marginBottom: 16 }}>
              For Shoppers
            </Typography>
            <Typography style={{ color: 'var(--text-dark)', opacity: 0.9, lineHeight: 1.7, marginBottom: 16, fontSize: 18 }}>
              Think of GB Rewards like a simple savings jar across your favorite Downtown Freeport spots.
            </Typography>
            <ul style={{ margin: 0, paddingLeft: 20, lineHeight: 2, color: 'var(--text-dark)', opacity: 0.9, fontSize: 18 }}>
              <li>Earn points every time you shop at a GB Rewards store – just give your phone number.</li>
              <li>Use your points to cut your bill at any store in the network, not just one place.</li>
              <li>No app, no plastic card, no forms. Your phone number is your rewards ID.</li>
              <li>See your points and visits in a clean, easy‑to‑read dashboard.</li>
            </ul>
            <div style={{ marginTop: 20 }}>
              <Link to="/customer/login">
                <Button
                  style={{
                    background: 'var(--primary-blue)',
                    color: '#fff',
                    padding: '14px 28px',
                    borderRadius: 8,
                    fontWeight: 700
                  }}
                  handleClick={() => {}}
                >
                  Join Free Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
        <div
          style={{
            maxWidth: 900,
            margin: '32px auto 0',
            background: '#fff',
            padding: 32,
            borderRadius: 12,
            boxShadow: '0 4px 20px rgba(0,0,0,0.06)'
          }}
        >
          <Typography style={{ fontWeight: 800, marginBottom: 16, fontSize: '1.75rem', textAlign: 'center' }}>
            WIN / WIN / WIN
          </Typography>
          <ul style={{ margin: 0, paddingLeft: 20, lineHeight: 1.9, color: 'var(--text-dark)', opacity: 0.9, fontSize: 18 }}>
            <li><strong>Businesses win:</strong> more repeat visits, bigger baskets, and new customers from other GB Rewards stores.</li>
            <li><strong>Shoppers win:</strong> real savings at the cash register and surprise rewards for staying loyal to local spots.</li>
            <li><strong>Community wins:</strong> money stays in Downtown Freeport and helps the whole district feel alive again.</li>
          </ul>
        </div>
      </Section>

      {/* About / Vision */}
      <Section id="about" background="gray">
        <Typography variant="h2" className="section-heading" style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-dark)', textAlign: 'center', marginBottom: 24 }}>
          Our Vision
        </Typography>
        <Typography style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center', color: 'var(--text-dark)', opacity: 0.9, lineHeight: 1.8, fontSize: '1.2rem' }}>
          The GB Rewards Program is a Downtown Freeport Business District initiative to bring energy, engagement, and repeat foot traffic back to our city. By creating a connected rewards community across participating stores, we encourage shoppers to explore the district while supporting local businesses. The program is overseen by the Downtown Freeport Business Association in partnership with the Grand Bahama community.
        </Typography>
      </Section>

      <Footer />
    </div>
  );
};

export default Landing;
