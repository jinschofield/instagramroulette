// background.js (MV3 module)
// ---------------------------

import { io } from 'https://cdn.socket.io/4.5.4/socket.io.esm.min.js';

console.log('[Background] loaded as module');

const KEY_NAME      = 'userName';
const KEY_LIVEMODE  = 'useWebSocket';
const REEL_PATH     = '/reels/';
const BATCH_SIZE    = 5;

let nameCache       = 'unknown';
let useWebSocket    = false;
let buffer          = [];
let socket          = null;

/** ——————————————————————————————————————————————
 * Initialize Socket.IO (auto-reconnect) only in live mode
 */
function initSocketIO() {
  if (!useWebSocket) {
    console.log('[Socket.IO] init skipped — testing mode');
    return;
  }
  if (socket) return;  // already initialized

  socket = io('http://localhost:8080', {
    transports: ['websocket'],
    reconnectionDelay: 5000,
    autoConnect: true
  });

  socket.on('connect', () =>
    console.log('[Socket.IO] connected as', socket.id)
  );
  socket.on('disconnect', reason =>
    console.log('[Socket.IO] disconnected:', reason)
  );
  socket.on('connect_error', err =>
    console.error('[Socket.IO] connection error:', err.message)
  );
}

/** ——————————————————————————————————————————————
 * Called on each new /reel/ URL:
 *  - buffer it (deduped)
 *  - once buffer.length === BATCH_SIZE, flush()
 */
function handleReelUrl(url) {
  if (buffer.includes(url)) return;
  buffer.push(url);
  console.log(`[Buffer] added (${buffer.length}/${BATCH_SIZE}):`, url);

  if (buffer.length < BATCH_SIZE) return;
  flushBuffer();
}

/** ——————————————————————————————————————————————
 * Flush the buffer: send or download, then clear it
 */
function flushBuffer() {
  const payload = { name: nameCache, reels: buffer.slice() };

  if (useWebSocket) {
    if (socket && socket.connected) {
      socket.emit('reelsBatch', payload);
      console.log('[Socket.IO] emitted batch:', payload);
    } else {
      console.warn('[Socket.IO] not connected — batch dropped', payload);
    }
  } else {
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
        console.log('[Download] saved data.json (id=' + id + ')');
    });
  }

  buffer = [];  // reset for next batch
}

/** ——————————————————————————————————————————————
 * On startup: load stored name & mode, init socket if live
 */
chrome.storage.local.get([KEY_NAME, KEY_LIVEMODE])
  .then(({ userName, useWebSocket: live }) => {
    if (userName)                nameCache    = userName;
    if (typeof live === 'boolean') useWebSocket = live;
    console.log('[Background] name=', nameCache, 'liveMode=', useWebSocket);
    if (useWebSocket) initSocketIO();
  });

/** ——————————————————————————————————————————————
 * Watch for popup toggles: update name or mode
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
