/* eslint-disable react/no-unescaped-entities */
import './RecordDocument.css';
import axios from 'axios';
import { API_URL } from '../../config';
import { useEffect, useState } from 'react';
import logo from '../../assets/logo/logo.png';
import { Link, useNavigate } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { ToastContainer, toast } from 'react-toastify';

/* eslint-disable react/prop-types */
const RecordDocument = ({ normalAccount, googleAccount }) => {
  document.title = 'Record Document';

  const [activeMenuItem, setActiveMenuItem] = useState(0);
  const [recordDocument, setRecordDocuments] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalCreate, setModalCreate] = useState(false);
  const [modalUpdate, setModalUpdate] = useState(false);
  const [role, setRole] = useState(null);
  const [loggedInAccount, setLoggedInAccount] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [categories, setCategories] = useState([]);
  const [offices, setOffices] = useState([]);
  const [isSideDropDownOpen, setSideDropDownOpen] = useState(false);

  const handleDropdownSidebar = () => {
    setSideDropDownOpen(!isSideDropDownOpen);
  };

  const navigate = useNavigate();

  const getAllTypes = async () => {
    try {
      const response = await axios.get(`${API_URL}/document-types`);
      setCategories(response.data);
    } catch (error) {
      console.log('Error fetching document types', error);
    }
  };

  const getAllOffice = async () => {
    try {
      const response = await axios.get(`${API_URL}/accounts/offices`);
      setOffices(response.data);
    } catch (error) {
      console.log('Error fetching offices', error);
    }
  };

  const getAllRecordDocument = async () => {
    try {
      const response = await axios.get(`${API_URL}/record-docs`);
      setRecordDocuments(response.data);
    } catch (error) {
      console.log('Error fetching record documents', error);
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

  // Function to load the selected image
  const loadImage = (e) => {
    const image = e.target.files[0];
    console.log('Selected Image:', image);
    if (image) {
      setFile(image);
      const previewUrl = URL.createObjectURL(image);
      console.log('Preview URL:', previewUrl);
      setPreview(previewUrl);
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
      getAllRecordDocument();
    } else {
      const filteredRecordDocs = recordDocument.filter((recdocs) =>
        recdocs.title.toLowerCase().includes(query.toLowerCase())
      );
      setRecordDocuments(filteredRecordDocs);
    }
  };

  // Document checker functions
  const documentChecker = async (documents) => {
    const pendingDocs = documents.filter(
      (doc) =>
        doc.status !== 'Archive' &&
        Object.values(doc).some((field) => field === '' || field === null)
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

  // Role-based access control
  useEffect(() => {
    if (role && role !== 'Admin' && role !== 'System') {
      navigate('/forbidden');
    }
  }, [role, navigate]);

  // Initial data loading
  useEffect(() => {
    getAllRecordDocument();
    getAllDocuments();
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
    window.open(`${API_URL}/auth/logout`, '_self');
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

  // useState
  const [title, setTitle] = useState('');
  const [source, setSource] = useState('');
  const [origin, setOrigin] = useState('');
  const [type, setType] = useState('');
  const [rdInstruction, setrdInstruction] = useState('');
  const [controlNo, setControlNo] = useState('');
  const [personConcern, setPersonConcern] = useState('');
  const [dateCreated, setDateCreated] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [dateReceived, setDateReceived] = useState(new Date());
  const [dateCompleted, setDateCompleted] = useState(new Date());
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

  // Save Record Document
  const saveRecDocument = async (e) => {
    e.preventDefault();
    const userName =
        normalAccount?.username || googleAccount.profile.emails[0].value;
      const fullName = normalAccount.fullname || null;
      const senderEmail = normalAccount.email;

    // Log form values
    console.log('Form submitted with values:', {
      title,
      source,
      origin,
      type,
      rdInstruction,
      controlNo,
      personConcern,
      dateCreated,
      dateReceived,
      dateCompleted,
      mode,
      recipient,
      action,
      remarks,
      description,
      userName,
      senderEmail
    });

    // Validate required fields
    const Fields = {
      title,
      source,
      origin,
      type,
      rdInstruction,
      controlNo,
      personConcern,
      dateCreated,
      dateReceived,
      dateCompleted,
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
      console.log('Recipient: append ', recipientId);
    });

    try {

      console.log('Sending request to:', `${API_URL}/record-docs`);
      const response = await axios.post(`${API_URL}/record-docs`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Create Audit Log
      const auditLogData = {
        userName,
        fullName,
        action: `Created record document by username ${userName}`,
      };

      await axios.post(`${API_URL}/audit-logs`, auditLogData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Server response:', response);

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
      // Create FormData for the update
      const formData = new FormData();
      formData.append('title', title);
      formData.append('source', source);
      formData.append('origin', origin);
      formData.append('type', type);
      formData.append('rdInstruction', rdInstruction);
      formData.append('controlNo', controlNo);
      formData.append('dateCreated', dateCreated);
      formData.append('dateCompleted', dateCompleted);
      formData.append('dateReceived', dateReceived);
      formData.append('mode', mode);
      formData.append('recipient', recipient);
      formData.append('action', action);
      formData.append('remarks', remarks);
      formData.append('description', description);

      // Only append the file if it exists
      if (file) {
        formData.append('file', file);
      }

      const userName =
        normalAccount?.username || googleAccount.profile.emails[0].value;
      const fullName = normalAccount.fullname || null;

      await axios.patch(`${API_URL}/record-docs/${record}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Create Audit Log
      const auditLogData = {
        userName,
        fullName,
        action: `Updated record document by username ${userName}`,
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
    setOrigin('');
    setType('');
    setrdInstruction('');
    setControlNo('');
    setMode('');
    setRecipient('');
    setAction('');
    setRemarks('');
    setDescription('');
    setPreview('');
    setFile(null);
    setRecordId(null);
  };

  const optionsDocumentPersonConcern = [
    'BARON JOSE L. LAGRAN',
    'EVELYN M. LUNA',
    'JULIETTE T. FELICIANO',
    'ELLA NESS D. DE LARA',
    'LIWAYWAY D. CALAGUAS',
    'ROSE ANNE S. ZALDIVAR',
    'HEIDIN P. MOHAMMAD AKIL',
    'GENER D. NICOLAS JR.',
    'OLIVIA D. ABAD',
    'MARIA FRANCES C. CASTRO',
    'GUIA MARIE V. FERNANDEZ',
    'MARY JOYCE ANN C. DAVID',
    'JACKELENE CLAIRE N. DE JESUS',
    'ERICA FE D. HERNANDEZ',
    'JOAINA C. TEODORO',
    'GINA G. CABRERA',
    'NICOLE ANGELA L. PINEDA',
    'KATE D. FLORES',
    'JOVITA M. NICDAO',
  ];

  const optionsDocumentOrigin = [
    'Provincial Office - Aurora',
    'Provincial Office - Bataan',
    'Provincial Office - Bulacan',
    'Provincial Office - Nueva Ecija',
    'Provincial Office - Pampanga',
    'Provincial Office - Tarlac',
    'Provincial Office - Zambales',
    'Provincial Training Center - Baler',
    'Provincial Training Center - Orion',
    'Regional Training Center - Mariveles',
    'Provincial Training Center - Calumpit',
    'Regional Training Center - Guiguinto',
    'Korea-Philippines IT Training Center - Bulacan',
    'Provincial Training Center - Nueva Ecija (Palayan)',
    'Provincial Training Center - Guagua',
    'Gonzalo Puyat School of Arts and Trades (GPSAT)',
    'Provincial Training Center - Tarlac',
    'Concepcion Vocational School (CVS)',
    'Provincial Training Center - Iba'
  ];

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    today;
    setDateCreated(today);
    console.log('Document Date Created: ' + dateCreated);
  }, []);

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
              <Link to="/rejected-docs">
                <li className={activeMenuItem === 1 ? 'active' : ''}>
                  <a href="#" onClick={() => handleMenuItemClick(0)}>
                    <i className="bx bx-task-x"></i>
                    <span className="text">Archived</span>
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
                placeholder="Search document by title..."
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
          <div className="record-docs-section">
            <h1>Record Document Table</h1>
            <hr className="record-docs-break-line" />
            <Link to="#" onClick={toggleModalCreate}>
              <button className="add-record-docs-btn">
                Add Record Documents <i className="bx bx-plus"></i>
              </button>
            </Link>
            <div className="record-docs-table">
              <table>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Source</th>
                    <th>Origin</th>
                    <th>Type</th>
                    <th>R'D Instruction</th>
                    <th>Control No</th>
                    <th>Person Concerned</th>
                    <th>Document Date Created</th>
                    <th>Document Date Received</th>
                    <th>Document Date Completed</th>
                    <th>Mode</th>
                    <th>Description</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recordDocument.length > 0 ? (
                    recordDocument.map((record_docs, index) => (
                      <tr key={index}>
                        <td>{record_docs.title}</td>
                        <td>{record_docs.source}</td>
                        <td>{record_docs.origin}</td>
                        <td>{record_docs.type}</td>
                        <td>{record_docs.rdInstruction}</td>
                        <td>{record_docs.controlNo}</td>
                        <td>{record_docs.personConcern}</td>
                        <td>{record_docs.dateCreated}</td>
                        <td>{record_docs.dateReceived}</td>
                        <td>{record_docs.dateCompleted}</td>
                        <td>{record_docs.mode}</td>
                        <td>{record_docs.description}</td>
                        <td>{record_docs.status}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="10">No record documents found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
        {/* MAIN */}
      </section>
      {modalCreate && (
        <div className="modal-office">
          <div className="overlay" onClick={() => setModalCreate(false)}></div>
          <div className="modal-content-office">
            <span className="close" onClick={() => setModalCreate(false)}>
              &times;
            </span>
            <h2>Create Record Document</h2>
            <form className="form" onSubmit={saveRecDocument}>
              {/* Title */}
              <input
                type="text"
                name="title"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              {/* END */}

              {/* Source */}
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
              {/* END */}

              {/* Origin */}
              <select
                name="origin"
                id="origin"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                required
              >
                <option disabled value="">
                  Select Origin
                </option>
                {optionsDocumentOrigin.map((option) => (
                  <option key={option} value={option} >
                    {option}
                  </option>
                ))}
              </select>
              {/* END */}

              {/* Types */}
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
              {/* END */}

              {/* RD Instruction */}
              <input
                type="text"
                name="rdInstruction"
                placeholder="R'D Instruction"
                value={rdInstruction}
                onChange={(e) => setrdInstruction(e.target.value)}
                required
              />

              {/* END */}

              {/* ControlNo */}
              <input
                type="text"
                name="controlNo"
                value={controlNo}
                onChange={(e) => setControlNo(e.target.value)}
                placeholder="Control No"
              />

              {/* END */}

              {/* Person Concern */}
              <select
                name="personConcern"
                id="personConcern"
                value={personConcern}
                onChange={(e) => setPersonConcern(e.target.value)}
                required
              >
                <option disabled value="">
                  Select Person
                </option>
                {optionsDocumentPersonConcern.map((option) => (
                  <option key={option} value={option} >
                    {option}
                  </option>
                ))}
              </select>
              {/* END */}

              {/* Date Created */}
              <input
                name="date"
                type="text"
                value={dateCreated}
                disabled
              />

              {/* END */}

              {/* Date Received */}
              <input
                type="date"
                name="dateReceived"
                value={dateReceived}
                onChange={(e) => setDateReceived(e.target.value)}
              />

              {/* END */}

              {/* Date Completed */}
              <input
                name="dateCompleted"
                type="date"
                value={dateCompleted}
                onChange={(e) => setDateCompleted(e.target.value)}
              />
              {/* END */}

              {/* Mode */}
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

              {/* END */}

              {/* Recipient */}
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
              {/* END */}

              {/* Action */}
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
              {/* END */}

              {/* Remarks */}
              <input
                type="text"
                name="remarks"
                placeholder="Remarks"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                required
              />
              {/* END */}

              {/* Description */}
              <textarea
                className="input"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                cols={70}
                placeholder="Enter the description"
                required
              />
              {/* END */}

              {/* Attachment */}
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
              {/* END */}
              <button className="docs-btn-submit" type="submit">
                Create Record Document
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
            <h2>Edit Record Document</h2>
            <form className="form" onSubmit={editRecDocument}>
              {/* Title */}
              <input
                type="text"
                name="title"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              {/* END */}

              {/* Source */}
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
              {/* END */}

              {/* Origin */}
              <select
                name="origin"
                id="origin"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                required
              >
                <option disabled value="">
                  Select Origin
                </option>
                {optionsDocumentOrigin.map((option) => (
                  <option key={option} value={option} >
                    {option}
                  </option>
                ))}
              </select>
              {/* END */}

              {/* Types */}
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
              {/* END */}

              {/* RD Instruction */}
              <input
                type="text"
                name="rdInstruction"
                placeholder="R'D Instruction"
                value={rdInstruction}
                onChange={(e) => setrdInstruction(e.target.value)}
                required
              />

              {/* END */}

              {/* ControlNo */}
              <input
                type="text"
                name="controlNo"
                value={controlNo}
                onChange={(e) => setControlNo(e.target.value)}
                placeholder="Control No"
              />

              {/* END */}

              {/* Person Concern */}
              <select
                name="personConcern"
                id="personConcern"
                value={personConcern}
                onChange={(e) => setPersonConcern(e.target.value)}
                required
              >
                <option disabled value="">
                  Select Person
                </option>
                {optionsDocumentPersonConcern.map((option) => (
                  <option key={option} value={option} >
                    {option}
                  </option>
                ))}
              </select>
              {/* END */}

              {/* Date Created */}
              <input
                name="date"
                type="text"
                value={dateCreated}
                disabled
              />

              {/* END */}

              {/* Date Received */}
              <input
                type="date"
                name="dateReceived"
                value={dateReceived}
                onChange={(e) => setDateReceived(e.target.value)}
              />

              {/* END */}

              {/* Date Completed */}
              <input
                name="dateCompleted"
                type="date"
                value={dateCompleted}
                onChange={(e) => setDateCompleted(e.target.value)}
              />
              {/* END */}

              {/* Mode */}
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

              {/* END */}

              {/* Recipient */}
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
              {/* END */}

              {/* Action */}
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
              {/* END */}

              {/* Remarks */}
              <input
                type="text"
                name="remarks"
                placeholder="Remarks"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                required
              />
              {/* END */}

              {/* Description */}
              <textarea
                className="input"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                cols={70}
                placeholder="Enter the description"
                required
              />
              {/* END */}

              {/* Attachment */}
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
              {/* END */}
              <button className="docs-btn-update" type="submit">
                Update Record Document
              </button>
            </form>
          </div>
        </div>
      )}
      <ToastContainer />
    </>
  );
};

export default RecordDocument;