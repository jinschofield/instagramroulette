import React, { useState } from "react";

const Home: React.FC = () => {
  const [username, setUsername] = useState<string>("");

  const handleJoinRoom = (): void => {
    if (!username.trim()) {
      alert("Please enter a username.");
      return;
    }

    console.log(`Joining room as ${username}`);
    // TODO: Route to join room or emit to socket
  };

  const handleCreateRoom = (): void => {
    if (!username.trim()) {
      alert("Please enter a username.");
      return;
    }

    console.log(`Creating room as ${username}`);
    // TODO: Route to create room or emit to socket
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: "1.5rem",
        backgroundColor: "#f9f9f9",
      }}
    >
      <h1 style={{ fontSize: "3rem", fontWeight: "bold" }}>Instagram Roulette</h1>

      <input
        type="text"
        placeholder="Enter your username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        style={{
          padding: "0.75rem 1rem",
          fontSize: "1rem",
          borderRadius: "0.5rem",
          border: "1px solid #ccc",
          width: "300px",
        }}
      />

      <div style={{ display: "flex", gap: "1rem" }}>
        <button
          onClick={handleCreateRoom}
          style={{
            padding: "0.75rem 1.25rem",
            fontSize: "1rem",
            borderRadius: "0.5rem",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            cursor: "pointer",
          }}
        >
          Create Room
        </button>

        <button
          onClick={handleJoinRoom}
          style={{
            padding: "0.75rem 1.25rem",
            fontSize: "1rem",
            borderRadius: "0.5rem",
            backgroundColor: "#2196F3",
            color: "white",
            border: "none",
            cursor: "pointer",
          }}
        >
          Join Room
        </button>
      </div>
    </div>
  );
};

export default Home;
