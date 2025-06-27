import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid, FormControl, InputLabel, Select, MenuItem, TextField, Button, Paper, Typography, Box, Alert } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';

const Register = () => {
  const { register, error, clearError } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user',
  });
  const [adminCode, setAdminCode] = useState('');
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) clearError();
  };

  const validateForm = () => {
    if (!formData.username.trim() || !formData.email.trim() || !formData.password || !formData.confirmPassword) {
      setFormError('All fields are required.');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setFormError('Passwords do not match.');
      return false;
    }
    if (formData.role === 'admin' && adminCode !== 'admin2025') {
      setFormError('Invalid admin code.');
      return false;
    }
    setFormError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!validateForm()) return;
    setLoading(true);
    const submitData = { ...formData };
    if (formData.role === 'admin') {
      submitData.adminCode = adminCode;
    }
    const result = await register(submitData);
    if (result.success) {
      navigate(formData.role === 'admin' ? '/admin' : '/dashboard');
    }
    setLoading(false);
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      width: '100vw',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(120deg, #f0f4ff 0%, #e0e7ff 100%)',
    }}>
      <Paper sx={{
        p: { xs: 2, sm: 4 },
        width: { xs: '95vw', sm: 400 },
        boxShadow: 6,
        borderRadius: 4,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
        background: 'rgba(255,255,255,0.97)',
      }}>
        <Typography variant="h4" fontWeight={700} gutterBottom align="center" sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          mb: 1,
        }}>
          Register
        </Typography>
        {formError && <Alert severity="error" sx={{ mb: 2, width: '100%' }}>{formError}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2, width: '100%' }}>{error}</Alert>}
        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField label="Username" name="username" value={formData.username} onChange={handleChange} fullWidth required autoComplete="username" sx={{ borderRadius: 2 }} />
            </Grid>
            <Grid item xs={12}>
              <TextField label="Email" name="email" value={formData.email} onChange={handleChange} fullWidth required autoComplete="email" sx={{ borderRadius: 2 }} />
            </Grid>
            <Grid item xs={12}>
              <TextField label="Password" name="password" type="password" value={formData.password} onChange={handleChange} fullWidth required autoComplete="new-password" sx={{ borderRadius: 2 }} />
            </Grid>
            <Grid item xs={12}>
              <TextField label="Confirm Password" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} fullWidth required autoComplete="new-password" sx={{ borderRadius: 2 }} />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel id="role-label">Role</InputLabel>
                <Select labelId="role-label" name="role" value={formData.role} label="Role" onChange={handleChange}>
                  <MenuItem value="user">User</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {formData.role === 'admin' && (
              <Grid item xs={12}>
                <TextField
                  label="Admin Code"
                  value={adminCode}
                  onChange={e => setAdminCode(e.target.value)}
                  fullWidth
                  required
                  error={!!formError}
                  helperText={formError || 'Enter the admin code to register as admin.'}
                  sx={{ borderRadius: 2 }}
                />
              </Grid>
            )}
            <Grid item xs={12}>
              <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading} sx={{ py: 1.2, fontWeight: 600, borderRadius: 2, fontSize: '1.1rem', mt: 1 }}>
                {loading ? 'Registering...' : 'Register'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default Register;