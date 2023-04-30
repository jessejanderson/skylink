const tabsWithDID = new Set()

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
    tabsWithDID.add(sender.tab.id)
  } else {
    setIcon(sender.tab.id, "logo48_gray.png")
    tabsWithDID.delete(sender.tab.id)
  }
})

chrome.action.onClicked.addListener((tab) => {
  if (tabsWithDID.has(tab.id)) {
    chrome.tabs.sendMessage(tab.id, { type: "GET_DOMAIN" }, (response) => {
      if (response && response.domain) {
        const newUrl = `https://staging.bsky.app/profile/${response.domain}`
        chrome.tabs.create({ url: newUrl })
      }
    })
  }
})
