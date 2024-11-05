import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import * as jose from 'jose';

// Pages
import ProtectedRoutes from './utils/ProtectedRoutes.jsx';
import Dashboard from './pages/Dashboard/Dashboard.jsx';
import Document from './pages/Document/Document.jsx';
import Notification from './pages/Notification/Notification.jsx';
import ViewDocument from './pages/ViewDocuments/ViewDocument.jsx';
import Profile from './pages/Profile/Profile.jsx';
import RejectedDocuments from './pages/RejectedDocument/RejectedDocuments.jsx';
import Registry from './pages/Registry/Registry.jsx';
import Office from './pages/Office/Office.jsx';
import Account from './pages/Account/Account.jsx';
import DocumentTypes from './pages/DocumentTypes/DocumentTypes.jsx';
import RecordDocument from './pages/RecordDocument/RecordDocument.jsx';
import IncomingDocuments from './pages/IncomingDocuments/IncomingDocuments.jsx';
import PendingDocuments from './pages/PendingDocuments/PendingDocuments.jsx';
import ArchiveDocs from './pages/ArchiveDocs/ArchiveDocs.jsx';
import OutboxDocs from './pages/OutboxDocs/OutboxDocs.jsx';

// Auth Pages
import Login from './pages/Login/Login.jsx';
import Register from './pages/Register/Register.jsx';

// Error Pages
import NotFound from './pages/NotFound/NotFound.jsx';
import Forbidden from './pages/Unauthorize/Forbidden.jsx';

import { API_URL } from './config.js';

function AppRoutes() {
  const [accounts, setAccounts] = useState({
    normalAccount: null,
    googleAccount: null,
  });
  const [loading, setLoading] = useState(true);

  async function getGoogleInfo() {
    try {
      const response = await fetch(`${API_URL}/auth/login/success`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 200) {
        console.log(
          'A data of the google has been authorized fetch',
          response.status
        );
        const data = await response.json();
        return data.user;
      }
      if (response.status === 401) {
        console.log('Unauthorized Data fetch yet', response.status);
      } else {
        console.error('Failed to fetch google data:', response.status);
        return null;
      }
    } catch (error) {
      console.error('Error fetching google data:', error);
      return null;
    }
  }

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

        {/* Protected Routes */}
        <Route element={<ProtectedRoutes />}>
          <Route
            path="/register"
            element={
              <Register
                normalAccount={accounts.normalAccount}
                googleAccount={accounts.googleAccount}
              />
            }
          />
          <Route
            path="/dashboard"
            element={
              <Dashboard
                normalAccount={accounts.normalAccount}
                googleAccount={accounts.googleAccount}
              />
            }
          />
          <Route
            path="/account"
            element={
              <Account
                normalAccount={accounts.normalAccount}
                googleAccount={accounts.googleAccount}
              />
            }
          />
          <Route
            path="/offices"
            element={
              <Office
                normalAccount={accounts.normalAccount}
                googleAccount={accounts.googleAccount}
              />
            }
          />
          <Route
            path="/incoming-documents"
            element={
              <IncomingDocuments
                normalAccount={accounts.normalAccount}
                googleAccount={accounts.googleAccount}
              />
            }
          />
          <Route
            path="/incoming-documents/pending"
            element={
              <PendingDocuments
                normalAccount={accounts.normalAccount}
                googleAccount={accounts.googleAccount}
              />
            }
          />
          <Route
            path="/outbox"
            element={
              <OutboxDocs
                normalAccount={accounts.normalAccount}
                googleAccount={accounts.googleAccount}
              />
            }
          />
          <Route
            path="/archive-documents"
            element={
              <ArchiveDocs
                normalAccount={accounts.normalAccount}
                googleAccount={accounts.googleAccount}
              />
            }
          />
          <Route
            path="/document-types"
            element={
              <DocumentTypes
                normalAccount={accounts.normalAccount}
                googleAccount={accounts.googleAccount}
              />
            }
          />
          <Route
            path="/record-documents"
            element={
              <RecordDocument
                normalAccount={accounts.normalAccount}
                googleAccount={accounts.googleAccount}
              />
            }
          />
          <Route
            path="/document"
            element={
              <Document
                normalAccount={accounts.normalAccount}
                googleAccount={accounts.googleAccount}
              />
            }
          />
          <Route
            path="/registry"
            element={
              <Registry
                normalAccount={accounts.normalAccount}
                googleAccount={accounts.googleAccount}
              />
            }
          />
          <Route
            path="/rejected-docs"
            element={
              <RejectedDocuments
                normalAccount={accounts.normalAccount}
                googleAccount={accounts.googleAccount}
              />
            }
          />
          <Route
            path="/viewDocument/:No"
            element={
              <ViewDocument
                normalAccount={accounts.normalAccount}
                googleAccount={accounts.googleAccount}
              />
            }
          />
          <Route
            path="/notification"
            element={
              <Notification
                normalAccount={accounts.normalAccount}
                googleAccount={accounts.googleAccount}
              />
            }
          />
          <Route
            path="/profile"
            element={
              <Profile
                normalAccount={accounts.normalAccount}
                googleAccount={accounts.googleAccount}
              />
            }
          />
          <Route path="/forbidden" element={<Forbidden />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
