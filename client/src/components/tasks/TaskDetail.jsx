import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, Chip, Button, Divider, List, ListItem, ListItemText, TextField, IconButton, Alert
} from '@mui/material';
import { Edit, Delete, ArrowBack, AddComment } from '@mui/icons-material';
import { useTask } from '../../contexts/TaskContext';
import LoadingSpinner from '../common/LoadingSpinner';

const TaskDetail = () => {
  const { id } = useParams();
  const { tasks, getTasks, addNote, deleteTask, loading, error } = useTask();
  const [note, setNote] = useState('');
  const [noteError, setNoteError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!tasks.length) getTasks();
  }, []);

  const task = tasks.find(t => t._id === id);

  if (loading || !task) return <LoadingSpinner message="Loading task..." />;

  const handleAddNote = async () => {
    if (!note.trim()) {
      setNoteError('Note cannot be empty');
      return;
    }
    await addNote(id, note);
    setNote('');
    setNoteError(null);
  };

  const handleDelete = async () => {
    await deleteTask(id);
    navigate('/tasks');
  };

  return (
    <Box maxWidth="md" mx="auto">
      <Button startIcon={<ArrowBack />} onClick={() => navigate('/tasks')} sx={{ mb: 2 }}>
        Back to Tasks
      </Button>
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h5">{task.title}</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Chip label={task.category} color="primary" />
              <Chip label={task.priority} color={task.priority === 'critical' ? 'error' : task.priority === 'high' ? 'warning' : 'info'} />
              <Chip label={task.status} color={task.status === 'completed' ? 'success' : task.status === 'cancelled' ? 'error' : 'default'} />
              <Chip label={new Date(task.dueDate).toLocaleDateString()} variant="outlined" />
            </Box>
          </Box>
          <Typography color="textSecondary" sx={{ mt: 2 }}>{task.description}</Typography>
          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant="contained" startIcon={<Edit />} onClick={() => navigate(`/tasks/${id}/edit`)}>
              Edit
            </Button>
            <Button variant="outlined" color="error" startIcon={<Delete />} onClick={handleDelete}>
              Delete
            </Button>
          </Box>
        </CardContent>
      </Card>
      <Box mt={4}>
        <Typography variant="h6">Notes</Typography>
        <List>
          {task.notes && task.notes.length > 0 ? (
            task.notes.map((note, idx) => (
              <ListItem key={idx} divider>
                <ListItemText
                  primary={note.content}
                  secondary={`By ${note.createdBy?.username || 'User'} on ${new Date(note.createdAt).toLocaleString()}`}
                />
              </ListItem>
            ))
          ) : (
            <Typography color="textSecondary" sx={{ ml: 2 }}>
              No notes yet.
            </Typography>
          )}
        </List>
        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          <TextField
            label="Add a note"
            value={note}
            onChange={e => setNote(e.target.value)}
            fullWidth
            error={!!noteError}
            helperText={noteError}
          />
          <IconButton color="primary" onClick={handleAddNote}>
            <AddComment />
          </IconButton>
        </Box>
      </Box>
      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
    </Box>
  );
};

export default TaskDetail; 