import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment,
  Avatar,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  EmailOutlined,
  LockOutlined,
  PersonOutlined,  // ✅ Fixed
  Visibility,
  VisibilityOff,
  HowToReg,
} from '@mui/icons-material';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1';

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('engineer');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!name || !email || !password) {
      setError('Please fill all fields');
      setLoading(false);
      return;
    }

    try {
      await axios.post(`${API_URL}/auth/register`, {
        name,
        email,
        password,
        role,
      });

      setSuccess('✅ Account created successfully! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#0e1117',
        backgroundImage: 'radial-gradient(ellipse at bottom left, rgba(99,102,241,0.08), transparent 50%)',
      }}
    >
      <Box sx={{ width: '100%', maxWidth: 480, px: 2 }}>
        {/* Logo / Brand */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Avatar
            sx={{
              width: 72,
              height: 72,
              mx: 'auto',
              mb: 2,
              bgcolor: 'transparent',
              background: 'linear-gradient(135deg, #22c55e, #16a34a)',
              fontSize: '2.5rem',
              boxShadow: '0 8px 32px rgba(34,197,94,0.3)',
            }}
          >
            🚀
          </Avatar>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: '#fff',
              letterSpacing: '-0.02em',
            }}
          >
            Create Account
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: '#94a3b8', mt: 0.5 }}
          >
            Join the AI Project Management platform
          </Typography>
        </Box>

        {/* Register Card */}
        <Card
          sx={{
            bgcolor: '#1a1a2e',
            borderRadius: 4,
            border: '1px solid rgba(255,255,255,0.06)',
            boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
            overflow: 'hidden',
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Typography
              variant="h5"
              sx={{
                color: '#fff',
                fontWeight: 600,
                mb: 0.5,
              }}
            >
              Get Started
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: '#94a3b8', mb: 3 }}
            >
              Create your free account today
            </Typography>

            {error && (
              <Alert
                severity="error"
                sx={{
                  mb: 3,
                  borderRadius: 2,
                  bgcolor: '#ef444420',
                  color: '#fca5a5',
                  '& .MuiAlert-icon': { color: '#ef4444' },
                }}
              >
                {error}
              </Alert>
            )}

            {success && (
              <Alert
                severity="success"
                sx={{
                  mb: 3,
                  borderRadius: 2,
                  bgcolor: '#22c55e20',
                  color: '#86efac',
                  '& .MuiAlert-icon': { color: '#22c55e' },
                }}
              >
                {success}
              </Alert>
            )}

            <form onSubmit={handleRegister}>
              <TextField
                fullWidth
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                sx={{
                  mb: 2,
                  input: { color: '#fff' },
                  '& .MuiOutlinedInput-root': {
                    bgcolor: '#0e1117',
                    borderRadius: 2,
                    '& fieldset': { borderColor: '#333344' },
                    '&:hover fieldset': { borderColor: '#22c55e' },
                    '&.Mui-focused fieldset': { borderColor: '#22c55e', borderWidth: 2 },
                  },
                  '& .MuiInputLabel-root': { color: '#94a3b8' },
                  '& .MuiInputLabel-root.Mui-focused': { color: '#22c55e' },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonOutlined sx={{ color: '#94a3b8', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
                required
              />

              <TextField
                fullWidth
                placeholder="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={{
                  mb: 2,
                  input: { color: '#fff' },
                  '& .MuiOutlinedInput-root': {
                    bgcolor: '#0e1117',
                    borderRadius: 2,
                    '& fieldset': { borderColor: '#333344' },
                    '&:hover fieldset': { borderColor: '#22c55e' },
                    '&.Mui-focused fieldset': { borderColor: '#22c55e', borderWidth: 2 },
                  },
                  '& .MuiInputLabel-root': { color: '#94a3b8' },
                  '& .MuiInputLabel-root.Mui-focused': { color: '#22c55e' },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailOutlined sx={{ color: '#94a3b8', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
                required
              />

              <TextField
                fullWidth
                placeholder="Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                sx={{
                  mb: 2,
                  input: { color: '#fff' },
                  '& .MuiOutlinedInput-root': {
                    bgcolor: '#0e1117',
                    borderRadius: 2,
                    '& fieldset': { borderColor: '#333344' },
                    '&:hover fieldset': { borderColor: '#22c55e' },
                    '&.Mui-focused fieldset': { borderColor: '#22c55e', borderWidth: 2 },
                  },
                  '& .MuiInputLabel-root': { color: '#94a3b8' },
                  '& .MuiInputLabel-root.Mui-focused': { color: '#22c55e' },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlined sx={{ color: '#94a3b8', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        sx={{ color: '#94a3b8' }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                required
              />

              <FormControl
                fullWidth
                sx={{
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    bgcolor: '#0e1117',
                    borderRadius: 2,
                    '& fieldset': { borderColor: '#333344' },
                    '&:hover fieldset': { borderColor: '#22c55e' },
                    '&.Mui-focused fieldset': { borderColor: '#22c55e', borderWidth: 2 },
                  },
                  '& .MuiInputLabel-root': { color: '#94a3b8' },
                  '& .MuiInputLabel-root.Mui-focused': { color: '#22c55e' },
                }}
              >
                <InputLabel sx={{ color: '#94a3b8' }}>Role</InputLabel>
                <Select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  sx={{ color: '#fff' }}
                >
                  <MenuItem value="admin">Admin</MenuItem>
                  <MenuItem value="manager">Manager</MenuItem>
                  <MenuItem value="engineer">Engineer</MenuItem>
                  <MenuItem value="designer">Designer</MenuItem>
                </Select>
              </FormControl>

              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={loading}
                sx={{
                  py: 1.5,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                  fontWeight: 600,
                  textTransform: 'none',
                  fontSize: '1rem',
                  boxShadow: '0 4px 16px rgba(34,197,94,0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #16a34a, #15803d)',
                    boxShadow: '0 6px 24px rgba(34,197,94,0.4)',
                  },
                  '&:disabled': {
                    opacity: 0.6,
                  },
                }}
              >
                {loading ? (
                  <CircularProgress size={24} sx={{ color: '#fff' }} />
                ) : (
                  <>
                    <HowToReg sx={{ mr: 1 }} /> Create Account
                  </>
                )}
              </Button>
            </form>

            <Divider
              sx={{
                my: 3,
                borderColor: '#333344',
                '&::before, &::after': { borderColor: '#333344' },
              }}
            >
              <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                OR
              </Typography>
            </Divider>

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                Already have an account?{' '}
                <Link
                  to="/login"
                  style={{
                    color: '#22c55e',
                    textDecoration: 'none',
                    fontWeight: 600,
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#4ade80')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#22c55e')}
                >
                  Sign In
                </Link>
              </Typography>
            </Box>
          </CardContent>
        </Card>

        <Typography
          variant="caption"
          sx={{
            display: 'block',
            textAlign: 'center',
            color: '#475569',
            mt: 3,
          }}
        >
          © 2026 AI PM • All rights reserved
        </Typography>
      </Box>
    </Box>
  );
}

export default Register;