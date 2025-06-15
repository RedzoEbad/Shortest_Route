import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoutes = ({ children, allowedRole }) => {
  const storedUser = localStorage.getItem('user');
  console.log("Stored User (raw):", storedUser);

  if (!storedUser) {
    console.log("No user found in localStorage");
    return <Navigate to="/login" replace />;
  }

  let user;
  try {
    user = JSON.parse(storedUser);
    console.log("Parsed User:", user);
  } catch (err) {
    console.error('Invalid user object in localStorage:', err);
    return <Navigate to="/login" replace />;
  }

  if (!user?.role) {
    console.log("No role found in user object");
    return <Navigate to="/login" replace />;
  }

  // Compare roles exactly as they are stored
  if (user.role === allowedRole) {
    return children;
  }

  // If roles don't match, redirect to the appropriate route
  if (user.role === 'Passenger') {
    return <Navigate to="/passenger" replace />;
  } else if (user.role === 'Rider') {
    return <Navigate to="/rider" replace />;
  } else {
    console.log("Invalid role:", user.role);
    return <Navigate to="/login" replace />;
  }
};

export default ProtectedRoutes;
