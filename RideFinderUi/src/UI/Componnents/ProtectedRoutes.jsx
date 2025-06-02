import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoutes = ({ children, allowedRole }) => {
  const storedUser = localStorage.getItem('user');
  console.log("Stored User (raw):", storedUser);

  if (!storedUser) {
    return <Navigate to="/" replace />;
  }

  let user;
  try {
    user = JSON.parse(storedUser);
    console.log("Parsed User:", user);
  } catch (err) {
    console.error('Invalid user object in localStorage:', err);
    return <Navigate to="/" replace />;
  }

  if (!user?.role) {
    return <Navigate to="/" replace />;
  }

  const normalizedUserRole = user.role.toLowerCase();
  const normalizedAllowedRole = allowedRole.toLowerCase();

  // ✅ ALLOW: only if roles match
  if (normalizedUserRole === normalizedAllowedRole) {
    return children;
  }

  // 🚫 REDIRECT: if roles don’t match
  if (normalizedUserRole === 'passenger' || normalizedUserRole === 'rider') {
    return <Navigate to={`/${normalizedUserRole}`} replace />;
  } else {
    return <Navigate to="/" replace />;
  }
};

export default ProtectedRoutes;
