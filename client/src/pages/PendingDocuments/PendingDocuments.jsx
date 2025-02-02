/* eslint-disable react-hooks/exhaustive-deps */
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

const PendingDocuments = ({ normalAccount }) => {
  document.title = 'Pending Document';
  const [documents, setDocuments] = useState([]);
  const [role, setRole] = useState(null);
  const [loggedInAccount, setLoggedInAccount] = useState(null);
  const [activeMenuItem, setActiveMenuItem] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSideDropDownOpen, setSideDropDownOpen] = useState(false);

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');

  const loadImage = (e) => {
    const image = e.target.files[0];
    if (image) {
      setFile(image);
      const previewUrl = URL.createObjectURL(image);
      setPreview(previewUrl);
    }  else {
      console.error('No file selected');
    }
  };

  const handleDropdownSidebar = () => {
    setSideDropDownOpen(!isSideDropDownOpen);
  };

  const navigate = useNavigate();

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
        setLoggedInAccount(response.data);
        setRole(response.data.createdBy);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    getUsernameForData();
  }, [normalAccount]);

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

  useEffect(() => {
    if (role && role !== 'Admin' && role !== 'System') {
      navigate('/forbidden');
    }
  }, [role, navigate]);

  const officeId = normalAccount.origin;

  const fetchPendingDocuments = async () => {
    const response = await axios.get(
      `${API_URL}/recipients/pending?officeId=${officeId}`
    );
    setDocuments(response.data);
  };

  useEffect(() => {
    fetchPendingDocuments();
  }, [officeId]);

  const [modalSend, setModalSend] = useState(false);
  const [currentDocId, setCurrentDocId] = useState('');
  const [recipientId, setRecipientId] = useState('');

  const closeModal = () => {
    setModalSend(false);
    setCurrentDocId(null);
    setRecipient([]);
    setAction('');
    setRemarks('');
    setRecipientId('')
    setFile(null);
    setPreview('');
  };

  const toggleModalSend = (recipientId, documentId) => {
    setRecipientId(recipientId)
    setCurrentDocId(documentId);
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
      const response = await axios.get(`${API_URL}/offices`);
      setOffices(response.data);
    } catch (error) {
      console.error('Error fetching offices', error);
    }
  };

  useEffect(() => {
    getAllOffice();
  }, []);

  const handleForward = async (e) => {
    e.preventDefault();
  
    if (!recipient || recipient.length === 0) {
      toast.warning('Please select a recipient');
      return;
    }
    if (!action) {
      toast.warning('Please select an action');
      return;
    }
    if (!remarks) {
      toast.warning('Please add remarks');
      return;
    }
  
    const userName = normalAccount?.username || '';
    const senderEmail = normalAccount.email;
    const fullName = normalAccount.fullname || null;
    const senderOfficeId = normalAccount.origin;
  
    const formData = new FormData();
    
    const allRecipients = [...recipient, senderOfficeId.toString()];
    
    allRecipients.forEach((recipientId) => {
      formData.append('recipient', recipientId);
    });

    console.log('All Recipient: ', allRecipients);
    formData.append('action', action);
    formData.append('remarks', remarks);
    formData.append('userName', userName);
    formData.append('senderEmail', senderEmail);
    formData.append('recipientDocId', recipientId);
  
    if (file) {
      formData.append('file', file);
    }
  
    try {
      await axios.post(
        `${API_URL}/recipients/${currentDocId}/forward`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
  
      const auditLogData = {
        userName,
        fullName,
        action: `Forwarded document by ID ${userName}`,
      };

      const DocAuditLogData = {
        document_id: currentDocId,
        senderName: fullName,
        receiver: allRecipients,
        action: `ID ${userName} Forward document by forward to offices ${allRecipients}`,
      }

      await axios.post(`${API_URL}/document_audits`, DocAuditLogData, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
  
      await axios.post(`${API_URL}/audit-logs`, auditLogData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      toast.success('Document forwarded successfully');
      setTimeout(() => {
        window.location.reload();
      },  1500);
      closeModal();
    } catch (error) {
      console.error('Error forwarding document:', error);
      
      if (error.response) {
        toast.error(error.response.data.message || 'Error forwarding document');
      } else if (error.request) {
        toast.error('No response received from server');
      } else {
        toast.error('Error preparing document forward request');
      }
    }
  };

  const handleArchive = async (id) => {
    try {
      const userName = normalAccount?.username || '';
      const fullName = normalAccount?.fullname || null;
  
      await axios.put(`${API_URL}/recipients/${id}/archive`);
  
      const auditLogData = {
        userName,
        fullName,
        action: `Archived document with ID ${id}`,
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
      setTimeout(() => {
        window.location.reload();
      },  1500);
    } catch (error) {
      toast.error(
        `Error archiving document: ${
          error.response?.data?.message || error.message || 'Unknown error'
        }`,
        toastConfig
      );
    }
  };

  const handleMenuItemClick = (index) => {
    setActiveMenuItem(index);
  };

  const handleToggleSidebar = () => {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('hide');
  };

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
      fetchPendingDocuments();
    } else {
      const filteredRecordDocs = documents.filter(recdocs =>
          recdocs.document.title.toLowerCase().includes(query.toLowerCase())
      );
      setDocuments(filteredRecordDocs);
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
    localStorage.removeItem('currentOffice');
    navigate('/');
  };

  const [openDocs, setOpenDocs] = useState(false);
  const [viewDocs, setViewDocs] = useState([]);

  const handleToggleOpenDocs = (docID) => {
    setOpenDocs(!openDocs);
    getViewDocs(docID);
  };

  const getViewDocs = async (docID) => {
    try {
      const response = await axios.get(`${API_URL}/record-docs/${docID}`);
      setViewDocs(response.data);
    } catch (error) {
      console.error('Error fetching specific');
    }
  };

  return (
    <>
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
                <Link to="/offices">
                  <li className={activeMenuItem === 1 ? 'active' : ''}>
                    <a href="#" onClick={() => handleMenuItemClick(0)}>
                      <i className="bx bx-buildings"></i>
                      <span className="text">Offices</span>
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
                placeholder="Search for pending docs by title..."
                value={searchQuery}
                onChange={handleSearchChange}
              />
              <button type="submit" className="search-btn">
                <i className="bx bx-search"></i>
              </button>
            </div>
          </form>
          <div className="container-logout-drop-down" onClick={toggleDropdown}>
            <div className="profile-name">
              <div className="profile-content-icon">
                <i id="icon" className="bx bx-user"></i>
              </div>
              <div className="profile-content-name">
                {loggedInAccount?.account_username ||''}
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
        <main>
          <div className="pending-docs-section">
            <h1>Pending Documents</h1>
            <hr className="pending-docs-break-line" />
            <div className="pending-docs-table">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Title</th>
                    <th>Description</th>
                    <th>Source</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Remarks</th>
                    <th>Actions</th>
                    <th>Sender</th>
                    <th>Email</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.length > 0 ? (
                    documents.map((doc) => (
                      <tr key={doc.id}>
                        <td>{doc.id}</td>
                        <td>{doc.document.title}</td>
                        <td>{doc.document.description}</td>
                        <td>{doc.document.source}</td>
                        <td>{doc.document.type}</td>
                        <td>{doc.status}</td>
                        <td>{doc.remarks}</td>
                        <td>{doc.senderName}</td>
                        <td>{doc.senderEmail}</td>
                        <td className="btn-container">
                          <button
                            className="btn-forward"
                            onClick={() => toggleModalSend(doc.id, doc.document.id)}
                          >
                            Forward
                          </button>
                          <button
                            className="btn-archive"
                            onClick={() => handleArchive(doc.document.id)}
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
              <div className="modal-pending">
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
                    <span>Type:</span> {viewDocs.type}
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
              <div className="modal-pending">
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
                        <option key={index} value={office.id}
                          disabled={office.id === officeId}
                        >
                          {office.name}
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
                  <div className="doc-image">
                    <label>Attachment</label>
                    <span>*</span> <br />
                    <input
                      type="file"
                      className="attachment-input"
                      onChange={loadImage}
                      required
                    />
                    <span>Preview</span>
                    {preview && (
                      <div className="image-preview">
                        <embed
                          src={preview}
                          alt="Preview"
                          width={150}
                          height={250}
                          className="preview-image"
                        />
                      </div>
                    )}
                  </div>
                  {/* END */}
                  <button className="pending-doc-btn-send" type="submit">
                    Send
                  </button>
                </form>
              </div>
            </div>
          </>
        )}
      </section>
      <ToastContainer />
    </>
  );
};

export default PendingDocuments;