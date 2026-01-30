import { createTheme } from '@mui/material';
import { ThemeProvider } from '@emotion/react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Company from './utilities/Company';

import Landing from './Pages/Landing';
import Join from './Pages/Join';
import CustomerLogin from './Pages/customer/Login';
import CustomerDashboard from './Pages/customer/Dashboard';
import VendorLogin from './Pages/vendor/Login';
import VendorSignup from './Pages/vendor/Signup';
import VendorDashboard from './Pages/vendor/Dashboard';
import VendorTransactions from './Pages/vendor/Transactions';
import VendorSettings from './Pages/vendor/Settings';
import AdminLogin from './Pages/admin/Login';
import AdminDashboard from './Pages/admin/Dashboard';
import AdminVendors from './Pages/admin/Vendors';
import AdminCustomers from './Pages/admin/Customers';
import AdminTransactions from './Pages/admin/Transactions';
import AdminSettings from './Pages/admin/Settings';

function App() {
  const theme = createTheme({
    palette: {
      primary: {
        main: '#1a365d'
      },
      secondary: {
        main: '#0891b2'
      }
    },
    typography: {
      fontFamily: 'Fira Sans Extra Condensed, sans-serif',
      fontWeightLight: 300,
      fontWeightRegular: 400,
      fontWeightBold: 800,
      fontSize: 20
    }
  });

  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Routes>
          <Route path="/" element={<Landing title={`${Company.name} | ${Company.tagline}`} />} />
          <Route path="/join" element={<Join title={`Join rewards | ${Company.name}`} />} />
          <Route path="/customer/login" element={<CustomerLogin title={`Customer | ${Company.name}`} />} />
          <Route path="/customer/dashboard" element={<CustomerDashboard title={`My Rewards | ${Company.name}`} />} />
          <Route path="/vendor/login" element={<VendorLogin title={`Vendor Login | ${Company.name}`} />} />
          <Route path="/vendor/signup" element={<VendorSignup title={`Vendor Sign Up | ${Company.name}`} />} />
          <Route path="/vendor/dashboard" element={<VendorDashboard title={`Vendor Dashboard | ${Company.name}`} />} />
          <Route path="/vendor/transactions" element={<VendorTransactions title={`Transactions | ${Company.name}`} />} />
          <Route path="/vendor/settings" element={<VendorSettings title={`Settings | ${Company.name}`} />} />
          <Route path="/admin/login" element={<AdminLogin title={`Admin | ${Company.name}`} />} />
          <Route path="/admin/dashboard" element={<AdminDashboard title={`Admin Dashboard | ${Company.name}`} />} />
          <Route path="/admin/vendors" element={<AdminVendors title={`Vendors | ${Company.name}`} />} />
          <Route path="/admin/customers" element={<AdminCustomers title={`Customers | ${Company.name}`} />} />
          <Route path="/admin/transactions" element={<AdminTransactions title={`Transactions | ${Company.name}`} />} />
          <Route path="/admin/settings" element={<AdminSettings title={`Settings | ${Company.name}`} />} />
          <Route path="*" element={<Landing title={`${Company.name} | ${Company.tagline}`} />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
