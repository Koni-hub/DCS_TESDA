/* eslint-disable react/prop-types */
/* eslint-disable react/no-unescaped-entities */
import './ViewDocument.css';
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API_URL } from '../../config.js';
import axios from 'axios';
import 'react-toastify/dist/ReactToastify.css';

const ViewDocument = ({ normalAccount, googleAccount }) => {
  document.title = 'View Document';

  const { No } = useParams();

  useEffect(() => {
    const currentUrl = window.location.href;
    console.log(`Here is the current URL: ${currentUrl}`);
    console.log(`Here is the current URL parameter: ${No}`);
  }, []);

  const [documents, setDocuments] = useState([]);

  const getDocumentById = async (DocNo) => {
    try {
      const DocNo = No;
      const response = await axios.get(`${API_URL}/documents/${DocNo}`);
      console.log('ID: ' + DocNo);
      console.log('Document Info: ', response.data);
      setDocuments(response.data);
    } catch (error) {
      console.log('Error fetching document ID ' + DocNo);
    }
  };

  useEffect(() => {
    getDocumentById();
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
    if (role && role !== 'Admin') {
      navigate('/forbidden');
    } else {
      console.log('Role:', role || 'not defined yet');
    }
  }, [role, navigate]);

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
      hour: '2-digit',
      minute: '2-digit',
    };
    return date.toLocaleDateString('en-US', options);
  };

  // -- END

  return (
    <>
      <section id="view-document-content">
        {/* NAVBAR */}
        <nav>
          <Link to="/document">
            <h1>
              <i className="bx bx-arrow-back"></i> Go back
            </h1>
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
        <main>
          <form className="form">
            <div className="form-grid">
              <div className="first-row">
                <label>
                  Title of Documents<span>*</span>
                </label>{' '}
                <br></br>
                <input
                  className="input"
                  type="text"
                  value={documents.No}
                  readOnly
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
                  value={documents.rdInstruction}
                  placeholder="Ex. for report"
                  readOnly
                />
                <br />
                <br />
                {/* <h5 >Validation Text</h5> */}
                <label>
                  Document Date Created<span>*</span>
                </label>
                <input
                  className="input"
                  type="input"
                  value={formatDate(documents.dateCreated)}
                  readOnly
                />
                <br />
                <br />
                {/* <h5 >Validation Text</h5> */}
              </div>
              <div className="second-row">
                <label>
                  Origin of Document<span>*</span>
                </label>{' '}
                <br></br>
                <input
                  className="input"
                  type="text"
                  value={documents.documentOrigin}
                  placeholder="Ex. ODDG-PP"
                  readOnly
                />
                <br />
                <br />
                <label>
                  Control No<span>*</span>
                </label>{' '}
                <br></br>
                <input
                  className="input"
                  type="text"
                  value={documents.controlNo}
                  placeholder="Ex. Memo No. 001 s.2024"
                  readOnly
                />
                <br />
                <br />
                <label>
                  Document Date Received<span>*</span>
                </label>
                <input
                  className="input"
                  type="input"
                  value={formatDate(documents.dateReceived)}
                  readOnly
                />
                <br />
                <br />
                {/* <h5 >Validation Text</h5> */}
              </div>
              <div className="third-row">
                <label>
                  Type of Documents<span>*</span>
                </label>{' '}
                <br></br>
                <input
                  className="input"
                  type="text"
                  value={documents.documentType}
                  placeholder="Sample Type"
                  readOnly
                />
                <br />
                <br />
                {/* <h5 >Validation Text</h5> */}
                <label>
                  Person Concern<span>*</span>
                </label>{' '}
                <br></br>
                <input
                  className="input"
                  type="text"
                  value={documents.personConcern}
                  placeholder="Ex. Joyce"
                  readOnly
                />
                <br />
                <br />
                <label>
                  Deadline / Action / Effectivety Date<span>*</span>
                </label>
                <input
                  className="input"
                  type="text"
                  value={documents.dateDeadline}
                  placeholder="Ex. January 18, 2024, via google meet"
                  readOnly
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
                  type="input"
                  value={formatDate(documents.dateCompleted)}
                  placeholder="Sample Date Completed"
                  readOnly
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
                value={documents.actionTaken}
                rows={5}
                cols={70}
                placeholder="Enter the description"
                readOnly
              />
            </div>
          </form>
        </main>
      </section>
    </>
  );
};

export default ViewDocument;
