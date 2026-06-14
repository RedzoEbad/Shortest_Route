export const appColors = {
  primary: '#276EF1',
  primaryDark: '#1d4ed8',
  primaryLight: '#dbeafe',
  slate900: '#0f172a',
  slate700: '#334155',
  slate500: '#64748b',
  slate200: '#e2e8f0',
  slate100: '#f1f5f9',
  bg: '#f8fafc',
  white: '#ffffff',
  success: '#059669',
  danger: '#dc2626',
};

export const fieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 2,
    bgcolor: '#fff',
    transition: 'box-shadow 0.2s',
    '&.Mui-focused': { boxShadow: '0 0 0 3px rgba(39,110,241,0.15)' },
  },
};

export const primaryButtonSx = {
  py: 1.4,
  borderRadius: 2,
  fontWeight: 700,
  textTransform: 'none',
  color: '#fff',
  background: 'linear-gradient(135deg, #276EF1, #1d4ed8)',
  boxShadow: '0 8px 24px rgba(39,110,241,0.3)',
  '&:hover': {
    background: 'linear-gradient(135deg, #1d4ed8, #1e40af)',
    boxShadow: '0 12px 28px rgba(39,110,241,0.4)',
  },
};
