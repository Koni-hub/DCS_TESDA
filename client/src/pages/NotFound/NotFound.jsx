/* eslint-disable react/no-unescaped-entities */
import './NotFound.css';
import {Link} from 'react-router-dom';

const NotFound = () => {
  return (
    <>
      <div className="notfound-wrapper">
        <div className="notfound-container">
          <div className="notfound-text">
            404 - Not Found 
          </div>
          <div className="notfound-text-sentences">
            <p>We couldn't find the page you're looking for.</p>
            <p><Link to="/">Return to Home</Link></p>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotFound;