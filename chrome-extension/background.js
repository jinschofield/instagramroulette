// background.js (MV3 module)
// ---------------------------

// 1) import the Socket.IO client
import { io } from 'https://cdn.socket.io/4.5.4/socket.io.esm.min.js';

console.log('[Background] loaded as module');

const KEY_NAME     = 'userName';
const KEY_LIVEMODE = 'useWebSocket';
const REEL_PATH    = '/reels/';

let nameCache    = 'unknown';
let useWebSocket = false;
let buffer       = [];
let socket       = null;

/**
 * Initialize Socket.IO (with auto-reconnect),
 * only if we're in Live mode.
 */
function initSocketIO() {
  if (!useWebSocket) {
    console.log('[Socket.IO] init skipped — testing mode');
    return;
  }
  if (socket) return;  // already initialized

  // ← change to your server URL & port
  socket = io('http://localhost:8080', {
    transports: ['websocket'],
    reconnectionDelay: 5000,
    autoConnect: true
  });

  socket.on('connect', () => {
    console.log('[Socket.IO] connected as', socket.id);
  });
  socket.on('disconnect', reason => {
    console.log('[Socket.IO] disconnected:', reason);
    // socket.io auto-reconnects by default
  });
  socket.on('connect_error', err => {
    console.error('[Socket.IO] connection error:', err.message);
  });
}

/**
 * Handle each new /reel/ URL:
 *  - In Test mode: buffer + download data.json
 *  - In Live mode: emit via Socket.IO
 */
async function handleReelUrl(url) {
  if (useWebSocket) {
    if (socket && socket.connected) {
      const payload = { name: nameCache, reel: url };
      socket.emit('reel', payload);
      console.log('[Socket.IO] emitted', payload);
    } else {
      console.warn('[Socket.IO] not connected — dropped', url);
    }

  } else {
    // TEST MODE: buffer & download
    if (!buffer.includes(url)) {
      buffer.push(url);
      console.log('[Test] buffered', url);

      const payload = { name: nameCache, reels: buffer };
      const json    = JSON.stringify(payload, null, 2);
      const blobUrl = 'data:application/json;charset=utf-8,' +
                      encodeURIComponent(json);

      chrome.downloads.download({
        url:            blobUrl,
        filename:       'data.json',
        conflictAction: 'overwrite'
      }, id => {
        if (chrome.runtime.lastError)
          console.error('[Download] error', chrome.runtime.lastError);
        else
          console.log('[Download] data.json saved (id=' + id + ')');
      });
    }
  }
}

/**
 * On startup: load stored name & mode, then init Socket.IO if needed
 */
chrome.storage.local.get([KEY_NAME, KEY_LIVEMODE])
  .then(({ userName, useWebSocket: live }) => {
    if (userName)          nameCache    = userName;
    if (typeof live === 'boolean') useWebSocket = live;
    console.log('[Background] name=', nameCache, 'liveMode=', useWebSocket);
    if (useWebSocket) initSocketIO();
  });

/**
 * Watch for changes (popup toggles)
 */
chrome.storage.onChanged.addListener(changes => {
  if (changes[KEY_NAME]) {
    nameCache = changes[KEY_NAME].newValue || 'unknown';
    console.log('[Background] name changed to', nameCache);
  }
  if (changes[KEY_LIVEMODE]) {
    useWebSocket = changes[KEY_LIVEMODE].newValue;
    console.log('[Background] liveMode changed to', useWebSocket);
    if (useWebSocket) initSocketIO();
    else if (socket) {
      socket.disconnect();
      socket = null;
    }
  }
});

// Filter for any instagram.com navigation
const filter = { url: [{ hostContains: 'instagram.com' }] };

// Full page loads
chrome.webNavigation.onCompleted.addListener(
  ({ url }) => url.includes(REEL_PATH) && handleReelUrl(url),
  filter
);
// SPA history changes
chrome.webNavigation.onHistoryStateUpdated.addListener(
  ({ url }) => url.includes(REEL_PATH) && handleReelUrl(url),
  filter
);
