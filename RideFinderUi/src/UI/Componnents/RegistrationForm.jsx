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
} from '@mui/material';

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
      setErrors((prev) => ({ ...prev, email: 'Please enter a valid email address.' }));
      hasError = true;
    }
    if (!validatePassword(formData.password)) {
      setErrors((prev) => ({ ...prev, password: 'Password must be at least 6 characters.' }));
      hasError = true;
    }
    if (hasError) return;

    setLoading(true);
    setErrors({ email: '', password: '' });

    try {
      const response = await axios.post('http://localhost:8000/api/auth/register', formData);
      console.log('Registration Successful:', response);

      // Make sure role is lowercase for routing consistency
      const userRole = response.data.role.toLowerCase();

      // Store user role in localStorage as an object
      localStorage.setItem('user', JSON.stringify({ role: userRole }));
      localStorage.setItem('name' , JSON.stringify(response.data.Username))

      // Redirect based on role
      if (userRole === 'passenger') {
        navigate('/passenger');
      } else if (userRole === 'rider') {
        navigate('/rider');
      } else {
        alert('Unknown user role');
      }

      setFormData({ username: '', email: '', password: '', role: '' });
      alert(`Welcome, ${response.data.Username}! Registration successful.`);
    } catch (error) {
      console.log('Registration Failed:', error.response?.data?.message || error.message);
      alert(`Registration Failed: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
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
        </form>
      </Card>
    </Box>
  );
};

export default RegistrationForm;
