/* eslint-disable react/no-unescaped-entities */
import './Forbidden.css';
import {Link} from 'react-router-dom';

const Forbidden = () => {
  return (
    <>
      <div className="forbidden-wrapper">
        <div className="forbidden-container">
          <div className="forbidden-text">
            403 - Forbidden
          </div>
          <div className="forbidden-text-sentences">
            <p>You don't have access to this page.</p>
            <p><Link to="/">Return to Home</Link></p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Forbidden;