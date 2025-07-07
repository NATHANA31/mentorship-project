import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const AdminMenteesPage: React.FC = () => {
  const [mentees, setMentees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMentees = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${apiUrl}/api/auth/all-mentees`, {
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
  }, []);

  return (
    <Box maxWidth={900} mx="auto" mt={6}>
      <Typography variant="h4" mb={3} fontWeight={700} color="#ffb347">All Mentees</Typography>
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
              {mentees.map((mentee) => (
                <TableRow key={mentee._id}>
                  <TableCell>{mentee.name}</TableCell>
                  <TableCell>{mentee.email}</TableCell>
                  <TableCell>{mentee.bio || '-'}</TableCell>
                  <TableCell>{Array.isArray(mentee.skills) ? mentee.skills.join(', ') : '-'}</TableCell>
                  <TableCell>{mentee.goals || '-'}</TableCell>
                  <TableCell>{mentee.favoriteQuote || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default AdminMenteesPage; 