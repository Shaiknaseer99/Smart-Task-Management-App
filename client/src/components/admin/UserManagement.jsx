import { useEffect, useState } from 'react';
import { Table, TableHead, TableRow, TableCell, TableBody, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select, MenuItem, Box, IconButton } from '@mui/material';
import axios from 'axios';
import DeleteIcon from '@mui/icons-material/Delete';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ username: '', email: '', password: '', role: 'user' });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const res = await axios.get('/admin/users');
    setUsers(res.data.data);
  };

  const handleCreate = async () => {
    await axios.post('/admin/users', form);
    setOpen(false);
    setForm({ username: '', email: '', password: '', role: 'user' });
    fetchUsers();
  };

  const handleDeactivate = async (id) => {
    await axios.post(`/admin/users/${id}/deactivate`);
    fetchUsers();
  };

  const handleReactivate = async (id) => {
    await axios.post(`/admin/users/${id}/reactivate`);
    fetchUsers();
  };

  const handleRoleChange = async (id, newRole) => {
    await axios.put(`/admin/users/${id}/role`, { role: newRole });
    fetchUsers();
  };

  const handleDelete = async (id) => {
    await axios.delete(`/admin/users/${id}`);
    fetchUsers();
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
        <Button variant="contained" onClick={() => setOpen(true)}>Create User</Button>
      </Box>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Create User</DialogTitle>
        <DialogContent>
          <TextField label="Username" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} fullWidth sx={{ mb: 2 }} />
          <TextField label="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} fullWidth sx={{ mb: 2 }} />
          <TextField label="Password" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} fullWidth sx={{ mb: 2 }} />
          <Select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} fullWidth>
            <MenuItem value="user">User</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
          </Select>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleCreate} variant="contained">Create</Button>
        </DialogActions>
      </Dialog>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Username</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Role</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map(u => (
            <TableRow key={u._id}>
              <TableCell>{u.username}</TableCell>
              <TableCell>{u.email}</TableCell>
              <TableCell>{u.isActive ? 'Active' : 'Inactive'}</TableCell>
              <TableCell>
                <Select
                  value={u.role}
                  onChange={e => handleRoleChange(u._id, e.target.value)}
                  size="small"
                  disabled={!u.isActive}
                >
                  <MenuItem value="user">User</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                </Select>
              </TableCell>
              <TableCell>
                {u.isActive
                  ? <Button color="error" onClick={() => handleDeactivate(u._id)}>Deactivate</Button>
                  : <Button color="success" onClick={() => handleReactivate(u._id)}>Reactivate</Button>
                }
                <IconButton color="error" onClick={() => handleDelete(u._id)} title="Delete User">
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
} 