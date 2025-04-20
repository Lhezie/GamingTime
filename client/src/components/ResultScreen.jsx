
import React from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  Fade,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import { motion } from 'framer-motion';

function ResultScreen({ result, setView }) {
  const { winner, answer, scores } = result;

  const handleNextRound = () => {
    setView('home');
  };

  return (
    <Fade in timeout={500} style={{background: 'linear-gradient(to right, #a0b1db, #f0f4ff)' }}>
      <Paper elevation={4} sx={{ p: 4, mt: 4, textAlign: 'center' }} component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <Typography variant="h4" gutterBottom>
          {winner ? `🎉 ${winner} won!` : '⏰ Time’s up!'}
        </Typography>

        <Typography variant="h6" gutterBottom>
          The correct answer was:
        </Typography>
        <Typography variant="body1" sx={{ fontWeight: 'bold' }} gutterBottom>
          {answer}
        </Typography>

        <Typography variant="h6" mt={3} gutterBottom>
          Scores:
        </Typography>
        <List>
          {scores.map((player, index) => (
            <ListItem key={index}>
              <ListItemText primary={`${player.name}: ${player.score} points`} />
            </ListItem>
          ))}
        </List>

        <Button
          variant="contained"
          color="primary"
          onClick={handleNextRound}
          sx={{ mt: 3 }}
        >
          Play Again
        </Button>
      </Paper>
    </Fade>
  );
}

export default ResultScreen;
