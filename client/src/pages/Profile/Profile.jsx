/* eslint-disable react/prop-types */
import './Profile.css';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../../assets/logo/logo.png';
import { API_URL } from '../../config.js';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Profile = ({ normalAccount }) => {
  const [loggedInAccount, setLoggedInAccount] = useState(null);
  const [formData, setFormData] = useState({
    account_firstName: '',
    account_lastName: '',
    account_contactNo: '',
    currentPassword: '',
    newPassword: '',
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

  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [passwordVisible1, setPasswordVisible1] = useState(false);
  const [passwordVisible2, setPasswordVisible2] = useState(false);

  useEffect(() => {
    const getUsernameForData = async () => {
      if (!normalAccount || !normalAccount.email) {
        console.error('Normal account or email is not defined');
        return;
      }

      const normalAccount_email = normalAccount.email;

      try {
        const response = await axios.get(
          `${API_URL}/account/${normalAccount_email}`
        );
        setLoggedInAccount(response.data);
        setFormData({
          account_firstName: response.data.account_firstName || '',
          account_lastName: response.data.account_lastName || '',
          account_contactNo: response.data.account_contactNo || '',
          currentPassword: '',
          newPassword: '',
        });
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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `${API_URL}/account/${formData.account_email}`,
        formData
      );
      toast.success('Successfully updating profile', toastConfig);
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('Error updating profile:', error);
      if (error.response.data) {
        if (error.response.data.message) {
          toast.error('Current password is incorrect', toastConfig);
        } else {
          toast.error(
            error.response.data.message ||
              'An error occurred while updating the profile.',
            toastConfig
          );
        }
      } else {
        toast.error(
          'An error occurred while updating the profile.',
          toastConfig
        );
      }
    }
  };

  const togglePassword1 = () => {
    setPasswordVisible1(!formData.passwordVisible1);
  };

  const togglePassword2 = () => {
    setPasswordVisible2(!passwordVisible2);
  };

  useEffect(() => {
    document.title = 'Account';
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

  return (
    <section id="profile-content">
      <nav>
        <Link to={'https://e-tesda.gov.ph/'} className="logo">
          <img src={Logo} width={35} height={35} />
        </Link>
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
              ></i>
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
        <div className="container-account-form">
          <div className="account-form">
            <div className="account-container">
              <div className="account-content">
                <form onSubmit={handleSubmit}>
                  <h3>
                    My Profile <i id="info" className="bx bx-info-circle"></i>
                  </h3>
                  <div className="account-form-field">
                    <div className="account-inputBox">
                      <input
                        type="text"
                        name="account_firstName"
                        required
                        value={
                          formData.account_firstName || ''
                        }
                        onChange={handleChange}
                      />
                      <i>First Name </i>
                    </div>

                    <div className="account-inputBox">
                      <input
                        type="text"
                        name="account_lastName"
                        required
                        value={
                          formData.account_lastName || ''
                        }
                        onChange={handleChange}
                      />
                      <i>Last Name </i>
                    </div>

                    <div className="account-inputBox">
                      <input
                        type="text"
                        name="account_contactNo"
                        required
                        value={formData.account_contactNo}
                        onChange={handleChange}
                      />
                      <i>Phone Number</i>
                    </div>

                    <div className="edit-save-account">
                      <button type="submit">Save</button>
                    </div>
                  </div>

                  <h3>
                    Password <i id="info" className="bx bx-info-circle"></i>
                  </h3>

                  <div className="account-form-field">
                    <div className="account-inputBox">
                      <input
                        type={passwordVisible1 ? 'text' : 'password'}
                        name="currentPassword"
                        value={formData.currentPassword}
                        onChange={handleChange}
                      />
                      <i>Current Password </i>
                      <span className="show-password">
                        <i
                          className={`bx ${
                            passwordVisible1 ? 'bx-low-vision' : 'bx-show'
                          }`}
                          onClick={togglePassword1}
                        ></i>
                      </span>
                    </div>

                    <div className="account-inputBox">
                      <input
                        type={passwordVisible2 ? 'text' : 'password'}
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleChange}
                      />
                      <i>New Password</i>
                      <span className="show-password">
                        <i
                          className={`bx ${
                            passwordVisible2 ? 'bx-low-vision' : 'bx-show'
                          }`}
                          onClick={togglePassword2}
                        ></i>
                      </span>
                    </div>
                    <div className="edit-save-account">
                      <button type="submit">Save</button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>
      <ToastContainer />
    </section>
  );
};

export default Profile;