import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Paper,
  Alert,
} from '@mui/material';
import {
  Add,
  Task,
  CheckCircle,
  Warning,
  TrendingUp,
  Category,
  CalendarToday,
  PriorityHigh,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useTask } from '../../contexts/TaskContext';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const STATUS_COLORS = {
  Pending: '#FFA500', // orange
  'In Progress': '#00BFFF', // blue
  Completed: '#4CAF50', // green
  Cancelled: '#F44336', // red
};

const Dashboard = () => {
  const { dashboardData, getDashboardData, loading, error } = useTask();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    getDashboardData();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading dashboard..." />;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!dashboardData) {
    return <LoadingSpinner message="Loading dashboard..." />;
  }

  const {
    tasksDueToday,
    overdueTasks,
    upcomingTasks,
    completedTasks,
    popularCategories,
    stats,
  } = dashboardData;

  // Prepare chart data
  const chartData = completedTasks.map(item => ({
    date: item._id,
    completed: item.count,
  }));

  // Prepare pie chart data for task status distribution
  const pieData = [
    { name: 'Pending', value: stats.pending || 0 },
    { name: 'In Progress', value: stats['in-progress'] || 0 },
    { name: 'Completed', value: stats.completed || 0 },
    { name: 'Cancelled', value: stats.cancelled || 0 },
  ];

  // Filter out zero-value statuses for the pie chart and legend
  const filteredPieData = pieData.filter(entry => entry.value > 0);

  // Custom label function for inside-slice labels
  const renderCustomizedLabel = ({
    cx, cy, midAngle, innerRadius, outerRadius, percent, index,
  }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.7;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
      <text
        x={x}
        y={y}
        fill="#222"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={18}
        fontWeight={700}
        style={{ textShadow: '0 1px 4px #fff, 0 0 2px #fff' }}
      >
        {filteredPieData[index].name} {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in-progress': return 'info';
      case 'pending': return 'warning';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3,
        flexDirection: { xs: 'column', sm: 'row' },
        gap: { xs: 2, sm: 0 },
        textAlign: { xs: 'center', sm: 'left' }
      }}>
        <Typography 
          variant="h4" 
          component="h1"
          sx={{ 
            fontSize: { xs: '1.5rem', sm: '2.125rem' },
            lineHeight: { xs: 1.2, sm: 1.3 }
          }}
        >
          Welcome back, {user?.profile?.firstName || user?.username}!
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/tasks/new')}
          sx={{ 
            minWidth: { xs: '100%', sm: 'auto' },
            py: { xs: 1.5, sm: 1 }
          }}
        >
          New Task
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Task color="primary" sx={{ mr: 2, fontSize: { xs: '1.5rem', sm: '2rem' } }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                    Total Tasks
                  </Typography>
                  <Typography variant="h4" sx={{ fontSize: { xs: '1.5rem', sm: '2.125rem' } }}>
                    {Object.values(stats).reduce((a, b) => a + b, 0)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CheckCircle color="success" sx={{ mr: 2, fontSize: { xs: '1.5rem', sm: '2rem' } }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                    Completed
                  </Typography>
                  <Typography variant="h4" sx={{ fontSize: { xs: '1.5rem', sm: '2.125rem' } }}>
                    {stats.completed || 0}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Warning color="warning" sx={{ mr: 2, fontSize: { xs: '1.5rem', sm: '2rem' } }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                    Overdue
                  </Typography>
                  <Typography variant="h4" sx={{ fontSize: { xs: '1.5rem', sm: '2.125rem' } }}>
                    {overdueTasks.length}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CalendarToday color="info" sx={{ mr: 2, fontSize: { xs: '1.5rem', sm: '2rem' } }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                    Due Today
                  </Typography>
                  <Typography variant="h4" sx={{ fontSize: { xs: '1.5rem', sm: '2.125rem' } }}>
                    {tasksDueToday.length}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Charts */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Tasks Completed (Last 7 Days)
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="completed" stroke="#8884d8" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Task Status Distribution
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                Overview of your tasks by status
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={filteredPieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={90}
                    innerRadius={40}
                    fill="#8884d8"
                    dataKey="value"
                    stroke="#fff"
                    strokeWidth={2}
                    isAnimationActive={true}
                    animationDuration={900}
                    style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.10))' }}
                  >
                    {filteredPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [`${value} task${value !== 1 ? 's' : ''}`, name]} />
                </PieChart>
              </ResponsiveContainer>
              {/* Show message if no tasks */}
              {filteredPieData.length === 0 && (
                <Typography color="textSecondary" align="center" sx={{ mt: 2 }}>
                  No tasks to display.
                </Typography>
              )}
              {/* Custom Legend */}
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', mt: 2 }}>
                {filteredPieData.map((entry) => {
                  const total = filteredPieData.reduce((sum, e) => sum + e.value, 0);
                  const percent = total ? ((entry.value / total) * 100).toFixed(0) : 0;
                  return (
                    <Box key={entry.name} sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                      <Box sx={{ width: 16, height: 16, borderRadius: '50%', backgroundColor: STATUS_COLORS[entry.name], mr: 1, border: '2px solid #fff', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }} />
                      <Typography variant="body2" sx={{ minWidth: 90, fontWeight: 600 }}>{entry.name}</Typography>
                      <Typography variant="body2" color="textSecondary" sx={{ ml: 1, minWidth: 40 }}>
                        {entry.value} task{entry.value !== 1 ? 's' : ''}
                      </Typography>
                      <Typography variant="body2" color="primary" sx={{ ml: 1, fontWeight: 500 }}>
                        {percent}%
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Tasks Due Today */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Tasks Due Today
              </Typography>
              {tasksDueToday.length === 0 ? (
                <Typography color="textSecondary">No tasks due today</Typography>
              ) : (
                <List>
                  {tasksDueToday.slice(0, 5).map((task) => (
                    <ListItem key={task._id} divider>
                      <ListItemIcon>
                        <Task color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary={task.title}
                        secondary={
                          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                            <Chip
                              label={task.priority}
                              size="small"
                              color={getPriorityColor(task.priority)}
                            />
                            <Chip
                              label={task.status}
                              size="small"
                              color={getStatusColor(task.status)}
                            />
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Overdue Tasks */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Overdue Tasks
              </Typography>
              {overdueTasks.length === 0 ? (
                <Typography color="textSecondary">No overdue tasks</Typography>
              ) : (
                <List>
                  {overdueTasks.slice(0, 5).map((task) => (
                    <ListItem key={task._id} divider>
                      <ListItemIcon>
                        <PriorityHigh color="error" />
                      </ListItemIcon>
                      <ListItemText
                        primary={task.title}
                        secondary={
                          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                            <Chip
                              label={task.priority}
                              size="small"
                              color={getPriorityColor(task.priority)}
                            />
                            <Chip
                              label="Overdue"
                              size="small"
                              color="error"
                            />
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Popular Categories */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Popular Categories
              </Typography>
              {popularCategories.length === 0 ? (
                <Typography color="textSecondary">No categories yet</Typography>
              ) : (
                <List>
                  {popularCategories.map((category) => (
                    <ListItem key={category._id}>
                      <ListItemIcon>
                        <Category color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary={category._id}
                        secondary={`${category.count} tasks`}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Upcoming Tasks */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Upcoming Tasks
              </Typography>
              {upcomingTasks.length === 0 ? (
                <Typography color="textSecondary">No upcoming tasks</Typography>
              ) : (
                <List>
                  {upcomingTasks.slice(0, 5).map((task) => (
                    <ListItem key={task._id} divider>
                      <ListItemIcon>
                        <TrendingUp color="info" />
                      </ListItemIcon>
                      <ListItemText
                        primary={task.title}
                        secondary={
                          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                            <Chip
                              label={task.priority}
                              size="small"
                              color={getPriorityColor(task.priority)}
                            />
                            <Chip
                              label={new Date(task.dueDate).toLocaleDateString()}
                              size="small"
                              variant="outlined"
                            />
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 