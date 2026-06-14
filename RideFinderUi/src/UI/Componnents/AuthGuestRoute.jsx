import { Navigate } from 'react-router-dom';
import { getStoredUser, getDashboardPath } from '../../auth/authStorage';

const AuthGuestRoute = ({ children }) => {
  const user = getStoredUser();
  if (user?.role) {
    return <Navigate to={getDashboardPath(user.role)} replace />;
  }
  return children;
};

export default AuthGuestRoute;
