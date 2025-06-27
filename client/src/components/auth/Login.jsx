import { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Link,
  Paper,
  Divider,
  Alert,
  IconButton,
  InputAdornment,
} from '@mui/material';
import { Visibility, VisibilityOff, Google } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, error, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Handle Google OAuth callback
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const token = urlParams.get('token');
    
    if (token) {
      // Store the token and redirect to dashboard
      localStorage.setItem('token', token);
      window.location.replace('/dashboard');
    }
  }, [location]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (error) clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const result = await login(formData.identifier, formData.password);
    if (result.success) {
      // Get user from localStorage or context
      const user = JSON.parse(localStorage.getItem('user')) || null;
      // But context is more reliable
      setTimeout(() => {
        const userRole = (user && user.role) || (window.__APP_USER__ && window.__APP_USER__.role) || null;
        if (userRole === 'admin') {
          navigate('/admin');
        } else if (userRole === 'student') {
          navigate('/dashboard');
        } else if (userRole === 'employee') {
          navigate('/dashboard');
        } else {
          navigate('/dashboard');
        }
      }, 100);
    }
    setLoading(false);
  };

  const handleGoogleLogin = () => {
    window.location.href = 'https://smart-task-management-app-idmu.onrender.com/api/auth/google';
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(120deg, #f0f4ff 0%, #e0e7ff 100%)',
      }}
    >
      {/* Subtle blurred background shape */}
      <Box
        sx={{
          position: 'absolute',
          width: 600,
          height: 600,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'radial-gradient(circle at 60% 40%, #b3baff 0%, #e0e7ff 80%)',
          filter: 'blur(80px)',
          opacity: 0.5,
          zIndex: 0,
        }}
      />
      <Container maxWidth="sm" sx={{ zIndex: 1 }}>
        <Paper
          elevation={10}
          sx={{
            padding: { xs: 2, sm: 3, md: 3 },
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
            borderRadius: 3,
            background: 'rgba(255, 255, 255, 0.95)',
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: '100%',
              maxWidth: 350,
            }}
          >
            <Typography 
              component="h1" 
              variant="h4" 
              gutterBottom
              sx={{
                fontWeight: 700,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textAlign: 'center',
                mb: 1,
              }}
            >
              Smart Task Management
            </Typography>
            <Typography 
              component="h2" 
              variant="h5" 
              gutterBottom
              sx={{
                color: 'text.secondary',
                fontWeight: 500,
                textAlign: 'center',
                mb: 2,
              }}
            >
              Sign In
            </Typography>

            {error && (
              <Alert 
                severity="error" 
                sx={{ 
                  width: '100%', 
                  mb: 2,
                  borderRadius: 2,
                }}
              >
                {error}
              </Alert>
            )}

            <Box 
              component="form" 
              onSubmit={handleSubmit} 
              sx={{ 
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: 1.5,
              }}
            >
              <TextField
                required
                fullWidth
                id="identifier"
                label="Username or Email"
                name="identifier"
                autoComplete="username"
                autoFocus
                value={formData.identifier}
                onChange={handleChange}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
              <TextField
                required
                fullWidth
                id="password"
                label="Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={formData.password}
                onChange={handleChange}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword((show) => !show)}
                        edge="end"
                        size="small"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                disabled={loading}
                sx={{ mt: 1, mb: 1 }}
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>
              <Divider sx={{ my: 1 }}>or</Divider>
              <Button
                variant="outlined"
                color="primary"
                fullWidth
                startIcon={<Google />}
                onClick={handleGoogleLogin}
                sx={{ mb: 1 }}
              >
                Sign in with Google
              </Button>
            </Box>
            <Typography sx={{ mt: 1, fontSize: 14 }}>
              Don't have an account?{' '}
              <Link component={RouterLink} to="/register" underline="hover">
                Sign up
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login; 
