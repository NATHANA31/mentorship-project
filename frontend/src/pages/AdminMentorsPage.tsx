import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const AdminMentorsPage: React.FC = () => {
  const [mentors, setMentors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMentors = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${apiUrl}/api/auth/mentors`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.errors?.[0]?.msg || 'Failed to fetch mentors');
        } else {
          setMentors(data);
        }
      } catch (err) {
        setError('Server error.');
      }
      setLoading(false);
    };
    fetchMentors();
  }, []);

  return (
    <Box maxWidth={900} mx="auto" mt={6}>
      <Typography variant="h4" mb={3} fontWeight={700} color="#ffb347">All Mentors</Typography>
      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Bio</TableCell>
                <TableCell>Skills</TableCell>
                <TableCell>Goals</TableCell>
                <TableCell>Favorite Quote</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {mentors.map((mentor) => (
                <TableRow key={mentor._id}>
                  <TableCell>{mentor.name}</TableCell>
                  <TableCell>{mentor.email}</TableCell>
                  <TableCell>{mentor.bio || '-'}</TableCell>
                  <TableCell>{Array.isArray(mentor.skills) ? mentor.skills.join(', ') : '-'}</TableCell>
                  <TableCell>{mentor.goals || '-'}</TableCell>
                  <TableCell>{mentor.favoriteQuote || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default AdminMentorsPage; 