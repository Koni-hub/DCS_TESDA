import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import * as jose from 'jose';

import ProtectedRoutes from './utils/ProtectedRoutes.jsx';
import Dashboard from './pages/Dashboard/Dashboard.jsx';
import Document from './pages/Document/Document.jsx';
import Profile from './pages/Profile/Profile.jsx';
import Registry from './pages/Registry/Registry.jsx';
import Office from './pages/Office/Office.jsx';
import Account from './pages/Account/Account.jsx';
import DocumentTypes from './pages/DocumentTypes/DocumentTypes.jsx';
import RecordDocument from './pages/RecordDocument/RecordDocument.jsx';
import IncomingDocuments from './pages/IncomingDocuments/IncomingDocuments.jsx';
import PendingDocuments from './pages/PendingDocuments/PendingDocuments.jsx';
import ArchiveDocs from './pages/ArchiveDocs/ArchiveDocs.jsx';
import OutboxDocs from './pages/OutboxDocs/OutboxDocs.jsx';

import Login from './pages/Login/Login.jsx';
import Register from './pages/Register/Register.jsx';

import NotFound from './pages/NotFound/NotFound.jsx';
import Forbidden from './pages/Unauthorize/Forbidden.jsx';
import Inactive from './pages/Inactive/Inactive.jsx';

function AppRoutes() {
  const [accounts, setAccounts] = useState({
    normalAccount: null,
    googleAccount: null,
  });
  const [loading, setLoading] = useState(true);


  const getNormalAccount = async () => {
    try {
      const storedTokenAccount = localStorage.getItem('token');
      if (!storedTokenAccount) {
        console.error('Token not found in localStorage');
        return null;
      }

      const decode = jose.decodeJwt(storedTokenAccount);
      if (!decode) {
        console.error('Decoding JWT returned undefined');
        return null;
      }

      return decode;
    } catch (error) {
      console.error('Error decoding JWT Token', error);
      return null;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const normalAccountData = await getNormalAccount();

      setAccounts({
        normalAccount: normalAccountData,
      });

      setTimeout(() => {
        setLoading(false);
      }, 500)
    };

    fetchData();
  }, []);

  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
    },
    spinner: {
      width: '50px',
      height: '50px',
      border: '5px solid #f3f3f3',
      borderTop: '5px solid #3498db',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
      marginBottom: '20px',
    },
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.spinner}></div>
        <h1>Loading...</h1>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

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
              />
            }
          />
          <Route
            path="/archive-documents"
            element={
              <ArchiveDocs
                normalAccount={accounts.normalAccount}
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
            path="/profile"
            element={
              <Profile
                normalAccount={accounts.normalAccount}
                googleAccount={accounts.googleAccount}
              />
            }
          />
          <Route path="/inactive" element={<Inactive />} />
          <Route path="/forbidden" element={<Forbidden />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;