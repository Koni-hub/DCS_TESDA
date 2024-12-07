import { Navigate, Outlet } from 'react-router-dom';

function ProtectedRoutes() {
  const isLoggedIn = window.localStorage.getItem('loggedIn') === 'true';
  const token = window.localStorage.getItem('token');
  const role = window.localStorage.getItem('role');

  console.log('Is LoggedIn:', isLoggedIn);
  console.log('Token:', token);
  console.log('Role:', role);

  const isAuthorized =
    isLoggedIn &&
    token &&
    (role === 'Admin' || role === 'Employee' || role === 'Office');

  return isAuthorized ? <Outlet /> : <Navigate to="/" />;
}

export default ProtectedRoutes;