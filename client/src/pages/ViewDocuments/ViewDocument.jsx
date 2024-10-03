/* eslint-disable react/prop-types */
/* eslint-disable react/no-unescaped-entities */
import './ViewDocument.css';
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API_URL } from '../../config.js';
import axios from 'axios';
import 'react-toastify/dist/ReactToastify.css';

const ViewDocument = ({ normalAccount, googleAccount }) => {
  document.title = 'View Document';

  const { No } = useParams();

  useEffect(() => {
    const currentUrl = window.location.href;
    console.log(`Here is the current URL: ${currentUrl}`);
    console.log(`Here is the current URL parameter: ${No}`);
  }, []);

  const [documents, setDocuments] = useState([]);

  const getDocumentById = async (DocNo) => {
    try {
      const DocNo = No;
      const response = await axios.get(`${API_URL}/documents/${DocNo}`);
      console.log('ID: ' + DocNo);
      console.log('Document Info: ', response.data);
      setDocuments(response.data);
    } catch (error) {
      console.log('Error fetching document ID ' + DocNo);
    }
  };

  useEffect(() => {
    getDocumentById();
  }, []);

  // Navigation = state
  const navigate = useNavigate();
  // -- END

  // Fetch data from json webtoken local storage = state
  const [role, setRole] = useState(null);
  const [loggedInAccount, setLoggedInAccount] = useState(null);
  // -- END

  // Fetch data from json webtoken local storage = function

  useEffect(() => {
    const getUsernameForData = async () => {
      if (!normalAccount || !normalAccount.email) {
        console.error('Normal account or email is not defined');
        return;
      }

      const normalAccount_email = normalAccount.email;
      console.log('User email:', normalAccount_email);

      try {
        const response = await axios.get(
          `${API_URL}/account/${normalAccount_email}`
        );
        setLoggedInAccount(response.data);
        console.log('here is the account details', loggedInAccount);
        const createdBy = response.data.createdBy;
        setRole(createdBy);
        console.log('Role:', createdBy);
      } catch (error) {
        if (error.response) {
          console.error('Error response:', error.response);
        } else if (error.request) {
          console.error('Error request:', error.request);
        } else {
          console.error('Error message:', error.message);
        }
      }
    };

    getUsernameForData();
  }, [normalAccount]);

  // -- END

  // Role

  useEffect(() => {
    if (role && role !== 'Admin') {
      navigate('/forbidden');
    } else {
      console.log('Role:', role || 'not defined yet');
    }
  }, [role, navigate]);

  // -- END

  // Toogle Profile Dropdown

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    window.addEventListener('click', handleClickOutside);
    return () => {
      window.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const handleClickOutside = (event) => {
    if (!event.target.closest('.profile-name')) {
      setIsDropdownOpen(false);
    }
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // -- END

  // Logout

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.setItem('loggedIn', false);
    localStorage.setItem('role', 'guest');
    window.open(`${API_URL}/auth/logout`, '_self');
    navigate('/');
  };

  // -- END

  // Function to format a timestamp into a readable date string
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const options = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    };
    return date.toLocaleDateString('en-US', options);
  };

  // -- END

  return (
    <>
      <section id="view-document-content">
        {/* NAVBAR */}
        <nav>
          <Link to="/document">
            <h1>
              <i className="bx bx-arrow-back"></i> Go back
            </h1>
          </Link>
          <div className="container-logut-drop-down" onClick={toggleDropdown}>
            <div className="profile-name">
              <div className="profile-content-icon">
                {googleAccount &&
                googleAccount.profile &&
                googleAccount.profile.photos &&
                googleAccount.profile.photos.length > 0 ? (
                  <img
                    src={googleAccount.profile.photos[0].value}
                    width={35}
                    height={35}
                  />
                ) : (
                  <i id="icon" className="bx bx-user"></i>
                )}
              </div>
              <div className="profile-content-name">
                {loggedInAccount?.account_username ||
                  googleAccount?.profile?.displayName ||
                  ''}
              </div>
              <div className="profile-content-drop-down-menu">
                <i
                  className={`bx bx-chevron-down ${
                    isDropdownOpen ? 'rotate' : ''
                  }`}
                ></i>{' '}
              </div>
            </div>
            {isDropdownOpen && (
              <div className="dropdown-content">
                <Link to={'/profile'}>
                  <i className="bx bx-user"></i>Profile
                </Link>
                <Link to={'/'} onClick={handleLogout}>
                  <i className="bx bx-log-out"></i>Logout
                </Link>
              </div>
            )}
          </div>
        </nav>
        {/* NAVBAR */}
        <main>
        <div className="document-view">
  <div className="document-header">
    <h2>Document Details</h2>
  </div>
  <div className="document-content">
    <div className="document-section">
      <h3>Title of Documents:</h3>
      <p>{documents.No}</p>
    </div>
    <div className="document-section">
      <h3>RD's Instruction:</h3>
      <p>{documents.rdInstruction}</p>
    </div>
    <div className="document-section">
      <h3>Document Date Created:</h3>
      <p>{formatDate(documents.dateCreated)}</p>
    </div>
    <div className="document-section">
      <h3>Origin of Document:</h3>
      <p>{documents.documentOrigin}</p>
    </div>
    <div className="document-section">
      <h3>Control No:</h3>
      <p>{documents.controlNo}</p>
    </div>
    <div className="document-section">
      <h3>Document Date Received:</h3>
      <p>{formatDate(documents.dateReceived)}</p>
    </div>
    <div className="document-section">
      <h3>Type of Documents:</h3>
      <p>{documents.documentType}</p>
    </div>
    <div className="document-section">
      <h3>Person Concern:</h3>
      <p>{documents.personConcern}</p>
    </div>
    <div className="document-section">
      <h3>Deadline / Action / Effectivity Date:</h3>
      <p>{documents.dateDeadline}</p>
    </div>
    <div className="document-section">
      <h3>Date Completed:</h3>
      <p>{formatDate(documents.dateCompleted)}</p>
    </div>
    <div className="document-section">
      <h3>Action Taken:</h3>
      <div className="document-action-taken">
        <p>{documents.actionTaken}</p>
      </div>
    </div>
  </div>
</div>

        </main>
      </section>
    </>
  );
};

export default ViewDocument;
