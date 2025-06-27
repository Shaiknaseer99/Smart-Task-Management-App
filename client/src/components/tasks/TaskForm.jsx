import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box, Typography, TextField, Button, Paper, MenuItem, Grid, Alert, CircularProgress, InputAdornment
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useTask } from '../../contexts/TaskContext';
import { useAuth } from '../../contexts/AuthContext';
import { AutoAwesome, Save, CalendarToday } from '@mui/icons-material';

const categories = [
  'Work', 'Personal', 'Shopping', 'Health', 'Finance', 'Education', 'Other'
];
const priorities = ['low', 'medium', 'high', 'critical'];
const statuses = ['pending', 'in-progress', 'completed', 'cancelled'];

const TaskForm = () => {
  const { tasks, createTask, updateTask, predictCategory, generateDescription, loading, error } = useTask();
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [form, setForm] = useState({
    title: '',
    summary: '',
    description: '',
    category: '',
    dueDate: null,
    priority: 'medium',
    status: 'pending',
  });
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [aiCategory, setAiCategory] = useState(null);

  useEffect(() => {
    if (isEdit && tasks.length > 0) {
      const task = tasks.find(t => t._id === id);
      if (task) {
        setForm({
          title: task.title,
          summary: task.summary || '',
          description: task.description || '',
          category: task.category,
          dueDate: task.dueDate ? new Date(task.dueDate) : null,
          priority: task.priority,
          status: task.status,
        });
      }
    } else {
      // Set default due date to current date + 1 day for new tasks
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setForm(prev => ({ ...prev, dueDate: tomorrow }));
    }
  }, [isEdit, id, tasks]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for date field
    if (name === 'dueDate') {
      // For editing existing tasks, allow past dates if they were already set
      if (isEdit) {
        // Allow any date change when editing
        setAiError(null);
      } else {
        // For new tasks, validate that the date is not in the past
        const selectedDate = new Date(value);
        const now = new Date();
        
        // Compare only the date part (not time) for today's date
        const selectedDateOnly = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
        const todayOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        if (selectedDateOnly < todayOnly) {
          setAiError('Due date cannot be in the past');
          return;
        }
        setAiError(null);
      }
    }
    
    setForm({ ...form, [name]: value });
  };

  const handleDateChange = (newDate) => {
    // For editing existing tasks, allow past dates if they were already set
    if (isEdit) {
      setAiError(null);
    } else {
      // For new tasks, validate that the date is not in the past
      if (newDate) {
        const now = new Date();
        
        // Compare only the date part (not time) for today's date
        const selectedDateOnly = new Date(newDate.getFullYear(), newDate.getMonth(), newDate.getDate());
        const todayOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        if (selectedDateOnly < todayOnly) {
          setAiError('Due date cannot be in the past');
          return;
        }
      }
      setAiError(null);
    }
    
    setForm({ ...form, dueDate: newDate });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate due date before submission (only for new tasks)
    if (!isEdit && form.dueDate) {
      const now = new Date();
      
      // Compare only the date part (not time) for today's date
      const selectedDateOnly = new Date(form.dueDate.getFullYear(), form.dueDate.getMonth(), form.dueDate.getDate());
      const todayOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      if (selectedDateOnly < todayOnly) {
        setAiError('Due date cannot be in the past');
        return;
      }
    }
    
    if (isEdit) {
      await updateTask(id, form);
    } else {
      await createTask(form);
    }
    navigate('/tasks');
  };

  const handleAIDescription = async () => {
    setAiLoading(true);
    setAiError(null);
    try {
      const description = await generateDescription(form.summary);
      setForm(f => ({ ...f, description }));
    } catch (err) {
      setAiError('Failed to generate description.');
    }
    setAiLoading(false);
  };

  const handleAICategory = async () => {
    setAiLoading(true);
    setAiError(null);
    try {
      const previousCategories = tasks.map(t => t.category);
      const category = await predictCategory(previousCategories);
      setForm(f => ({ ...f, category }));
      setAiCategory(category);
    } catch (err) {
      setAiError('Failed to predict category.');
    }
    setAiLoading(false);
  };

  return (
    <Box maxWidth="sm" mx="auto" sx={{ px: { xs: 2, sm: 0 } }}>
      <Paper sx={{ p: { xs: 3, sm: 4 }, mt: { xs: 2, sm: 4 } }}>
        <Typography 
          variant="h5" 
          gutterBottom
          sx={{ 
            fontSize: { xs: '1.25rem', sm: '1.5rem' },
            mb: { xs: 2, sm: 3 }
          }}
        >
          {isEdit ? 'Edit Task' : 'Create New Task'}
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {aiError && <Alert severity="error" sx={{ mb: 2 }}>{aiError}</Alert>}
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Title"
                name="title"
                value={form.title}
                onChange={handleChange}
                required
                fullWidth
                size="small"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Summary"
                name="summary"
                value={form.summary}
                onChange={handleChange}
                fullWidth
                size="small"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Button
                        size="small"
                        startIcon={<AutoAwesome />}
                        onClick={handleAIDescription}
                        disabled={aiLoading || !form.summary}
                        sx={{ 
                          fontSize: { xs: '0.75rem', sm: '0.875rem' },
                          px: { xs: 1, sm: 2 }
                        }}
                      >
                        AI Desc
                      </Button>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Description"
                name="description"
                value={form.description}
                onChange={handleChange}
                multiline
                minRows={3}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Category"
                name="category"
                value={form.category}
                onChange={handleChange}
                required
                fullWidth
              >
                {categories.map((cat) => (
                  <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                ))}
              </TextField>
              <Button
                size="small"
                startIcon={<AutoAwesome />}
                onClick={handleAICategory}
                disabled={aiLoading}
                sx={{ mt: 1 }}
                variant="outlined"
              >
                AI Cat
              </Button>
              {/* AI Category Suggestion as Button below dropdown only if not selected */}
              {aiCategory && !form.category && !categories.includes(aiCategory) && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="caption" color="primary" sx={{ mr: 1 }}>
                    AI Suggestion:
                  </Typography>
                  <Button
                    size="small"
                    variant="outlined"
                    color="primary"
                    onClick={() => setForm(f => ({ ...f, category: aiCategory }))}
                    sx={{ textTransform: 'none', fontWeight: 500 }}
                  >
                    {aiCategory}
                  </Button>
                </Box>
              )}
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Priority"
                name="priority"
                value={form.priority}
                onChange={handleChange}
                required
                fullWidth
              >
                {priorities.map((p) => (
                  <MenuItem key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <DateTimePicker
                label="Due Date & Time"
                value={form.dueDate}
                onChange={handleDateChange}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    required
                    fullWidth
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <InputAdornment position="start">
                          <CalendarToday color="action" />
                        </InputAdornment>
                      ),
                    }}
                    helperText={form.dueDate ? `Due: ${form.dueDate.toLocaleString()}` : 'Select due date and time'}
                    error={!isEdit && form.dueDate && form.dueDate < new Date()}
                  />
                )}
                slotProps={{
                  textField: {
                    variant: 'outlined',
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Status"
                name="status"
                value={form.status}
                onChange={handleChange}
                required
                fullWidth
              >
                {statuses.map((s) => (
                  <MenuItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                startIcon={aiLoading ? <CircularProgress size={18} /> : <Save />}
                fullWidth
                disabled={aiLoading || loading}
                sx={{ mt: 2 }}
              >
                {isEdit ? 'Update Task' : 'Create Task'}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Box>
  );
};

export default TaskForm; 