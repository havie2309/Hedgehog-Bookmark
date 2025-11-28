chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // Only trigger when page is completely loaded and it's a YouTube watch page
  if (changeInfo.status === 'complete' && tab.url && tab.url.includes("youtube.com/watch")) {
    const queryParameters = tab.url.split("?")[1];
    const urlParameters = new URLSearchParams(queryParameters);
    
    chrome.tabs.sendMessage(tabId, {
      type: "NEW",
      videoId: urlParameters.get("v"),
    }).catch(err => {
      console.log("Content script not ready:", err);
    });
  }
});
