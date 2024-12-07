/* eslint-disable react/prop-types */
import './DocumentTypes.css';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import logo from '../../assets/logo/logo.png';
import { API_URL } from '../../config.js';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DOMPurify from 'dompurify';

const DocumentTypes = ({ normalAccount }) => {
  const [activeMenuItem, setActiveMenuItem] = useState(0);
  const [documentTypes, setDocumentTypes] = useState([]);
  const [loggedInAccount, setLoggedInAccount] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [role, setRole] = useState(null);
  const [modalCreate, setModalCreate] = useState(false);
  const [modalUpdate, setModalUpdate] = useState(false);
  const [selectedDocTypesID, setSelectedDocTypesID] = useState([]);
  const [isSideDropDownOpen, setSideDropDownOpen] = useState(false);

  const handleDropdownSidebar = () => {
    setSideDropDownOpen(!isSideDropDownOpen);
  };

  const [formData, setFormData] = useState({
    name: '',
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const validateInputs = () => {
    const { name } = formData;

    if (!name) {
      toast.error(
        'Name must not be empty',
        toastConfig
      );
      return false;
    }

    return true;
  };

  const resetFormData = () => {
    setFormData({
      name: '',
    });
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

  useEffect(() => {
    getAllDocumentTypes();
  }, []);

  const getAllDocumentTypes = async () => {
    try {
      const response = await axios.get(`${API_URL}/document-types`);
      setDocumentTypes(response.data);
    } catch (error) {
      console.log('Error fetching document types');
    }
  };

  useEffect(() => {
    getAllDocumentTypes;
  }, []);

  const handleMenuItemClick = (index) => {
    setActiveMenuItem(index);
  };

  const handleToggleSidebar = () => {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('hide');
  };

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

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.setItem('loggedIn', false);
    localStorage.setItem('role', 'guest');
    window.open(`${API_URL}/auth/logout`, '_self');
    navigate('/');
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
      getAllDocumentTypes();
    } else {
      const filteredDocumentTypes = documentTypes.filter((doctype) =>
        doctype.name.toLowerCase().includes(query.toLowerCase())
      );
      setDocumentTypes(filteredDocumentTypes);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();

    if (!validateInputs) {
      return;
    }

    const createPayload = {
      name: formData.name,
    };

    try {
      const userName =
        normalAccount?.username || '';
      const fullName = normalAccount.fullname || null;

      const response = await axios.post(
        `${API_URL}/document-types`,
        createPayload
      );

      if (response.data) {
        // Create Audit Log
        const auditLogData = {
          userName,
          fullName,
          action: `Created document types types by ID ${userName}`,
        };

        await axios.post(`${API_URL}/audit-logs`, auditLogData, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
        toast.success('Document types created successfully', toastConfig);
        setModalCreate(false);
        setFormData({
          name: '',
          email: '',
          address: '',
          phone: '',
          status: '',
        });
        setTimeout(() => {
          window.location.reload();
        }, 2500);
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || 'Error creating document types';
      toast.error(errorMessage, toastConfig);
      console.error('Error creating document types:', error);
    }
  };

  const toggleModalUpdate = async (id) => {
    if (id) {
      try {
        const response = await axios.get(`${API_URL}/document-types/${id}`);
        console.log('Selected document types Data', response.data);
        setSelectedDocTypesID(response.data);
        setFormData({
          name: response.data.name || '',
        });
        setModalUpdate(true);
      } catch (error) {
        console.error('Error fetching document types:', error);
      }
    }
    setModalUpdate(!modalUpdate);
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();

    if (!validateInputs()) {
      return;
    }

    if (!selectedDocTypesID) {
      toast.error('No doc types selected for update', toastConfig);
      return;
    }

    try {
      const userName =
        normalAccount?.username || '';
      const fullName = normalAccount.fullname || null;

      const response = await axios.patch(
        `${API_URL}/document-types/${selectedDocTypesID.id}`,
        formData
      );

      if (response.data) {
        const auditLogData = {
          userName,
          fullName,
          action: `Updated document types by ID ${userName}`,
        };

        await axios.post(`${API_URL}/audit-logs`, auditLogData, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
        toast.success('Document types updated successfully', toastConfig);
        setTimeout(() => {
          window.location.reload();
        }, 2500);
        setModalUpdate(false);
        resetFormData();
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || 'Error updating document types';
      toast.error(errorMessage, toastConfig);
      console.error('Error updating document types:', error);
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
                placeholder="Search document types..."
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
          <div className="document-types-section">
            <div className="display-status-document-types">
              <h1>Document Types Table</h1>
            </div>
            <hr className="document-types-break-line" />
            <Link to="#" onClick={() => setModalCreate(true)}>
              <button className="add-document-types-btn">
                Add Document Types <i className="bx bx-plus"></i>
              </button>
            </Link>
            <div className="document-types-table">
              <table>
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Office Name</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {documentTypes.length > 0 ? (
                    documentTypes.map((doctype, index) => (
                      <tr key={index}>
                        <td>{doctype.id}</td>
                        <td>{doctype.name}</td>
                        <td className="action-icons">
                          <i
                            id="bx-edit"
                            className="bx bx-edit"
                            onClick={() => toggleModalUpdate(doctype.id)}
                            title="Edit"
                          ></i>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3">No document types found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </section>
      {modalCreate && (
        <div className="modal-document-types">
          <div className="overlay">
            <div className="modal-content-document-types">
              <span className="close" onClick={() => setModalCreate(false)}>
                &times;
              </span>
              <h2>Add Documents Types</h2>
              <form className="form" onSubmit={handleCreateSubmit}>
                <input
                  type="text"
                  name="name"
                  placeholder="Name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
                <button className="document-types-btn-submit" type="submit">
                  Create Document Types
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
      {modalUpdate && (
        <div className="modal-document-types">
          <div className="overlay">
            <div className="modal-content-document-types">
              <span className="close" onClick={() => setModalUpdate(false)}>
                &times;
              </span>
              <h2>Update Documents Types</h2>
              <form className="form" onSubmit={handleUpdateSubmit}>
                <input
                  type="text"
                  name="name"
                  placeholder="Name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
                <button className="document-types-btn-update" type="submit">
                  Update Document Types
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
      <ToastContainer />
    </>
  );
};

export default DocumentTypes;