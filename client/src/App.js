import React from 'react';
import { Button, Typography, Container } from '@mui/material';

function App() {
  return (
    <Container maxWidth="sm" style={{ marginTop: '3rem', textAlign: 'center' }}>
      <Typography variant="h3" gutterBottom>
        🎉 Guessing Game
      </Typography>
      <Button variant="contained" color="primary">
        Start Game
      </Button>
    </Container>
  );
}

export default App;
