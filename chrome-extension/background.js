// background.js

console.log('[Background] loaded');

const KEY_NAME      = 'userName';
const KEY_LIVEMODE  = 'useWebSocket';
const REEL_PATH     = '/reels/';

let nameCache       = 'unknown';
let useWebSocket    = false;
let buffer          = [];
let ws              = null;

/**
 * Initialize the WebSocket connection (with auto-reconnect),
 * but only if we’re in live mode.
 */
function initWebSocket() {
  if (!useWebSocket) {
    console.log('[WS] init skipped—testing mode');
    return;
  }
  if (ws && ws.readyState <= WebSocket.OPEN) return;

  ws = new WebSocket('ws://localhost:8080');  // ← your real endpoint
  ws.addEventListener('open',  ()    => console.log('[WS] connected'));
  ws.addEventListener('close', ()    => {
    console.log('[WS] closed—retry in 5s');
    setTimeout(initWebSocket, 5000);
  });
  ws.addEventListener('error', err  => console.error('[WS] error', err));
}

/**
 * Handle every new /reel/ URL:
 * - In Test mode: buffer it and download data.json
 * - In Live mode: send { name, reel } over WebSocket
 */
async function handleReelUrl(url) {
  if (useWebSocket) {
    if (ws && ws.readyState === WebSocket.OPEN) {
      const payload = { name: nameCache, reel: url };
      ws.send(JSON.stringify(payload));
      console.log('[WS] sent', payload);
    } else {
      console.warn('[WS] not open—dropped', url);
    }

  } else {
    if (!buffer.includes(url)) {
      buffer.push(url);
      console.log('[Test] buffered', url);

      const payload = { name: nameCache, reels: buffer };
      const json    = JSON.stringify(payload, null, 2);
      const blobUrl = 'data:application/json;charset=utf-8,' +
                      encodeURIComponent(json);

      chrome.downloads.download({
        url:         blobUrl,
        filename:    'data.json',
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
 * On startup, load stored name & mode
 */
chrome.storage.local.get([KEY_NAME, KEY_LIVEMODE])
  .then(({ userName, useWebSocket: live }) => {
    if (userName)      nameCache    = userName;
    if (typeof live === 'boolean') useWebSocket = live;
    console.log('[Background] name=', nameCache, 'liveMode=', useWebSocket);
    if (useWebSocket) initWebSocket();
  });

/**
 * Watch for changes to name or live/test mode from popup
 */
chrome.storage.onChanged.addListener(changes => {
  if (changes[KEY_NAME]) {
    nameCache = changes[KEY_NAME].newValue || 'unknown';
    console.log('[Background] name changed to', nameCache);
  }
  if (changes[KEY_LIVEMODE]) {
    useWebSocket = changes[KEY_LIVEMODE].newValue;
    console.log('[Background] liveMode changed to', useWebSocket);
    if (useWebSocket) initWebSocket();
    else if (ws) {
      ws.close();
      ws = null;
    }
  }
});

// Filter for any instagram.com navigation
const filter = { url: [{ hostContains: 'instagram.com' }] };

// Full page loads
chrome.webNavigation.onCompleted.addListener(
  ({ url }) => {
    if (url.includes(REEL_PATH)) handleReelUrl(url);
  },
  filter
);

// Client-side (SPA) navigations
chrome.webNavigation.onHistoryStateUpdated.addListener(
  ({ url }) => {
    if (url.includes(REEL_PATH)) handleReelUrl(url);
  },
  filter
);
