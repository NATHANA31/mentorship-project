import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Chip, Stack, CircularProgress, Alert, Card, CardContent, Button } from '@mui/material';

const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const MentorProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [mentor, setMentor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [requestStatus, setRequestStatus] = useState<'none' | 'pending' | 'accepted' | 'rejected'>('none');
  const token = localStorage.getItem('token');
  const currentUserId = localStorage.getItem('userId'); // Assume you store this after login
  const currentUserRole = localStorage.getItem('role'); // Assume you store this after login
  const [isAlreadyMentee, setIsAlreadyMentee] = useState(false);

  useEffect(() => {
    const fetchMentor = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`${apiUrl}/api/auth/mentors?_id=${id}`);
        const data = await res.json();
        if (!res.ok || !data.length) {
          setError('Mentor not found.');
        } else {
          const foundMentor = data.find((m: any) => m._id === id);
          if (foundMentor) {
            setMentor(foundMentor);
          } else {
            setError('Mentor not found.');
          }
        }
      } catch (err) {
        setError('Server error.');
      }
      setLoading(false);
    };
    fetchMentor();
    // Check if already a mentee
    const checkAlreadyMentee = async () => {
      if (!token || !id || currentUserRole !== 'mentee') return;
      try {
        const res = await fetch(`${apiUrl}/api/auth/mentees`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const mentees = await res.json();
        if (Array.isArray(mentees) && mentees.some((m: any) => m._id === currentUserId && m.mentor === id)) {
          setIsAlreadyMentee(true);
        }
      } catch {}
    };
    checkAlreadyMentee();
  }, [id, token, currentUserId, currentUserRole]);

  // Check if a request is already sent (optional: fetch from backend)
  // For demo, always allow sending unless you want to implement request status check

  const handleRequest = async () => {
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`${apiUrl}/api/auth/requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ mentorId: id }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.errors?.[0]?.msg || 'Failed to send request');
        setRequestStatus('pending');
      } else {
        setSuccess('Request sent!');
        setRequestStatus('pending');
      }
    } catch (err) {
      setError('Server error.');
    }
  };

  if (loading) return <Box display="flex" justifyContent="center" mt={8}><CircularProgress /></Box>;
  if (error) return <Alert severity="error" sx={{ mt: 8 }}>{error}</Alert>;
  if (!mentor) return null;

  const isOwnProfile = currentUserId === mentor._id;
  const isMentee = currentUserRole === 'mentee';

  return (
    <Box maxWidth={500} mx="auto" mt={8} p={4} boxShadow={3} borderRadius={3} bgcolor="#fff">
      <Card>
        <CardContent>
          <Typography variant="h4" mb={2} color="#43ea7f" fontWeight={700} align="center">
            {mentor.name}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" mb={2} align="center">
            {mentor.bio || 'No bio provided.'}
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" mb={2} justifyContent="center">
            {(mentor.skills || []).map((s: string) => (
              <Chip key={s} label={s} color="success" size="small" />
            ))}
          </Stack>
          {mentor.goals && (
            <Typography variant="body2" mb={1}><b>Goals:</b> {mentor.goals}</Typography>
          )}
          {mentor.favoriteQuote && (
            <Typography variant="body2" mb={1}><b>Favorite Quote:</b> {mentor.favoriteQuote}</Typography>
          )}
          {isMentee && !isOwnProfile && (
            <>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                sx={{ mt: 3, fontWeight: 700 }}
                onClick={handleRequest}
                disabled={requestStatus === 'pending' || isAlreadyMentee}
              >
                {isAlreadyMentee ? 'Already a Mentee' : requestStatus === 'pending' ? 'Request Pending' : 'Request Mentorship'}
              </Button>
            </>
          )}
          {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        </CardContent>
      </Card>
    </Box>
  );
};

export default MentorProfilePage;