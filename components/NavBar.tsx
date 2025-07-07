import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { Link } from 'react-router-dom';

const NavBar: React.FC = () => {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Mentorship App
        </Typography>
        <Button color="inherit" component={Link} to="/login">Login</Button>
        <Button color="inherit" component={Link} to="/admin">Admin</Button>
        <Button color="inherit" component={Link} to="/mentor">Mentor</Button>
        <Button color="inherit" component={Link} to="/mentee">Mentee</Button>
      </Toolbar>
    </AppBar>
  );
};

export default NavBar; 