import React, { useEffect, useState, useRef } from 'react';
import {
  Box,
  Button,
  Typography,
  List,
  ListItem,
  ListItemText,
  Paper,
  Divider,
  Fade,
  IconButton,
  Tooltip,
  TextField,
  Fab,
  Drawer,
  Avatar,
  InputBase,
  Switch
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import { motion } from 'framer-motion';
import EmojiPicker from 'emoji-picker-react';

function WaitingRoom({ socket, session, player, setView, setQuestion }) {
  const [players, setPlayers] = useState(session.players);
  const [question, setLocalQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const chatBoxRef = useRef(null);

  useEffect(() => {
    const update = (updatedSession) => setPlayers(updatedSession.players);
    const handleMessage = (message) => {
      setChatMessages((prev) => [...prev, message]);
    };
    const typingStatus = (status) => setIsTyping(status);

    socket.on('session-updated', update);
    socket.on('chat-message', handleMessage);
    socket.on('typing', typingStatus);

    return () => {
      socket.off('session-updated', update);
      socket.off('chat-message', handleMessage);
      socket.off('typing', typingStatus);
    };
  }, [socket]);

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const isGameMaster = player.id === session.gameMasterId;

  const handleStartGame = () => {
    if (!question || !answer) return setError('Enter both question and answer');
    socket.emit('start-game', { sessionId: session.id, question, answer });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(session.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sendMessage = () => {
    if (newMessage.trim()) {
      socket.emit('chat-message', {
        sessionId: session.id,
        sender: player.name,
        senderId: player.id,
        text: newMessage.trim(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
      setNewMessage('');
      setShowEmojiPicker(false);
    }
  };

  const handleTyping = () => {
    socket.emit('typing', true);
    setTimeout(() => socket.emit('typing', false), 1000);
  };

  const handleEmojiClick = (emojiData) => {
    setNewMessage((prev) => prev + emojiData.emoji);
  };

  return (
    <Fade in timeout={500} style={{ backgroundColor: "" }}>
      <Paper elevation={6} sx={{ p: 4, mt: 4, borderRadius: 4, background: 'linear-gradient(to right, #a0b1db, #f0f4ff)' }} component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        
        <Typography variant="h6" fontWeight={700} color="primary" gutterBottom textAlign={'center'} fontStyle={'italic'}>
          Waiting Room
        </Typography>

        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <Typography variant="body1" sx={{ wordBreak: 'break-all' }}>
            Share this Session ID:
            <br />
            <strong>{session.id}</strong>
          </Typography>
          <Tooltip title={copied ? 'Copied!' : 'Copy to clipboard'}>
            <IconButton onClick={handleCopy} color="primary">
              <ContentCopyIcon />
            </IconButton>
          </Tooltip>
        </Box>

        <Typography variant="h6">👥 Players</Typography>
        <List>
          {players.map((p) => (
            <ListItem key={p.id}>
              <Avatar sx={{ bgcolor: p.isGameMaster ? 'secondary.main' : 'primary.main', mr: 2 }}>
                {p.name.charAt(0).toUpperCase()}
              </Avatar>
              <ListItemText
                primary={<strong>{p.name}</strong>}
                secondary={p.isGameMaster ? 'Game Master' : 'Player'}
              />
            </ListItem>
          ))}
        </List>

        <Divider sx={{ my: 2 }} />

        {isGameMaster && (
          <Box>
            <Typography variant="h6" gutterBottom>🧠 Set a Question</Typography>
            <TextField
              fullWidth
              label="Question"
              variant="outlined"
              sx={{ mb: 2 }}
              value={question}
              onChange={(e) => setLocalQuestion(e.target.value)}
            />
            <TextField
              fullWidth
              label="Answer"
              variant="outlined"
              sx={{ mb: 2 }}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
            />
            {error && <Typography color="error">{error}</Typography>}
            <Button
              variant="contained"
              style={{ backgroundColor: '#2f7ed3', color: '#fff' }}
              fullWidth
              onClick={handleStartGame}
              disabled={players.length < 3}
              sx={{ borderRadius: 8 }}
            >
              Start Game
            </Button>
          </Box>
        )}

        {!isGameMaster && (
          <Typography color="textSecondary" mt={2}>
            Waiting for the game master to start the game...
          </Typography>
        )}

        {!isChatOpen && (
          <Fab
            color="primary"
            sx={{ position: 'fixed', bottom: 16, right: 16, zIndex: 1300 }}
            onClick={() => setIsChatOpen(true)}
          >
            <ChatIcon />
          </Fab>
        )}

        {/* Chat Modal- players can communicate */}
        <Drawer anchor="right" open={isChatOpen} onClose={() => setIsChatOpen(false)}>
          <Box sx={{ width: 360, height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: '#d0e1f4', backgroundSize: 'cover' }}>
            <Box sx={{ p: 2, bgcolor: '#2f7ed3', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h8">💬 Game Chat</Typography>
              <Switch checked={darkMode} onChange={() => setDarkMode(!darkMode)} size="small" />
              <IconButton size="small" sx={{ color: '#fff' }} onClick={() => setIsChatOpen(false)}>
                <CloseIcon />
              </IconButton>
            </Box>
            <Box ref={chatBoxRef} sx={{ flexGrow: 1, overflowY: 'auto', px: 2, py: 1 }}>
              {chatMessages.map((msg, idx) => (
                <motion.div key={idx} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: msg.senderId === player.id ? 'flex-end' : 'flex-start',
                      mb: 1,
                    }}
                  >
                    <Box
                      sx={{
                        px: 2,
                        py: 1,
                        maxWidth: '70%',
                        bgcolor: msg.senderId === player.id ? '#2f7ed3' : '#ffffff',
                        borderRadius: 3,
                        borderTopLeftRadius: msg.senderId === player.id ? 20 : 5,
                        borderTopRightRadius: msg.senderId === player.id ? 5 : 20,
                        boxShadow: 1
                      }}
                    >
                      <Typography variant="caption" sx={{ fontWeight: 'bold', mb: 0.5, display: 'block' }}>
                        {msg.sender} <span style={{ fontWeight: 'normal', float: 'right', fontSize: '0.75rem' }}>{msg.timestamp}</span>
                      </Typography>
                      <Typography variant="body2">{msg.text}</Typography>
                    </Box>
                  </Box>
                </motion.div>
              ))}
              {isTyping && <Typography variant="caption" sx={{ color: 'gray', pl: 2 }}>Someone is typing...</Typography>}
            </Box>
            {showEmojiPicker && <EmojiPicker onEmojiClick={handleEmojiClick} width={360} />} 
            <Box sx={{ p: 2, background: '#ffffff', display: 'flex', alignItems: 'center', borderTop: '1px solid #ccc' }}>
              <Box sx={{ display: 'flex', flex: 1, alignItems: 'center', background: '#f5f5f5', borderRadius: 50, px: 2 }}>
                <InputBase
                  sx={{ flex: 1, py: 1 }}
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => { setNewMessage(e.target.value); handleTyping(); }}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                />
                <IconButton onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
                  😀
                </IconButton>
              </Box>
              <IconButton
                onClick={sendMessage}
                sx={{ ml: 1, bgcolor: '#2f7ed3', color: '#fff', '&:hover': { bgcolor: '#1c5fa3' }, borderRadius: 4 }}
              >
                <SendIcon />
              </IconButton>
            </Box>
          </Box>
        </Drawer>
      </Paper>
    </Fade>
  );
}

export default WaitingRoom;
