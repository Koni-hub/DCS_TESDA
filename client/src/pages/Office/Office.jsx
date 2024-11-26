/* eslint-disable react/prop-types */
import './Office.css';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import logo from '../../assets/logo/logo.png';
import { API_URL } from '../../config.js';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DOMPurify from 'dompurify';

const Office = ({ normalAccount, googleAccount }) => {
  document.title = 'Office Management';

  const navigate = useNavigate();
  
  // State management
  const [offices, setOffices] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalCreate, setModalCreate] = useState(false);
  const [modalUpdate, setModalUpdate] = useState(false);
  const [selectedOfficeID, setSelectedOfficeID] = useState(null);
  const [role, setRole] = useState(null);
  const [loggedInAccount, setLoggedInAccount] = useState(null);
  const [activeMenuItem, setActiveMenuItem] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  // Form data state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    phone: '',
    status: '',
  });

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

  // API calls
  const getAllOffices = async () => {
    try {
      const response = await axios.get(`${API_URL}/offices`);
      setOffices(response.data);
    } catch (error) {
      console.error('Error fetching offices:', error);
    }
  };

  const getAllDocuments = async () => {
    try {
      const response = await axios.get(`${API_URL}/documents`);
      await documentChecker(response.data);
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  // Document checker functions
  const documentChecker = async (documents) => {
    const pendingDocs = documents.filter(doc => 
      doc.status !== 'Archive' && 
      Object.values(doc).some(field => field === '' || field === null)
    );
    setPendingCount(pendingDocs.length);
  };

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
        setLoggedInAccount(response.data);
        setRole(response.data.createdBy);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    getUsernameForData();
  }, [normalAccount]);

  const [isSideDropDownOpen, setSideDropDownOpen] = useState(false);

  const handleDropdownSidebar = () => {
    setSideDropDownOpen(!isSideDropDownOpen);
  };

  // Role-based access control
  useEffect(() => {
    if (role && role !== 'Admin' && role !== 'System') {
      navigate('/forbidden');
    }
  }, [role, navigate]);

  // Initial data loading
  useEffect(() => {
    getAllOffices();
    getAllDocuments();
  }, []);

  // Event handlers
  const handleMenuItemClick = (index) => {
    setActiveMenuItem(index);
  };

  const handleToggleSidebar = () => {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('hide');
  };

  const handleClickOutside = (event) => {
    if (!event.target.closest('.profile-name')) {
      setIsDropdownOpen(false);
    }
  };

  useEffect(() => {
    window.addEventListener('click', handleClickOutside);
    return () => {
      window.removeEventListener('click', handleClickOutside);
    };
  }, []);

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
      getAllOffices();
    } else {
      const filteredOffices = offices.filter(office =>
        office.name.toLowerCase().includes(query.toLowerCase())
      );
      setOffices(filteredOffices);
    }
  };

  // Form handling
  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  // Modal functions
  const toggleModalUpdate = async (id) => {
    if (id) {
      try {
        const response = await axios.get(`${API_URL}/offices/${id}`);
        console.log('Selected Office Data', response.data);
        setSelectedOfficeID(response.data);
        setFormData({
          name: response.data.name || '',
          email: response.data.email || '',
          address: response.data.address || '',
          phone: response.data.phone || '',
          status: response.data.status || '',
        });
        setModalUpdate(true)
      } catch (error) {
        console.error('Error fetching offices:', error);
      }
    }
    setModalUpdate(!modalUpdate);
  };

  // Form validation
  const validateInputs = () => {
    const { 
      name,
      email,
      address,
      phone,
      status
    } = formData;

    if (!name || name.length > 30) {
      toast.error('Name must not be empty and less than 20 characters', toastConfig);
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address', toastConfig);
      return false;
    }

    if (!address || address.length > 30) {
      toast.error('Address must not be empty and less than 30 characters', toastConfig);
      return false;
    }
    
    if (!phone || !/^\d{11}$/.test(phone)) {
      toast.error('Phone Number must be exactly 11 digits', toastConfig);
      return false;
    }
    
    if (!status) {
      toast.error('Please select an account status', toastConfig);
      return false;
    }

    return true;
  };

  // Reset form data
  const resetFormData = () => {
    setFormData({
      name: '',
      email: '',
      address: '',
      phone: '',
      status: '',
    });
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
  
    if (!validateInputs()) {
      return;
    }
  
    const createPayload = {
      name: formData.name,
      email: formData.email,
      address: formData.address,
      phone: formData.phone,
      status: formData.status,
    };
  
    console.log('Payload being sent:', createPayload);
    console.log('API URL:', `${API_URL}/offices`);
  
    try {
      const userName = normalAccount?.username || googleAccount.profile.emails[0].value;
      const fullName = normalAccount.fullname || null;

      const response = await axios.post(`${API_URL}/offices`, createPayload);
  
      if (response.data) {
        // Create Audit Log
        const auditLogData = {
          userName,
          fullName,
          action: `Created office by username ${userName}`,
        };

        await axios.post(`${API_URL}/audit-logs`, auditLogData, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
        toast.success('Office created successfully', toastConfig);
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
        }, 2000);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error creating office';
      toast.error(errorMessage, toastConfig);
      console.error('Error creating office:', error);
    }
  };
  

  // Form submission for updating
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateInputs()) {
      return;
    }

    if (!selectedOfficeID) {
      toast.error('No office selected for update', toastConfig);
      return;
    }

    try {
      const userName = normalAccount?.username || googleAccount.profile.emails[0].value;
      const fullName = normalAccount.fullname || null;
      
      const response = await axios.patch(
        `${API_URL}/offices/${selectedOfficeID.id}`,
        formData
      );

      if (response.data) {
        // Create Audit Log
        const auditLogData = {
          userName,
          fullName,
          action: `Updated office by username ${userName}`,
        };

        await axios.post(`${API_URL}/audit-logs`, auditLogData, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
        toast.success('Office updated successfully', toastConfig);
        setTimeout(() => {
          window.location.reload();
        }, 2000);
        setModalUpdate(false);
        resetFormData();
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error updating office';
      toast.error(errorMessage, toastConfig);
      console.error('Error updating office:', error);
    }
  };


  const userLoginRole = 
    (normalAccount?.role == 'Admin') 
    ? 'Administrator' 
    : (normalAccount?.role == 'Employee')
    ? 'Employee' 
    : (normalAccount?.role == 'Office')
    ? 'Office' 
    : 'Unknown';

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
                placeholder="Search office..."
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
          <div className="office-section">
            <div className="display-status-office">
              <h1>Office Table</h1>
            </div>
            <hr className="office-break-line" />
            <Link to="#" onClick={() => setModalCreate(true)}>
              <button className="add-office-btn">
                Add Office <i className="bx bx-plus"></i>
              </button>
            </Link>
            <div className="office-table">
              <table>
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Address</th>
                    <th>Phone</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {offices.length > 0 ? (
                    offices.map((office, index) => (
                      <tr key={index} >
                        <td>{office.id}</td>
                        <td>{office.name}</td>
                        <td>{office.email}</td>
                        <td>{office.address}</td>
                        <td>{office.phone}</td>
                        <td>{(office.status == 'active' ? 'Active' : 'Close')}</td>
                        <td className="action-icons">
                          <i
                            id="bx-edit"
                            className="bx bx-edit"
                            onClick={() => toggleModalUpdate(office.id)}
                            title="Edit"
                          ></i>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6">No office found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
        {/* MAIN */}
      </section>
      {/* Create Office Modal */}
      {modalCreate && (
        <div className="modal-office">
          <div className="overlay"></div>
          <div className="modal-content-office">
            <span className="close" onClick={() => setModalCreate(false)}>&times;</span>
            <h2>Create Office</h2>
            <form className='form' onSubmit={handleCreateSubmit}>
              <input 
                type="text" 
                name="name" 
                placeholder="Office Name" 
                value={formData.name} 
                onChange={handleChange} 
                required 
              />
              <input 
                type="email" 
                name="email" 
                placeholder="Office Email" 
                value={formData.email} 
                onChange={handleChange} 
                required 
              />
              <input 
                type="text" 
                name="address" 
                placeholder="Office Address" 
                value={formData.address} 
                onChange={handleChange} 
                required 
              />
              <input 
                type="tel" 
                name="phone" 
                placeholder="Office Phone" 
                value={formData.phone} 
                onChange={handleChange} 
                required 
              />
              <select
                id='select'
                name="status" 
                value={formData.status} 
                onChange={handleChange} 
                required
              >
                <option value="">Select Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <button className='office-btn-submit' type="submit">Create Office</button>
            </form>
          </div>
        </div>
      )}
      {/* Update Office Modal */}
      {modalUpdate && (
        <div className="modal-office">
          <div className="overlay"></div>
          <div className="modal-content-office">
            <span className="close" onClick={() => setModalUpdate(false)}>&times;</span>
            <h2>Update Office</h2>
            <form className='form' onSubmit={handleUpdateSubmit}>
              <input 
                type="text" 
                name="name" 
                placeholder="Office Name" 
                value={formData.name} 
                onChange={handleChange} 
                required 
              />
              <input 
                type="email" 
                name="email" 
                placeholder="Office Email" 
                value={formData.email} 
                onChange={handleChange} 
                required 
              />
              <input 
                type="text" 
                name="address" 
                placeholder="Office Address" 
                value={formData.address} 
                onChange={handleChange} 
                required 
              />
              <input 
                type="tel" 
                name="phone" 
                placeholder="Office Phone" 
                value={formData.phone} 
                onChange={handleChange} 
                required 
              />
              <select 
                name="status" 
                value={formData.status} 
                onChange={handleChange} 
                required
              >
                <option value="">Select Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <button className='office-btn-update' type="submit">Update Office</button>
            </form>
          </div>
        </div>
      )}
      <ToastContainer />
    </>
  );
};

export default Office;