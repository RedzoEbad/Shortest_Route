import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';

import './App.css';

import RegistrationForm from './UI/Componnents/RegistrationForm';
import LoginForm from './UI/Componnents/LoginForm';
import PassengerScreen from './UI/Screens/PassengerScreen';
import RiderScreen from './UI/Screens/RiderScreen';
import ProtectedRoutes from './UI/Componnents/ProtectedRoutes';

function App() {
  return (
    <Routes>
      <Route path="/" element={<RegistrationForm />} />
      <Route path="/login" element={<LoginForm />} />
      <Route path="/register" element={<RegistrationForm />} />

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

      {/* Redirect unknown routes */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
