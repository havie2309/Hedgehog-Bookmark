// background.js - Service Worker for YouTube Bookmarks Extension

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // Only trigger when page is completely loaded and it's a YouTube watch page
  if (changeInfo.status === 'complete' && tab.url && tab.url.includes("youtube.com/watch")) {
    const queryParameters = tab.url.split("?")[1];
    const urlParameters = new URLSearchParams(queryParameters);
    
    chrome.tabs.sendMessage(tabId, {
      type: "NEW",
      videoId: urlParameters.get("v"),
    }).catch(err => {
      // Handle case where content script might not be ready yet
      console.log("Content script not ready:", err);
    });
  }
});