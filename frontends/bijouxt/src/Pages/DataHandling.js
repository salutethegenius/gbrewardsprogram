import { Link } from 'react-router-dom';
import Company from '../utilities/Company';
import { Typography } from '@mui/material';
import Flexbox from '../components/Flexbox';

const DataHandling = ({ title }) => {
  if (typeof document !== 'undefined' && document.querySelector('title')) {
    document.querySelector('title').textContent = title || `Data Handling & Compliance | ${Company.name}`;
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-light)', padding: '24px 16px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <Flexbox style={{ marginBottom: 24 }}>
          <Link to="/" style={{ color: 'var(--primary-dark)', fontSize: 14 }}>← Back to home</Link>
        </Flexbox>
        <Typography variant="h4" className="bold" style={{ marginBottom: 8 }}>Data Handling & Compliance</Typography>
        <Typography style={{ fontSize: 14, opacity: 0.8, marginBottom: 32 }}>Bahamas Data Protection Act alignment</Typography>

        <Typography component="div" style={{ lineHeight: 1.7 }}>
          <p><strong>1. Compliance framework</strong></p>
          <p>{Company.name} is designed to align with the Bahamas Data Protection Act (DPA). We act as data controller for the personal data we collect through the platform and ensure processing is lawful, fair, and transparent.</p>

          <p><strong>2. Principles we follow</strong></p>
          <p>We process data in line with DPA principles: lawfulness and fairness; purpose limitation; data minimization; accuracy; storage limitation; security and confidentiality; and accountability. We maintain records of processing where required.</p>

          <p><strong>3. Data subjects and rights</strong></p>
          <p>Data subjects (customers, vendors, admins) can request access, rectification, erasure, restriction of processing, and data portability where applicable. We respond to such requests within the timeframes set by the DPA. Contact: {Company.email ? <a href={`mailto:${Company.email}`}>{Company.email}</a> : 'see Contact on the website'}.</p>

          <p><strong>4. Security measures</strong></p>
          <p>We use industry-standard security: encrypted connections (HTTPS), hashed passwords, secure JWT tokens, and access controls. Database access is restricted and audit logs record admin and key actions for accountability.</p>

          <p><strong>5. Data breaches</strong></p>
          <p>In the event of a personal data breach that poses a risk to individuals, we will assess and, where required by the Bahamas DPA, notify the relevant authority and affected data subjects without undue delay.</p>

          <p><strong>6. Sub-processors and transfers</strong></p>
          <p>We use Supabase (hosted infrastructure) for database and backend services. Data may be stored in supported regions. We ensure appropriate safeguards for any cross-border transfer as required by the DPA.</p>

          <p><strong>7. Audit and review</strong></p>
          <p>Admins can view an audit log of key actions (logins, views, changes) in the admin dashboard. We periodically review our data handling practices to maintain compliance with the Bahamas Data Protection Act.</p>
        </Typography>
      </div>
    </div>
  );
};

export default DataHandling;
