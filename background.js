// 定时每5分钟刷新指定页面
const targetUrl = "https://example.com"; // 替换为指定的网址

chrome.alarms.create("refreshAlarm", { periodInMinutes: 5 });

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "refreshAlarm") {
    chrome.tabs.query({ url: targetUrl }, (tabs) => {
      if (tabs.length > 0) {
        chrome.tabs.reload(tabs[0].id);
      } else {
        chrome.tabs.create({ url: targetUrl });
      }
    });
  }
});

// 截图并发送给内容脚本进行OCR处理
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url === targetUrl) {
    chrome.tabs.captureVisibleTab(tab.windowId, { format: "png" }, (dataUrl) => {
      chrome.tabs.sendMessage(tabId, { action: "processScreenshot", dataUrl: dataUrl });
    });
  }
});