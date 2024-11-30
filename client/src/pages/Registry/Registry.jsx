/* eslint-disable react/prop-types */
/* eslint-disable react-hooks/exhaustive-deps */

import './Registry.css';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import logo from '../../assets/logo/logo.png';
import { API_URL } from '../../config.js';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DOMPurify from 'dompurify';

const Registry = ({ normalAccount, googleAccount }) => {
  document.title = 'Registry';

  const [registries, setRegistries] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [allDocuments, setAllDocuments] = useState([]);
  const [, setFilterDocuments] = useState([]);
  const [filterRegistries, setFilterRegistries] = useState([]);
  const [modalCreate, setModalCreate] = useState(false);
  const [modalUpdate, setModalUpdate] = useState(false);
  const [selectedRegistryId, setSelectedRegistryId] = useState(null);

  // Registry Fields
  const [region, setRegion] = useState('');
  const [province, setProvince] = useState('');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [sex, setSex] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [educationalAttainment, setEducationalAttainment] = useState('');
  const [presentDesignation, setPresentDesignation] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [sector, setSector] = useState('');
  const [qualificationTitle, setQualificationTitle] = useState('');
  const [accreditationNumber, setAccreditationNumber] = useState('');
  const [dateAccreditation, setDateAccreditation] = useState('');
  const [validUntil, setValidUntil] = useState('');

  const getAllRegistries = async () => {
    try {
      const response = await axios.get(`${API_URL}/registry`);
      setRegistries(response.data);
      setFilterRegistries(response.data);
    } catch (error) {
      console.log('Error fetching registries', error);
    }
  };

  useEffect(() => {
    getAllRegistries();
  }, []);

  const toggleModalCreate = () => {
    setRegistryDefaults();
    setModalCreate(!modalCreate);
  };

  const toggleModalUpdate = async (registryId) => {
    setSelectedRegistryId(registryId);
    setModalUpdate(!modalUpdate);
    if (registryId) {
      await getRegistryById(registryId);
    }
  };

  const setRegistryDefaults = () => {
    setRegion('');
    setProvince('');
    setName('');
    setAddress('');
    setSex('');
    setDateOfBirth('');
    setEducationalAttainment('');
    setPresentDesignation('');
    setCompanyName('');
    setSector('');
    setQualificationTitle('');
    setAccreditationNumber('');
    setDateAccreditation('');
    setValidUntil('');
  };

  const getRegistryById = async (registryId) => {
    const response = await axios.get(`${API_URL}/registry/${registryId}`);
    const registry = response.data;
    setRegion(registry.region);
    setProvince(registry.province);
    setName(registry.name);
    setAddress(registry.address);
    setSex(registry.sex);
    setDateOfBirth(registry.date_of_birth);
    setEducationalAttainment(registry.educational_attainment);
    setPresentDesignation(registry.present_designation);
    setCompanyName(registry.company_name);
    setSector(registry.sector);
    setQualificationTitle(registry.qualification_title);
    setAccreditationNumber(registry.accreditation_number);
    setDateAccreditation(registry.date_accreditation);
    setValidUntil(registry.valid_until);
  };

  const getAllDocuments = async () => {
    try {
      const response = await axios.get(`${API_URL}/documents`);
      setFilterDocuments(response.data);
      setAllDocuments(response.data);
    } catch (error) {
      console.log('Error fetching docouments', error);
    }
  };

  const createRegistry = async (e) => {
    e.preventDefault();
    const userName =
      normalAccount?.username
    console.log('Username: ', userName);
    const fullName = normalAccount.fullname || null;

    const formData = {
      region,
      province,
      name,
      address,
      sex,
      date_of_birth: dateOfBirth,
      educational_attainment: educationalAttainment,
      present_designation: presentDesignation,
      company_name: companyName,
      sector,
      qualification_title: qualificationTitle,
      accreditation_number: accreditationNumber,
      date_accreditation: dateAccreditation,
      valid_until: validUntil,
    };

    try {
      await axios.post(`${API_URL}/registry`, formData, {
        headers: { 'Content-Type': 'application/json' },
      });

      // Create Audit Log
      const auditLogData = {
        userName,
        fullName,
        action: 'Successfully created registry',
      };

      await axios.post(`${API_URL}/audit-logs`, auditLogData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      toast.success('Registry created successfully', toastConfig);
      getAllRegistries();
      toggleModalCreate();
    } catch (error) {
      console.error('Error creating registry', error);
      toast.error('Error creating registry', toastConfig);
    }
  };

  const updateRegistry = async (e) => {
    e.preventDefault();
    const userName =
      normalAccount?.username;
    console.log('Username: ', userName);
    const fullName = normalAccount.fullname || null;

    const formData = {
      region,
      province,
      name,
      address,
      sex,
      date_of_birth: dateOfBirth,
      educational_attainment: educationalAttainment,
      present_designation: presentDesignation,
      company_name: companyName,
      sector,
      qualification_title: qualificationTitle,
      accreditation_number: accreditationNumber,
      date_accreditation: dateAccreditation,
      valid_until: validUntil,
    };

    try {
      await axios.patch(`${API_URL}/registry/${selectedRegistryId}`, formData, {
        headers: { 'Content-Type': 'application/json' },
      });

      // Create Audit Log
      const auditLogData = {
        userName,
        fullName,
        action: 'Successfully updated registry',
      };

      await axios.post(`${API_URL}/audit-logs`, auditLogData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      toast.success('Registry updated successfully', toastConfig);
      getAllRegistries();
      toggleModalUpdate(null);
    } catch (error) {
      console.error('Error updating registry', error);
      toast.error('Error updating registry', toastConfig);
    }
  };
  const deleteRegistries = async (e, registryId) => {
    const userName =
      normalAccount?.username;
    console.log('Username: ', userName);
    const fullName = normalAccount.fullname || null;

    e.preventDefault();

    // Show confirmation dialog
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this registry No ' + registryId + ' ?'
    );

    if (!confirmDelete) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/registry/${registryId}`);

      // Create Audit Log
      const auditLogData = {
        userName,
        fullName,
        action: 'Successfully updated registry',
      };

      await axios.post(`${API_URL}/audit-logs`, auditLogData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      alert('Registry deleted successfully!');
    } catch (error) {
      console.error('Error deleting registry:', error);
      alert('Failed to delete registry.');
    }
  };

  useEffect(() => {
    getAllDocuments();
  }, []);

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

  const [isSideDropDownOpen, setSideDropDownOpen] = useState(false);

  const handleDropdownSidebar = () => {
    setSideDropDownOpen(!isSideDropDownOpen);
  };

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

  // Toast Configuration
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
  // -- END

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
    const sanitizedQuery = DOMPurify.sanitize(query);
    setSearchQuery(sanitizedQuery);
    filterDocumentsList(query);
  };

  const filterDocumentsList = (query) => {
    if (query.trim() === '') {
      setFilterDocuments(registries);
    } else {
      setFilterDocuments(
        registries.filter((doc) =>
          doc.No.toLowerCase().includes(query.toLowerCase())
        )
      );
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
          <div className="registry-section">
            <div className="display-status-registry">
              <h1>Registry Table</h1>
              <hr className="registry-break-line" />
              <button className="add-reg-btn" onClick={toggleModalCreate}>
                Add Registry <i className="bx bx-plus"></i>
              </button>
              <div className="registry-table">
                <table>
                  <thead>
                    <tr>
                      <th>No</th>
                      <th>Name</th>
                      <th>Address</th>
                      <th>Date of Birth</th>
                      <th>Educational Attainment</th>
                      <th>Company Name</th>
                      <th>Sector</th>
                      <th>Qualification Title</th>
                      <th>Accreditation Number</th>
                      <th>Date of Accreditation</th>
                      <th>Valid Until</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filterRegistries.length > 0 ? (
                      filterRegistries.map((registry, index) => (
                        <tr key={index}>
                          <td>{registry.id}</td>
                          <td>{registry.name}</td>
                          <td>{registry.address}</td>
                          <td>{formatDate(registry.dateOfBirth)}</td>
                          <td>{registry.educational_attainment}</td>
                          <td>{registry.company_name}</td>
                          <td>{registry.sector}</td>
                          <td>{registry.qualification_title}</td>
                          <td>{registry.accreditation_number}</td>
                          <td>{formatDate(registry.date_accreditation)}</td>
                          <td>{formatDate(registry.valid_until)}</td>
                          <td className="action-icons">
                            <i
                              id="bx-edit"
                              className="bx bx-edit"
                              onClick={() => toggleModalUpdate(registry.id)}
                              title="Edit"
                            ></i>
                            <i
                              id="bx-trash"
                              className="bx bx-trash"
                              onClick={(e) => deleteRegistries(e, registry.id)}
                              title="Delete"
                            ></i>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="12">No Registry found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>

        {/* MAIN */}
      </section>
      {modalCreate && (
        <div className="modal">
          <div onClick={toggleModalCreate} className="overlay"></div>
          <div className="modal-document">
            <h1>Add Registry</h1>
            <hr />
            <form className="form" onSubmit={createRegistry}>
              <div className="form-grid">
                <div className="first-row">
                  <label>
                    Region<span>*</span>
                  </label>
                  <br />
                  <input
                    className="input"
                    type="text"
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    placeholder="Ex. NCR"
                    required
                  />
                  <br />
                  <br />
                  <label>
                    Province<span>*</span>
                  </label>
                  <br />
                  <input
                    className="input"
                    type="text"
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    placeholder="Ex. Metro Manila"
                    required
                  />
                  <br />
                  <br />
                  <label>
                    Name<span>*</span>
                  </label>
                  <br />
                  <input
                    className="input"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex. Juan Dela Cruz"
                    required
                  />
                  <br />
                  <br />
                </div>
                <div className="second-row">
                  <label>
                    Address<span>*</span>
                  </label>
                  <br />
                  <input
                    className="input"
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Ex. 123 Main St."
                    required
                  />
                  <br />
                  <br />
                  <label>
                    Sex<span>*</span>
                  </label>
                  <br />
                  <select
                    className="input"
                    value={sex}
                    onChange={(e) => setSex(Number(e.target.value))}
                    required
                  >
                    <option value="">Select Sex</option>
                    <option value="1">Male</option>
                    <option value="0">Female</option>
                  </select>
                  <br />
                  <br />
                  <label>
                    Date of Birth<span>*</span>
                  </label>
                  <br />
                  <input
                    className="input"
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    required
                  />
                  <br />
                  <br />
                </div>
                <div className="third-row">
                  <label>
                    Educational Attainment<span>*</span>
                  </label>
                  <br />
                  <input
                    className="input"
                    type="text"
                    value={educationalAttainment}
                    onChange={(e) => setEducationalAttainment(e.target.value)}
                    placeholder="Ex. Bachelor's Degree"
                    required
                  />
                  <br />
                  <br />
                  <label>
                    Present Designation<span>*</span>
                  </label>
                  <br />
                  <input
                    className="input"
                    type="text"
                    value={presentDesignation}
                    onChange={(e) => setPresentDesignation(e.target.value)}
                    placeholder="Ex. Software Engineer"
                    required
                  />
                  <br />
                  <br />
                  <label>
                    Company Name<span>*</span>
                  </label>
                  <br />
                  <input
                    className="input"
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Ex. Tech Corp"
                    required
                  />
                  <br />
                  <br />
                </div>
                <div className="fourth-row">
                  <label>
                    Sector<span>*</span>
                  </label>
                  <br />
                  <input
                    className="input"
                    type="text"
                    value={sector}
                    onChange={(e) => setSector(e.target.value)}
                    placeholder="Ex. IT"
                    required
                  />
                  <br />
                  <br />
                  <label>
                    Qualification Title<span>*</span>
                  </label>
                  <br />
                  <input
                    className="input"
                    type="text"
                    value={qualificationTitle}
                    onChange={(e) => setQualificationTitle(e.target.value)}
                    placeholder="Ex. Certified Developer"
                    required
                  />
                  <br />
                  <br />
                  <label>
                    Accreditation Number<span>*</span>
                  </label>
                  <br />
                  <input
                    className="input"
                    type="text"
                    value={accreditationNumber}
                    onChange={(e) => setAccreditationNumber(e.target.value)}
                    placeholder="Ex. ABC123"
                    required
                  />
                  <br />
                  <br />
                </div>
                <div className="fifth-row">
                  <label>
                    Date of Accreditation<span>*</span>
                  </label>
                  <br />
                  <input
                    className="input"
                    type="date"
                    value={dateAccreditation}
                    onChange={(e) => setDateAccreditation(e.target.value)}
                    required
                  />
                  <br />
                  <br />
                  <label>
                    Valid Until<span>*</span>
                  </label>
                  <br />
                  <input
                    className="input"
                    type="date"
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                    required
                  />
                  <br />
                  <br />
                </div>
              </div>
              <div className="btn-container">
                <button
                  type="button"
                  className="document-btn-cancel"
                  onClick={toggleModalCreate}
                >
                  Discard
                </button>
                <button type="submit" className="document-btn-submit">
                  Submit
                </button>
              </div>
            </form>
            <button className="close-modal" onClick={toggleModalCreate}>
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

      {modalUpdate && (
        <div className="modal">
          <div onClick={toggleModalUpdate} className="overlay"></div>
          <div className="modal-document">
            <h1>Update Registry</h1>
            <hr />
            <form className="form" onSubmit={updateRegistry}>
              <div className="form-grid">
                <div className="first-row">
                  <label>
                    Region<span>*</span>
                  </label>
                  <br />
                  <input
                    className="input"
                    type="text"
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    placeholder="Ex. NCR"
                    required
                  />
                  <br />
                  <br />
                  <label>
                    Province<span>*</span>
                  </label>
                  <br />
                  <input
                    className="input"
                    type="text"
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    placeholder="Ex. Metro Manila"
                    required
                  />
                  <br />
                  <br />
                  <label>
                    Name<span>*</span>
                  </label>
                  <br />
                  <input
                    className="input"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex. Juan Dela Cruz"
                    required
                  />
                  <br />
                  <br />
                </div>
                <div className="second-row">
                  <label>
                    Address<span>*</span>
                  </label>
                  <br />
                  <input
                    className="input"
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Ex. 123 Main St."
                    required
                  />
                  <br />
                  <br />
                  <label>
                    Sex<span>*</span>
                  </label>
                  <br />
                  <select
                    className="input"
                    value={sex}
                    onChange={(e) => setSex(Number(e.target.value))}
                    required
                  >
                    <option value="">Select Sex</option>
                    <option value="1">Male</option>
                    <option value="0">Female</option>
                  </select>
                  <br />
                  <br />
                  <label>
                    Date of Birth<span>*</span>
                  </label>
                  <br />
                  <input
                    className="input"
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    required
                  />
                  <br />
                  <br />
                </div>
                <div className="third-row">
                  <label>
                    Educational Attainment<span>*</span>
                  </label>
                  <br />
                  <input
                    className="input"
                    type="text"
                    value={educationalAttainment}
                    onChange={(e) => setEducationalAttainment(e.target.value)}
                    placeholder="Ex. Bachelor's Degree"
                    required
                  />
                  <br />
                  <br />
                  <label>
                    Present Designation<span>*</span>
                  </label>
                  <br />
                  <input
                    className="input"
                    type="text"
                    value={presentDesignation}
                    onChange={(e) => setPresentDesignation(e.target.value)}
                    placeholder="Ex. Software Engineer"
                    required
                  />
                  <br />
                  <br />
                  <label>
                    Company Name<span>*</span>
                  </label>
                  <br />
                  <input
                    className="input"
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Ex. Tech Corp"
                    required
                  />
                  <br />
                  <br />
                </div>
                <div className="fourth-row">
                  <label>
                    Sector<span>*</span>
                  </label>
                  <br />
                  <input
                    className="input"
                    type="text"
                    value={sector}
                    onChange={(e) => setSector(e.target.value)}
                    placeholder="Ex. IT"
                    required
                  />
                  <br />
                  <br />
                  <label>
                    Qualification Title<span>*</span>
                  </label>
                  <br />
                  <input
                    className="input"
                    type="text"
                    value={qualificationTitle}
                    onChange={(e) => setQualificationTitle(e.target.value)}
                    placeholder="Ex. Certified Developer"
                    required
                  />
                  <br />
                  <br />
                  <label>
                    Accreditation Number<span>*</span>
                  </label>
                  <br />
                  <input
                    className="input"
                    type="text"
                    value={accreditationNumber}
                    onChange={(e) => setAccreditationNumber(e.target.value)}
                    placeholder="Ex. ABC123"
                    required
                  />
                  <br />
                  <br />
                </div>
                <div className="fifth-row">
                  <label>
                    Date of Accreditation<span>*</span>
                  </label>
                  <br />
                  <input
                    className="input"
                    type="date"
                    value={dateAccreditation}
                    onChange={(e) => setDateAccreditation(e.target.value)}
                    required
                  />
                  <br />
                  <br />
                  <label>
                    Valid Until<span>*</span>
                  </label>
                  <br />
                  <input
                    className="input"
                    type="date"
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                    required
                  />
                  <br />
                  <br />
                </div>
              </div>
              <div className="btn-container">
                <button
                  type="button"
                  className="document-btn-cancel"
                  onClick={toggleModalUpdate}
                >
                  Discard
                </button>
                <button type="submit" className="document-btn-submit">
                  Update
                </button>
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

export default Registry;