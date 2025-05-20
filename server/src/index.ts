import express from 'express';
import { createServer } from 'node:http';
import { Server } from 'socket.io';

const app = express();
const server = createServer(app);
const io = new Server(server);

const userUrlsMap = new Map<string, string[] | null>();

io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('join', (username) => {
    // TODO: make sure can't take someone else's username
    if (!userUrlsMap.has(username)) {
      userUrlsMap.set(username, null);
      io.emit("lobby_update", Object.fromEntries(userUrlsMap));
    }
  });

  socket.on('geturls', (username, links) => {
    if (typeof username !== 'string' || !Array.isArray(links) || links.some(link => typeof link !== 'string')) {
      console.log('Invalid input. Expecting a username and an array of links.');
    }
    userUrlsMap.set(username, links);
    console.log(`Received links for user: ${username}`);
    console.log(links);
    io.emit("lobby_update", Object.fromEntries(userUrlsMap));
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
})

server.listen(3000, () => {
  console.log('server running at http://localhost:3000');
});