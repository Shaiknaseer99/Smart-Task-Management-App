import { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, Grid, Table, TableHead, TableRow, TableCell, TableBody, Chip, Paper, Button, Alert } from '@mui/material';
import axios from 'axios';
import LoadingSpinner from '../common/LoadingSpinner';
import UserManagement from './UserManagement';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [aiReport, setAiReport] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [statsRes, usersRes, logsRes, aiReportRes] = await Promise.all([
          axios.get('/admin/dashboard'),
          axios.get('/users'),
          axios.get('/admin/audit'),
          axios.get('/admin/ai-report'),
        ]);
        setStats(statsRes.data.data);
        setUsers(usersRes.data.data);
        setLogs(logsRes.data.data);
        setAiReport(aiReportRes.data.data);
      } catch (err) {
        setError('Failed to load admin data');
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) return <LoadingSpinner message="Loading admin dashboard..." />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Admin Dashboard</Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card><CardContent><Typography>Total Users</Typography><Typography variant="h5">{stats.userCount}</Typography></CardContent></Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card><CardContent><Typography>Active Users</Typography><Typography variant="h5">{stats.activeUsers}</Typography></CardContent></Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card><CardContent><Typography>Total Tasks</Typography><Typography variant="h5">{stats.taskCount}</Typography></CardContent></Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card><CardContent><Typography>Completed Tasks</Typography><Typography variant="h5">{stats.completedTasks}</Typography></CardContent></Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card><CardContent><Typography>Overdue Tasks</Typography><Typography variant="h5">{stats.overdueTasks}</Typography></CardContent></Card>
        </Grid>
      </Grid>
      <Paper sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ p: 2 }}>User Management</Typography>
        <UserManagement />
      </Paper>
      <Paper>
        <Typography variant="h6" sx={{ p: 2 }}>Audit Logs (last 200)</Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell>Action</TableCell>
              <TableCell>Resource</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Time</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {logs.map(log => (
              <TableRow key={log._id}>
                <TableCell>{log.user?.username || 'N/A'}</TableCell>
                <TableCell>{log.action}</TableCell>
                <TableCell>{log.resource}</TableCell>
                <TableCell><Chip label={log.status} color={log.status === 'success' ? 'success' : log.status === 'failure' ? 'error' : 'warning'} size="small" /></TableCell>
                <TableCell>{new Date(log.createdAt).toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
      <Paper sx={{ mt: 4 }}>
        <Typography variant="h6" sx={{ p: 2 }}>AI Reports (Tasks per Category)</Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Category</TableCell>
              <TableCell>Task Count</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {aiReport.map(row => (
              <TableRow key={row._id || 'uncategorized'}>
                <TableCell>{row._id || 'Uncategorized'}</TableCell>
                <TableCell>{row.count}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
};

export default AdminDashboard; 