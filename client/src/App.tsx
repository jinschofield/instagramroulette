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
          <Lobby/>
        }
      />


      <Route
        path="/guess"
        element={
          <Guess
            postUrl="DIlCkRwt5LX" // e.g., the part after "/p/"
            players={["alice", "bob", "charlie", "dave", "eve", "mallory"]}
          />
        }
      />

      <Route 
        path="/leaderboard" 
        element={
          <Leaderboard 
            players={["alice", "bob", "charlie", "dave", "eve", "mallory"]}
            scores={[0,4,6,3,4,1]}
          />
        } 
      />
    </Routes>
  );
};

export default App;
