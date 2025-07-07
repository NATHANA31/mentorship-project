import React, { useEffect, useState } from 'react';
import { Box, Typography, TextField, Button, Alert, Chip, Stack, Checkbox, FormControlLabel, FormGroup, InputLabel } from '@mui/material';

const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const API_URL = `${apiUrl}/api/auth/profile`;

const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState({
    name: '',
    age: '',
    bio: '',
    skills: [] as string[],
    skillInput: '',
    goals: '',
    favoriteQuote: '',
    availability: { days: [] as string[], startTime: '', endTime: '' },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editMode, setEditMode] = useState(false);

  // Get token from localStorage (assumes you store it there after login)
  const token = localStorage.getItem('token');
  const currentUserRole = localStorage.getItem('role');

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(API_URL, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.errors?.[0]?.msg || 'Failed to fetch profile');
        } else {
          setProfile({
            name: data.name || '',
            age: data.age ? String(data.age) : '',
            bio: data.bio || '',
            skills: data.skills || [],
            skillInput: '',
            goals: data.goals || '',
            favoriteQuote: data.favoriteQuote || '',
            availability: data.availability || { days: [], startTime: '', endTime: '' },
          });
        }
      } catch (err) {
        setError('Server error.');
      }
      setLoading(false);
    };
    fetchProfile();
    // eslint-disable-next-line
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleAddSkill = () => {
    const skill = profile.skillInput.trim();
    if (skill && !profile.skills.includes(skill)) {
      setProfile({ ...profile, skills: [...profile.skills, skill], skillInput: '' });
    }
  };

  const handleDeleteSkill = (skillToDelete: string) => {
    setProfile({ ...profile, skills: profile.skills.filter(s => s !== skillToDelete) });
  };

  const handleAvailabilityChange = (day: string) => {
    setProfile({
      ...profile,
      availability: {
        ...profile.availability,
        days: profile.availability.days.includes(day)
          ? profile.availability.days.filter((d: string) => d !== day)
          : [...profile.availability.days, day],
      },
    });
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({
      ...profile,
      availability: {
        ...profile.availability,
        [e.target.name]: e.target.value,
      },
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const res = await fetch(API_URL, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: profile.name,
          age: profile.age ? Number(profile.age) : undefined,
          bio: profile.bio,
          skills: profile.skills,
          goals: profile.goals,
          favoriteQuote: profile.favoriteQuote,
          availability: profile.availability,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.errors?.[0]?.msg || 'Failed to update profile');
      } else {
        setSuccess('Profile updated successfully!');
        setEditMode(false);
      }
    } catch (err) {
      setError('Server error.');
    }
  };

  if (loading) return <Typography align="center" mt={8}>Loading...</Typography>;

  return (
    <Box maxWidth={500} mx="auto" mt={8} p={4} boxShadow={3} borderRadius={3} bgcolor="#fff">
      <Typography variant="h4" mb={2} align="center" color="#43ea7f" fontWeight={700}>
        My Profile
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      <form onSubmit={handleSubmit}>
        <TextField
          label="Name"
          name="name"
          value={profile.name}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
          InputProps={{ readOnly: !editMode }}
        />
        <TextField
          label="Age"
          name="age"
          type="number"
          value={profile.age}
          onChange={handleChange}
          fullWidth
          margin="normal"
          InputProps={{ readOnly: !editMode }}
        />
        <TextField
          label="Bio"
          name="bio"
          value={profile.bio}
          onChange={handleChange}
          fullWidth
          margin="normal"
          multiline
          minRows={2}
          InputProps={{ readOnly: !editMode }}
        />
        <Box mt={2} mb={2}>
          <Typography variant="subtitle1" fontWeight={600} color="#43c6ea">Skills</Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" mb={1}>
            {profile.skills.map(skill => (
              <Chip key={skill} label={skill} onDelete={editMode ? () => handleDeleteSkill(skill) : undefined} color="success" />
            ))}
          </Stack>
          {editMode && (
            <Box display="flex" gap={1}>
              <TextField
                label="Add Skill"
                value={profile.skillInput}
                onChange={e => setProfile({ ...profile, skillInput: e.target.value })}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddSkill(); } }}
                size="small"
              />
              <Button variant="contained" color="primary" onClick={handleAddSkill} sx={{ minWidth: 100 }}>
                Add
              </Button>
            </Box>
          )}
        </Box>
        <TextField
          label="Goals"
          name="goals"
          value={profile.goals}
          onChange={handleChange}
          fullWidth
          margin="normal"
          multiline
          minRows={2}
          InputProps={{ readOnly: !editMode }}
        />
        <TextField
          label="Favorite Quote"
          name="favoriteQuote"
          value={profile.favoriteQuote}
          onChange={handleChange}
          fullWidth
          margin="normal"
          multiline
          minRows={2}
          InputProps={{ readOnly: !editMode }}
        />
        {/* Mentor Availability Section */}
        {currentUserRole === 'mentor' && (
          <Box mt={3} mb={2}>
            <Typography variant="subtitle1" fontWeight={600} color="#43c6ea" mb={1}>
              Availability
            </Typography>
            <FormGroup row>
              {daysOfWeek.map(day => (
                <FormControlLabel
                  key={day}
                  control={
                    <Checkbox
                      checked={profile.availability.days.includes(day)}
                      onChange={() => editMode && handleAvailabilityChange(day)}
                      disabled={!editMode}
                    />
                  }
                  label={day}
                />
              ))}
            </FormGroup>
            <Box display="flex" gap={2} mt={2}>
              <TextField
                label="Start Time"
                name="startTime"
                type="time"
                value={profile.availability.startTime}
                onChange={handleTimeChange}
                InputLabelProps={{ shrink: true }}
                InputProps={{ readOnly: !editMode }}
                disabled={!editMode}
              />
              <TextField
                label="End Time"
                name="endTime"
                type="time"
                value={profile.availability.endTime}
                onChange={handleTimeChange}
                InputLabelProps={{ shrink: true }}
                InputProps={{ readOnly: !editMode }}
                disabled={!editMode}
              />
            </Box>
          </Box>
        )}
        {editMode && (
          <Button type="submit" variant="contained" color="success" fullWidth sx={{ mt: 3, fontWeight: 700 }}>
            Save Profile
          </Button>
        )}
      </form>
      {!editMode && (
        <Button type="button" variant="outlined" color="primary" fullWidth sx={{ mt: 3, fontWeight: 700 }} onClick={() => setEditMode(true)}>
          Edit Profile
        </Button>
      )}
    </Box>
  );
};

export default ProfilePage; 