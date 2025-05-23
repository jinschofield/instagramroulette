import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import io from "socket.io-client";

const serverAddress: string = "http://localhost:3000";
const socket = io(serverAddress);

/** User object as used in rendering */
interface User {
  username: string;
  ready: boolean;
}

interface GameStartResponse {
  postUser: string;
  postId: string;
}

/** Server response: maps usernames to their submitted Instagram links */
interface LobbyUpdateResponse {
  [username: string]: string[];
}

/* ******Lobby Component****** */
/**
 * Lobby UI that shows a list of players, their ready status (based on whether they’ve submitted links),
 * and allows the owner to start the game. It listens to live updates from the server via websockets.
 *
 * @param {string} currentUser - Username of the current user
 * @param {User[]} users - Initial users list to show before any update
 * @returns {JSX.Element} - Rendered lobby page
 */
const Lobby: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = location.state;

  const [users, setUsers] = useState<User[]>(location.state.users);
  const [lobbyData, setLobbyData] = useState<LobbyUpdateResponse>(location.state.data);
  console.log("IN LOBBY NOW");
  console.log(users);

  /**
   * Converts the server's lobby update payload into a list of users with ready states.
   *
   * @param {LobbyUpdateResponse} data - The server lobby update payload
   * @returns {User[]} - List of users with updated ready status
   */
  const extractUsersFromUpdate = (data: LobbyUpdateResponse): User[] => {
    return Object.entries(data).map(([username, links]) => ({
      username,
      ready: links !== null,
    }));
  };

  useEffect(() => {
    socket.on("lobby_update", (data: LobbyUpdateResponse) => {
      console.log("Received lobby update:", data);
      setUsers(extractUsersFromUpdate(data));
      setLobbyData(data);
    });

    return () => {
      socket.off("lobby_update");
    };
  }, []);

  const handleStartGame = (): void => {
    socket.emit("start_game");
  };

  socket.on("start_guess", (payload: GameStartResponse) => {
    const { postId } = payload;
    const { postUser } = payload;
    const players = users.map((user) => user.username);
    navigate("/guess", {
      state: {
        players,
        postId,
        postUser,
      }
    })
  });

  socket.on("start_failed", () => {
    console.log("start failed");
  })

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
      {/* Top Row - Owner Display */}
      <div style={{ alignSelf: "flex-start", fontSize: "1.2rem", fontWeight: "bold" }}>
        Owner: {"DEMO"}
      </div>

      {/* Center - Room Code + User List */}
      <div style={{ textAlign: "center" }}>
        <h1 style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>Room Code: DEMO</h1>
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
            {users.map((user) => (
              <li
                key={user.username}
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

      {/* Bottom - Start Game Button (only if currentUser is owner) */}
      {(
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
