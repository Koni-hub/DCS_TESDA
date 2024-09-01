import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import * as jose from 'jose';
import axios from 'axios';

// Pages
import ProtectedRoutes from './utils/ProtectedRoutes.jsx';
import Dashboard from './pages/Dashboard/Dashboard.jsx';
import Document from './pages/Document/Document.jsx';
import Notification from './pages/Notification/Notification.jsx';
import ViewDocument from './pages/ViewDocuments/ViewDocument.jsx';
import Profile from './pages/Profile/Profile.jsx';

// Auth Pages
import Login from './pages/Login/Login.jsx';
import Register from './pages/Register/Register.jsx';

// Error Pages
import NotFound from './pages/NotFound/NotFound.jsx';
import Forbidden from './pages/Unauthorize/Forbidden.jsx';

import { API_URL } from './config.js';

function AppRoutes() {
  const [accounts, setAccounts] = useState({ normalAccount: null, googleAccount: null });
  const [loading, setLoading] = useState(true);

  const getGoogleInfo = async () => {
    try {
      const response = await fetch(`${API_URL}/auth/login/success`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.error('Failed to fetch:', response.status, response.statusText);
      } 

      const data = await response.json(); 

      const GoogleAccountEmail = data.user.profile.emails[0].value;
      console.log(GoogleAccountEmail);
       // Send email to the server to find the account
      const accountResponse = await axios.post(
        `${API_URL}/find-account`,
        { email: GoogleAccountEmail }, // Send correct data format
        { withCredentials: true } // Include withCredentials in request configuration
      );
  
      if (accountResponse.data && accountResponse.data.createdBy) {
        console.log('Account createdBy:', accountResponse.data.createdBy);
      }

      if (response.ok) {
        window.localStorage.setItem('loggedIn', 'true');
        window.localStorage.setItem('token', data.user.accessToken);
        window.localStorage.setItem('role', accountResponse.data);

        return data.user;
      } else if (response.status === 401) {
        console.log('Unauthorized Data fetch yet', response.status);
        return null;
      } else {
        console.error('Failed to fetch google data:', response.status);
        return null;
      }
    } catch (error) {
      console.error('Error fetching google data:', error);
      return null;
    }
  };

  const getNormalAccount = async () => {
    try {
      const storedTokenAccount = localStorage.getItem('token');
      if (!storedTokenAccount) {
        console.log('Token not found in localStorage');
        return null;
      }

      const decode = jose.decodeJwt(storedTokenAccount);
      if (!decode) {
        console.log('Decoding JWT returned undefined');
        return null;
      }

      return decode;
    } catch (error) {
      console.log('Error decoding JWT Token', error);
      return null;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const googleData = await getGoogleInfo();
      const normalAccountData = await getNormalAccount();

      setAccounts({
        googleAccount: googleData,
        normalAccount: normalAccountData,
      });

      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoutes />}>
          <Route
            path="/dashboard"
            element={<Dashboard normalAccount={accounts.normalAccount} googleAccount={accounts.googleAccount} />}
          />
          <Route
            path="/document"
            element={<Document normalAccount={accounts.normalAccount} googleAccount={accounts.googleAccount} />}
          />
          <Route
            path="/viewDocument/:No"
            element={<ViewDocument normalAccount={accounts.normalAccount} googleAccount={accounts.googleAccount} />}
          />
          <Route
            path="/notification"
            element={<Notification normalAccount={accounts.normalAccount} googleAccount={accounts.googleAccount} />}
          />
          <Route
            path="/profile"
            element={<Profile normalAccount={accounts.normalAccount} googleAccount={accounts.googleAccount} />}
          />
          <Route path="/forbidden" element={<Forbidden />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;