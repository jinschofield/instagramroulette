import React from "react";

interface User {
  username: string;
  ready: boolean;
}

interface LobbyProps {
  roomCode: string;
  owner: string;
  currentUser: string;
  users: User[];
}

const Lobby: React.FC<LobbyProps> = ({ roomCode, owner, currentUser, users }) => {
  const handleStartGame = (): void => {
    console.log("Game started!");
    // TODO: emit start to socket
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "2rem",
        backgroundColor: "#f0f0f0"
      }}
    >
      {/* Top Row - Owner */}
      <div style={{ alignSelf: "flex-start", fontSize: "1.2rem", fontWeight: "bold" }}>
        Owner: {owner}
      </div>

      {/* Center - Room Code + User List */}
      <div style={{ textAlign: "center" }}>
        <h1 style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>Room Code: {roomCode}</h1>
        <div
          style={{
            margin: "0 auto",
            width: "300px",
            padding: "1rem",
            backgroundColor: "white",
            borderRadius: "0.5rem",
            boxShadow: "0 0 10px rgba(0,0,0,0.1)",
          }}
        >
          <h2 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>Players</h2>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {users.map((user, idx) => (
              <li
                key={idx}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "0.5rem 0",
                  borderBottom: "1px solid #eee",
                }}
              >
                <span>{user.username}</span>
                <span style={{ color: user.ready ? "green" : "red" }}>
                  {user.ready ? "Ready" : "Not Ready"}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom - Start Button */}
      {currentUser === owner && (
        <button
          onClick={handleStartGame}
          style={{
            alignSelf: "center",
            marginTop: "2rem",
            padding: "0.75rem 1.5rem",
            fontSize: "1.2rem",
            borderRadius: "0.5rem",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            cursor: "pointer",
          }}
        >
          Start Game
        </button>
      )}
    </div>
  );
};

export default Lobby;
