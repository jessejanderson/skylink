function setIcon(tabId, iconName) {
  chrome.action.setIcon({ path: iconName, tabId })
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach((tab) => setIcon(tab.id, "logo48_gray.png"))
  })
})

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "DID_FOUND") {
    setIcon(sender.tab.id, "logo48.png")
  } else {
    setIcon(sender.tab.id, "logo48_gray.png")
  }
})
