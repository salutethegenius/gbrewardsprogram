import { Link } from 'react-router-dom';
import Company from '../utilities/Company';
import { Typography } from '@mui/material';
import Flexbox from '../components/Flexbox';

const Privacy = ({ title }) => {
  if (typeof document !== 'undefined' && document.querySelector('title')) {
    document.querySelector('title').textContent = title || `Privacy Policy | ${Company.name}`;
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-light)', padding: '24px 16px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <Flexbox style={{ marginBottom: 24 }}>
          <Link to="/" style={{ color: 'var(--primary-dark)', fontSize: 14 }}>← Back to home</Link>
        </Flexbox>
        <Typography variant="h4" className="bold" style={{ marginBottom: 8 }}>Privacy Policy</Typography>
        <Typography style={{ fontSize: 14, opacity: 0.8, marginBottom: 32 }}>Last updated: {new Date().toLocaleDateString()}</Typography>

        <Typography component="div" style={{ lineHeight: 1.7 }}>
          <p><strong>1. Who we are</strong></p>
          <p>{Company.name} is a loyalty and rewards platform for the Downtown Freeport Business Association. We act as a data controller (and, where applicable, processor) for personal data collected through the Service, in line with the Bahamas Data Protection Act.</p>

          <p><strong>2. Data we collect</strong></p>
          <p>We collect: (a) <strong>Customers:</strong> phone number, name, email (optional), and transaction/points data; (b) <strong>Vendors:</strong> business name, email, password (hashed), phone, address; (c) <strong>Admins:</strong> email, password (hashed), name. We also log technical data (e.g. IP, timestamps) for security and audit.</p>

          <p><strong>3. How we use it</strong></p>
          <p>We use your data to operate the rewards program (awarding and redeeming points), to communicate with you (e.g. magic-link emails for customer login), and to comply with legal obligations. We do not sell your data to third parties.</p>

          <p><strong>4. Lawful basis (Bahamas DPA)</strong></p>
          <p>We process personal data on the basis of: performance of a contract (providing the rewards service), consent where we ask for it (e.g. marketing), and legitimate interests (security, fraud prevention, audit). Where required by law we will obtain consent.</p>

          <p><strong>5. Your rights</strong></p>
          <p>Under the Bahamas Data Protection Act you have rights including: access to your data, correction of inaccuracies, erasure in certain cases, restriction of processing, and data portability. To exercise these rights, contact us at {Company.email ? <a href={`mailto:${Company.email}`}>{Company.email}</a> : 'the contact address on the website'}.</p>

          <p><strong>6. Retention and security</strong></p>
          <p>We retain data only as long as needed for the purposes above or as required by law. We use technical and organizational measures to protect your data (e.g. encryption, access controls).</p>

          <p><strong>7. Changes</strong></p>
          <p>We may update this Privacy Policy. Significant changes will be communicated where appropriate. See also our Data Handling page for more on compliance.</p>
        </Typography>
      </div>
    </div>
  );
};

export default Privacy;
