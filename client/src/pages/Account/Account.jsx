/* eslint-disable react/prop-types */
import './Account.css';
import '../Register/Register.css';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import logo from '../../assets/logo/logo.png';
import { API_URL } from '../../config.js';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DOMPurify from 'dompurify';

const Account = ({ normalAccount }) => {
  document.title = 'Account Management';

  const navigate = useNavigate();

  const [accounts, setAccounts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalUpdate, setModalUpdate] = useState(false);
  const [selectedAccountID, setSelectedAccountID] = useState(null);
  const [role, setRole] = useState(null);
  const [loggedInAccount, setLoggedInAccount] = useState(null);
  const [activeMenuItem, setActiveMenuItem] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [verifyPassword, setVerifyPassword] = useState('');
  const [passwordVisible1, setPasswordVisible1] = useState(false);
  const [passwordVisible2, setPasswordVisible2] = useState(false);
  const [isSideDropDownOpen, setSideDropDownOpen] = useState(false);

  const handleDropdownSidebar = () => {
    setSideDropDownOpen(!isSideDropDownOpen);
  };

  const [formData, setFormData] = useState({
    account_username: '',
    account_firstName: '',
    account_lastName: '',
    account_email: '',
    currentPassword: '',
    account_password: '',
    account_contactNo: '',
    account_status: '',
    account_role: '',
    origin: '',
    isAccountVerified: false,
  });


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

  const getAllAccounts = async () => {
    try {
      const response = await axios.get(`${API_URL}/accounts`);
      setAccounts(response.data);
    } catch (error) {
      console.error('Error fetching accounts:', error);
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
    getAllAccounts();
  }, []);

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
      getAllAccounts();
    } else {
      const filteredAccounts = accounts.filter((acc) =>
        acc.account_username.toLowerCase().includes(query.toLowerCase())
      );
      setAccounts(filteredAccounts);
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const toggleModalUpdate = async (accountEmail) => {
    if (accountEmail) {
      try {
        const response = await axios.get(`${API_URL}/account/${accountEmail}`);
        setFormData({
          account_username: response.data.account_username || '',
          account_email: response.data.account_email || '',
          account_firstName: response.data.account_firstName || '',
          account_lastName: response.data.account_lastName || '',
          account_contactNo: response.data.account_contactNo || '',
          account_password: '',
          currentPassword: '',
          account_status: response.data.account_status || '',
          account_role: response.data.account_role || '',
          origin: response.data.origin || '',
        });
        setSelectedAccountID(response.data);
      } catch (error) {
        console.error('Error fetching account:', error);
      }
    }
    setModalUpdate(!modalUpdate);
  };

  const togglePassword1 = () => setPasswordVisible1(!passwordVisible1);
  const togglePassword2 = () => setPasswordVisible2(!passwordVisible2);

  const validateInputs = () => {
    const {
      account_username,
      account_email,
      account_password,
      account_firstName,
      account_lastName,
      account_contactNo,
      account_status,
      account_role,
    } = formData;

    if (!/^\d{8}$/.test(account_username)) {
      toast.error('Username must be exactly 8 numeric characters', toastConfig);
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(account_email)) {
      toast.error('Please enter a valid email address', toastConfig);
      return false;
    }

    if (!account_firstName || account_firstName.length > 30) {
      toast.error(
        'First Name must not be empty and less than 30 characters',
        toastConfig
      );
      return false;
    }

    if (!account_lastName || account_lastName.length > 30) {
      toast.error(
        'Last Name must not be empty and less than 30 characters',
        toastConfig
      );
      return false;
    }

    if (!account_contactNo || !/^\d{11}$/.test(account_contactNo)) {
      toast.error('Mobile Number must be exactly 11 digits', toastConfig);
      return false;
    }

    if (!account_status) {
      toast.error('Please select an account status', toastConfig);
      return false;
    }

    // Select Account role (must not be empty)
    if (!account_role) {
      toast.error('Role must be not empty');
      return false;
    }

    if (account_password) {
      const passwordRegex = /^(?=.*[!@#$%^&*])(?=.*[A-Z]).{16,}$/;
      if (!passwordRegex.test(account_password)) {
        toast.error(
          'Password must be 16 characters with at least one uppercase letter and one special character',
          toastConfig
        );
        return false;
      }

      if (account_password !== verifyPassword) {
        toast.error('Passwords do not match', toastConfig);
        return false;
      }
    }

    return true;
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateInputs()) {
      return;
    }

    const updatePayload = {
      account_username: formData.account_username,
      account_email: formData.account_email,
      account_firstName: formData.account_firstName,
      account_lastName: formData.account_lastName,
      account_contactNo: formData.account_contactNo,
      account_password: formData.account_password,
      currentPassword: formData.currentPassword,
      account_status: formData.account_status,
      account_role: formData.account_role,
      origin: formData.origin,
    };

    try {
      const userName =
        normalAccount?.username || '';
      const fullName = normalAccount.fullname || null;

      const response = await axios.patch(
        `${API_URL}/account/${selectedAccountID.account_id}`,
        updatePayload
      );

      if (response.data) {
        const auditLogData = {
          userName,
          fullName,
          action: `update account by ID ${userName}`,
        };

        await axios.post(`${API_URL}/audit-logs`, auditLogData, {
          headers: {
            'Content-Type': 'application/json',
          },
        });

        toast.success('Account updated successfully', toastConfig);
        setTimeout(() => {
          window.location.reload();
        }, 2500);
        await getAllAccounts();
        setModalUpdate(false);
        setFormData({
          account_username: '',
          account_email: '',
          account_firstName: '',
          account_lastName: '',
          account_contactNo: '',
          account_password: '',
          currentPassword: '',
          account_status: '',
          account_role: '',
          origin: '',
        });
        setVerifyPassword('');
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || 'Error updating account';
      toast.error(errorMessage, toastConfig);
      console.error('Error updating account:', error);
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
                placeholder="Search account by id..."
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
          <div className="account-section">
            <h1>Account Table</h1>
            <hr className="account-break-line" />
            <Link to={'/register'}>
              <button className="add-acc-btn">
                Add Account <i className="bx bx-plus"></i>
              </button>{' '}
            </Link>
            <div className="account-table">
              <table>
                <thead>
                  <tr>
                    <th>No</th>
                    <th>ID</th>
                    <th>First Name</th>
                    <th>Last Name</th>
                    <th>Password</th>
                    <th>Email</th>
                    <th>Contact No</th>
                    <th>Status</th>
                    <th>Office</th>
                    <th>Role</th>
                    <th>Created By</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {accounts.length > 0 ? (
                    accounts.map((account, index) => (
                      <tr key={index}>
                        <td>{account.account_id}</td>
                        <td>{account.account_username}</td>
                        <td>{account.account_firstName}</td>
                        <td>{account.account_lastName}</td>
                        <td>{account.account_pass}</td>
                        <td>{account.account_email}</td>
                        <td>{account.account_contactNo}</td>
                        <td>
                          {account.account_status == 'active'
                            ? 'Active'
                            : 'Inactive'}
                        </td>
                        <td>
                          {account.origin}
                        </td>
                        <td>{account.account_role}</td>
                        <td>{account.createdBy}</td>
                        <td className="action-icons">
                          <i
                            id="bx-edit"
                            className="bx bx-edit"
                            onClick={() =>
                              toggleModalUpdate(account.account_email)
                            }
                            title="Edit"
                          ></i>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="9">No Accounts found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </section>
      {modalUpdate && (
        <div className="modal">
          <div onClick={toggleModalUpdate} className="overlay"></div>
          <div className="modal-account">
            <h1>Update Account</h1>
            <hr></hr>
            <form className="form" onSubmit={handleSubmit}>
              <div className="inputBox">
                <input
                  type="text"
                  name="account_username"
                  required
                  value={formData.account_username}
                  onChange={handleChange}
                />{' '}
                <i className="no-event">Employee ID </i>
              </div>

              <div className="inputBox">
                <input
                  type="email"
                  name="account_email"
                  required
                  value={formData.account_email}
                  onChange={handleChange}
                />{' '}
                <i className="no-event">Email </i>
              </div>

              <div className="full-name-form">
                <div className="inputBox">
                  <input
                    type="text"
                    name="account_firstName"
                    required
                    value={formData.account_firstName}
                    onChange={handleChange}
                  />{' '}
                  <i className="no-event">First Name </i>
                </div>

                <div className="inputBox">
                  <input
                    type="text"
                    name="account_lastName"
                    required
                    value={formData.account_lastName}
                    onChange={handleChange}
                  />{' '}
                  <i className="no-event">Last Name </i>
                </div>
              </div>

              <div className="inputBox">
                <input
                  type="tel"
                  name="account_contactNo"
                  required
                  value={formData.account_contactNo}
                  onChange={handleChange}
                />{' '}
                <i className="no-event">Mobile Number </i>
              </div>
              <div className="inputBox">
                <input
                  type={passwordVisible1 ? 'text' : 'password'}
                  name="account_password"
                  required
                  value={formData.account_password}
                  onChange={handleChange}
                />
                <i className="no-event">Password</i>
                <span className="show-password">
                  <i
                    className={`bx ${
                      passwordVisible1 ? 'bx-low-vision' : 'bx-show'
                    }`}
                    onClick={togglePassword1}
                  ></i>
                </span>
              </div>

              <div className="inputBox">
                <input
                  type={passwordVisible2 ? 'text' : 'password'}
                  name="account_verifyPassword"
                  onChange={(e) => setVerifyPassword(e.target.value)}
                  value={verifyPassword}
                  required
                />
                <i className="no-event">Confirm Password</i>
                <span className="show-password">
                  <i
                    className={`bx ${
                      passwordVisible2 ? 'bx-low-vision' : 'bx-show'
                    }`}
                    onClick={togglePassword2}
                  ></i>
                </span>
              </div>

              <div className="inputBox">
                <select
                  name="account_status"
                  id="account_status"
                  required
                  value={formData.account_status}
                  onChange={handleChange}
                >
                  <option disabled value="">
                    Select status
                  </option>
                  <option value="active">Active</option>
                  <option value="closed">Inactive</option>
                </select>
              </div>

              <div className="inputBox">
                <select
                  name="account_role"
                  id="account_role"
                  required
                  value={formData.account_role}
                  onChange={handleChange}
                >
                  <option disabled value="">
                    Select Role
                  </option>
                  <option value="Admin">Admin</option>
                  <option value="Employee">Employee</option>
                </select>
              </div>

              <select
                  name="origin"
                  id="origin"
                  value={formData.origin}
                  onChange={handleChange}
                  required
                >
                  <option disabled value="">
                    Select Office
                  </option>
                  {offices && offices.length > 0 ? (
                    offices.map((office, index) => (
                      <option key={index} value={office.name} >
                        {office.name}
                      </option>
                    ))
                  ): (
                    <option disabled>No office found</option>
                  )}
                </select>

              <div id="btn-update" className="inputBox">
                <input type="submit" value="Update" />
              </div>
            </form>
            <button className="close-modal" onClick={toggleModalUpdate}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="feather feather-x"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
      )}
      <ToastContainer />
    </>
  );
};

export default Account;