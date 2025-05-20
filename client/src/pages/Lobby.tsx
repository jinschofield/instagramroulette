import React, { useEffect, useState } from "react";
import io from "socket.io-client";

const serverAddress: string = "http://localhost:3000";
const socket = io(serverAddress);

/** User object as used in rendering */
interface User {
  username: string;
  ready: boolean;
}

/** Props passed to Lobby */
interface LobbyProps {
  currentUser: string;
  users: User[];
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
const Lobby: React.FC<LobbyProps> = ({ currentUser, users: initialUsers }) => {
  const [users, setUsers] = useState<User[]>(initialUsers);

  /**
   * Converts the server's lobby update payload into a list of users with ready states.
   *
   * @param {LobbyUpdateResponse} data - The server lobby update payload
   * @returns {User[]} - List of users with updated ready status
   */
  const extractUsersFromUpdate = (data: LobbyUpdateResponse): User[] => {
    return Object.entries(data).map(([username, links]) => ({
      username,
      ready: links.length > 0
    }));
  };

  useEffect(() => {
    socket.on("lobby_update", (data: LobbyUpdateResponse) => {
      console.log("Received lobby update:", data);
      setUsers(extractUsersFromUpdate(data));
    });

    return () => {
      socket.off("lobby_update");
    };
  }, []);

  const handleStartGame = (): void => {
    console.log("Game started!");
    socket.emit("start_game");
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
      {/* Top Row - Owner Display */}
      <div style={{ alignSelf: "flex-start", fontSize: "1.2rem", fontWeight: "bold" }}>
        Owner: {users[0]?.username || "Unknown"}
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
      {currentUser === users[0]?.username && (
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
