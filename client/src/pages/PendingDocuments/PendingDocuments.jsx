/* eslint-disable react/prop-types */
import './PendingDocuments.css';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { API_URL } from '../../config.js';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../../assets/logo/logo.png';
import DOMPurify from 'dompurify';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const PendingDocuments = ({ normalAccount, googleAccount }) => {
  document.title = 'Incoming Pending Document';
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
  console.log('Office ID: ', officeId);

  useEffect(() => {
    const fetchPendingDocuments = async () => {
      const response = await axios.get(
        `${API_URL}/recipients/pending?officeId=${officeId}`
      );
      console.log('Pending Document:', response.data);
      setDocuments(response.data);
    };
    fetchPendingDocuments();
  }, [officeId]);

  const [modalSend, setModalSend] = useState(false);
  const [currentDocId, setCurrentDocId] = useState('');

  const closeModal = () => {
    setModalSend(false);
    setCurrentDocId(null);
    setRecipient([]);
    setAction('');
    setRemarks('');
  };

  const toggleModalSend = (id) => {
    setCurrentDocId(id);
    setModalSend(!modalSend);
  };

  const [recipient, setRecipient] = useState([]);
  const [action, setAction] = useState('');
  const [remarks, setRemarks] = useState('');

  const handleRecipientChange = (event) => {
    const selectedOptions = Array.from(
      event.target.selectedOptions,
      (option) => option.value
    );
    setRecipient(selectedOptions);
  };

  const [offices, setOffices] = useState([]);

  const getAllOffice = async () => {
    try {
      const response = await axios.get(`${API_URL}/accounts/offices`);
      setOffices(response.data);
    } catch (error) {
      console.log('Error fetching offices', error);
    }
  };

  useEffect(() => {
    getAllOffice();
  }, []);

  // handle forward
  const handleForward = async (e) => {
    e.preventDefault();

    if (!recipient || !action || !remarks) {
      toast.warning('Please fill the empty fields');
    }

    console.log('Recipient Data Array: ', recipient);
    console.log('Action: ', action);
    console.log('Remark: ', remarks);

    const uniqueRecipients = [
      ...new Set(recipient.map((id) => parseInt(id, 10))),
    ];

    const payload = {
      recipient: uniqueRecipients,
      action,
      remarks,
    };

    try {
      const userName =
        normalAccount?.username || googleAccount.profile.emails[0].value;
      const fullName = normalAccount.fullname || null;

      const response = await axios.post(
        `${API_URL}/recipients/${currentDocId}/forward`,
        payload
      );
      if (response.status !== 200) {
        toast.error('Error forwarding document, try again');
        return;
      }
      // Create Audit Log
      const auditLogData = {
        userName,
        fullName,
        action: `Forwarded document types by username ${userName}`,
      };

      await axios.post(`${API_URL}/audit-logs`, auditLogData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      toast.success('Document forwarded successfully');
      closeModal();
    } catch (error) {
      console.error('Error forwarding document:', error);
      toast.error('Error forwarding document');
    }
  };

  // handle archive
  const handleArchive = async (id) => {
    try {
      const userName =
        normalAccount?.username || googleAccount.profile.emails[0].value;
      const fullName = normalAccount.fullname || null;
      await axios.put(`${API_URL}/recipients/${id}/archive`);
      // Create Audit Log
      const auditLogData = {
        userName,
        fullName,
        action: `Archived document types by username ${userName}`,
      };

      await axios.post(`${API_URL}/audit-logs`, auditLogData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      setDocuments((docs) => docs.filter((doc) => doc.id !== id));
      toast.success(
        'Document successfully archived, status set to "Archived".',
        toastConfig
      );
    } catch (error) {
      toast.error(
        `Error archiving document: ${
          error.response?.data?.message || error.message
        }`,
        toastConfig
      );
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
                    <span className="text">Documents</span>
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
                    <span className="text">Archived</span>
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
              <Link to="/outbox">
                <li className={activeMenuItem === 1 ? 'active' : ''}>
                  <a href="#" onClick={() => handleMenuItemClick(0)}>
                    <i className="bx bx-box"></i>
                    <span className="text">Outbox</span>
                  </a>
                </li>
              </Link>
              <Link to="/archive-documents">
                <li className={activeMenuItem === 1 ? 'active' : ''}>
                  <a href="#" onClick={() => handleMenuItemClick(0)}>
                    <i className="bx bx-archive"></i>
                    <span className="text">Archived</span>
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
            <h1>Pending Documents</h1>
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
                            className="btn-forward"
                            onClick={() => toggleModalSend(doc.id)}
                          >
                            Forward
                          </button>
                          <button
                            className="btn-archive"
                            onClick={() => handleArchive(doc.id)}
                          >
                            Archive
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
                        No pending documents
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
                  <iframe
                      src={viewDocs.url}
                      title={viewDocs.title}
                      width={500}
                      height={500}
                      style={{ border: 'none' }}
                    >
                  </iframe>
                  <p>
                    <span>Source:</span> {viewDocs.source}
                  </p>
                  <p>
                    <span>Origin:</span> {viewDocs.origin}
                  </p>
                  <p>
                    <span>Type:</span> {viewDocs.type}
                  </p>
                  <p>
                    <span>Rd Instruction:</span> {viewDocs.rdInstruction}
                  </p>
                  <p>
                    <span>Control No:</span> {viewDocs.controlNo}
                  </p>
                  <p>
                    <span>Person Concern:</span> {viewDocs.personConcern}
                  </p>
                  <p>
                    <span>Date Created:</span> {viewDocs.dateCreated}
                  </p>
                  <p>
                    <span>Date Received:</span> {viewDocs.dateReceived}
                  </p>
                  <p>
                    <span>Date Completed:</span> {viewDocs.dateCompleted}
                  </p>
                  <p>
                    <span>Mode:</span> {viewDocs.mode}
                  </p>
                  <p>
                    <span>Status: {viewDocs.status}</span>
                  </p>
                  <textarea disabled value={viewDocs.description}></textarea>
                </div>
              </div>
            </div>
          </>
        )}
        {modalSend && (
          <>
            <div className="modal">
              <div onClick={() => toggleModalSend()} className="overlay"></div>
              <div className="modal-document">
                <h1>Send Documents</h1>
                <form className="form" onSubmit={handleForward}>
                  <select
                    name="recipient"
                    id="recipient"
                    value={recipient}
                    onChange={handleRecipientChange}
                    required
                    multiple
                  >
                    <option disabled value="">
                      Select Recipient
                    </option>
                    {offices && offices.length > 0 ? (
                      offices.map((office, index) => (
                        <option
                          key={index}
                          value={office.account_username}
                          disabled={office.account_username === officeId}
                        >
                          {' ( ' +
                            office.account_username +
                            ' ) ' +
                            office.account_firstName +
                            ' ' +
                            office.account_lastName}
                        </option>
                      ))
                    ) : (
                      <option disabled>No recipient found</option>
                    )}
                  </select>
                  <select
                    type="text"
                    name="action"
                    placeholder="Action"
                    value={action}
                    onChange={(e) => setAction(e.target.value)}
                    required
                  >
                    <option disabled value="">
                      Select Action
                    </option>
                    <option value="For approval/signature">
                      For approval/signature
                    </option>
                    <option value="For comments">For comments</option>
                    <option value="For filing/archiving">
                      For filing/archiving
                    </option>
                    <option value="For appropriate action">
                      For appropriate action
                    </option>
                    <option value="For information">For information</option>
                  </select>
                  <input
                    type="text"
                    name="remarks"
                    placeholder="Remarks"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    required
                  />
                  <button className="pending-doc-btn-send" type="submit">
                    Send
                  </button>
                </form>
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

export default PendingDocuments;
