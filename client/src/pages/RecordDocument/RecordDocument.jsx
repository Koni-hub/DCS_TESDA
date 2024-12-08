/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */
 
import './RecordDocument.css';
import axios from 'axios';
import { API_URL } from '../../config';
import { useEffect, useState } from 'react';
import logo from '../../assets/logo/logo.png';
import { Link, useNavigate } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { ToastContainer, toast } from 'react-toastify';

const RecordDocument = ({ normalAccount }) => {
  document.title = 'Record Document';

  const [activeMenuItem, setActiveMenuItem] = useState(0);
  const [recordDocument, setRecordDocuments] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalCreate, setModalCreate] = useState(false);
  const [modalUpdate, setModalUpdate] = useState(false);
  const [modalView, setModalView] = useState(false);
  const [role, setRole] = useState(null);
  const [loggedInAccount, setLoggedInAccount] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [offices, setOffices] = useState([]);
  const [isSideDropDownOpen, setSideDropDownOpen] = useState(false);
  const [viewDocs, setViewDocs] = useState([]);
  const [currentOffice, setCurrentOffice] = useState('');

  const handleDropdownSidebar = () => {
    setSideDropDownOpen(!isSideDropDownOpen);
  };

  const navigate = useNavigate();

  const getAllTypes = async () => {
    try {
      const response = await axios.get(`${API_URL}/document-types`);
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching document types', error);
    }
  };

  const getAllOffice = async () => {
    try {
      const response = await axios.get(`${API_URL}/offices`);

      setOffices(response.data);
    } catch (error) {
      console.error('Error fetching offices', error);
    }
  };

    const officeId = normalAccount.origin;
    localStorage.setItem('currentOffice', officeId);

    const getPersistedOffice = () => {
      const savedOffice = localStorage.getItem('currentOffice');
      return savedOffice ? savedOffice : null;
    };

    const checkIfOfficeExists = async (selectedOffice) => {
      console.info('Checking if office exists for ID:', selectedOffice);
      console.info('Offices available:', offices);
      const matchingOffice = offices.find(office => office.id === selectedOffice);
      
      if (matchingOffice) {
        console.info('Office found (ID):', matchingOffice.id);
        localStorage.setItem('currentOffice', matchingOffice.id);
        setCurrentOffice(matchingOffice.id);
      } else {
        console.info('Office not found');
      }
    };

    useEffect(() => {
      const persistedOffice = getPersistedOffice();
      if (persistedOffice) {
        console.info('Persisted office found:', persistedOffice);
        setCurrentOffice(persistedOffice);
      } else {
        const sessionLogOffice = localStorage.getItem('currentOffice');
        checkIfOfficeExists(sessionLogOffice);
      }
    }, []);

    useEffect(() => {
      if (currentOffice) {
        console.info('Fetching documents for office ID:', currentOffice);
        getAllRecordDocument();
      }
    }, [currentOffice]);

    const getAllRecordDocument = async () => {
      try {
        const response = await axios.get(`${API_URL}/document_audits/all/${currentOffice}`);
        setRecordDocuments(response.data);
      } catch (error) {
        console.error('Error fetching record documents', error);
      }
    };

  const loadImage = (e) => {
    const image = e.target.files[0];
    if (image) {
      setFile(image);
      const previewUrl = URL.createObjectURL(image);
      setPreview(previewUrl);
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
      getAllRecordDocument();
    } else {
      const filteredRecordDocs = recordDocument.filter((recdocs) =>
        recdocs.title.toLowerCase().includes(query.toLowerCase())
      );
      setRecordDocuments(filteredRecordDocs);
    }
  };

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

  useEffect(() => {
    if (role && role !== 'Admin' && role !== 'System') {
      navigate('/forbidden');
    }
  }, [role, navigate]);

  useEffect(() => {
    getAllRecordDocument();
    getAllTypes();
    getAllOffice();
  }, []);

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

  const userLoginRole =
    normalAccount?.role == 'Admin'
      ? 'Administrator'
      : normalAccount?.role == 'Employee'
      ? 'Employee'
      : normalAccount?.role == 'Office'
      ? 'Office'
      : 'Unknown';

  const [title, setTitle] = useState('');
  const [source, setSource] = useState('');
  const [type, setType] = useState('');
  const [description, setDescription] = useState('');
  const [mode, setMode] = useState('');
  const [recipient, setRecipient] = useState([]);
  const [action, setAction] = useState('');
  const [remarks, setRemarks] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [record, setRecordId] = useState('');

  const handleRecipientChange = (event) => {
    const selectedOptions = Array.from(
      event.target.selectedOptions,
      (option) => option.value
    );
    setRecipient(selectedOptions);
  };

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

  const saveRecDocument = async (e) => {
    e.preventDefault();
    const userName =
        normalAccount?.username || '';
      const fullName = normalAccount.fullname || null;
      const senderEmail = normalAccount.email;

    const Fields = {
      title,
      source,
      type,
      mode,
      recipient,
      action,
      remarks,
      description,
      userName,
      senderEmail
    };

    const formData = new FormData();
    Object.entries(Fields).forEach(([key, value]) => {
      formData.append(key, value);
    });

    if (file) {
      formData.append('file', file);
    }

    recipient.forEach((recipientId) => {
      formData.append('recipient', recipientId);
    });

    try {
      const response = await axios.post(`${API_URL}/record-docs`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const auditLogData = {
        userName,
        fullName,
        action: `Created document by ID ${userName}`,
      };

      const documentId = response.data.recordDocument.id;

      const DocAuditLogData = {
        document_id: documentId,
        senderName: fullName,
        receiver: recipient,
        action: `Created document by ID ${userName} and forward to offices ${recipient}`,
      }

      await axios.post(`${API_URL}/audit-logs`, auditLogData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      await axios.post(`${API_URL}/document_audits`, DocAuditLogData, {
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.status === 201 || response.status === 200) {
        toast.success('Record Document Created Successfully', toastConfig);
        setTimeout(() => {
          window.location.reload();
        }, 2000);

        await getAllRecordDocument();
        resetFields();
        setModalCreate(false);
      }
    } catch (error) {
      console.error('Error creating record document:', error);
      toast.error(
        error.response?.data?.message || 'Error creating record document',
        toastConfig
      );
    }
  };

  const editRecDocument = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('source', source);
      formData.append('type', type);
      formData.append('mode', mode);
      formData.append('recipient', recipient);
      formData.append('action', action);
      formData.append('remarks', remarks);
      formData.append('description', description);

      if (file) {
        formData.append('file', file);
      }

      const userName =
        normalAccount?.username || '';
      const fullName = normalAccount.fullname || null;

      await axios.patch(`${API_URL}/record-docs/${record}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const auditLogData = {
        userName,
        fullName,
        action: `Updated record document by ID ${userName}`,
      };

      await axios.post(`${API_URL}/audit-logs`, auditLogData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      toast.success('Record Document Updated Successfully', toastConfig);
      resetFields();
      setModalUpdate(false);
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error('Error updating record document:', error);
      toast.error(
        error.response?.data?.message || 'Error updating record document',
        toastConfig
      );
      console.error('Error details:', error.stack);
    }
  };

  const toggleModalCreate = () => {
    resetFields();
    setModalCreate(!modalCreate);
  };

  const resetFields = () => {
    setTitle('');
    setSource('');
    setType('');
    setMode('');
    setRecipient('');
    setAction('');
    setRemarks('');
    setDescription('');
    setPreview('');
    setFile(null);
    setRecordId(null);
  };

  const handleToggleOpenDocsView = (docID) => {
    setModalView(!modalView);
    getViewDocsLog(docID);
  }

  const getViewDocsLog = async (docID) => {
    try {
      const response = await axios.get(`${API_URL}/document_audits/${docID}`);
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
                placeholder="Search document by title..."
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
                {loggedInAccount?.account_username || ''}
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
          <div className="record-docs-section">
            <h1>Document Table</h1>
            <hr className="record-docs-break-line" />
            <Link to="#" onClick={toggleModalCreate}>
              <button className="add-record-docs-btn">
                Add Documents <i className="bx bx-plus"></i>
              </button>
            </Link>
            <div className="record-docs-table">
              <table>
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Title</th>
                    <th>Source</th>
                    <th>Type</th>
                    <th>Mode</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recordDocument.length > 0 ? (
                    recordDocument.map((record_docs, index) => (
                      <tr key={index}>
                        <td>{record_docs.document.No}</td>
                        <td>{record_docs.document.title}</td>
                        <td>{record_docs.document.source}</td>
                        <td>{record_docs.document.type}</td>
                        <td>{record_docs.document.mode}</td>
                        <td>{record_docs.document.description}</td>
                        <td>{record_docs.document.status}</td>
                        <td>
                          <button
                            className="btn-view"
                            onClick={() => handleToggleOpenDocsView(1)}
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5">No record documents found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </section>
      {modalCreate && (
        <div className="modal-office">
          <div className="overlay" onClick={() => setModalCreate(false)}></div>
          <div className="modal-content-office">
            <span className="close" onClick={() => setModalCreate(false)}>
              &times;
            </span>
            <h2>Create Document</h2>
            <form className="form" onSubmit={saveRecDocument}>
              <input
                type="text"
                name="title"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              <select
                name="source"
                id="source"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                required
              >
                <option disabled value="">
                  Select Source
                </option>
                <option value="Internal">Internal</option>
                <option value="External">External</option>
              </select>
              <select
                name="types"
                id="types"
                value={type}
                onChange={(e) => setType(e.target.value)}
                required
              >
                <option disabled value="">
                  Type of document
                </option>
                {categories && categories.length > 0 ? (
                  categories.map((category, index) => (
                    <option key={index} value={category.name}>
                      {category.name}
                    </option>
                  ))
                ) : (
                  <option disabled>No document types found</option>
                )}
              </select>
              <select
                name="mode"
                id="mode"
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                required
              >
                <option disabled value="">
                  Select Mode
                </option>
                <option value="Hard copy">Hard Copy</option>
                <option value="Soft copy">Soft Copy</option>
              </select>
              <select
                name="recipient"
                id="recipient"
                value={recipient}
                onChange={handleRecipientChange}
                required
                multiple
              >
                <option disabled value="">
                  Forward To
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
              <textarea
                className="input"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                cols={70}
                placeholder="Enter the description"
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
                      height={200}
                      className="preview-image"
                    />
                  </div>
                )}
              </div>
              <button className="docs-btn-submit" type="submit">
                Create Document
              </button>
            </form>
          </div>
        </div>
      )}
      {modalUpdate && (
        <div className="modal-office">
          <div className="overlay" onClick={() => setModalUpdate(false)}></div>
          <div className="modal-content-office">
            <span className="close" onClick={() => setModalUpdate(false)}>
              &times;
            </span>
            <h2>Edit Document</h2>
            <form className="form" onSubmit={editRecDocument}>
              <input
                type="text"
                name="title"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />

              <select
                name="source"
                id="source"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                required
              >
                <option disabled value="">
                  Select Source
                </option>
                <option value="Internal">Internal</option>
                <option value="External">External</option>
              </select>

              <select
                name="types"
                id="types"
                value={type}
                onChange={(e) => setType(e.target.value)}
                required
              >
                <option disabled value="">
                  Select Type
                </option>
                {categories && categories.length > 0 ? (
                  categories.map((category, index) => (
                    <option key={index} value={category.name}>
                      {category.name}
                    </option>
                  ))
                ) : (
                  <option disabled>No document types found</option>
                )}
              </select>

              <select
                name="mode"
                id="mode"
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                required
              >
                <option disabled value="">
                  Select Mode
                </option>
                <option value="Hard copy">Hard Copy</option>
                <option value="Soft copy">Soft Copy</option>
              </select>

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
                    <option key={index} value={office.account_username}>
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

              <textarea
                className="input"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                cols={70}
                placeholder="Enter the description"
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
                    <img
                      src={preview}
                      alt="Preview"
                      width={150}
                      height={250}
                      className="preview-image"
                    />
                  </div>
                )}
              </div>
              <button className="docs-btn-update" type="submit">
                Update Document
              </button>
            </form>
          </div>
        </div>
      )}
      {modalView && (
        <div className="modal-office">
        <div className="overlay" onClick={() => setModalView(false)}></div>
        <div className="modal-content-office-lg">
          <span className="close" onClick={() => setModalView(false)}>
            &times;
          </span>
          <h1>View Document</h1>
          <br />
          {viewDocs.length > 0 ? (
              <table>
                <thead>
                  <tr>
                    <th>Sender Name</th>
                    <th>Action</th>
                    <th>Date & Time</th>
                    <th>Receive By</th>
                  </tr>
                </thead>
                <tbody>
                  {viewDocs.map((doc, index) => (
                    <tr key={index}>
                      <td>{doc.senderName}</td>
                      <td>{doc.action}</td>
                      <td>{new Date(doc.timestamp).toLocaleString()}</td>
                      <td>
                        {doc.offices.map((office, i) => (
                          <span key={i}>
                            {office}
                            <br />
                            {i < doc.receiver.length - 1 && ' '}
                          </span>
                        ))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No documents to display.</p>
            )}
        </div>
      </div>
      )}
      <ToastContainer />
    </>
  );
};

export default RecordDocument;