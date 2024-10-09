/* eslint-disable react/prop-types */
/* eslint-disable react-hooks/exhaustive-deps */
import './Dashboard.css';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import logo from '../../assets/logo/logo.png';
import { API_URL } from '../../config.js';
import axios from 'axios';

const Dashboard = ({ normalAccount, googleAccount }) => {
  document.title = 'Dashboard';

  // Navigation = state
  const navigate = useNavigate();
  // -- END

  console.log('here is a passed data from app routes', googleAccount);
  console.log('here is a passed normal data from app routes', normalAccount);

  // Fetch data from json webtoken local storage = state
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
  }, []);

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

  const [documents, setDocuments] = useState([]);
  const [completedCount, setCompletedCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [rejectedCount, setRejectedCount] = useState(0);

  // Fetch all documents
  const getAllDocuments = async () => {
    try {
      const response = await axios.get(`${API_URL}/documents`);
      setDocuments(response.data);
    } catch (error) {
      console.error('Error fetching documents', error);
    }
  };

  // Check if a document is completed based on all fields being non-empty
  const isCompleted = (document) => {
    return Object.values(document).every(
      (field) => field !== '' && field !== null
    );
  };

  // Check if a document is pending based on any field being empty
  const isPending = (document) => {
      return Object.values(document).some((field) => 
          document.status !== 'Rejected' && (field === '' || field === null)
      );
  };

  const pendingDocuments = documents.filter(isPending);

  // Check if a document is rejected based on your criteria
  const isRejected = (document) => {
    return document.status === 'Rejected';
  };

  // Count completed, pending, and rejected documents
  const documentChecker = () => {
    const completed = documents.filter(isCompleted).length;
    const pending = documents.filter(isPending).length;
    const rejected = documents.filter(isRejected).length;
    setCompletedCount(completed);
    setPendingCount(pending);
    setRejectedCount(rejected);
  };

  useEffect(() => {
    getAllDocuments();
    getAuditLogs();
  }, []);

  useEffect(() => {
    documentChecker();
  }, [documents]);

  const [auditLogs, setAuditLogs] = useState([]);

  const getAuditLogs = async () => {
    try {
      const response = await axios.get(`${API_URL}/audit-logs`);
      setAuditLogs(response.data);
    } catch (error) {
      console.error('Error fetching audit logs', error);
    }
  };

  // Function to format a timestamp into a readable date string
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const options = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    return date.toLocaleDateString('en-US', options);
  };

  const userLoginRole = (normalAccount?.role == 'Admin') ? 'Administrator' : 'Employee'; 

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
          <form action="#">
            <div className="form-input">
              
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
          {/* Overview Section */}
          <div className='welcome-msg'>
            <h1>Hello, {userLoginRole} </h1>
          </div>
          <div className="overview-section">
            <div className="completed-task">
              <div className="icon-completed-task">
                <i className="bx bx-task"></i>
              </div>
              <div className="text-completed-task">
                <h1>Completed Task</h1>
                <h2>{completedCount}</h2>
              </div>
            </div>
            <div className="pending-task">
              <div className="icon-pending-task">
                <i className="bx bx-loader-circle"></i>
              </div>
              <div className="text-pending-task">
                <h1>Pending Task</h1>
                <h2>{pendingCount}</h2>
              </div>
            </div>
            <div className="rejected-task">
              <div className="icon-rejected-task">
                <i className="bx bxs-left-arrow-circle"></i>
              </div>
              <div className="text-rejected-task">
                <h1>Rejected Task</h1>
                <h2>{rejectedCount}</h2>
              </div>
            </div>
          </div>
          {/* Overview Section */}
          <div className="features-section">
            <div className="audit-section">
              <h2>Accounts Logs</h2>
              <table>
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Full Name</th>
                    <th>Action</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.length > 0 ? (
                    auditLogs.map((log) => (
                      <tr key={log.id}>
                        <td>{log.userName}</td>
                        <td>{log.fullName}</td>
                        <td>{log.action}</td>
                        <td>{formatDate(log.timestamp)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3">No Audit logs available</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="reminder-section">
              <div className="reminders">
                <div className="header">
                  <h2>Reminders</h2>
                </div>
                {pendingDocuments.length > 0 ? (
                  <div className="card-list">
                    {pendingDocuments.map((doc) => (
                      <div key={doc.id} className="task_list">
                        <li className="uncomplete">
                          <div className="task_title">
                            <div className="text-list">
                              <h3 className="card-No">No: {doc.No}</h3>
                              <br />
                              <p className="card-title">
                                Title:{' '}
                                {doc.documentTitle ? doc.documentTitle : 'N/A'}
                              </p>
                            </div>
                          </div>
                        </li>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>No pending tasks.</p>
                )}
              </div>
            </div>
          </div>
        </main>
        {/* MAIN */}
      </section>
    </>
  );
};

export default Dashboard;
