import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  Chip,
  Popover,
  List as MUIList,
  ListItem as MUIListItem,
  ListItemAvatar,
  ListItemText as MUIListItemText,
  Button,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  Task,
  Add,
  AdminPanelSettings,
  AccountCircle,
  Logout,
  Settings,
  Notifications,
  CheckCircle,
  Warning,
  Event,
  Delete,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const drawerWidth = 240;

const mockNotifications = [
  {
    id: 1,
    type: 'due',
    message: 'Task "Submit report" is due today!',
    timestamp: 'Just now',
    read: false,
  },
  {
    id: 2,
    type: 'overdue',
    message: 'Task "Pay bills" is overdue!',
    timestamp: '2 hours ago',
    read: false,
  },
  {
    id: 3,
    type: 'completed',
    message: 'Task "Go to gym" marked as completed.',
    timestamp: 'Yesterday',
    read: true,
  },
];

const notificationIcon = (type) => {
  switch (type) {
    case 'due': return <Event color="info" />;
    case 'overdue': return <Warning color="error" />;
    case 'completed': return <CheckCircle color="success" />;
    default: return <Notifications color="primary" />;
  }
};

const Layout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifAnchorEl, setNotifAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState(mockNotifications);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Notification popover handlers
  const handleNotifOpen = (event) => {
    setNotifAnchorEl(event.currentTarget);
  };
  const handleNotifClose = () => {
    setNotifAnchorEl(null);
  };
  const handleMarkAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };
  const handleClearAll = () => {
    setNotifications([]);
  };
  const unreadCount = notifications.filter(n => !n.read).length;

  const menuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
    { text: 'Tasks', icon: <Task />, path: '/tasks' },
    { text: 'New Task', icon: <Add />, path: '/tasks/new' },
  ];

  if (user?.role === 'admin') {
    menuItems.push({
      text: 'Admin',
      icon: <AdminPanelSettings />,
      path: '/admin',
    });
  }

  const drawer = (
    <div>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          Smart Tasks
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => navigate(item.path)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {menuItems.find(item => item.path === location.pathname)?.text || 'Smart Task Management'}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton color="inherit" onClick={handleNotifOpen}>
              <Badge badgeContent={unreadCount} color="error">
                <Notifications />
              </Badge>
            </IconButton>
            <Popover
              open={Boolean(notifAnchorEl)}
              anchorEl={notifAnchorEl}
              onClose={handleNotifClose}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              PaperProps={{ sx: { width: 340, maxWidth: '90vw', p: 1 } }}
            >
              <Box sx={{ p: 1, pb: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle1">Notifications</Typography>
                <Box>
                  <Button size="small" onClick={handleMarkAllRead} disabled={notifications.length === 0 || unreadCount === 0}>Mark all as read</Button>
                  <Button size="small" color="error" onClick={handleClearAll} disabled={notifications.length === 0}>Clear all</Button>
                </Box>
              </Box>
              <Divider sx={{ my: 1 }} />
              {notifications.length === 0 ? (
                <Typography color="textSecondary" align="center" sx={{ p: 2 }}>
                  No notifications
                </Typography>
              ) : (
                <MUIList dense>
                  {notifications.map((notif) => (
                    <MUIListItem key={notif.id} alignItems="flex-start" sx={{ bgcolor: notif.read ? 'background.paper' : '#e3f2fd' }}>
                      <ListItemAvatar>
                        {notificationIcon(notif.type)}
                      </ListItemAvatar>
                      <MUIListItemText
                        primary={notif.message}
                        secondary={notif.timestamp}
                        primaryTypographyProps={{ fontWeight: notif.read ? 400 : 600 }}
                      />
                    </MUIListItem>
                  ))}
                </MUIList>
              )}
            </Popover>
            <Chip
              label={user?.role === 'admin' ? 'Admin' : 'User'}
              color={user?.role === 'admin' ? 'secondary' : 'primary'}
              size="small"
            />
            <IconButton
              size="large"
              edge="end"
              aria-label="account of current user"
              aria-controls="primary-search-account-menu"
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              color="inherit"
            >
              <Avatar sx={{ width: 32, height: 32 }}>
                {user?.profile?.firstName?.[0] || user?.username?.[0] || 'U'}
              </Avatar>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        onClick={handleProfileMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={() => navigate('/profile')}>
          <ListItemIcon>
            <AccountCircle fontSize="small" />
          </ListItemIcon>
          Profile
        </MenuItem>
        <MenuItem onClick={() => navigate('/settings')}>
          <ListItemIcon>
            <Settings fontSize="small" />
          </ListItemIcon>
          Settings
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default Layout; 