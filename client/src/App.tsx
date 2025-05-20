import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Guess from "./pages/Guess";
import Lobby from "./pages/Lobby";
import Leaderboard from "./pages/Leaderboard"

/* ******App Component****** */
/**
 * Main router component for the web app game.
 * Defines routes between Home, Lobby, Guess, Leaderboard screens.
 *
 * @returns {JSX.Element} - Rendered application routes
 */


// TODO: TEMPORARY VARIABLES SET IN THE PAGES 
const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route
        path="/lobby"
        element={
          <Lobby
            roomCode="ABCD1234"
            owner="alice"
            currentUser="alice"
            users={[
              { username: "alice", ready: true },
              { username: "bob", ready: false },
              { username: "charlie", ready: true },
            ]}
          />
        }
      />


      <Route
        path="/guess"
        element={
          <Guess
            postUrl="DIlCkRwt5LX" // e.g., the part after "/p/"
            roomCode="ROOM123"
            owner="alice"
            players={["alice", "bob", "charlie", "dave", "eve", "mallory"]}
          />
        }
      />

      <Route path="/leaderboard" element={<Leaderboard />} />
    </Routes>
  );
};

export default App;
