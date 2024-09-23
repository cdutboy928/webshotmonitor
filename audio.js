chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "alert") {
    const alertMessage = message.message;
    const utterance = new SpeechSynthesisUtterance(alertMessage);
    utterance.lang = "zh-CN";
    speechSynthesis.speak(utterance);
  }
});