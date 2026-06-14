export const getStoredUser = () => {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const saveAuth = ({ id, role, token, username }) => {
  localStorage.setItem(
    'user',
    JSON.stringify({ id, role, token })
  );
  localStorage.setItem('name', JSON.stringify(username));
};

export const clearAuth = () => {
  localStorage.removeItem('user');
  localStorage.removeItem('name');
};

export const getDashboardPath = (role) => {
  if (role === 'Passenger') return '/passenger';
  if (role === 'Rider') return '/rider';
  return '/login';
};
