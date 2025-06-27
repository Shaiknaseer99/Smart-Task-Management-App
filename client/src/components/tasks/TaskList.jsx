import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, Card, CardContent, Grid, Chip, IconButton, Tooltip, Menu, MenuItem, TextField, InputAdornment, Select, FormControl, InputLabel
} from '@mui/material';
import {
  Add, Edit, Delete, CheckCircle, Cancel, FileDownload, Search, FilterList, MoreVert
} from '@mui/icons-material';
import { useTask } from '../../contexts/TaskContext';
import LoadingSpinner from '../common/LoadingSpinner';

const highlightText = (text, query) => {
  if (!query) return text;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.split(regex).map((part, i) =>
    regex.test(part) ? <mark key={i} style={{ background: '#ffe082', padding: 0 }}>{part}</mark> : part
  );
};

const TaskList = () => {
  const { tasks: allTasks, getTasks, deleteTask, completeTask, exportTasks, loading, error } = useTask();
  const [filters, setFilters] = useState({ search: '', status: '', priority: '', sortBy: 'dueDate', sortOrder: 'asc' });
  const [searchInput, setSearchInput] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const navigate = useNavigate();

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setFilters(f => ({ ...f, search: searchInput }));
    }, 400);
    return () => clearTimeout(handler);
  }, [searchInput]);

  useEffect(() => {
    getTasks(filters);
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    if (name === 'search') {
      setSearchInput(value);
    } else {
      setFilters({ ...filters, [name]: value });
    }
  };

  // Enhanced client-side search and filter
  const filteredTasks = useMemo(() => {
    let filtered = allTasks;
    const q = filters.search.trim().toLowerCase();
    if (q) {
      filtered = filtered.filter(task =>
        (task.title && task.title.toLowerCase().includes(q)) ||
        (task.description && task.description.toLowerCase().includes(q)) ||
        (task.category && task.category.toLowerCase().includes(q)) ||
        (task.status && task.status.toLowerCase().includes(q))
      );
    }
    if (filters.status) filtered = filtered.filter(t => t.status === filters.status);
    if (filters.priority) filtered = filtered.filter(t => t.priority === filters.priority);
    // Sorting
    if (filters.sortBy) {
      filtered = [...filtered].sort((a, b) => {
        if (filters.sortBy === 'dueDate' || filters.sortBy === 'createdAt') {
          return filters.sortOrder === 'asc'
            ? new Date(a[filters.sortBy]) - new Date(b[filters.sortBy])
            : new Date(b[filters.sortBy]) - new Date(a[filters.sortBy]);
        } else {
          return filters.sortOrder === 'asc'
            ? (a[filters.sortBy] || '').localeCompare(b[filters.sortBy] || '')
            : (b[filters.sortBy] || '').localeCompare(a[filters.sortBy] || '');
        }
      });
    }
    return filtered;
  }, [allTasks, filters]);

  const handleMenuOpen = (event, task) => {
    setAnchorEl(event.currentTarget);
    setSelectedTask(task);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedTask(null);
  };

  const handleEdit = () => {
    navigate(`/tasks/${selectedTask._id}/edit`);
    handleMenuClose();
  };

  const handleDelete = async () => {
    await deleteTask(selectedTask._id);
    handleMenuClose();
  };

  const handleComplete = async () => {
    await completeTask(selectedTask._id);
    handleMenuClose();
  };

  const handleExport = (format) => {
    exportTasks(format);
  };

  if (loading) return <LoadingSpinner message="Loading tasks..." />;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4">Tasks</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/tasks/new')}>
          New Task
        </Button>
      </Box>
      <Box sx={{ 
        display: 'flex', 
        gap: 2, 
        mb: 2, 
        flexWrap: 'wrap',
        '& > *': {
          minWidth: { xs: '100%', sm: 'auto' },
          flex: { xs: '1 1 100%', sm: '0 0 auto' }
        }
      }}>
        <TextField
          label="Search"
          name="search"
          value={searchInput}
          onChange={handleFilterChange}
          InputProps={{ endAdornment: <InputAdornment position="end"><Search /></InputAdornment> }}
          size="small"
          sx={{ minWidth: { xs: '100%', sm: 200 } }}
        />
        <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 120 } }}>
          <InputLabel>Status</InputLabel>
          <Select
            label="Status"
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="in-progress">In Progress</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
            <MenuItem value="cancelled">Cancelled</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 120 } }}>
          <InputLabel>Priority</InputLabel>
          <Select
            label="Priority"
            name="priority"
            value={filters.priority}
            onChange={handleFilterChange}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="low">Low</MenuItem>
            <MenuItem value="medium">Medium</MenuItem>
            <MenuItem value="high">High</MenuItem>
            <MenuItem value="critical">Critical</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 120 } }}>
          <InputLabel>Sort By</InputLabel>
          <Select
            label="Sort By"
            name="sortBy"
            value={filters.sortBy}
            onChange={handleFilterChange}
          >
            <MenuItem value="dueDate">Due Date</MenuItem>
            <MenuItem value="priority">Priority</MenuItem>
            <MenuItem value="status">Status</MenuItem>
            <MenuItem value="createdAt">Created At</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 120 } }}>
          <InputLabel>Order</InputLabel>
          <Select
            label="Order"
            name="sortOrder"
            value={filters.sortOrder}
            onChange={handleFilterChange}
          >
            <MenuItem value="asc">Ascending</MenuItem>
            <MenuItem value="desc">Descending</MenuItem>
          </Select>
        </FormControl>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', width: { xs: '100%', sm: 'auto' } }}>
          <Button
            variant="outlined"
            startIcon={<FileDownload />}
            onClick={() => handleExport('csv')}
            size="small"
          >
            CSV
          </Button>
          <Button
            variant="outlined"
            startIcon={<FileDownload />}
            onClick={() => handleExport('excel')}
            size="small"
          >
            Excel
          </Button>
          <Button
            variant="outlined"
            startIcon={<FileDownload />}
            onClick={() => handleExport('pdf')}
            size="small"
          >
            PDF
          </Button>
        </Box>
      </Box>
      <Grid container spacing={2}>
        {filteredTasks.length === 0 ? (
          <Grid item xs={12}>
            <Typography color="textSecondary">No tasks found matching your search.</Typography>
          </Grid>
        ) : (
          filteredTasks.map((task) => (
            <Grid item xs={12} sm={6} md={6} lg={4} key={task._id}>
              <Card sx={{ mb: 2, height: '100%' }}>
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        cursor: 'pointer',
                        fontSize: { xs: '1rem', sm: '1.25rem' },
                        lineHeight: 1.2,
                        flex: 1,
                        mr: 1
                      }} 
                      onClick={() => navigate(`/tasks/${task._id}`)}
                    >
                      {highlightText(task.title, filters.search)}
                    </Typography>
                    <IconButton 
                      onClick={(e) => handleMenuOpen(e, task)}
                      size="small"
                      sx={{ flexShrink: 0 }}
                    >
                      <MoreVert />
                    </IconButton>
                  </Box>
                  <Typography 
                    variant="body2" 
                    color="textSecondary" 
                    sx={{ mb: 1 }}
                  >
                    {highlightText(task.description, filters.search)}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                    <Chip label={highlightText(task.category, filters.search)} size="small" color="primary" />
                    <Chip label={highlightText(task.status, filters.search)} size="small" color="info" />
                    <Chip label={task.priority} size="small" color="secondary" />
                  </Box>
                  <Box sx={{ 
                    display: 'flex', 
                    gap: 1,
                    justifyContent: { xs: 'space-between', sm: 'flex-start' }
                  }}>
                    {task.status !== 'completed' && (
                      <Tooltip title="Mark as Complete">
                        <IconButton 
                          color="success" 
                          onClick={() => completeTask(task._id)}
                          size="small"
                        >
                          <CheckCircle />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title="Edit">
                      <IconButton 
                        color="primary" 
                        onClick={() => navigate(`/tasks/${task._id}/edit`)}
                        size="small"
                      >
                        <Edit />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton 
                        color="error" 
                        onClick={() => deleteTask(task._id)}
                        size="small"
                      >
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={handleEdit}>Edit</MenuItem>
        <MenuItem onClick={handleComplete}>Mark as Complete</MenuItem>
        <MenuItem onClick={handleDelete}>Delete</MenuItem>
      </Menu>
    </Box>
  );
};

export default TaskList; 