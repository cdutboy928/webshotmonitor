chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "processScreenshot") {
    const dataUrl = message.dataUrl;
    // 将截图发送到后端进行OCR处理
    fetch("http://localhost:5000/ocr", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ image: dataUrl })
    })
    .then(response => response.json())
    .then(data => {
      const text = data.text;
      // 处理OCR结果，检测关键词
      if (text.includes("鼻炎")) {
        chrome.runtime.sendMessage({ action: "alert", message: "拼多多有异常上架" });
      }
      if (text.includes("手机登录")) {
        chrome.runtime.sendMessage({ action: "alert", message: "拼多多需要重新登录" });
      }
    });
  }
});