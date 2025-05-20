import React from "react";
import io from "socket.io-client";

const serverAddress = "http://localhost:3000";

interface LeaderboardProps {
  players: string[];
  scores: number[];
}

const Leaderboard: React.FC<LeaderboardProps> = ({players, scores }) => {
  const socket = io(serverAddress); // Connect to your server 
  
  // Create an array of player objects with their original index
  const playerData = players.map((player, index) => ({
    name: player,
    score: scores[index],
    originalIndex: index,
  }));

  // Sort by score (descending) while keeping original index
  const sortedPlayers = [...playerData].sort((a, b) => b.score - a.score);

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
      <h1 style={{ fontSize: "2.5rem", marginBottom: "2rem" }}>Leaderboard</h1>

      {/* Leaderboard */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(1, 1fr)",
          gap: "1rem",
          maxWidth: "600px",
          width: "100%",
        }}
      >
        {sortedPlayers.map((player, index) => (
          <div
            key={player.originalIndex} // Using original index as key
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "1rem",
              fontSize: "1rem",
              backgroundColor: "#ffffff",
              border: "1px solid #e0e0e0",
              borderRadius: "0.5rem",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <span style={{ 
                fontWeight: "bold",
                color: "#666",
                minWidth: "1.5rem",
                textAlign: "right"
              }}>
                {index + 1}.
              </span>
              <span style={{ fontWeight: 500 }}>{player.name}</span>
            </div>
            <span style={{ 
              color: "#666",
              fontWeight: "bold",
              fontSize: "1.1rem"
            }}>
              {player.score}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Leaderboard;