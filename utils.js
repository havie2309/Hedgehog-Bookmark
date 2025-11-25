// utils.js - Utility functions for the extension

export async function getActiveTabURL() {
    const tabs = await chrome.tabs.query({
        currentWindow: true,
        active: true
    });
    
    return tabs[0];
}

export function getTime(t) {
    const date = new Date(0);
    date.setSeconds(t);
    return date.toISOString().substring(11, 19); 
}