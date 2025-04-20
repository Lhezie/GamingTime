
import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Fade,
  Stack
} from '@mui/material';
import { motion } from 'framer-motion';

function Home({ socket, setView, setSession, setPlayer }) {
  const [name, setName] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [error, setError] = useState('');

  const handleCreate = () => {
    if (!name) return setError('Enter your name');
    socket.emit('create-session', name, ({ session, player }) => {
      setSession(session);
      setPlayer(player);
      setView('waiting');
    });
  };

  const handleJoin = () => {
    if (!name || !sessionId) return setError('Enter name and session ID');
    socket.emit('join-session', { sessionId, name }, ({ session, player, error }) => {
      if (error) return setError(error);
      setSession(session);
      setPlayer(player);
      setView('waiting');
    });
  };

  return (
    <Fade in timeout={500}>
      <Paper elevation={4} sx={{ p: 4, mt: 4 }} component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <Typography variant="h5" gutterBottom>
          Join or Create a Game
        </Typography>

        <Stack spacing={2}>
          <TextField
            label="Your Name"
            variant="outlined"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <TextField
            label="Session ID (to join)"
            variant="outlined"
            fullWidth
            value={sessionId}
            onChange={(e) => setSessionId(e.target.value)}
          />
          {error && <Typography color="error">{error}</Typography>}

          <Box display="flex" justifyContent="space-between">
            <Button variant="contained" color="primary" onClick={handleCreate}>
              Create Game
            </Button>
            <Button variant="outlined" color="secondary" onClick={handleJoin}>
              Join Game
            </Button>
          </Box>
        </Stack>
      </Paper>
    </Fade>
  );
}

export default Home;
