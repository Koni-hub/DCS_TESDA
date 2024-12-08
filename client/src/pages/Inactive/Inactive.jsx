 
import './Inactive.css';
import {Link} from 'react-router-dom';
import inactive_account from '../../assets/logo/inactive_account-logo.png'

const Inactive = () => {
  return (
    <>
      <div className="inactive-wrapper">
        <div className="inactive-container">
          <img width={250} height={250} src={inactive_account}></img>
          <div className="inactive-text">
            Inactive
          </div>
          <div className="inactive-text-sentences">
            <p>Your account has been suspended due to inactivity. Please contact support to reactivate your account.</p>
            <p><Link to="/">Return to Home</Link></p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Inactive;