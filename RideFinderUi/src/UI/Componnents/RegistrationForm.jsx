import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  TextField,
  Button,
  Box,
  CircularProgress,
  InputAdornment,
  IconButton,
  Typography,
  Paper,
} from '@mui/material';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import DirectionsCarOutlinedIcon from '@mui/icons-material/DirectionsCarOutlined';
import PersonIcon from '@mui/icons-material/Person';
import { motion } from 'framer-motion';
import API_BASE_URL from '../../config/api';
import { saveAuth, getDashboardPath } from '../../auth/authStorage';
import AuthLayout from './AuthLayout';
import AuthToast from './AuthToast';
import { useThemeMode } from '../../theme/AppThemeProvider';

const ROLES = [
  {
    value: 'Passenger',
    label: 'Passenger',
    desc: 'Book rides & find routes',
    icon: PersonIcon,
    color: '#276EF1',
  },
  {
    value: 'Rider',
    label: 'Rider',
    desc: 'Drive & accept trips',
    icon: DirectionsCarOutlinedIcon,
    color: '#059669',
  },
];

const RegistrationForm = () => {
  const { fieldSx, colors, primaryButtonSx } = useThemeMode();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'Passenger',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState({ open: false, message: '', type: 'info' });

  const validate = () => {
    const next = {};
    if (!formData.username.trim()) next.username = 'Name is required';
    if (!formData.email.trim()) next.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      next.email = 'Enter a valid email address';
    }
    if (!formData.password) next.password = 'Password is required';
    else if (formData.password.length < 6) {
      next.password = 'At least 6 characters';
    }
    if (!formData.role) next.role = 'Select a role';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const { data } = await axios.post(`${API_BASE_URL}/api/auth/register`, formData);
      const username = data.username || data.Username;

      saveAuth({
        id: data._id,
        role: data.role,
        token: data.token,
        username,
      });

      setToast({
        open: true,
        message: `Welcome, ${username}! Your account is ready.`,
        type: 'success',
      });

      setTimeout(() => navigate(getDashboardPath(data.role)), 1200);
    } catch (error) {
      const msg = error.response?.data?.message || 'Registration failed. Please try again.';
      setToast({ open: true, message: msg, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create account"
      subtitle="Join RideEase — pick your role and start in seconds."
    >
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
          <TextField
            name="username"
            label="Full name"
            fullWidth
            margin="normal"
            value={formData.username}
            onChange={handleChange}
            error={!!errors.username}
            helperText={errors.username}
            autoComplete="name"
            sx={fieldSx}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonOutlineIcon sx={{ color: colors.iconMuted }} />
                </InputAdornment>
              ),
            }}
          />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}>
          <TextField
            name="email"
            label="Email address"
            type="email"
            fullWidth
            margin="normal"
            value={formData.email}
            onChange={handleChange}
            error={!!errors.email}
            helperText={errors.email}
            autoComplete="email"
            sx={fieldSx}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailOutlinedIcon sx={{ color: colors.iconMuted }} />
                </InputAdornment>
              ),
            }}
          />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <TextField
            name="password"
            label="Password"
            type={showPassword ? 'text' : 'password'}
            fullWidth
            margin="normal"
            value={formData.password}
            onChange={handleChange}
            error={!!errors.password}
            helperText={errors.password || 'Minimum 6 characters'}
            autoComplete="new-password"
            sx={fieldSx}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockOutlinedIcon sx={{ color: colors.iconMuted }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword((v) => !v)} edge="end">
                    {showPassword ? <VisibilityOffOutlinedIcon /> : <VisibilityOutlinedIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.26 }}>
          <Typography variant="body2" fontWeight={600} color={colors.slate700} sx={{ mt: 2, mb: 1 }}>
            I am a
          </Typography>
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            {ROLES.map(({ value, label, desc, icon: Icon, color }) => {
              const selected = formData.role === value;
              return (
                <Paper
                  key={value}
                  onClick={() => setFormData((prev) => ({ ...prev, role: value }))}
                  elevation={0}
                  sx={{
                    flex: 1,
                    p: 1.5,
                    cursor: 'pointer',
                    borderRadius: 2,
                    border: selected ? `2px solid ${color}` : `2px solid ${colors.border}`,
                    bgcolor: selected ? `${color}18` : colors.surface,
                    transition: 'all 0.2s',
                    '&:hover': { borderColor: color },
                  }}
                >
                  <Icon sx={{ color: selected ? color : colors.iconMuted, mb: 0.5 }} />
                  <Typography fontWeight={700} fontSize="0.9rem" color={colors.textPrimary}>
                    {label}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {desc}
                  </Typography>
                </Paper>
              );
            })}
          </Box>
          {errors.role && (
            <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
              {errors.role}
            </Typography>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32 }}>
          <Button
            type="submit"
            fullWidth
            disabled={loading}
            sx={{ ...primaryButtonSx, mt: 3, py: 1.6, fontSize: '1rem' }}
          >
            {loading ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : 'Create account'}
          </Button>
        </motion.div>

        <Typography align="center" sx={{ mt: 3, color: colors.textSecondary }}>
          Already have an account?{' '}
          <Typography
            component={Link}
            to="/login"
            sx={{
              color: colors.primary,
              fontWeight: 700,
              textDecoration: 'none',
              '&:hover': { textDecoration: 'underline' },
            }}
          >
            Sign in
          </Typography>
        </Typography>
      </Box>

      <AuthToast
        open={toast.open}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
      />
    </AuthLayout>
  );
};

export default RegistrationForm;
