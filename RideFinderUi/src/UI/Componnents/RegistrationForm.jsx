import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Box,
  CircularProgress,
  Paper,
  Container,
  Fade,
  Grow,
  IconButton,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';

const CustomToast = ({ open, message, type, onClose }) => {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon sx={{ fontSize: 32, color: '#fff' }} />;
      case 'error':
        return <ErrorIcon sx={{ fontSize: 32, color: '#fff' }} />;
      case 'warning':
        return <WarningIcon sx={{ fontSize: 32, color: '#fff' }} />;
      case 'info':
        return <InfoIcon sx={{ fontSize: 32, color: '#fff' }} />;
      default:
        return <InfoIcon sx={{ fontSize: 32, color: '#fff' }} />;
    }
  };

  const getBackground = () => {
    switch (type) {
      case 'success':
        return 'linear-gradient(135deg, #00c853, #69f0ae)';
      case 'error':
        return 'linear-gradient(135deg, #ff1744, #ff616f)';
      case 'warning':
        return 'linear-gradient(135deg, #ffd600, #ffecb3)';
      case 'info':
        return 'linear-gradient(135deg, #2196f3, #90caf9)';
      default:
        return 'linear-gradient(135deg, #2196f3, #90caf9)';
    }
  };

  return (
    <Fade in={open} timeout={500}>
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 9999,
          minWidth: 320,
          maxWidth: 450,
          animation: open ? 'slideDown 0.5s ease-out' : 'slideUp 0.5s ease-in',
          '@keyframes slideDown': {
            '0%': {
              transform: 'translate(-50%, -100%)',
              opacity: 0,
            },
            '100%': {
              transform: 'translate(-50%, 20px)',
              opacity: 1,
            },
          },
          '@keyframes slideUp': {
            '0%': {
              transform: 'translate(-50%, 20px)',
              opacity: 1,
            },
            '100%': {
              transform: 'translate(-50%, -100%)',
              opacity: 0,
            },
          },
        }}
      >
        <Grow in={open} timeout={500}>
          <Paper
            elevation={8}
            sx={{
              p: 2.5,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              background: getBackground(),
              borderRadius: '16px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.3)',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'rgba(255,255,255,0.3)',
              },
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                flex: 1,
              }}
            >
              {getIcon()}
              <Typography
                sx={{
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: '1.1rem',
                  flex: 1,
                  textShadow: '0 1px 2px rgba(0,0,0,0.1)',
                }}
              >
                {message}
              </Typography>
            </Box>
            <IconButton
              onClick={onClose}
              sx={{
                color: '#fff',
                padding: '4px',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  transform: 'scale(1.1)',
                  transition: 'all 0.2s ease',
                },
              }}
            >
              <Typography sx={{ fontSize: '1.4rem', fontWeight: 500 }}>×</Typography>
            </IconButton>
          </Paper>
        </Grow>
      </Box>
    </Fade>
  );
};

