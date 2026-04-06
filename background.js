const TOGGLE_MESSAGE = "nl-homesickness:toggle:v11";

chrome.action.onClicked.addListener((tab) => {
  if (!tab.id) {
    return;
  }

  chrome.scripting.executeScript(
    {
      target: { tabId: tab.id },
      files: ["content.js"]
    },
    () => {
      if (chrome.runtime.lastError) {
        return;
      }

      chrome.tabs.sendMessage(tab.id, { type: TOGGLE_MESSAGE }, () => {
        void chrome.runtime.lastError;
      });
    }
  );
});
