/* eslint-disable react/prop-types */
import './Register.css';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import logo from '../../assets/logo/logo.png';
import { API_URL } from '../../config.js';

const Register = ({normalAccount}) => {
  const [role, setRole] = useState(null);

  const navigate = useNavigate();

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

  useEffect(() => {
    const getUsernameForData = async () => {
      if (!normalAccount.normalAccount || !normalAccount.normalAccount.email) {
        console.error('Normal account or email is not defined');
        return;
      }


      try {
        const createdBy = normalAccount.normalAccount.role;
        setRole(createdBy);
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

  useEffect(() => {
    if (role && role !== 'Admin' && role === 'System') {
      navigate('/forbidden');
    } else {
      console.error('Role:', role || 'not defined yet');
    }
  }, [role, navigate]);

  const [verifyPassword, setVerifyPassword] = useState('');

  const [formData, setFormData] = useState({
    account_username: '',
    account_firstName: '',
    account_lastName: '',
    account_email: '',
    account_password: '',
    account_contactNo: '',
    account_role: '',
    origin: '',
    isAccountVerified: false,
  });

  const toastConfig = {
    position: 'top-center',
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: 'light',
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };


  const validateInputs = () => {
    const {
      account_username,
      account_email,
      account_password,
      account_firstName,
      account_lastName,
      account_contactNo,
      account_role,
    } = formData;

    if (!/^\d{1,8}$/.test(account_username)) {
      toast.error(
        'Employee ID must be numeric and exactly 8 characters long.',
        toastConfig
      );
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(account_email)) {
      toast.error('Please enter a valid email address.', toastConfig);
      return false;
    }

    if (!account_firstName || account_firstName.length > 30) {
      toast.error('First Name must be 30 characters or less.', toastConfig);
      return false;
    }

    if (!account_lastName || account_lastName.length > 30) {
      toast.error('Last Name must be 30 characters or less.', toastConfig);
      return false;
    }

    const phoneRegex = /^\d{11}$/;
    if (!account_contactNo || !phoneRegex.test(account_contactNo)) {
      toast.error('Mobile Number must be 11 digits.', toastConfig);
      return false;
    }

    if (!account_role) {
      toast.error('Role must be not empty');
      return false;
    }

    const passwordRegex = /^(?=.*[!@#$%^&*])(?=.*[A-Z]).{16,}$/;
    if (!passwordRegex.test(account_password)) {
      toast.error(
        'Password must be 16 characters minimum, include at least one uppercase letter and one special character.',
        toastConfig
      );
      return false;
    }

    if (account_password !== verifyPassword) {
      toast.error('Passwords do not match.', toastConfig);
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateInputs()) {
      return;
    }

    try {
      const userName = normalAccount.normalAccount.username;
      const fullName = normalAccount.normalAccount.fullname || null;

      await axios.post(`${API_URL}/register`, formData);
      const auditLogData = {
        userName,
        fullName,
        action: `Created account by ID ${userName}`,
      };

      await axios.post(`${API_URL}/audit-logs`, auditLogData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      toast.success('Successfully registered user', toastConfig);
      setTimeout(() => {
        navigate('/');
      }, 2100);
    } catch (error) {
      if (error.response) {
        toast.error(
          error.response.data.message || 'Error registering user',
          toastConfig
        );
      } else if (error.request) {
        toast.error(
          'No response from server. Please try again later.',
          toastConfig
        );
      } else {
        toast.error('An error occurred. Please try again later.', toastConfig);
      }
      console.error('Error registering user:', error);
    }
  };

  const [passwordVisible1, setPasswordVisible1] = useState(false);
  const [passwordVisible2, setPasswordVisible2] = useState(false);

  const togglePassword1 = () => {
    setPasswordVisible1(!passwordVisible1);
  };

  const togglePassword2 = () => {
    setPasswordVisible2(!passwordVisible2);
  };

  return (
    <>
      <div className="container-register-form">
        <Link id="back-btn" to={'/account'}>
          ← Go back
        </Link>
        <div className="register-form">
          <div className="signup">
            <div className="content">
              <Link>
                <div className="container-logo">
                  <img src={logo} alt={logo} width={150} height={150} />
                </div>
              </Link>
              <h2>Sign Up</h2>

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

                <div className="inputBox">
                  <input type="submit" value="Register" />
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </>
  );
};

export default Register;