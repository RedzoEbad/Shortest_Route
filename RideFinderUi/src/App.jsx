import { Routes, Route, Navigate } from 'react-router-dom';
import RegistrationForm from './UI/Componnents/RegistrationForm';
import LoginForm from './UI/Componnents/LoginForm';
import PassengerScreen from './UI/Screens/PassengerScreen';
import RiderScreen from './UI/Screens/RiderScreen';
import ProtectedRoutes from './UI/Componnents/ProtectedRoutes';
import AuthGuestRoute from './UI/Componnents/AuthGuestRoute';
import { getStoredUser, getDashboardPath } from './auth/authStorage';

const HomeRedirect = () => {
  const user = getStoredUser();
  if (user?.role) return <Navigate to={getDashboardPath(user.role)} replace />;
  return <Navigate to="/login" replace />;
};

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />

      <Route
        path="/login"
        element={
          <AuthGuestRoute>
            <LoginForm />
          </AuthGuestRoute>
        }
      />
      <Route
        path="/register"
        element={
          <AuthGuestRoute>
            <RegistrationForm />
          </AuthGuestRoute>
        }
      />

      <Route
        path="/passenger"
        element={
          <ProtectedRoutes allowedRole="Passenger">
            <PassengerScreen />
          </ProtectedRoutes>
        }
      />
      <Route
        path="/rider"
        element={
          <ProtectedRoutes allowedRole="Rider">
            <RiderScreen />
          </ProtectedRoutes>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
