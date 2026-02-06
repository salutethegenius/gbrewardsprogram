import { Link } from 'react-router-dom';
import Company from '../utilities/Company';
import { Typography } from '@mui/material';
import Flexbox from '../components/Flexbox';

const Terms = ({ title }) => {
  if (typeof document !== 'undefined' && document.querySelector('title')) {
    document.querySelector('title').textContent = title || `Terms of Service | ${Company.name}`;
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-light)', padding: '24px 16px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <Flexbox style={{ marginBottom: 24 }}>
          <Link to="/" style={{ color: 'var(--primary-dark)', fontSize: 14 }}>← Back to home</Link>
        </Flexbox>
        <Typography variant="h4" className="bold" style={{ marginBottom: 8 }}>Terms of Service</Typography>
        <Typography style={{ fontSize: 14, opacity: 0.8, marginBottom: 32 }}>Last updated: {new Date().toLocaleDateString()}</Typography>

        <Typography component="div" style={{ lineHeight: 1.7 }}>
          <p><strong>1. Acceptance</strong></p>
          <p>By using the {Company.name} platform (the &quot;Service&quot;), you agree to these Terms of Service and our Privacy Policy. The Service is operated for the Downtown Freeport Business Association and its participating vendors and customers.</p>

          <p><strong>2. Use of the Service</strong></p>
          <p>You may use the Service only for lawful purposes. You must not misuse the Service, attempt to gain unauthorized access, or interfere with other users. Vendors and admins are responsible for keeping their credentials secure.</p>

          <p><strong>3. Rewards and Points</strong></p>
          <p>Points and rewards are offered by participating vendors and are subject to their policies. The program operator does not guarantee the value or availability of rewards. Points have no cash value unless stated by a vendor.</p>

          <p><strong>4. Account and Data</strong></p>
          <p>You are responsible for the accuracy of information you provide. We process personal data in accordance with our Privacy Policy and the Bahamas Data Protection Act where applicable.</p>

          <p><strong>5. Changes</strong></p>
          <p>We may update these Terms from time to time. Continued use of the Service after changes constitutes acceptance. Material changes will be communicated where appropriate.</p>

          <p><strong>6. Contact</strong></p>
          <p>Questions about these Terms: {Company.email ? <a href={`mailto:${Company.email}`}>{Company.email}</a> : 'see Contact on the website'}.</p>
        </Typography>
      </div>
    </div>
  );
};

export default Terms;
