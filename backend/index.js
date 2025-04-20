
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*'
  }
});

const sessions = {}; 

function createPlayer(name) {
  return {
    id: uuidv4(),
    name,
    score: 0,
    isGameMaster: false,
    attemptsLeft: 3
  };
}

function createSession(gameMaster) {
  const sessionId = uuidv4();
  gameMaster.isGameMaster = true;
  const session = {
    id: sessionId,
    players: [gameMaster],
    gameMasterId: gameMaster.id,
    question: null,
    answer: null,
    status: 'waiting',
    startTime: null,
    winnerId: null,
    timer: null
  };
  sessions[sessionId] = session;
  return session;
}

function getSessionByPlayerId(playerId) {
  return Object.values(sessions).find(session =>
    session.players.some(p => p.id === playerId)
  );
}

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('create-session', (name, cb) => {
    const player = createPlayer(name);
    const session = createSession(player);
    socket.join(session.id);
    socket.data.playerId = player.id;
    cb({ session, player });
    io.to(session.id).emit('session-updated', session);
  });

  socket.on('join-session', ({ sessionId, name }, cb) => {
    const session = sessions[sessionId];
    if (!session || session.status !== 'waiting') {
      return cb({ error: 'Cannot join session now' });
    }
    const player = createPlayer(name);
    session.players.push(player);
    socket.join(session.id);
    socket.data.playerId = player.id;
    cb({ session, player });
    io.to(session.id).emit('session-updated', session);
  });

  socket.on('start-game', ({ sessionId, question, answer }) => {
    const session = sessions[sessionId];
    if (!session || session.players.length < 3) return;
    session.status = 'in-progress';
    session.question = question;
    session.answer = answer.toLowerCase();
    session.startTime = Date.now();
    session.players.forEach(p => (p.attemptsLeft = 3));
    io.to(sessionId).emit('game-started', { question });

    session.timer = setTimeout(() => {
      if (!session.winnerId) {
        session.status = 'ended';
        io.to(sessionId).emit('game-ended', {
          answer: session.answer,
          winner: null,
          scores: session.players.map(p => ({ name: p.name, score: p.score }))
        });
      }
    }, 60000);
  });

  socket.on('guess-answer', ({ sessionId, guess }) => {
    const session = sessions[sessionId];
    const player = session.players.find(p => p.id === socket.data.playerId);
    if (!player || player.attemptsLeft <= 0 || session.status !== 'in-progress') return;

    player.attemptsLeft--;
    if (guess.toLowerCase() === session.answer && !session.winnerId) {
      session.winnerId = player.id;
      session.status = 'ended';
      player.score += 10;
      clearTimeout(session.timer);

      io.to(sessionId).emit('game-ended', {
        answer: session.answer,
        winner: player.name,
        scores: session.players.map(p => ({ name: p.name, score: p.score }))
      });
    } else {
      socket.emit('guess-feedback', { correct: false, attemptsLeft: player.attemptsLeft });
    }
  });

  socket.on('leave-session', () => {
    const session = getSessionByPlayerId(socket.data.playerId);
    if (!session) return;
    session.players = session.players.filter(p => p.id !== socket.data.playerId);
    socket.leave(session.id);

    if (session.players.length === 0) {
      delete sessions[session.id];
    } else {
      io.to(session.id).emit('session-updated', session);
    }
  });

  // ✅ Real-time chat feature
  socket.on('chat-message', ({ sessionId, sender, text }) => {
    if (!sessionId || !text || !sender) return;
    io.to(sessionId).emit('chat-message', { sender, text });
  });
});

server.listen(3000, () => {
  console.log('Guessing Game server listening on http://localhost:3000');
});
