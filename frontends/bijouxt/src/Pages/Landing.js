import { Link } from 'react-router-dom';
import Company from '../utilities/Company';
import Flexbox from '../components/Flexbox';
import Spacebox from '../components/Spacebox';
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
        <Flexbox flexDirection="column" alignItems="center" style={{ flexDirection: 'column', textAlign: 'center', position: 'relative', zIndex: 2 }}>
          <Typography variant="h1" component="h1" style={{ fontSize: '3rem', color: 'var(--text-light)', marginBottom: 12, fontWeight: 800 }}>
            {Company.name}
          </Typography>
          <Typography className="hero-tagline" style={{ fontSize: '1.35rem', color: 'var(--text-light)', opacity: 0.95, fontWeight: 600, marginBottom: 40 }}>
            {Company.tagline}
          </Typography>
          <Flexbox style={{ gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link to="/customer/login">
              <Button
                style={{
                  background: 'var(--accent-gold)',
                  color: 'var(--text-dark)',
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
        <Typography variant="h2" className="section-heading" style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-dark)', textAlign: 'center', marginBottom: 48 }}>
          How It Works
        </Typography>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 32 }}>
          {[
            { icon: StoreIcon, title: 'Shop', text: 'Visit participating Downtown Freeport businesses. Simply provide your phone number at checkout.' },
            { icon: StarIcon, title: 'Earn', text: 'Earn points with every purchase. A portion goes to your store balance; the rest to your shared pool for use anywhere.' },
            { icon: CardGiftcardIcon, title: 'Redeem', text: 'Redeem points at any participating store. Use store-specific points or shared rewards across the district.' }
          ].map((step) => (
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
              <step.icon style={{ fontSize: 48, color: 'var(--primary-blue)', marginBottom: 16 }} />
              <Typography style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 8 }}>{step.title}</Typography>
              <Typography style={{ color: 'var(--text-dark)', opacity: 0.85, lineHeight: 1.6 }}>{step.text}</Typography>
            </div>
          ))}
        </div>
      </Section>

      {/* For Businesses */}
      <Section id="for-businesses">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 48, alignItems: 'center' }}>
          <div>
            <Typography variant="h2" style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-dark)', marginBottom: 16 }}>
              For Businesses
            </Typography>
            <Typography style={{ color: 'var(--text-dark)', opacity: 0.9, lineHeight: 1.7, marginBottom: 24 }}>
              Join the Downtown Freeport rewards network. Attract more customers, reward loyalty, and be part of a connected district-wide program managed by the Downtown Freeport Business Association.
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
          <div style={{ background: 'var(--bg-light)', padding: 32, borderRadius: 12 }}>
            <Typography style={{ fontWeight: 700, marginBottom: 16 }}>Benefits</Typography>
            <ul style={{ margin: 0, paddingLeft: 20, lineHeight: 2, color: 'var(--text-dark)', opacity: 0.9 }}>
              <li>Reach customers across the district</li>
              <li>Simple point-of-sale integration</li>
              <li>Shared rewards drive cross-store traffic</li>
              <li>Backed by DFBA and city program standards</li>
            </ul>
          </div>
        </div>
      </Section>

      {/* About / Vision */}
      <Section id="about" background="gray">
        <Typography variant="h2" className="section-heading" style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-dark)', textAlign: 'center', marginBottom: 24 }}>
          Our Vision
        </Typography>
        <Typography style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center', color: 'var(--text-dark)', opacity: 0.9, lineHeight: 1.8, fontSize: '1.05rem' }}>
          The GB Rewards Program is a Downtown Freeport Business District initiative to bring energy, engagement, and repeat foot traffic back to our city. By creating a connected rewards community across participating stores, we encourage shoppers to explore the district while supporting local businesses. The program is overseen by the Downtown Freeport Business Association in partnership with the Grand Bahama community.
        </Typography>
      </Section>

      <Footer />
    </div>
  );
};

export default Landing;
