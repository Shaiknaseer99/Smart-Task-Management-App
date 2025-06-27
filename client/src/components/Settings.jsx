import React, { useState } from 'react';
import {
  Box, Card, CardContent, Typography, Divider, TextField, Button, Switch, FormControlLabel, Avatar, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Alert
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useTask } from '../contexts/TaskContext';
import { Brightness4, Brightness7, Delete, CloudDownload, Edit } from '@mui/icons-material';
import { useThemeMode } from '../App';

const Settings = () => {
  const { user } = useAuth();
  const { exportTasks } = useTask();
  const { themeMode, setThemeMode } = useThemeMode();
  const [profile, setProfile] = useState({
    name: user?.profile?.firstName || '',
    email: user?.email || '',
    avatar: user?.profile?.avatar || user?.avatar || '',
  });
  const [editMode, setEditMode] = useState(false);
  const [password, setPassword] = useState({ current: '', new: '', confirm: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [notifications, setNotifications] = useState(true); // Placeholder
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [alert, setAlert] = useState(null);

  // Handlers (placeholders)
  const handleProfileChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };
  const handleProfileSave = () => {
    setEditMode(false);
    setAlert({ type: 'success', msg: 'Profile updated (not yet connected to backend).' });
  };
  const handlePasswordChange = (e) => {
    setPassword({ ...password, [e.target.name]: e.target.value });
  };
  const handlePasswordSave = () => {
    setAlert({ type: 'success', msg: 'Password changed (not yet connected to backend).' });
    setPassword({ current: '', new: '', confirm: '' });
  };
  const handleNotificationToggle = () => {
    setNotifications((prev) => !prev);
  };
  const handleThemeToggle = () => {
    setThemeMode(themeMode === 'light' ? 'dark' : 'light');
  };
  const handleExport = () => {
    exportTasks && exportTasks();
    setAlert({ type: 'info', msg: 'Export started (connect to backend for real export).' });
  };
  const handleDeleteAccount = () => {
    setDeleteDialog(false);
    setAlert({ type: 'error', msg: 'Account deleted (not yet connected to backend).' });
  };

  return (
    <Box maxWidth="sm" mx="auto" mt={4}>
      <Typography variant="h4" mb={3}>Settings</Typography>
      {alert && <Alert severity={alert.type} sx={{ mb: 2 }}>{alert.msg}</Alert>}
      {/* Edit Profile Info */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Edit Profile</Typography>
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <Avatar src={profile.avatar} sx={{ width: 56, height: 56 }} />
            <Box>
              <Typography>{profile.name}</Typography>
              <Typography color="textSecondary" fontSize={14}>{profile.email}</Typography>
            </Box>
            <IconButton onClick={() => setEditMode((e) => !e)}><Edit /></IconButton>
          </Box>
          {editMode && (
            <Box display="flex" flexDirection="column" gap={2}>
              <TextField label="Name" name="name" value={profile.name} onChange={handleProfileChange} fullWidth />
              <TextField label="Email" name="email" value={profile.email} onChange={handleProfileChange} fullWidth />
              <TextField label="Avatar URL" name="avatar" value={profile.avatar} onChange={handleProfileChange} fullWidth />
              <Button variant="contained" onClick={handleProfileSave}>Save</Button>
            </Box>
          )}
        </CardContent>
      </Card>
      {/* Change Password */}
      {user?.provider !== 'google' && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>Change Password</Typography>
            <Box display="flex" flexDirection="column" gap={2}>
              <TextField label="Current Password" name="current" type="password" value={password.current} onChange={handlePasswordChange} fullWidth />
              <TextField label="New Password" name="new" type="password" value={password.new} onChange={handlePasswordChange} fullWidth />
              <TextField label="Confirm New Password" name="confirm" type="password" value={password.confirm} onChange={handlePasswordChange} fullWidth />
              <Button variant="contained" onClick={handlePasswordSave}>Change Password</Button>
            </Box>
          </CardContent>
        </Card>
      )}
      {/* Notification Preferences */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Notification Preferences</Typography>
          <FormControlLabel
            control={<Switch checked={notifications} onChange={handleNotificationToggle} />}
            label="Email Notifications"
          />
        </CardContent>
      </Card>
      {/* Theme Toggle */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Theme</Typography>
          <FormControlLabel
            control={<Switch checked={themeMode === 'dark'} onChange={handleThemeToggle} />}
            label={themeMode === 'dark' ? <><Brightness4 sx={{ mr: 1 }} />Dark Mode</> : <><Brightness7 sx={{ mr: 1 }} />Light Mode</>}
          />
        </CardContent>
      </Card>
      {/* Export Tasks */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Export Tasks</Typography>
          <Button variant="outlined" startIcon={<CloudDownload />} onClick={handleExport}>
            Export as CSV/Excel
          </Button>
        </CardContent>
      </Card>
      {/* Delete Account */}
      <Card sx={{ mb: 3, borderColor: 'error.main', borderWidth: 1, borderStyle: 'solid' }}>
        <CardContent>
          <Typography variant="h6" color="error" gutterBottom>Delete Account</Typography>
          <Typography color="textSecondary" mb={2}>This action is irreversible. All your data will be deleted.</Typography>
          <Button variant="contained" color="error" startIcon={<Delete />} onClick={() => setDeleteDialog(true)}>
            Delete Account
          </Button>
        </CardContent>
      </Card>
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
        <DialogTitle>Confirm Account Deletion</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete your account? This cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleDeleteAccount} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Settings; 