// 定时每5分钟刷新指定页面
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "refreshAlarm") {
    chrome.storage.sync.get('targetUrl', (data) => {
      const targetUrl = data.targetUrl;
      if (targetUrl) {
        chrome.tabs.query({ url: targetUrl }, (tabs) => {
          if (tabs.length > 0) {
            chrome.tabs.reload(tabs[0].id);
            // 在页面加载完成后进行截图
            chrome.tabs.onUpdated.addListener(function listener(tabId, info) {
              if (info.status === 'complete' && tabId === tabs[0].id) {
                chrome.tabs.onUpdated.removeListener(listener);
                captureAndProcessScreenshot(tabId);
              }
            });
          } else {
            chrome.tabs.create({ url: targetUrl }, (tab) => {
              // 在新创建的标签页加载完成后进行截图
              chrome.tabs.onUpdated.addListener(function listener(tabId, info) {
                if (info.status === 'complete' && tabId === tab.id) {
                  chrome.tabs.onUpdated.removeListener(listener);
                  captureAndProcessScreenshot(tabId);
                }
              });
            });
          }
        });
      }
    });
  }
});

function captureAndProcessScreenshot(tabId) {
  chrome.tabs.captureVisibleTab(null, { format: "png" }, (dataUrl) => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `screenshots/screenshot_${timestamp}.png`;
    
    console.log("Captured screenshot, dataUrl length:", dataUrl.length);
    
    // 将 dataUrl 转换为 Blob
    fetch(dataUrl)
      .then(res => res.blob())
      .then(blob => {
        console.log("Converted dataUrl to blob, blob size:", blob.size);
        
        // 创建一个新的 FileReader
        const reader = new FileReader();
        reader.onloadend = function() {
          // reader.result 包含了 base64 编码的图片数据
          console.log("Read blob as data URL, length:", reader.result.length);
          
          chrome.downloads.download({
            url: reader.result,
            filename: filename,
            saveAs: false
          }, (downloadId) => {
            if (chrome.runtime.lastError) {
              console.error("Download failed:", chrome.runtime.lastError);
            } else {
              console.log("Screenshot saved:", filename);
              // 截图保存后，发送消息给 Python 后端进行 OCR 处理
              sendToPythonBackend(reader.result, filename);
              
              // 显示通知
              chrome.notifications.create({
                type: 'basic',
                iconUrl: 'icons/icon48.png',
                title: 'Screenshot Saved',
                message: `Screenshot saved to ${filename}`
              });
            }
          });
        };
        reader.readAsDataURL(blob);
      })
      .catch(error => {
        console.error("Error converting dataUrl to blob:", error);
      });
  });
}

function sendToPythonBackend(imageData, filename) {
  fetch("http://localhost:5000/ocr", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ image: imageData, filename: filename })
  })
  .then(response => response.json())
  .then(data => {
    console.log("OCR result:", data.text);
    // 处理OCR结果，检测关键词
    if (data.text.includes("鼻炎")) {
      chrome.runtime.sendMessage({ action: "alert", message: "拼多多有异常上架" });
    }
    if (data.text.includes("手机登录")) {
      chrome.runtime.sendMessage({ action: "alert", message: "拼多多需要重新登录" });
    }
  })
  .catch(error => {
    console.error('OCR processing error:', error);
  });
}