import './Register.css';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import logo from '../../assets/logo/logo.png';
import { API_URL } from '../../config.js';

const Register = (normalAccount, googleAccount) => {
  const [role, setRole] = useState(null);

  const navigate = useNavigate();

  console.log('here is a passed data from app routes', googleAccount);
  console.log(
    'here is a passed normal data from app routes GG',
    normalAccount.normalAccount.role
  );

  // Fetch data from json webtoken local storage = function
  useEffect(() => {
    const getUsernameForData = async () => {
      if (!normalAccount.normalAccount || !normalAccount.normalAccount.email) {
        console.error('Normal account or email is not defined');
        return;
      }

      const normalAccount_email = normalAccount.email;
      console.log('User email:', normalAccount_email);

      try {
        const createdBy = normalAccount.normalAccount.role;
        setRole(createdBy);
        console.log('Role:', normalAccount.normalAccount.role);
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
    console.log('Select Role: ', role);
    if (role && role !== 'Admin' && role === 'System') {
      navigate('/forbidden');
    } else {
      console.log('Role:', role || 'not defined yet');
    }
  }, [role, navigate]);

  const [verifyPassword, setVerifyPassword] = useState('');

  // User Inputted Data Functions, request => server
  const [formData, setFormData] = useState({
    account_username: '',
    account_firstName: '',
    account_lastName: '',
    account_email: '',
    account_password: '',
    account_contactNo: '',
    account_status: '',
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

  console.log('Account Status', formData.account_status);

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

    // Username validation: Must be numeric and at most 8 characters
    if (!/^\d{1,8}$/.test(account_username)) {
      toast.error(
        'Username must be numeric and exactly 8 characters long.',
        toastConfig
      );
      return;
    }

    // Email validation (valid format)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(account_email)) {
      toast.error('Please enter a valid email address.', toastConfig);
      return false;
    }

    // First Name validation (non-empty and max length)
    if (!account_firstName || account_firstName.length > 30) {
      toast.error('First Name must be 30 characters or less.', toastConfig);
      return false;
    }

    // Last Name validation (non-empty and max length)
    if (!account_lastName || account_lastName.length > 30) {
      toast.error('Last Name must be 30 characters or less.', toastConfig);
      return false;
    }

    // Phone Number validation (must be 10 digits)
    const phoneRegex = /^\d{11}$/; // Change this regex to match your requirements
    if (!account_contactNo || !phoneRegex.test(account_contactNo)) {
      toast.error('Mobile Number must be 11 digits.', toastConfig);
      return false;
    }

    // Select status (must not be empty)
    if (!account_status) {
      toast.error('Status must be not empty');
      return false;
    }

    // Select Account role (must not be empty)
    if (!account_role) {
      toast.error('Role must be not empty');
      return false;
    }

    // Password validation (max length, at least one special character, at least one uppercase letter)
    const passwordRegex = /^(?=.*[!@#$%^&*])(?=.*[A-Z]).{16,}$/;
    if (!passwordRegex.test(account_password)) {
      toast.error(
        'Password must be 16 characters minimum, include at least one uppercase letter and one special character.',
        toastConfig
      );
      return false;
    }

    // Confirm Password validation
    if (account_password !== verifyPassword) {
      toast.error('Passwords do not match.', toastConfig);
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateInputs()) {
      return; // Stop submission if validation fails
    }

    try {
      const userName = normalAccount.normalAccount.username;
      const fullName = normalAccount.normalAccount.fullname || null;

      const response = await axios.post(`${API_URL}/register`, formData);
      // Create Audit Log
      const auditLogData = {
        userName,
        fullName,
        action: `Created account by username ${userName}`,
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
      console.log(response.data);
    } catch (error) {
      if (error.response) {
        toast.error(
          error.response.data.message || 'Error registering user',
          toastConfig
        );
      } else if (error.request) {
        // The request was made but no response was received
        toast.error(
          'No response from server. Please try again later.',
          toastConfig
        );
      } else {
        // Something happened in setting up the request that triggered an Error
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
                    onInput={(e) => {
                      e.target.value = e.target.value.replace(/[^0-9]/g, '');
                    }}
                  />{' '}
                  <i className="no-event">ID </i>
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
                  value={origin}
                  onChange={handleChange}
                  required
                >
                  <option disabled value="">
                    Select Office
                  </option>
                  {optionsDocumentOrigin.map((option) => (
                    <option key={option} value={option} >
                      {option}
                    </option>
                  ))}
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
