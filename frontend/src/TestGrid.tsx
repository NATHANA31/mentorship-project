import React from 'react';
import Grid from '@mui/material/Grid';

export default function TestGrid() {
  return (
    <Grid container component="div" spacing={2}>
      {/* @ts-ignore */}
      <Grid item component="div" xs={6}>A</Grid>
      {/* @ts-ignore */}
      <Grid item component="div" xs={6}>B</Grid>
    </Grid>
  );
} 