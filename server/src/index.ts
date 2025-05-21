import express from 'express';
import { createServer } from 'node:http';
import { Server } from 'socket.io';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173"
  }
});

const userUrlsMap = new Map<string, string[] | null>();
const socketUserMap = new Map<string, string>();

const extractInstagramPostId = (url: string): string | null => {
  const match = url.match(/instagram\.com\/reels?\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}

io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('join_lobby', (username) => {
    // TODO: make sure can't take someone else's username
    if (!userUrlsMap.has(username)) {
      userUrlsMap.set(username, null);
    }
    io.emit("lobby_update", Object.fromEntries(userUrlsMap));
    socketUserMap.set(socket.id, username);
  });

  socket.on('reelsBatch', (payload) => {
    const username = payload?.name;
    const links = payload?.reels;
    if (typeof username !== 'string' || !Array.isArray(links) || links.some(link => typeof link !== 'string')) {
      console.log('Invalid input. Expecting a username and an array of links.');
    }
    userUrlsMap.set(username, links);
    console.log(`Received links for user: ${username}`);
    console.log(links);
    io.emit("lobby_update", Object.fromEntries(userUrlsMap));
  });

  socket.on('start_game', () => {
    for (const value of userUrlsMap.values()) {
      if (!value) {
        io.emit("start_failed", { error: "Not all players are ready!" });
        console.log("not all players are ready");
        return;
      }
    }

    const users = Array.from(userUrlsMap.keys());
    const postUser = users[Math.floor(Math.random() * users.length)];

    const urls = userUrlsMap.get(postUser);
    if (urls && urls.length > 0) {
      const url = urls[Math.floor(Math.random() * urls.length)];
      const postId = extractInstagramPostId(url);
      io.emit("start_guess", { postUser, postId });
    } else {
      console.log(`No URLs found for user ${postUser}`);
    }
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
    const user = socketUserMap.get(socket.id);
    if (user) {
      userUrlsMap.delete(user);
      io.emit("lobby_update", Object.fromEntries(userUrlsMap));
    }
  });
})

server.listen(3000, () => {
  console.log('server running at http://localhost:3000');
});