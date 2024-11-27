/* eslint-disable react/prop-types */
import './IncomingDocuments.css';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { API_URL } from '../../config.js';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../../assets/logo/logo.png';
import DOMPurify from 'dompurify';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2'

const IncomingDocuments = ({ normalAccount, googleAccount }) => {
  document.title = 'Incoming To Receive Documents';
  const [documents, setDocuments] = useState([]);
  const [role, setRole] = useState(null);
  const [loggedInAccount, setLoggedInAccount] = useState(null);
  const [activeMenuItem, setActiveMenuItem] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSideDropDownOpen, setSideDropDownOpen] = useState(false);

  const handleDropdownSidebar = () => {
    setSideDropDownOpen(!isSideDropDownOpen);
  };

  const navigate = useNavigate();

  // User authentication and role management
  useEffect(() => {
    const getUsernameForData = async () => {
      if (!normalAccount?.email) {
        console.error('Normal account or email is not defined');
        return;
      }

      try {
        const response = await axios.get(
          `${API_URL}/account/${normalAccount.email}`
        );
        console.log(normalAccount.username);
        setLoggedInAccount(response.data);
        setRole(response.data.createdBy);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    console.log('Account: ', loggedInAccount);

    getUsernameForData();
  }, [normalAccount]);

  // Toast configuration
  const toastConfig = {
    position: 'top-right',
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: 'light',
  };

  // Role-based access control
  useEffect(() => {
    if (role && role !== 'Admin' && role !== 'System') {
      navigate('/forbidden');
    }
  }, [role, navigate]);

  const officeId = normalAccount.username;

  useEffect(() => {
    const fetchIncomingDocuments = async () => {
      const response = await axios.get(
        `${API_URL}/recipients/incoming?officeId=${officeId}`
      );
      console.log('Incoming Document:', response.data);
      setDocuments(response.data);
    };
    fetchIncomingDocuments();
  }, [officeId]);

  const handleReceive = async (id) => {
    try {
      const userName =
        normalAccount?.username || googleAccount.profile.emails[0].value;
      const fullName = normalAccount.fullname || null;

      await axios.put(`${API_URL}/recipients/${id}/receive`);
      // Create Audit Log
      const auditLogData = {
        userName,
        fullName,
        action: `Received document by username ${userName}`,
      };

      await axios.post(`${API_URL}/audit-logs`, auditLogData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      setDocuments((docs) => docs.filter((doc) => doc.id !== id));
      toast.success(
        'Successfully received documents, document set to pending status',
        toastConfig
      );
    } catch (error) {
      toast.error('Error receiving documents', toastConfig);
    }
  };

  const handleDecline = async (id) => {
    console.log('ID', id);
    try {
      const {value: reason, isConfirmed} = await Swal.fire({
        title: 'Reason for declining',
        input: 'text',
        inputLabel: 'Reason',
        showCancelButton: true,
        inputValidator: (value) => {
          if (!value) {
            return 'You need to write something reasonable!';
          }
        }
      });
      if (!isConfirmed) {
        return; // Do nothing if the user clicks "Cancel"
      }
      const userName =
        normalAccount?.username || googleAccount.profile.emails[0].value;
      const fullName = normalAccount.fullname || null;
      await axios.put(`${API_URL}/recipients/${id}/decline`, reason);  
      // Create Audit Log
      const auditLogData = {
        userName,
        fullName,
        action: `Declined document by username ${userName}`,
      };
      await axios.post(`${API_URL}/audit-logs`, auditLogData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      setDocuments((docs) => docs.filter((doc) => doc.id !== id));
      toast.success(
        'Successfully decline documents, document set to decline status',
        toastConfig
      );
    } catch (error) {
      toast.error('Error declining documents', toastConfig);
    }
  };

  // Event handlers
  const handleMenuItemClick = (index) => {
    setActiveMenuItem(index);
  };

  const handleToggleSidebar = () => {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('hide');
  };

  // Search functionality
  const handleSearchSubmit = (event) => {
    event.preventDefault();
    filterAccountList(searchQuery);
  };

  const handleSearchChange = (event) => {
    const query = DOMPurify.sanitize(event.target.value);
    setSearchQuery(query);
    filterAccountList(query);
  };

  const filterAccountList = (query) => {
    if (!query.trim()) {
      // getAllRecordDocument();
    } else {
      // const filteredRecordDocs = recordDocument.filter(recdocs =>
      //     recdocs.title.toLowerCase().includes(query.toLowerCase())
      // );
      // setRecordDocuments(filteredRecordDocs);
    }
  };

  const userLoginRole =
    normalAccount?.role == 'Admin'
      ? 'Administrator'
      : normalAccount?.role == 'Employee'
      ? 'Employee'
      : normalAccount?.role == 'Office'
      ? 'Office'
      : 'Unknown';

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.setItem('loggedIn', 'false');
    localStorage.setItem('role', 'guest');
    window.open(`${API_URL}/auth/logout`, '_self');
    navigate('/');
  };

  console.log('Document:', documents);

  const [openDocs, setOpenDocs] = useState(false);
  const [viewDocs, setViewDocs] = useState([]);

  const handleToggleOpenDocs = (docID) => {
    console.log('modal ID:', docID);
    setOpenDocs(!openDocs);
    getViewDocs(docID);
  };

  const getViewDocs = async (docID) => {
    try {
      const response = await axios.get(`${API_URL}/record-docs/${docID}`);
      setViewDocs(response.data);
    } catch (error) {
      console.log('Error fetching specific');
    }
  };

  console.log('Response ViewDocs: ', viewDocs);

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
                <i className="bx bx-home"></i>
                <span className="text">Dashboard</span>
              </a>
            </li>
          </Link>
          {userLoginRole === 'Employee' && (
            <>
              <Link to="/record-documents">
                <li className={activeMenuItem === 1 ? 'active' : ''}>
                  <a href="#" onClick={() => handleMenuItemClick(0)}>
                    <i className="bx bx-file"></i>
                    <span className="text">Record Docs</span>
                  </a>
                </li>
              </Link>
              <Link to="/document-types">
                <li className={activeMenuItem === 1 ? 'active' : ''}>
                  <a href="#" onClick={() => handleMenuItemClick(0)}>
                    <i className="bx bx-category"></i>
                    <span className="text">Types</span>
                  </a>
                </li>
              </Link>
              <Link to="/outbox">
                <li className={activeMenuItem === 1 ? 'active' : ''}>
                  <a href="#" onClick={() => handleMenuItemClick(0)}>
                    <i className="bx bx-box"></i>
                    <span className="text">Outbox</span>
                  </a>
                </li>
              </Link>
            </>
          )}
          {userLoginRole === 'Office' && (
            <>
              <li
                onClick={handleDropdownSidebar}
                className={activeMenuItem === 1 ? 'active' : ''}
              >
                <a href="#" onClick={() => handleMenuItemClick(0)}>
                  <i className="bx bx-mail-send"></i>
                  <span className="text">Incoming</span>
                </a>
              </li>
              {isSideDropDownOpen && (
                <div className="custom-dropdown-content">
                  <Link to="/incoming-documents">
                    <li className={activeMenuItem === 2 ? 'custom-active' : ''}>
                      <i className="bx bx-mail-send"></i>
                      <span className="text">Receive</span>
                    </li>
                  </Link>
                  <Link to="/incoming-documents/pending">
                    <li className={activeMenuItem === 3 ? 'custom-active' : ''}>
                      <i className="bx bx-mail-send"></i>
                      <span className="text">Pending</span>
                    </li>
                  </Link>
                </div>
              )}
              <Link to="/archive-documents">
                <li className={activeMenuItem === 1 ? 'active' : ''}>
                  <a href="#" onClick={() => handleMenuItemClick(0)}>
                    <i className="bx bx-archive"></i>
                    <span className="text">Archive</span>
                  </a>
                </li>
              </Link>
            </>
          )}
          {userLoginRole === 'Administrator' && (
            <>
              <Link to="/account">
                <li className={activeMenuItem === 1 ? 'active' : ''}>
                  <a href="#" onClick={() => handleMenuItemClick(0)}>
                    <i className="bx bx-user"></i>
                    <span className="text">Accounts</span>
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
              <Link to="/document">
                <li className={activeMenuItem === 1 ? 'active' : ''}>
                  <a href="#" onClick={() => handleMenuItemClick(0)}>
                    <i className="bx bx-file"></i>
                    <span className="text">Documents</span>
                  </a>
                </li>
              </Link>
              <Link to="/rejected-docs">
                <li className={activeMenuItem === 1 ? 'active' : ''}>
                  <a href="#" onClick={() => handleMenuItemClick(0)}>
                    <i className="bx bx-task-x"></i>
                    <span className="text">Archived</span>
                  </a>
                </li>
              </Link>
                <Link to="/offices">
                  <li className={activeMenuItem === 1 ? 'active' : ''}>
                    <a href="#" onClick={() => handleMenuItemClick(0)}>
                      <i className="bx bx-building-house"></i>
                      <span className="text">Offices</span>
                    </a>
                  </li>
                </Link>
                <Link to="/document-types">
                  <li className={activeMenuItem === 1 ? 'active' : ''}>
                    <a href="#" onClick={() => handleMenuItemClick(0)}>
                      <i className="bx bx-file-blank"></i>
                      <span className="text">Document Types</span>
                    </a>
                  </li>
                </Link>
                <Link to="/record-documents">
                  <li className={activeMenuItem === 1 ? 'active' : ''}>
                    <a href="#" onClick={() => handleMenuItemClick(0)}>
                      <i className="bx bx-file"></i>
                      <span className="text">Documents</span>
                    </a>
                  </li>
                </Link>
            </>
          )}
        </ul>
      </section>
      {/* SIDEBAR */}
      <section id="content">
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
                placeholder="Search for incoming docs..."
                value={searchQuery}
                onChange={handleSearchChange}
              />
              <button type="submit" className="search-btn">
                <i className="bx bx-search"></i>
              </button>
            </div>
          </form>
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
          <div className="incoming-docs-section">
            <h1>Incoming Documents</h1>
            <hr className="incoming-docs-break-line" />
            <div className="incoming-docs-table">
              <table>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Description</th>
                    <th>Source</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Remarks</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.length > 0 ? (
                    documents.map((doc) => (
                      <tr key={doc.id}>
                        <td>{doc.document.title}</td>
                        <td>{doc.document.description}</td>
                        <td>{doc.document.source}</td>
                        <td>{doc.document.type}</td>
                        <td>{doc.status}</td>
                        <td>{doc.remarks}</td>
                        <td className="btn-container">
                          <button
                            className="btn-receive"
                            onClick={() => handleReceive(doc.id)}
                          >
                            Receive
                          </button>
                          <button
                            className="btn-decline"
                            onClick={() => handleDecline(doc.id)}
                          >
                            Decline
                          </button>
                          <button
                            className="btn-view"
                            onClick={() =>
                              handleToggleOpenDocs(doc.document.id)
                            }
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center' }}>
                        No to receive documents
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
        {openDocs && (
          <>
            <div className="modal">
              <div onClick={handleToggleOpenDocs} className="overlay"></div>
              <div className="modal-document">
                <h1>View Document</h1>
                <hr></hr>
                <div className="container">
                  <p>
                    <span>Title: </span>
                    {viewDocs.title}
                  </p>
                  <img
                    src={viewDocs.url}
                    alt={viewDocs.title}
                    width={150}
                    height={250}
                  />
                  <p>
                    <span>Type:</span> {viewDocs.type}
                  </p>
                  <p>
                    <span>Mode:</span> {viewDocs.mode}
                  </p>
                  <p>
                    <span>Source:</span> {viewDocs.source}
                  </p>
                  <textarea disabled value={viewDocs.description}></textarea>
                </div>
              </div>
            </div>
          </>
        )}
        {/* MAIN */}
      </section>
      <ToastContainer />
    </>
  );
};

export default IncomingDocuments;
