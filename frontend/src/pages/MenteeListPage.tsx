import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, Chip, Stack, CircularProgress, Alert } from '@mui/material';

const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const API_URL = `${apiUrl}/api/auth/mentees`;

const MenteeListPage: React.FC = () => {
  const [mentees, setMentees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchMentees = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(API_URL, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.errors?.[0]?.msg || 'Failed to fetch mentees');
        } else {
          setMentees(data);
        }
      } catch (err) {
        setError('Server error.');
      }
      setLoading(false);
    };
    fetchMentees();
    // eslint-disable-next-line
  }, []);

  if (loading) return <Box display="flex" justifyContent="center" mt={8}><CircularProgress /></Box>;

  return (
    <Box maxWidth={900} mx="auto" mt={8} p={4}>
      <Typography variant="h4" mb={3} align="center" color="#43ea7f" fontWeight={700}>
        My Mentees
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {mentees.length === 0 ? (
        <Typography align="center" color="text.secondary">No mentees found.</Typography>
      ) : (
        <Stack spacing={3}>
          {mentees.map(mentee => (
            <Card key={mentee._id} sx={{ boxShadow: 3 }}>
              <CardContent>
                <Typography variant="h6" color="#43c6ea" fontWeight={700}>
                  {mentee.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={1}>
                  {mentee.bio || 'No bio provided.'}
                </Typography>
                <Typography variant="body2" mb={1}><b>Email:</b> {mentee.email}</Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" mb={1}>
                  {(mentee.skills || []).map((s: string) => (
                    <Chip key={s} label={s} color="success" size="small" />
                  ))}
                </Stack>
                {mentee.goals && (
                  <Typography variant="body2" mb={1}><b>Goals:</b> {mentee.goals}</Typography>
                )}
                {mentee.favoriteQuote && (
                  <Typography variant="body2" mb={1}><b>Favorite Quote:</b> {mentee.favoriteQuote}</Typography>
                )}
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default MenteeListPage; 