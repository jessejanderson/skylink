const tabsWithDID = new Map()

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
    tabsWithDID.set(sender.tab.id, message.did)
  } else {
    setIcon(sender.tab.id, "logo48_gray.png")
    tabsWithDID.delete(sender.tab.id)
  }
})

chrome.action.onClicked.addListener((tab) => {
  const did = tabsWithDID.get(tab.id)
  if (did) {
    const newUrl = `${bskyAppUrl}/profile/${did}`
    chrome.tabs.create({ url: newUrl })
  }
})
