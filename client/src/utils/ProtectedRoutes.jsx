import { Navigate, Outlet } from 'react-router-dom';

function ProtectedRoutes() {
  // Retrieve from local storage if states are not set
  const isLoggedIn = window.localStorage.getItem('loggedIn') === 'true';
  const token = window.localStorage.getItem('token');
  const role = window.localStorage.getItem('role');

  console.log('Is LoggedIn:', isLoggedIn);
  console.log('Token:', token);
  console.log('Role:', role);

  // Check if the user is logged in and has a valid role
  const isAuthorized = isLoggedIn && token && (role === 'Admin' || role === 'System');

  return isAuthorized ? <Outlet /> : <Navigate to="/" />;
}

export default ProtectedRoutes; 