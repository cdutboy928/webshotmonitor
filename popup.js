document.getElementById('save').addEventListener('click', () => {
  const url = document.getElementById('url').value;
  chrome.storage.sync.set({ targetUrl: url }, () => {
    alert('URL saved');
  });
});

document.getElementById('start').addEventListener('click', () => {
  chrome.storage.sync.get('targetUrl', (data) => {
    const targetUrl = data.targetUrl;
    if (targetUrl) {
      chrome.alarms.create("refreshAlarm", { periodInMinutes: 5 });
      chrome.tabs.create({ url: targetUrl });
    } else {
      alert('Please save a URL first');
    }
  });
});

document.getElementById('stop').addEventListener('click', () => {
  chrome.alarms.clear("refreshAlarm");
});