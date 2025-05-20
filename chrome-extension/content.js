// content.js

let collected = [];
let userName = null;

// Load any previously stored URLs and name
chrome.storage.local.get(["reelUrls","userName"], data => {
  if (Array.isArray(data.reelUrls)) collected = data.reelUrls;
  if (typeof data.userName === "string") userName = data.userName;
});

document.addEventListener("keydown", e => {
  if (e.key === "ArrowDown") {
    setTimeout(async () => {
      // 1) Prompt for name if missing
      if (!userName) {
        const name = prompt("Please enter your name:");
        if (!name) return;                // abort if they cancel/blank
        userName = name;
        await chrome.storage.local.set({ userName });
        console.log("👤 Stored user name:", userName);
      }

      // 2) Save the current URL if it's new
      const url = window.location.href;
      if (collected[collected.length - 1] !== url) {
        collected.push(url);
        chrome.storage.local.set({ reelUrls: collected });
        console.log("➕ Saved URL:", url);
      }
    }, 500); // give the SPA half a second to update the URL
  }
});
