import './Register.css';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import logo from '../../assets/logo/logo.png';
import { API_URL } from '../../config.js';

const Register = () => {
  const Navigate = useNavigate();
  const [verifyPassowrd, setVerifyPassowrd] = useState('');

  //User Inputted Data Functions, request => server
  const [formData, setFormData] = useState({
    account_username: '',
    account_firstName: '',
    account_lastName: '',
    account_email: '',
    account_password: '',
    account_contactNo: '',
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Simple form validation
    if (
      !formData.account_username ||
      !formData.account_email ||
      !formData.account_password ||
      !formData.account_firstName ||
      !formData.account_lastName ||
      !verifyPassowrd
    ) {
      toast.error('Please fill in all fields.', toastConfig);
      return;
    }

    if (formData.account_password !== verifyPassowrd) {
      toast.error('Passwords do not match.', toastConfig);
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/register`, formData);
      toast.success('Successfully registered user', toastConfig);
      setTimeout(() => {
        Navigate('/');
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
    console.log('trigger shit');
    setPasswordVisible1(!passwordVisible1);
  };

  const togglePassword2 = () => {
    setPasswordVisible2(!passwordVisible2);
  };

  return (
    <>
      <div className="container-register-form">
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
                  <i className="no-event">Username </i>
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
                  <i className="no-event">Phone Number </i>
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
                    onChange={(e) => setVerifyPassowrd(e.target.value)}
                    value={verifyPassowrd}
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
                  <input type="submit" value="Register" />
                </div>

                <div className="links-register">
                  <p>Already have an account?</p>
                  <Link to={'/'}> login here</Link>
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
