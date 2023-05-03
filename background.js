const tabsWithDID = new Set()

const bskyAppUrl = "https://staging.bsky.app"

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
    chrome.tabs.sendMessage(tab.id, { type: "GET_DID" }, function (response) {
        if (response && response.did) {
          const newUrl = `${bskyAppUrl}/profile/${response.did}`
          chrome.tabs.create({ url: newUrl })
        }
      })
  }
})
