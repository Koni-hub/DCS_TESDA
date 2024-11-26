/* eslint-disable react/prop-types */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/no-unescaped-entities */
import './Document.css';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import logo from '../../assets/logo/logo.png';
import { API_URL } from '../../config.js';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DOMPurify from 'dompurify';

const Document = ({ normalAccount, googleAccount }) => {
  document.title = 'Document';

  const [, setDocuments] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [allDocuments, setAllDocuments] = useState([]);
  const [filterDocuments, setFilterDocuments] = useState([]);

  const getAllDocuments = async () => {
    try {
      const response = await axios.get(`${API_URL}/documents`);
      setFilterDocuments(response.data);
      setAllDocuments(response.data);
    } catch (error) {
      console.log('Error fetching docouments', error);
    }
  };

  const [modalCreate, setModalCreate] = useState(false);
  const [modalUpdate, setModalUpdate] = useState(false);

  // Document Information State
  const [, setNo] = useState('');
  const [documentTitle, setDocumentTitle] = useState('');
  const [documentOrigin, setDocumentOrigin] = useState('');
  const [controlNo, setControlNo] = useState('');
  const [documentType, setDocumentType] = useState('');
  const [rdInstruction, setrdInstruction] = useState('');
  const [personConcern, setPersonConcern] = useState('');
  const [dateReceived, setDateReceived] = useState(new Date());
  const [dateCreated, setDateCreated] = useState(new Date().toISOString().split('T')[0]);
  const [dateDeadline, setDateDeadline] = useState('');
  const [dateCompleted, setDateCompleted] = useState(new Date());
  const [actionTaken, setActionTaken] = useState('');
  const [isSideDropDownOpen, setSideDropDownOpen] = useState(false);
  
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
      (today);
      setDateCreated(today);
    console.log('Document Date Created: ' + dateCreated);
  }, []);

  // -- END

  // Modal Toggle Create Document
  const toggleModalCreate = () => {
    setNo('');
    setDocumentTitle('');
    setDocumentOrigin('');
    setControlNo('');
    setDocumentType('');
    setrdInstruction();
    setPersonConcern('');
    setDateReceived('');
    setDateDeadline('');
    setDateCompleted('');
    setActionTaken('');
    setModalCreate(!modalCreate);
  };
  // -- END

  const getDocumentById = async (documentID) => {
    const response = await axios.get(`${API_URL}/documents/${documentID}`);
    const document = response.data;
    setNo(document.No);
    setDateReceived(document.dateReceived);
    setDocumentType(document.documentType);
    setDocumentOrigin(document.documentOrigin);
    setControlNo(document.controlNo);
    setDocumentTitle(document.documentTitle);
    setDateCreated(document.dateCreated);
    setDateDeadline(document.dateDeadline);
    setrdInstruction(document.rdInstruction);
    setPersonConcern(document.personConcern);
    setActionTaken(document.actionTaken);
    setDateCompleted(document.dateCompleted);
  };

  const [selectedDocumentId, setSelectedDocumentId] = useState(null);

  // Function to toggle the update product modal
  const toggleModalUpdate = async (documentID) => {
    setSelectedDocumentId(documentID);
    setModalUpdate(!modalUpdate);
    if (documentID) {
      await getDocumentById(documentID);
    }
  };
  // -- END

  const handleDropdownSidebar = () => {
    setSideDropDownOpen(!isSideDropDownOpen);
  };

  // Creating Document
  const createDocument = async (e) => {
    e.preventDefault();
    const userName = normalAccount?.username || googleAccount.profile.emails[0].value;
    const fullName = normalAccount.fullname || null;


    console.log('Username: ', userName);
    const formData = {
      documentTitle,
      documentOrigin,
      controlNo,
      documentType,
      rdInstruction,
      personConcern,
      dateReceived,
      dateCreated,
      dateDeadline,
      dateCompleted,
      actionTaken,
    };

    // Convert empty date fields to null
    const convertEmptyDatesToNull = (data) => {
      const dateFields = [
        'dateReceived',
        'dateCreated',
        'dateDeadline',
        'dateCompleted',
      ];
      dateFields.forEach((field) => {
        if (!data[field] || data[field] === 'Invalid date') {
          data[field] = null;
        }
      });
      return data;
    };

    const sanitizedFormData = convertEmptyDatesToNull(formData);

    console.log(sanitizedFormData);

    try {
      await axios.post(`${API_URL}/documents`, formData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Create Audit Log
      const auditLogData = {
        userName,
        fullName,
        action: `Created document with control number ${controlNo}`,
      };

      await axios.post(`${API_URL}/audit-logs`, auditLogData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      toast.success('Document created Successfully', toastConfig);
      getAllDocuments();
      toggleModalCreate();
    } catch (error) {
      console.error('Error creating document', error);
      toast.error('Error creating document', toastConfig);
    }
  };
  // -- END

  // Updating Document
  const updateDocument = async (e) => {
    e.preventDefault();
    const userName = normalAccount?.username || googleAccount.profile.emails[0].value;
    const fullName = normalAccount.fullname || null;

    console.log('FullName is this', normalAccount.fullname);

    const formData = {
      documentTitle,
      documentOrigin,
      controlNo,
      documentType,
      rdInstruction,
      personConcern,
      dateReceived,
      dateCreated,
      dateDeadline,
      dateCompleted,
      actionTaken,
    };

    // Convert empty date fields to null
    const convertEmptyDatesToNull = (data) => {
      const dateFields = [
        'dateReceived',
        'dateCreated',
        'dateDeadline',
        'dateCompleted',
      ];
      dateFields.forEach((field) => {
        if (!data[field] || data[field] === 'Invalid date') {
          data[field] = null;
        }
      });
      return data;
    };

    const sanitizedFormData = convertEmptyDatesToNull(formData);

    console.log(sanitizedFormData);

    try {
      await axios.patch(
        `${API_URL}/documents/${selectedDocumentId}`,
        formData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      // Update Audit Log
      const auditLogData = {
        userName,
        fullName,
        action: `Updated document with control number ${controlNo}`,
      };

      await axios.post(`${API_URL}/audit-logs`, auditLogData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      toast.success('Document updated Successfully', toastConfig);
      getAllDocuments();
      toggleModalUpdate(null);
    } catch (error) {
      console.error('Error updating document', error);
      toast.error('Error updating document', toastConfig);
    }
  };
  // -- END

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
    console.log('Select Role: ', role);
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
  
  // Update document status to 'rejected'
  const rejectDocument = async (documentId) => {
    const userName = normalAccount?.username || googleAccount.profile.emails[0].value;
    const fullName = normalAccount.fullname || null;

    const confirmation = confirm('Are you sure you want to reject this document ' + documentId + '?');
    
    if (!confirmation) {
      return;
    }
    
    try {
      // Fetch the document data
      const response = await axios.get(`${API_URL}/documents/${documentId}`);
      const documentData = response.data;
  
      console.log('Document Data', documentData);
    
      // Backup the document in the 'rejected-documents' section
      await axios.post(`${API_URL}/rejected-documents/${documentData.No}`, {
        No: documentData.No,
        dateReceived: documentData.dateReceived,
        documentType: documentData.documentType,
        documentOrigin: documentData.documentOrigin,
        controlNo: documentData.controlNo,
        documentTitle: documentData.documentTitle,
        dateCreated: documentData.dateCreated,
        dateDeadline: documentData.dateDeadline,
        rdInstruction: documentData.rdInstruction,
        personConcern: documentData.personConcern,
        actionTaken: documentData.actionTaken,
        dateCompleted: documentData.dateCompleted,
        status: 'Archive' // Set status to 'Rejected'
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
    
      // Update the original document status to 'Rejected'
      await axios.patch(`${API_URL}/documents/${documentId}`, {
        status: 'Archive',
      });
      
      // Update Audit Log
      const auditLogData = {
        userName,
        fullName,
        action: `Reject and backup document with control number ${controlNo}`,
      };

      await axios.post(`${API_URL}/audit-logs`, auditLogData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
    
      setDocuments((prevDocs) =>
        prevDocs.map((document) =>
          document.id === documentId ? { ...document, status: 'Archive' } : document
        )
      );
    
      toast.success('Document successfully rejected and backed up', toastConfig);
    
    } catch (error) {
      toast.error('Failed to reject the document', toastConfig);
      console.error('Error rejecting document:', error);
    }
  };

  // Event handler for clicking the trash icon
  const handleRejectClick = async (documentId) => {
    console.log('Document ID: ', documentId);
    try {
        const response = await axios.get(`${API_URL}/documents/${documentId}`);
        const documentData = response.data;
        console.log('Response Rejected: ', documentData);

        // Check if any field in the documentData is empty
        const hasEmptyField = Object.values(documentData).some(field => field === '' || field === null || field === undefined);

        if (!hasEmptyField) {
            toast.error('The document has been finished and cannot be rejected.');
        } else {
            rejectDocument(documentId);
        }
    } catch (error) {
        toast.error('Failed to reject the document', toastConfig);
        console.error('Error rejecting document', error);
    }
  };

  const [pendingCount, setPendingCount] = useState(0);
  const [, setCompletedCount] = useState(0);
  const [, setRejectedCount] = useState(0);

  // Helper functions to update document status
  const updateDocumentStatus = async (documentId, status) => {
    try {
        await axios.patch(`${API_URL}/documents/${documentId}`, { status });
        setDocuments(prevDocs =>
            prevDocs.map(doc =>
                doc.id === documentId ? { ...doc, status } : doc
            )
        );
    } catch (error) {
        console.error('Error updating document status:', error);
    }
  };

  // Logic for checking document status
  const isRejected = async (documentId, document) => {
    if (document.status === 'Archive') {
        await updateDocumentStatus(documentId, 'Archive');
        return true;
    }
    return false;
  };

  const isPending = async (documentId, document) => {
    if (document.status !== 'Archive' && Object.values(document).some(field => field === '' || field === null)) {
        await updateDocumentStatus(documentId, 'Pending');
        return true;
    }
    return false;
};


  const isCompleted = async (documentId, document) => {
    if (Object.values(document).every(field => field !== '' && field !== null)) {
        await updateDocumentStatus(documentId, 'Completed');
        return true;
    }
    return false;
  };

  // Main document checker
  const documentChecker = async () => {
    console.log('Starting document check...');

    const rejectedDocuments = await Promise.all(
        allDocuments.map(async (doc) => {
            if (doc.No) return isRejected(doc.No, doc);
        })
    );

    const completedDocuments = await Promise.all(
        allDocuments.map(async (doc) => {
            if (doc.No) return isCompleted(doc.No, doc);
        })
    );

    const pendingDocuments = await Promise.all(
        allDocuments.map(async (doc) => {
            if (doc.No) return isPending(doc.No, doc);
        })
    );

    // Update counts
    const pendingCount = pendingDocuments.filter(Boolean).length;
    console.log('Pending count:', pendingCount);
    setPendingCount(pendingCount);

    const completedCount = completedDocuments.filter(Boolean).length;
    console.log('Completed count:', completedCount);
    setCompletedCount(completedCount);

    const rejectedCount = rejectedDocuments.filter(Boolean).length;
    console.log('Rejected count:', rejectedCount);
    setRejectedCount(rejectedCount); // Fixed variable to setRejectedCount
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
    const sanitizedQuery = DOMPurify.sanitize(query)
    setSearchQuery(sanitizedQuery);
    filterDocumentsList(query);
  };

  const filterDocumentsList = (query) => {
    if (query.trim() === '') {
      setFilterDocuments(allDocuments); // Reset to original documents if searchQuery is empty
    } else {
      setFilterDocuments(
        allDocuments.filter((doc) =>
          doc.No.toLowerCase().includes(query.toLowerCase())
        )
      );
    }
  };

  // Status Cchecker

  const getStatusChecker = (dateCreated) => {
    if (!dateCreated) return '';
  
    const createdDate = new Date(dateCreated);
    const today = new Date();
    const diffTime = today - createdDate; // Swap to get positive diff
    const diffMonths = diffTime / (1000 * 60 * 60 * 24 * 30);
    if (diffMonths < 2) {
      return 'status-green'; // Within 1-2 months
    } else if (diffMonths < 5) {
      return 'status-yellow'; // Within 4-5 months
    } else {
      return 'status-red'; // More than 5 months
    }
  };
  
  const optionsDocumentType = [
    'MEMORANDUM CIRCULAR',
    'MEMORANDUM',
    'TESDA ORDER',
    'OFFICE ORDER',
    'CIRCULAR',
    'BULLETIN',
    'CLUSTER ORDER',
    'ADVISORY',
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
    'JOVITA M. NICDAO'
  ];

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
          <div className="document-section">
            <div className="display-status-document">
              <h1>Document Table</h1>
              <div className='display-container-document'>
                <div className="green-date">
                  <p>1-2 Months</p>
                </div>
                <div className="yellow-date">
                  <p>2-5 Months</p>
                </div>
                <div className="red-date">
                  <p>5+ Months</p>
                </div>
              </div>
            </div>
            <hr className="document-break-line" />
            <button className="add-doc-btn" onClick={toggleModalCreate}>
              Add Document <i className="bx bx-plus"></i>
            </button>{' '}
            {/* navigate to the add docs page form  = Data Entry */}
            <div className="document-table">
              <table>
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Date Received</th>
                    <th>Type</th>
                    <th>Origin</th>
                    <th>Control No</th>
                    <th>Title</th>
                    <th>Date Created</th>
                    <th>Date Deadline</th>
                    <th>RD's Instruction</th>
                    <th>Person Concerned</th>
                    <th>Action Taken</th>
                    <th>Date Completed</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filterDocuments.length > 0 ? (
                    filterDocuments.map((document, index) => (
                      <tr key={index} className={getStatusChecker(document.dateCreated)}>
                        <td>{document.No}</td>
                        <td>{formatDate(document.dateReceived)}</td>
                        <td>{document.documentType}</td>
                        <td>{document.documentOrigin}</td>
                        <td>{document.controlNo}</td>
                        <td>{document.documentTitle}</td>
                        <td>{formatDate(document.dateCreated)}</td>
                        <td>{document.dateDeadline}</td>
                        <td>{document.rdInstruction}</td>
                        <td>{document.personConcern}</td>
                        <td>{document.actionTaken}</td>
                        <td>{formatDate(document.dateCompleted)}</td>
                        <td>{document.status}</td>
                        <td className="action-icons">
                          <i
                            id="bx-edit"
                            className="bx bx-edit"
                            onClick={() => toggleModalUpdate(document.No)}
                            title="Edit"
                          ></i>
                          <i
                            id="bx-trash"
                            className="bx bx-x-circle"
                            onClick={() => handleRejectClick(document.No)}
                            title="Reject"
                          ></i>
                          <Link to={`/viewDocument/${document.No}`}>
                            <i
                              id="bx-view"
                              className="bx bx-show-alt"
                              title="View"
                            ></i>
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="9">No Documents found.</td>
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
        <div className="modal">
          <div onClick={toggleModalCreate} className="overlay"></div>
          <div className="modal-document">
            <h1>Add Document</h1>
            <hr></hr>
            <form className="form" onSubmit={createDocument}>
              <div className="form-grid">
                <div className="first-row">
                  <label>
                    Title<span>*</span>
                  </label>{' '}
                  <br></br>
                  <input
                    className="input"
                    type="text"
                    value={documentTitle}
                    onChange={(e) => setDocumentTitle(e.target.value)}
                    placeholder="Ex. After Activity Report: CTEC Forum"
                    required
                  />
                  <br />
                  <br />
                  {/* <h5 >Validation Text</h5> */}
                  <label>
                    RD's Instruction<span>*</span>
                  </label>
                  <input
                    className="input"
                    type="text"
                    value={rdInstruction}
                    onChange={(e) => setrdInstruction(e.target.value)}
                    placeholder="Ex. for report"
                  />
                  <br />
                  <br />
                  {/* <h5 >Validation Text</h5> */}
                  <label>
                    Document Date Created<span>*</span>
                  </label>
                  <input
                    className="input"
                    type="text"
                    value={dateCreated}
                    disabled
                  />
                  <br />
                  <br />
                  {/* <h5 >Validation Text</h5> */}
                </div>
                <div className="second-row">
                  <label>
                    Origin<span>*</span>
                  </label>{' '}
                  <br></br>
                  <select
                    className="input"
                    type="text"
                    value={documentOrigin}
                    onChange={(e) => setDocumentOrigin(e.target.value)}
                    required
                  >
                    <option value="" disabled>
                      Ex. ODDG-PP
                    </option>
                    {optionsDocumentOrigin.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <br />
                  <br />
                  <label>
                    Control No<span>*</span>
                  </label>{' '}
                  <br></br>
                  <input
                    className="input"
                    type="text"
                    value={controlNo}
                    onChange={(e) => setControlNo(e.target.value)}
                    placeholder="Ex. Memo No. 001 s.2024"
                    required
                  />
                  <br />
                  <br />
                  <label>
                    Document Date Received<span>*</span>
                  </label>
                  <input
                    className="input"
                    type="date"
                    value={dateReceived}
                    onChange={(e) => setDateReceived(e.target.value)}
                    required
                  />
                  <br />
                  <br />
                  {/* <h5 >Validation Text</h5> */}
                </div>
                <div className="third-row">
                  <label>
                    Type<span>*</span>
                  </label>{' '}
                  <br></br>
                  <select
                    className="input"
                    value={documentType}
                    onChange={(e) => setDocumentType(e.target.value)}
                    required
                  >
                    <option value="" disabled>
                      Ex. Memo
                    </option>
                    {optionsDocumentType.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <br />
                  <br />
                  {/* <h5 >Validation Text</h5> */}
                  <label>
                    Person Concerned<span>*</span>  
                  </label>{' '}
                  <br></br>
                  <select
                    className="input"
                    type="text"
                    value={personConcern}
                    onChange={(e) => setPersonConcern(e.target.value)}
                  >
                    <option value="" disabled>
                      Ex. Joyce
                    </option>
                    {optionsDocumentPersonConcern.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <br />
                  <br />
                  <label>
                    Deadline / Action / Effectivety Date<span>*</span>
                  </label>
                  <input
                    className="input"
                    type="text"
                    value={dateDeadline}
                    onChange={(e) => setDateDeadline(e.target.value)}
                    placeholder="Ex. January 18, 2024, via google meet"
                  />
                  <br />
                  <br />
                  {/* <h5 >Validation Text</h5> */}
                </div>
                <div className="fourth-row">
                  {/* <h5 >Validation Text</h5> */}
                  <label>
                    Date Completed<span>*</span>
                  </label>{' '}
                  <br></br>
                  <input
                    className="input"
                    type="date"
                    value={dateCompleted}
                    onChange={(e) => setDateCompleted(e.target.value)}
                    placeholder="Sample Date Completed"
                  />
                  <br />
                  <br />
                  {/* <h5 >Validation Text</h5> */}
                </div>
              </div>
              <div className="document-description">
                <label>
                  Action Taken<span>*</span>
                </label>{' '}
                <br></br>
                <textarea
                  className="input"
                  value={actionTaken}
                  onChange={(e) => setActionTaken(e.target.value)}
                  rows={5}
                  cols={70}
                  placeholder="Enter the description"
                />
              </div>
              <br></br>
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
            <h1>Update Document</h1>
            <hr></hr>
            <form className="form" onSubmit={updateDocument}>
              <div className="form-grid">
                <div className="first-row">
                  <label>
                    Title<span>*</span>
                  </label>{' '}
                  <br></br>
                  <input
                    className="input"
                    type="text"
                    value={documentTitle}
                    onChange={(e) => setDocumentTitle(e.target.value)}
                    placeholder="Ex. After Activity Report: CTEC Forum"
                    required
                  />
                  <br />
                  <br />
                  {/* <h5 >Validation Text</h5> */}
                  <label>
                    RD's Instruction<span>*</span>
                  </label>
                  <input
                    className="input"
                    type="text"
                    value={rdInstruction}
                    onChange={(e) => setrdInstruction(e.target.value)}
                    placeholder="Ex. for report"
                  />
                  <br />
                  <br />
                  {/* <h5 >Validation Text</h5> */}
                  <label>
                    Document Date Created<span></span>
                  </label>
                  <input
                    className="input"
                    type="text"
                    value={dateCompleted}
                    disabled
                  />
                  <br />
                  <br />
                  {/* <h5 >Validation Text</h5> */}
                </div>
                <div className="second-row">
                  <label>
                    Origin<span>*</span>
                  </label>{' '}
                  <br></br>
                  <select
                    className="input"
                    type="text"
                    value={documentOrigin}
                    onChange={(e) => setDocumentOrigin(e.target.value)}
                    required
                  >
                    <option value="" disabled>
                    Ex. ODDG-PP
                    </option>
                    {optionsDocumentOrigin.map((option) => (
                      <option key={option} value={option} >
                        {option}
                      </option>
                    ))}
                  </select>
                  <br />
                  <br />
                  <label>
                    Control No<span>*</span>
                  </label>{' '}
                  <br></br>
                  <input
                    className="input"
                    type="text"
                    value={controlNo}
                    onChange={(e) => setControlNo(e.target.value)}
                    placeholder="Ex. Memo No. 001 s.2024"
                    required
                  />
                  <br />
                  <br />
                  <label>
                    Document Date Received<span>*</span>
                  </label>
                  <input
                    className="input"
                    type="date"
                    value={dateReceived}
                    onChange={(e) => setDateReceived(e.target.value)}
                    required
                  />
                  <br />
                  <br />
                  {/* <h5 >Validation Text</h5> */}
                </div>
                <div className="third-row">
                  <label>
                    Type<span>*</span>
                  </label>{' '}
                  <br></br>
                  <select
                    className="input"
                    value={documentType}
                    onChange={(e) => setDocumentType(e.target.value)}
                    required
                  >
                    <option value="" disabled>
                      Ex. Memo
                    </option>
                    {optionsDocumentType.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <br />
                  <br />
                  {/* <h5 >Validation Text</h5> */}
                  <label>
                    Person Concerned<span>*</span>
                  </label>{' '}
                  <br></br>
                  <select
                    className="input"
                    type="text"
                    value={personConcern}
                    onChange={(e) => setPersonConcern(e.target.value)}
                  >
                    <option value="" disabled>
                      Ex. Joyce
                    </option>
                    {optionsDocumentPersonConcern.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <br />
                  <br />
                  <label>
                    Deadline / Action / Effectivety Date<span>*</span>
                  </label>
                  <input
                    className="input"
                    type="text"
                    value={dateDeadline}
                    onChange={(e) => setDateDeadline(e.target.value)}
                    placeholder="Ex. January 18, 2024, via google meet"
                  />
                  <br />
                  <br />
                  {/* <h5 >Validation Text</h5> */}
                </div>
                <div className="fourth-row">
                  {/* <h5 >Validation Text</h5> */}
                  <label>
                    Date Completed<span>*</span>
                  </label>{' '}
                  <br></br>
                  <input
                    className="input"
                    type="date"
                    value={dateCompleted}
                    onChange={(e) => setDateCompleted(e.target.value)}
                    placeholder="Sample Date Completed"
                  />
                  <br />
                  <br />
                  {/* <h5 >Validation Text</h5> */}
                </div>
              </div>
              <div className="document-description">
                <label>
                  Action Taken<span>*</span>
                </label>{' '}
                <br></br>
                <textarea
                  className="input"
                  value={actionTaken}
                  onChange={(e) => setActionTaken(e.target.value)}
                  rows={5}
                  cols={70}
                  placeholder="Enter the description"
                />
              </div>
              <br></br>
              <div className="btn-container">
                <button
                  type="button"
                  className="document-btn-cancel"
                  onClick={toggleModalUpdate}
                >
                  Discard
                </button>
                <button type="submit" className="document-btn-submit">
                  Submit
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

export default Document;
