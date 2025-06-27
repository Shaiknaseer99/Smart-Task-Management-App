import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Box, Card, CardContent, Typography, Avatar, Divider } from '@mui/material';

const Profile = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <Box maxWidth="sm" mx="auto" mt={4}>
      <Card>
        <CardContent>
          <Box display="flex" flexDirection="column" alignItems="center" mb={2}>
            <Avatar
              src={user.profile?.avatar || user.avatar}
              sx={{ width: 80, height: 80, mb: 2 }}
            >
              {user.profile?.firstName?.[0] || user.username?.[0] || '?'}
            </Avatar>
            <Typography variant="h5" gutterBottom>
              {user.profile?.firstName ? `${user.profile.firstName} ${user.profile.lastName}` : user.username}
            </Typography>
            <Typography color="textSecondary">
              {user.email}
            </Typography>
            {user.provider === 'google' && (
              <Typography color="primary" fontSize={14} mt={1}>
                (Signed in with Google)
              </Typography>
            )}
          </Box>
          <Divider sx={{ mb: 2 }} />
          <Box>
            <Typography variant="subtitle1" fontWeight={600}>Username:</Typography>
            <Typography mb={1}>{user.username}</Typography>
            <Typography variant="subtitle1" fontWeight={600}>Email:</Typography>
            <Typography mb={1}>{user.email}</Typography>
            {user.profile?.firstName && (
              <>
                <Typography variant="subtitle1" fontWeight={600}>Name:</Typography>
                <Typography mb={1}>{user.profile.firstName} {user.profile.lastName}</Typography>
              </>
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Profile; 