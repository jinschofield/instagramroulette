import React from "react";
import { useLocation } from "react-router-dom";
import io from "socket.io-client";

const serverAddress = "http://localhost:3000";

interface GuessProps {
  postUrl: string;
  players: string[];
}

const Guess: React.FC<GuessProps> = () => {
    const location = useLocation();
    const { postUrl } = location.state;
    const { players } = location.state;

    const socket = io(serverAddress); // Connect to your server
    return (
    <div
      style={{
        minHeight: "100vh",
        padding: "2rem",
        backgroundColor: "#fafafa",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {/* Top-left Room Info */}
      <div style={{ alignSelf: "flex-start", marginBottom: "1rem", fontSize: "1rem" }}>
        <strong>Room:</strong> DEMO | <strong>Owner:</strong> DEMO
      </div>

      {/* Page Title */}
      <h1 style={{ fontSize: "2.5rem", marginBottom: "2rem" }}>Who's reel is this...</h1>

      {/* Instagram Embed */}
      <div style={{ width: "100%", maxWidth: "500px", marginBottom: "2rem" }}>
        <iframe
          title="Instagram Post"
          src={`https://www.instagram.com/p/${postUrl}/embed`}
          width="100%"
          height="600"
          frameBorder="0"
          scrolling="no"
          allowTransparency
          style={{ borderRadius: "1rem", border: "1px solid #ddd" }}
        ></iframe>
      </div>

      {/* Player Guess Options */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "1rem",
          maxWidth: "600px",
          width: "100%",
        }}
      >
        {players.map((player, index) => (
          <button
            key={index}
            style={{
              padding: "1rem",
              fontSize: "1rem",
              backgroundColor: "#ffffff",
              border: "1px solid #ccc",
              borderRadius: "0.5rem",
              cursor: "pointer",
              transition: "all 0.2s ease-in-out",
            }}
            onClick={() => console.log(`Guessed: ${player}`)}
          >
            {player}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Guess;
