// update here and also add to host permissions in manifest.json pls
const SERVER_ENDPOINT = "http://localhost:3000/";

chrome.action.onClicked.addListener(tab => {
  if (!tab.url.startsWith("https://www.instagram.com/explore/")) {
    return chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => alert("Please open the Instagram Explore page first.")
    });
  }

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: async (endpoint) => {
      // scroll 
      const scroller = document.scrollingElement || document.documentElement;
      for (let i = 0; i < 2; i++) {
        scroller.scrollTop = scroller.scrollHeight;
        await new Promise(r => setTimeout(r, 800));
      }

      // grab urls
      const links = Array.from(
        document.querySelectorAll('a[href^="/p/"]')
      )
      .slice(0, 5)
      .map(a => a.href);

      // send them to server
      try {
        const resp = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ links })
        });
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        // optional user feedback:
        console.log("✅ Links sent successfully");
      } catch (err) {
        console.error("❌ Failed to send links:", err);
        alert("Error sending links: " + err.message);
      }
    },
    
    args: [ SERVER_ENDPOINT ]
  });
});