const RegistrationForm = () => {
  const navigate = useNavigate();
  const [errors, setErrors] = useState({ email: '', password: '' });
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: '',
  });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ open: false, message: '', type: 'info' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === 'email' && errors.email) {
      setErrors((prev) => ({ ...prev, email: '' }));
    }
    if (name === 'password' && errors.password) {
      setErrors((prev) => ({ ...prev, password: '' }));
    }
  };

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePassword = (password) => password.length >= 6;

  const handleSubmit = async (e) => {
    e.preventDefault();

    let hasError = false;
    if (!validateEmail(formData.email)) {
      setToast({
        open: true,
        message: 'Please enter a valid email address',
        type: 'error'
      });
      hasError = true;
    }
    if (!validatePassword(formData.password)) {
      setToast({
        open: true,
        message: 'Password must be at least 6 characters',
        type: 'warning'
      });
      hasError = true;
    }
    if (hasError) return;

    setLoading(true);
    setErrors({ email: '', password: '' });

    try {
      const response = await axios.post('http://localhost:8000/api/auth/register', formData);
      console.log('Registration Successful:', response);

      localStorage.setItem('user', JSON.stringify({ 
        role: response.data.role,
        token: response.data.token,
        id: response.data._id 
      }));
      localStorage.setItem('name', JSON.stringify(response.data.Username));

      setToast({
        open: true,
        message: `Welcome ${response.data.Username}! Registration successful. Redirecting...`,
        type: 'success'
      });

      setTimeout(() => {
        if (response.data.role === 'Passenger') {
          navigate('/passenger');
        } else if (response.data.role === 'Rider') {
          navigate('/rider');
        }
      }, 2000);

      setFormData({ username: '', email: '', password: '', role: '' });
    } catch (error) {
      console.log('Registration Failed:', error.response?.data?.message || error.message);
      const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
      
      // Clear the specific field that caused the error
      if (errorMessage.includes('Email already registered')) {
        setFormData(prev => ({ ...prev, email: '' }));
      } else if (errorMessage.includes('Username already taken')) {
        setFormData(prev => ({ ...prev, username: '' }));
      }

      setToast({
        open: true,
        message: errorMessage,
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseToast = () => {
    setToast({ ...toast, open: false });
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg,rgb(212, 215, 228) 0%,rgb(144, 112, 175) 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 2,
        backgroundSize: 'cover',
      }}
    >
      <Card
        sx={{
          maxWidth: 480,
          width: '100%',
          borderRadius: 3,
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          backdropFilter: 'blur(10px)',
          backgroundColor: 'rgba(255, 255, 255, 0.85)',
          px: 4,
          py: 5,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Typography
          variant="h4"
          align="center"
          gutterBottom
          sx={{ fontWeight: '700', letterSpacing: 1, color: '#4a148c' }}
        >
          Create an Account
        </Typography>

        <form onSubmit={handleSubmit} noValidate>
          <TextField
            name="username"
            label="Your Name"
            variant="filled"
            fullWidth
            margin="normal"
            value={formData.username}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
            sx={{
              borderRadius: 2,
              '& .MuiFilledInput-root': {
                borderRadius: 2,
                backgroundColor: '#f3e5f5',
                '&:hover': { backgroundColor: '#e1bee7' },
              },
            }}
          />
          <TextField
            name="email"
            label="Your Email"
            variant="filled"
            fullWidth
            margin="normal"
            type="email"
            value={formData.email}
            onChange={handleChange}
            error={!!errors.email}
            helperText={errors.email}
            InputLabelProps={{ shrink: true }}
            sx={{
              borderRadius: 2,
              '& .MuiFilledInput-root': {
                borderRadius: 2,
                backgroundColor: '#f3e5f5',
                '&:hover': { backgroundColor: '#e1bee7' },
              },
            }}
          />
          <TextField
            name="password"
            label="Password"
            variant="filled"
            fullWidth
            margin="normal"
            type="password"
            value={formData.password}
            onChange={handleChange}
            error={!!errors.password}
            helperText={errors.password}
            InputLabelProps={{ shrink: true }}
            sx={{
              borderRadius: 2,
              '& .MuiFilledInput-root': {
                borderRadius: 2,
                backgroundColor: '#f3e5f5',
                '&:hover': { backgroundColor: '#e1bee7' },
              },
            }}
          />
          <FormControl
            fullWidth
            margin="normal"
            variant="filled"
            sx={{
              borderRadius: 2,
              backgroundColor: '#f3e5f5',
              '&:hover': { backgroundColor: '#e1bee7' },
            }}
          >
            <InputLabel id="role-label" sx={{ color: '#4a148c' }}>
              Role
            </InputLabel>
            <Select
              name="role"
              labelId="role-label"
              value={formData.role}
              onChange={handleChange}
              label="Role"
              sx={{ borderRadius: 2 }}
            >
              <MenuItem value="Rider">Rider</MenuItem>
              <MenuItem value="Passenger">Passenger</MenuItem>
            </Select>
          </FormControl>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{
              mt: 4,
              py: 1.8,
              fontWeight: '700',
              fontSize: '1.1rem',
              background: 'linear-gradient(90deg, #8e24aa, #d81b60)',
              boxShadow: '0 4px 15px rgba(216, 27, 96, 0.5)',
              transition: 'background 0.3s ease',
              '&:hover': {
                background: 'linear-gradient(90deg, #d81b60, #8e24aa)',
                boxShadow: '0 6px 20px rgba(216, 27, 96, 0.7)',
              },
              borderRadius: 3,
            }}
          >
            {loading ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : 'Register'}
          </Button>

          <Button
            fullWidth
            variant="text"
            onClick={handleLoginClick}
            sx={{
              mt: 2,
              color: '#aa00ff',
              '&:hover': {
                background: 'rgba(170, 0, 255, 0.04)',
              },
              textTransform: 'none',
            }}
          >
            Already have an account? Login
          </Button>
        </form>
      </Card>

      {/* Custom Toast */}
      <CustomToast
        open={toast.open}
        message={toast.message}
        type={toast.type}
        onClose={handleCloseToast}
      />
    </Box>
  );
};

export default RegistrationForm;
