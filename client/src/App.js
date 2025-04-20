// client/src/App.js
import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { Container, Typography, Box } from "@mui/material";
import Home from "./components/Home";
import WaitingRoom from "./components/WaitingRoom.jsx";
import GameScreen from "./components/Gamescreen.jsx";
import ResultScreen from "./components/ResultScreen.jsx";


const socket = io(process.env.REACT_APP_SERVER_URL || "http://localhost:4000" );

const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#ff4081",
    },
    background: {
      default: "#f4f6f8",
    },
  },
  typography: {
    fontFamily: '"Poppins", sans-serif',
  },
});

function App() {
  const [view, setView] = useState("home");
  const [session, setSession] = useState(null);
  const [player, setPlayer] = useState(null);
  const [question, setQuestion] = useState(null);
  const [gameResult, setGameResult] = useState(null);

  useEffect(() => {
    socket.on("game-started", ({ question }) => {
      setQuestion(question);
      setView("game");
    });

    socket.on("game-ended", (result) => {
      setGameResult(result);
      setView("result");
    });

    return () => {
      socket.off("game-started");
      socket.off("game-ended");
    };
  }, []);

  return (
    <>
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          minHeight: "100vh",
          backgroundImage: 'url("/infinity.png")',
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
        }}
      >
        <Container maxWidth="md">
          <Box mt={4} mb={4} textAlign="center">
            <Typography variant="h3" gutterBottom color="white"></Typography>
          </Box>
          <br />

          {view === "home" && (
            <Home
              socket={socket}
              setView={setView}
              setSession={setSession}
              setPlayer={setPlayer}
            />
          )}

          {view === "waiting" && (
            <WaitingRoom
              socket={socket}
              session={session}
              player={player}
              setView={setView}
              setQuestion={setQuestion}
            />
          )}

          {view === "game" && (
            <GameScreen
              socket={socket}
              session={session}
              player={player}
              question={question}
            />
          )}

          {view === "result" && (
            <ResultScreen result={gameResult} setView={setView} />
          )}
        </Container>
        </Box>
       
      </ThemeProvider>
      </>
  );
}

export default App;
