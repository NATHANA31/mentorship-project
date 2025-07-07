import React, { useEffect, useState } from 'react';
import { Box, Typography, TextField, Chip, Card, CardContent, Stack, Button, CircularProgress, Alert, Select, MenuItem, InputLabel, FormControl } from '@mui/material';
import Grid from '@mui/material/Grid';
import { Link } from 'react-router-dom';

const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const API_URL = `${apiUrl}/api/auth/mentors`;

const MentorDiscoveryPage: React.FC = () => {
  const [mentors, setMentors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [skill, setSkill] = useState('');
  const [skillsList, setSkillsList] = useState<string[]>([]);

  useEffect(() => {
    const fetchMentors = async () => {
      setLoading(true);
      setError('');
      try {
        const params = [];
        if (search) params.push(`name=${encodeURIComponent(search)}`);
        if (skill) params.push(`skill=${encodeURIComponent(skill)}`);
        const url = params.length ? `${API_URL}?${params.join('&')}` : API_URL;
        const res = await fetch(url);
        const data = await res.json();
        if (!res.ok) {
          setError(data.errors?.[0]?.msg || 'Failed to fetch mentors');
        } else {
          setMentors(data);
          // Collect all unique skills for filter dropdown
          const allSkills = new Set<string>();
          data.forEach((mentor: any) => (mentor.skills || []).forEach((s: string) => allSkills.add(s)));
          setSkillsList(Array.from(allSkills));
        }
      } catch (err) {
        setError('Server error.');
      }
      setLoading(false);
    };
    fetchMentors();
    // eslint-disable-next-line
  }, [search, skill]);

  return (
    <Box maxWidth={1000} mx="auto" mt={6} p={2}>
      <Typography variant="h4" mb={3} align="center" color="#43ea7f" fontWeight={700}>
        Discover Mentors
      </Typography>
      <Box display="flex" gap={2} mb={4} justifyContent="center" flexWrap="wrap">
        <TextField
          label="Search by name"
          value={search}
          onChange={e => setSearch(e.target.value)}
          size="small"
        />
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel id="skill-filter-label">Filter by skill</InputLabel>
          <Select
            labelId="skill-filter-label"
            label="Filter by skill"
            value={skill}
            onChange={e => setSkill(e.target.value)}
          >
            <MenuItem value="">All Skills</MenuItem>
            {skillsList.map(s => (
              <MenuItem key={s} value={s}>{s}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      {loading ? (
        <Box display="flex" justifyContent="center" mt={6}><CircularProgress /></Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : mentors.length === 0 ? (
        <Typography align="center" color="text.secondary">No mentors found.</Typography>
      ) : (
        <Grid container component="div" spacing={3} justifyContent="center">
          {mentors.map(mentor => (
            // @ts-ignore
            <Grid item component="div" xs={12} sm={6} md={4} key={mentor._id}>
              <Card sx={{ minHeight: 220, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: 4 }}>
                <CardContent>
                  <Typography variant="h6" color="#43c6ea" fontWeight={700} gutterBottom>
                    {mentor.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mb={1}>
                    {mentor.bio || 'No bio provided.'}
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" mb={1}>
                    {(mentor.skills || []).map((s: string) => (
                      <Chip key={s} label={s} color="success" size="small" />
                    ))}
                  </Stack>
                  {mentor.availability && mentor.availability.days && mentor.availability.days.length > 0 && (
                    <Typography variant="body2" color="text.secondary" mb={1}>
                      <b>Availability:</b> {mentor.availability.days.join(', ')}{' '}
                      {mentor.availability.startTime && mentor.availability.endTime && (
                        <>({mentor.availability.startTime} - {mentor.availability.endTime})</>
                      )}
                    </Typography>
                  )}
                  <Button
                    variant="outlined"
                    color="primary"
                    size="small"
                    sx={{ mt: 1 }}
                    component={Link}
                    to={`/mentors/${mentor._id}`}
                  >
                    View Profile
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default MentorDiscoveryPage; 