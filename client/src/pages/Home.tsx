import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";

const serverAddress: string = "http://localhost:3000";
const socket = io(serverAddress);

/** User object used in Lobby */
interface User {
  username: string;
  ready: boolean;
}

/* ******Home Component****** */
/**
 * Home page where the user enters their username and joins a room.
 * Emits a join request via socket and navigates to the lobby on success.
 *
 * @returns {JSX.Element} - Rendered home screen
 */
const Home: React.FC = () => {
  const [username, setUsername] = useState<string>("");
  const navigate = useNavigate();

  /**
   * Extracts user-ready state from the server lobby data.
   *
   * @param {{ [username: string]: string[] }} data - lobby update JSON payload
   * @returns {User[]} - List of users with readiness
   */
  const extractUsersFromUpdate = (data: { [username: string]: string[] }): User[] => {
    return Object.entries(data).map(([uname, links]) => ({
      username: uname,
      ready: links !== null,
    }));
  };

  const handleJoinLobby = (): void => {
    if (!username.trim()) return;

    // Emit join request
    socket.emit("join_lobby", username);

    // Listen for lobby update and navigate once received
    socket.once("lobby_update", (data: { [username: string]: string[] }) => {
      const users: User[] = extractUsersFromUpdate(data);
      console.log(`Loading users: ${users} into lobby.`);
      navigate("/lobby", {
        state: {
          currentUser: username,
          users
        }
      });
    });
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fafafa",
      }}
    >
      <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>Instagram Roulette</h1>
      <input
        type="text"
        placeholder="Enter username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        style={{
          padding: "0.75rem",
          fontSize: "1rem",
          borderRadius: "0.5rem",
          border: "1px solid #ccc",
          marginBottom: "1rem",
          width: "250px"
        }}
      />
      <button
        onClick={handleJoinLobby}
        style={{
          padding: "0.75rem 1.5rem",
          fontSize: "1rem",
          borderRadius: "0.5rem",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          cursor: "pointer",
        }}
      >
        Join Lobby
      </button>
    </div>
  );
};

export default Home;
