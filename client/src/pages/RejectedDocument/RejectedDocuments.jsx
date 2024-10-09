/* eslint-disable react/prop-types */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/no-unescaped-entities */
import './RejectedDocuments.css';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import logo from '../../assets/logo/logo.png';
import { API_URL } from '../../config.js';
import axios from 'axios';
import 'react-toastify/dist/ReactToastify.css';
import DOMPurify from 'dompurify';

const RejectedDocuments = ({ normalAccount, googleAccount }) => {
  document.title = 'Reject Document';

  const [searchQuery, setSearchQuery] = useState('');
  const [allDocuments, setAllDocuments] = useState([]);
  const [filterDocuments, setFilterDocuments] = useState([]);

  const getAllDocuments = async () => {
    try {
      const response = await axios.get(`${API_URL}/documents`);
      setAllDocuments(response.data);
    } catch (error) {
      console.log('Error fetching rejected docouments', error);
    }
  };

  const getAllRejectedDocuments = async () => {
    try {
      const response = await axios.get(`${API_URL}/rejected-documents`);
      setFilterDocuments(response.data);
    } catch (error) {
      console.log('Error fetching rejected docouments', error);
    }
  }

  useEffect(() => {
    getAllDocuments();
    getAllRejectedDocuments();
  }, [])

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
    if (role && role !== 'Admin' && role !== 'System') {
      navigate('/forbidden');
    } else {
      console.log('Role:', role || 'not defined yet');
    }
  }, [role, navigate]);

  // -- END

  //Toggle Sidebar
  const [activeMenuItem, setActiveMenuItem] = useState(0);

  const handleMenuItemClick = (index) => {
    setActiveMenuItem(index);
  };

  const handleToggleSidebar = () => {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('hide');
  };

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

  // Helper functions to update document status
  const [pendingCount, setPendingCount] = useState(0);

  const isPending = async (documentId, document) => {
      if (document.status !== 'Rejected' && Object.values(document).some(field => field === '' || field === null)) {
          return true;
      }
      return false;
  };
  // Main document checker
  const documentChecker = async () => {
    console.log('Starting document check...');

    const pendingDocuments = await Promise.all(
        allDocuments.map(async (doc) => {
            if (doc.No) return isPending(doc.No, doc);
        })
    );

    // Update counts
    const pendingCount = pendingDocuments.filter(Boolean).length;
    console.log('Pending count:', pendingCount);
    setPendingCount(pendingCount);
  };

  // Trigger the document check on load or document updates
  useEffect(() => {
    documentChecker();
}, [allDocuments]);

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    filterDocumentsList(searchQuery);
  };

  const handleSearchChange = (event) => {
    const query = event.target.value;
    const sanitizedQuery = DOMPurify.sanitize(query)
    setSearchQuery(sanitizedQuery);
    filterDocumentsList(query);
  };

  const filterDocumentsList = (query) => {
    if (query.trim() === '') {
      setFilterDocuments(filterDocuments); // Reset to original documents if searchQuery is empty
    } else {
      setFilterDocuments(
        filterDocuments.filter((doc) =>
          doc.No.toLowerCase().includes(query.toLowerCase())
        )
      );
    }
  };

  // Status Cchecker

  const getStatusChecker = (dateCreated) => {
    if (!dateCreated) return '';
  
    const createdDate = new Date(dateCreated);
    const today = new Date();
    const diffTime = today - createdDate; // Swap to get positive diff
    const diffMonths = diffTime / (1000 * 60 * 60 * 24 * 30);
    if (diffMonths < 2) {
      return 'status-green'; // Within 1-2 months
    } else if (diffMonths < 5) {
      return 'status-yellow'; // Within 4-5 months
    } else {
      return 'status-red'; // More than 5 months
    }
  };
  

  return (
    <>
      {/* SIDEBAR */}
      <section id="sidebar">
        <Link to="https://e-tesda.gov.ph/">
          <a href="https://e-tesda.gov.ph/" className="brand">
            <div className="logo">
              <img src={logo} width={35} height={35} />
            </div>
            <div className="text-logo">
              <span className="text">TESDA</span>
            </div>
          </a>
        </Link>
        <ul className="side-menu top">
          <Link to="/dashboard">
            <li className={activeMenuItem === 1 ? 'active' : ''}>
              <a href="#" onClick={() => handleMenuItemClick(0)}>
                <i className="bx bx-category"></i>
                <span className="text">Dasboard</span>
              </a>
            </li>
          </Link>
          <Link to="/document">
            <li className={activeMenuItem === 1 ? 'active' : ''}>
              <a href="#" onClick={() => handleMenuItemClick(0)}>
                <i className="bx bx-file"></i>
                <span className="text">Documents</span>
              </a>
            </li>
          </Link>
          <Link to="/registry">
            <li className={activeMenuItem === 1 ? 'active' : ''}>
              <a href="#" onClick={() => handleMenuItemClick(0)}>
                <i className="bx bx-registered"></i>
                <span className="text">Registry</span>
              </a>
            </li>
          </Link>
          <Link to="/rejected-docs">
            <li className={activeMenuItem === 1 ? 'active' : ''}>
              <a href="#" onClick={() => handleMenuItemClick(0)}>
                <i className="bx bx-task-x"></i>
                <span className="text">Rejected</span>
              </a>
            </li>
          </Link>
          <Link to="/register">
            <li className={activeMenuItem === 1 ? 'active' : ''}>
              <a href="#" onClick={() => handleMenuItemClick(0)}>
                <i className="bx bx-user"></i>
                <span className="text">Add Employees</span>
              </a>
            </li>
          </Link>
        </ul>
      </section>
      {/* SIDEBAR */}

      <section id="content">
        {/* NAVBAR */}
        <nav>
          <i className="bx bx-menu" onClick={handleToggleSidebar}></i>
          <form
            className="form-submit-query"
            action="#"
            onSubmit={handleSearchSubmit}
          >
            <div className="form-input">
              <input
                type="search"
                placeholder="Search document..."
                value={searchQuery}
                onChange={handleSearchChange}
              />
              <button type="submit" className="search-btn">
                <i className="bx bx-search"></i>
              </button>
            </div>
          </form>
          <Link to="/notification">
            <div className="notification-container">
              <i className="bx bx-bell"></i>
              {pendingCount > 0 && (
                <span className="notification-count">{pendingCount}</span>
              )}
            </div>
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

        {/* MAIN */}
        <main>
          <div className="document-section">
            <div className="display-status-document">
              <h1>Rejected Document Table</h1>
              <div className='display-container-document'>
                <div className="green-date">
                  <p>1-2 Months</p>
                </div>
                <div className="yellow-date">
                  <p>2-5 Months</p>
                </div>
                <div className="red-date">
                  <p>5+ Months</p>
                </div>
              </div>
            </div>
            <hr className="document-break-line" />
            <div className="document-table">
              <table>
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Date Received</th>
                    <th>Document Type</th>
                    <th>Document Origin</th>
                    <th>Control No</th>
                    <th>Document Title</th>
                    <th>Date Created</th>
                    <th>Date Deadline</th>
                    <th>RD's Instruction</th>
                    <th>Person Concern</th>
                    <th>Action Taken</th>
                    <th>Date Completed</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filterDocuments.length > 0 ? (
                    filterDocuments.map((document, index) => (
                      <tr key={index} className={getStatusChecker(document.dateCreated)}>
                        <td>{document.No}</td>
                        <td>{formatDate(document.dateReceived)}</td>
                        <td>{document.documentType}</td>
                        <td>{document.documentOrigin}</td>
                        <td>{document.controlNo}</td>
                        <td>{document.documentTitle}</td>
                        <td>{formatDate(document.dateCreated)}</td>
                        <td>{formatDate(document.dateDeadline)}</td>
                        <td>{document.rdInstruction}</td>
                        <td>{document.personConcern}</td>
                        <td>{document.actionTaken}</td>
                        <td>{formatDate(document.dateCompleted)}</td>
                        <td>{document.status}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="9">No Rejected Documents found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
        {/* MAIN */}
      </section>
    </>
  );
};

export default RejectedDocuments;
