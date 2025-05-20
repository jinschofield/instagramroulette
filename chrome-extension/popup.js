const KEY_NAME     = 'userName';
const KEY_LIVEMODE = 'useWebSocket';

const inpName      = document.getElementById('username');
const chkLive      = document.getElementById('liveMode');
const btnSave      = document.getElementById('save');

// Load stored values into inputs
chrome.storage.local.get([KEY_NAME, KEY_LIVEMODE])
  .then(({ userName, useWebSocket }) => {
    if (userName)   inpName.value = userName;
    if (typeof useWebSocket === 'boolean')
                    chkLive.checked = useWebSocket;
  });

btnSave.addEventListener('click', async () => {
  const name = inpName.value.trim();
  if (!name) return alert('Please enter your name.');

  await chrome.storage.local.set({
    [KEY_NAME]: name,
    [KEY_LIVEMODE]: chkLive.checked
  });

  alert('Saved ✔');
  window.close();
});
