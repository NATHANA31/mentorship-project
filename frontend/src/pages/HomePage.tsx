import React from 'react';
import { Box, Typography } from '@mui/material';

const HomePage: React.FC = () => (
  <Box
    sx={{
      minHeight: '100vh',
      width: '100vw',
      background: 'linear-gradient(135deg, #43ea7f 0%, #43c6ea 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <Box
      sx={{
        background: '#fff',
        boxShadow: 6,
        borderRadius: 4,
        p: 5,
        minWidth: 350,
        maxWidth: 500,
        textAlign: 'center',
      }}
    >
      <Typography
        variant="h3"
        mb={2}
        fontWeight={700}
        color="#43ea7f"
        fontFamily="'Montserrat', 'Roboto', sans-serif"
      >
        Welcome to letsgetmentored
      </Typography>
      <Typography
        variant="h6"
        mb={2}
        color="#43c6ea"
        fontWeight={500}
        fontFamily="'Montserrat', 'Roboto', sans-serif"
      >
        Grow, connect, and unlock your potential with mentorship.
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Start your journey today and be part of a vibrant, supportive community focused on growth and success.
      </Typography>
    </Box>
  </Box>
);

export default HomePage; 