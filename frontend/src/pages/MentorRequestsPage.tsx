import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, Button, Stack, CircularProgress, Alert } from '@mui/material';

const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const MentorRequestsPage: React.FC = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const token = localStorage.getItem('token');

  const API_URL = `${apiUrl}/api/auth/requests/mentor`;
  const ACCEPT_URL = `${apiUrl}/api/auth/requests`;

  const fetchRequests = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.errors?.[0]?.msg || 'Failed to fetch requests');
      } else {
        setRequests(data);
      }
    } catch (err) {
      setError('Server error.');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();
    // eslint-disable-next-line
  }, []);

  const handleAction = async (id: string, action: 'accept' | 'reject') => {
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`${ACCEPT_URL}/${id}/${action}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.errors?.[0]?.msg || 'Failed to update request');
      } else {
        setSuccess(`Request ${action}ed!`);
        fetchRequests();
      }
    } catch (err) {
      setError('Server error.');
    }
  };

  if (loading) return <Box display="flex" justifyContent="center" mt={8}><CircularProgress /></Box>;

  return (
    <Box maxWidth={700} mx="auto" mt={8} p={4}>
      <Typography variant="h4" mb={3} align="center" color="#43ea7f" fontWeight={700}>
        Mentorship Requests
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      {requests.length === 0 ? (
        <Typography align="center" color="text.secondary">No requests found.</Typography>
      ) : (
        <Stack spacing={3}>
          {requests.map(req => (
            <Card key={req._id} sx={{ boxShadow: 3 }}>
              <CardContent>
                <Typography variant="h6" color="#43c6ea" fontWeight={700}>
                  {req.mentee?.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={1}>
                  {req.mentee?.bio || 'No bio provided.'}
                </Typography>
                <Typography variant="body2" mb={1}><b>Email:</b> {req.mentee?.email}</Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" mb={1}>
                  {(req.mentee?.skills || []).map((s: string) => (
                    <Button key={s} size="small" variant="outlined" color="success" sx={{ mr: 1, mb: 1 }} disabled>{s}</Button>
                  ))}
                </Stack>
                <Typography variant="body2" mb={1}><b>Status:</b> {req.status}</Typography>
                {req.status === 'pending' && (
                  <Stack direction="row" spacing={2} mt={2}>
                    <Button variant="contained" color="success" onClick={() => handleAction(req._id, 'accept')}>Accept</Button>
                    <Button variant="outlined" color="error" onClick={() => handleAction(req._id, 'reject')}>Reject</Button>
                  </Stack>
                )}
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default MentorRequestsPage; 