import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { Link, useNavigate } from 'react-router-dom';

const NavBar: React.FC = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <AppBar
      position="static"
      sx={{
        background: 'linear-gradient(90deg, #ffb347 0%, #ffcc33 100%)',
        boxShadow: 3,
      }}
    >
      <Toolbar>
        <Typography
          variant="h6"
          sx={{ flexGrow: 1, fontWeight: 700, letterSpacing: 1, color: '#fff', fontFamily: "'Montserrat', 'Roboto', sans-serif" }}
        >
          letsgetmentored
        </Typography>
        {!token ? (
          <Button
            sx={{ color: '#fff', fontWeight: 600, mx: 1, textTransform: 'none', boxShadow: '0 2px 8px rgba(255,179,71,0.15)' }}
            component={Link}
            to="/login"
          >
            Login
          </Button>
        ) : (
          <>
            <Button
              sx={{ color: '#fff', fontWeight: 600, mx: 1, textTransform: 'none', boxShadow: '0 2px 8px rgba(255,179,71,0.15)' }}
              component={Link}
              to="/admin"
            >
              Admin
            </Button>
            <Button
              sx={{ color: '#fff', fontWeight: 600, mx: 1, textTransform: 'none', boxShadow: '0 2px 8px rgba(255,179,71,0.15)' }}
              component={Link}
              to="/mentor"
            >
              Mentor
            </Button>
            {localStorage.getItem('role') === 'mentor' && (
              <Button
                sx={{ color: '#fff', fontWeight: 600, mx: 1, textTransform: 'none', boxShadow: '0 2px 8px rgba(255,179,71,0.15)' }}
                component={Link}
                to="/mentor/requests"
              >
                Requests
              </Button>
            )}
            <Button
              sx={{ color: '#fff', fontWeight: 600, mx: 1, textTransform: 'none', boxShadow: '0 2px 8px rgba(255,179,71,0.15)' }}
              component={Link}
              to="/mentee"
            >
              Mentee
            </Button>
            <Button
              sx={{ color: '#fff', fontWeight: 600, mx: 1, textTransform: 'none', boxShadow: '0 2px 8px rgba(255,179,71,0.15)' }}
              component={Link}
              to="/profile"
            >
              Profile
            </Button>
            <Button
              sx={{ color: '#fff', fontWeight: 600, mx: 1, textTransform: 'none', boxShadow: '0 2px 8px rgba(71,179,255,0.15)' }}
              component={Link}
              to="/book-session"
            >
              Book Session
            </Button>
            <Button
              sx={{ color: '#fff', fontWeight: 600, mx: 1, textTransform: 'none', boxShadow: '0 2px 8px rgba(255,71,71,0.15)' }}
              onClick={handleLogout}
              color="error"
            >
              Logout
            </Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default NavBar;
