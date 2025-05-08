import { createTheme } from '@mui/material'
import { ThemeProvider } from '@emotion/react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Pages/Login';
import AdminLogin from './Pages/admin/Login';
import AdminDashboard from './Pages/admin/Dashboard';
import Company from './utilities/Company';
import Signup from './Pages/Signup';
import Signin from './Pages/Signin';
import Dashboard from './Pages/Dashboard';
import Layout from './components/Layout';

function App() {

  const theme = createTheme({
    palette: {
      primary: {
        main: '#000'
      },
      secondary: {
        main: '#7badf9'
      }
    },

    typography: {
      fontFamily: "Fira Sans Extra Condensed",
      fontWeightLight: 300,
      fontWeightRegular: 400,
      fontWeightBold: 800,
      fontSize: 20
    }
  })

  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Routes>
          <Route exact path='/' element={<Login title={"Loyalty Program | " + Company.name} />} />
          <Route exact path='/signup/:email' element={<Signup title={"Create an account | " + Company.name} />} />
          <Route exact path='/signin/:email' element={<Signin title={"Sign into account | " + Company.name} />} />
          <Route exact path="/dashboard" element={<Layout />} >
            <Route exact path='' element={<Dashboard title={"Dashboard | " + Company.name} />} />
          </Route>
          <Route exact path='/admin/' element={<AdminLogin title={"Control Panel | " + Company.name} />} />
          <Route exact path='/admin/dashboard' element={<AdminDashboard title={"Control Panel | " + Company.name} />} />
          <Route exact path='*' element={<Login title={"Loyalty Program | " + Company.name} />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
