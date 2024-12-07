/* eslint-disable react/prop-types */
import './OutboxDocs.css';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { API_URL } from '../../config.js';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../../assets/logo/logo.png';
import DOMPurify from 'dompurify';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const OutboxDocs = ({ normalAccount }) => {
  document.title = 'Outbox Document';
  const [documents, setDocuments] = useState([]);
  const [role, setRole] = useState(null);
  const [loggedInAccount, setLoggedInAccount] = useState(null);
  const [activeMenuItem, setActiveMenuItem] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSideDropDownOpen, setSideDropDownOpen] = useState(false);
  const [modalUpdate, setModalUpdate] = useState(false);
  const [categories, setCategories] = useState([]);

  const getAllTypes = async () => {
    try {
      const response = await axios.get(`${API_URL}/document-types`);
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching document types', error);
    }
  };

  const getAllToReceiveDocs = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/record-docs/to-receive-docs`
      );
      setDocuments(response.data);
    } catch (error) {
      console.error('Error fetching archived documents');
    }
  };

  useEffect(() => {
    getAllToReceiveDocs();
    getAllTypes();
  }, []);

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

  useEffect(() => {
    if (role && role !== 'Admin' && role !== 'System') {
      navigate('/forbidden');
    }
  }, [role, navigate]);

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

  const toggleModalUpdate = async (id) => {
    try {
      const response = await axios.get(`${API_URL}/record-docs/${id}`);
      const record = response.data;

      if (record) {
        setTitle(record.title);
        setSource(record.source);
        setType(record.type);
        setDescription(record.description);
        setMode(record.mode);
        setRecordId(id);
        setPreview(record.url);
        setModalUpdate(true);
      }
    } catch (error) {
      console.error('Error fetching record:', error);
      toast.error('Error fetching record data', toastConfig);
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
      getAllToReceiveDocs();
    } else {
      const filteredRecordDocs = documents.filter((recdocs) =>
        recdocs.title.toLowerCase().includes(query.toLowerCase())
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

  const resetFields = () => {
    setTitle('');
    setSource('');
    setType('');
    setDescription('');
    setMode('');
    setPreview('');
    setFile(null);
    setRecordId(null);
  };

  const loadImage = (e) => {
    const image = e.target.files[0];
    if (image) {
      setFile(image);
      const previewUrl = URL.createObjectURL(image);
      setPreview(previewUrl);
    }
  };

  const [source, setSource] = useState('');
  const [type, setType] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [mode, setMode] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [record, setRecordId] = useState('');

  const editRecDocument = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('source', source);
      formData.append('type', type);
      formData.append('description', description);
      formData.append('mode', mode);

      if (file) {
        formData.append('file', file);
      }

      const userName =
        normalAccount?.username || '';
      const fullName = normalAccount.fullname || null;

      await axios.patch(
        `${API_URL}/record-docs/${record}/to-receive-docs`,
        formData
      );

      const auditLogData = {
        userName,
        fullName,
        action: `Updated record document by ID ${userName}`,
      };

      await axios.post(`${API_URL}/audit-logs`, auditLogData);

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
                placeholder="Search title docs..."
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
          <div className="outbox-docs-section">
            <h1>Outbox Documents</h1>
            <hr className="outbox-docs-break-line" />
            <div className="outbox-docs-table">
              <table>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Description</th>
                    <th>Source</th>
                    <th>Type</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.length > 0 ? (
                    documents.map((doc) => (
                      <tr key={doc.id}>
                        <td>{doc.title}</td>
                        <td>{doc.description}</td>
                        <td>{doc.source}</td>
                        <td>{doc.type}</td>
                        <td className="btn-container-outbox">
                          <button
                            className="btn-edit"
                            onClick={() => toggleModalUpdate(doc.id)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn-view"
                            onClick={() => handleToggleOpenDocs(doc.id)}
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center' }}>
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
              <div className="modal-outbox">
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
        {modalUpdate && (
          <div className="modal-office">
            <div
              className="overlay"
              onClick={() => setModalUpdate(false)}
            ></div>
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
                <textarea
                  className="input"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  cols={70}
                  placeholder="Enter the description"
                  required
                />
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
                <div className="rec-docs-image">
                  <label>Attachment</label>
                  <span>*</span> <br />
                  <input
                    type="file"
                    className="attachment-input"
                    onChange={loadImage}
                    accept="image/*"
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
                <button className="office-btn-update" type="submit">
                  Update Document
                </button>
              </form>
            </div>
          </div>
        )}
      </section>
      <ToastContainer />
    </>
  );
};

export default OutboxDocs;