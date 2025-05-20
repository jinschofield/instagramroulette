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

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/lobby" element={<Lobby />} />
      <Route path="/guess" element={<Guess />} />
      <Route path="/leaderboard" element={<Leaderboard />} />
    </Routes>
  );
};

export default App;
