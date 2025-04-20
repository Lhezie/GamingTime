
import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  TextField,
  Paper,
  Fade
} from '@mui/material';
import { motion } from 'framer-motion';

function GameScreen({ socket, session, player, question }) {
  const [guess, setGuess] = useState('');
  const [attemptsLeft, setAttemptsLeft] = useState(player.attemptsLeft);
  const [feedback, setFeedback] = useState('');

  const handleGuess = () => {
    if (!guess) return;
    socket.emit('guess-answer', { sessionId: session.id, guess });
    setGuess('');
  };

  socket.on('guess-feedback', ({ correct, attemptsLeft }) => {
    setAttemptsLeft(attemptsLeft);
    setFeedback(correct ? 'Correct!' : 'Wrong guess. Try again!');
  });

  return (
    <Fade in timeout={500} style={{background: 'linear-gradient(to right, #a0b1db, #f0f4ff)' }}>
      <Paper elevation={4} sx={{ p: 4, mt: 4 }} component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <Typography variant="h5" gutterBottom>
          Guess the Answer
        </Typography>

        <Typography variant="h6" gutterBottom>
          Question:
        </Typography>
        <Typography variant="body1" gutterBottom>
          {question}
        </Typography>

        <Box mt={2}>
          <TextField
            fullWidth
            label="Your Guess"
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            disabled={attemptsLeft === 0}
          />
          <Button
            fullWidth
            variant="contained"
            color="secondary"
            sx={{ mt: 2 }}
            onClick={handleGuess}
            disabled={attemptsLeft === 0 || !guess.trim()}
          >
            Submit Guess
          </Button>
        </Box>

        <Box mt={2}>
          <Typography variant="subtitle2">
            Attempts left: {attemptsLeft}
          </Typography>
          <Typography variant="body2" color={feedback === 'Correct!' ? 'green' : 'error'}>
            {feedback}
          </Typography>
        </Box>
      </Paper>
    </Fade>
  );
}

export default GameScreen;
