import React, { useState, useRef, useEffect } from 'react';
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
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  EmailOutlined,
  LockOutlined,
  Visibility,
  VisibilityOff,
  Login as LoginIcon,
} from '@mui/icons-material';
import gsap from 'gsap';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1';

function Login() {
  const [isOn, setIsOn] = useState(false); // 🔥 Lamp toggle state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  
  // 🔥 GSAP Animation Ref
  const bgRef = useRef<HTMLDivElement>(null);

  // Toggle ke saath background color ka animation
  useEffect(() => {
    if (bgRef.current) {
      gsap.to(bgRef.current, {
        backgroundColor: isOn ? '#e8e4d9' : '#111316', // Warm light vs Deep dark
        duration: 0.6,
        ease: 'power2.inOut',
      });
    }
  }, [isOn]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // FastAPI's OAuth2PasswordRequestForm expects x-www-form-urlencoded with 'username' and 'password'
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);

      const res = await axios.post(`${API_URL}/auth/login`, formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      const { access_token, user_id, name, role, is_admin } = res.data;

      localStorage.setItem('token', access_token);
      localStorage.setItem('user_id', String(user_id));
      localStorage.setItem('name', name);
      localStorage.setItem('role', role);
      localStorage.setItem('is_admin', String(is_admin));

      if (is_admin === true || role === 'admin') {
        navigate('/admin');
        setTimeout(() => {
          if (window.location.pathname !== '/admin') window.location.href = '/admin';
        }, 500);
      } else {
        navigate('/user');
        setTimeout(() => {
          if (window.location.pathname !== '/user') window.location.href = '/user';
        }, 500);
      }
    } catch (err: any) {
      let errorMsg = 'Invalid email or password';
      if (err.response?.data?.detail) {
        if (typeof err.response.data.detail === 'string') {
          errorMsg = err.response.data.detail;
        } else if (Array.isArray(err.response.data.detail)) {
          errorMsg = err.response.data.detail[0]?.msg || JSON.stringify(err.response.data.detail);
        } else {
          errorMsg = JSON.stringify(err.response.data.detail);
        }
      }
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      ref={bgRef} // Isi par GSAP animation lagayega
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#111316', // Default Dark
        transition: 'background-color 0.5s ease',
      }}
    >
      {/* 🔥 Glassmorphism Card Container */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          width: '900px',
          maxWidth: '95%',
          borderRadius: 4,
          overflow: 'hidden',
          boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
          bgcolor: isOn ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(16px)',
          border: isOn ? '1px solid rgba(255, 255, 255, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        {/* 🟢 LEFT SIDE: LAMP & INTERACTIVE TOGGLE */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            p: 4,
            bgcolor: isOn ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.2)',
            cursor: 'pointer',
            minHeight: { xs: '250px', md: 'auto' },
          }}
          onClick={() => setIsOn(!isOn)} // Click karne par toggle
        >
          <Typography variant="h6" sx={{ color: isOn ? '#333' : '#fff', mb: 2, fontWeight: 600 }}>
            {isOn ? '✨ Light is ON' : '💡 Click the Lamp'}
          </Typography>

          {/* Custom Lamp SVG */}
          <Box sx={{ position: 'relative', width: 120, height: 140 }}>
            {/* Lamp Base */}
            <Box sx={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: 60, height: 8, bgcolor: isOn ? '#888' : '#444', borderRadius: 2 }} />
            {/* Lamp Stand */}
            <Box sx={{ position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)', width: 6, height: 80, bgcolor: isOn ? '#aaa' : '#666' }} />
            {/* Lamp Shade */}
            <Box sx={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 120, height: 50, bgcolor: isOn ? '#f9f9f9' : '#2a2a2a', borderRadius: '100% 100% 10% 10%', boxShadow: isOn ? '0 0 40px 10px rgba(255, 200, 50, 0.8)' : 'none', transition: 'all 0.5s ease' }} />
            {/* Lamp Bulb glow */}
            <Box sx={{ position: 'absolute', top: 45, left: '50%', transform: 'translateX(-50%)', width: 20, height: 20, borderRadius: '50%', bgcolor: isOn ? '#ffd700' : '#333', transition: 'all 0.4s ease' }} />
            
            {/* 🔥 Lamp ki Wire (String) */}
            <Box
              sx={{
                position: 'absolute',
                top: 10,
                right: -15,
                width: 2,
                height: 40,
                bgcolor: isOn ? '#888' : '#555',
                cursor: 'pointer',
              }}
              onClick={(e) => {
                e.stopPropagation(); // Parent click ko rokne ke liye
                setIsOn(!isOn);
              }}
            >
              {/* String ka ball */}
              <Box sx={{ position: 'absolute', bottom: -8, left: -3.5, width: 8, height: 8, bgcolor: isOn ? '#d4a373' : '#888', borderRadius: '50%' }} />
            </Box>
          </Box>
        </Box>

        {/* 🟢 RIGHT SIDE: LOGIN FORM */}
        <Box sx={{ flex: 1, p: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: isOn ? '#222' : '#fff', textAlign: 'center', mb: 1 }}>
            Welcome Back
          </Typography>
          <Typography variant="body2" sx={{ color: isOn ? '#444' : '#b0b0b0', textAlign: 'center', mb: 3 }}>
            Sign in to your account to continue
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2, bgcolor: '#ef444420', color: '#fca5a5' }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleLogin}>
            {/* ✅ UPDATED: Placeholder change, autoComplete off */}
            <TextField
              fullWidth
              placeholder="Enter your gmail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="off" // 👈 Browser auto-fill ko rokne ke liye
              sx={{
                mb: 2,
                input: { color: isOn ? '#222' : '#fff' },
                '& label': { color: isOn ? '#444' : '#b0b0b0' },
                '& .MuiOutlinedInput-root': {
                  bgcolor: isOn ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.3)',
                  borderRadius: 2,
                  '& fieldset': { borderColor: isOn ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)' },
                  '&:hover fieldset': { borderColor: '#6366f1' },
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailOutlined sx={{ color: isOn ? '#444' : '#b0b0b0' }} />
                  </InputAdornment>
                ),
              }}
              required
            />

            {/* ✅ UPDATED: Placeholder change, autoComplete new-password */}
            <TextField
              fullWidth
              placeholder="Enter your password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password" // 👈 Browser auto-fill ko rokne ke liye
              sx={{
                mb: 1,
                input: { color: isOn ? '#222' : '#fff' },
                '& label': { color: isOn ? '#444' : '#b0b0b0' },
                '& .MuiOutlinedInput-root': {
                  bgcolor: isOn ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.3)',
                  borderRadius: 2,
                  '& fieldset': { borderColor: isOn ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)' },
                  '&:hover fieldset': { borderColor: '#6366f1' },
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlined sx={{ color: isOn ? '#444' : '#b0b0b0' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} sx={{ color: isOn ? '#444' : '#b0b0b0' }}>
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              required
            />

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
              <Button sx={{ color: isOn ? '#555' : '#b0b0b0', '&:hover': { color: '#6366f1' } }}>
                Forgot password?
              </Button>
            </Box>

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              sx={{
                py: 1.5,
                borderRadius: 2,
                background: isOn 
                  ? 'linear-gradient(135deg, #f7d875, #eab308)' // Light mode golden button
                  : 'linear-gradient(135deg, #6366f1, #8b5cf6)',  // Dark mode purple button
                fontWeight: 600,
                textTransform: 'none',
                fontSize: '1rem',
                boxShadow: isOn ? '0 4px 16px rgba(234, 179, 8, 0.4)' : '0 4px 16px rgba(99,102,241,0.3)',
                '&:hover': {
                  background: isOn ? 'linear-gradient(135deg, #eab308, #ca8a04)' : 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                },
              }}
            >
              {loading ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : <><LoginIcon sx={{ mr: 1 }} /> Sign In</>}
            </Button>
          </form>
        </Box>
      </Box>
    </Box>
  );
}

export default Login;