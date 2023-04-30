function getDomainName() {
  return window.location.hostname
}

async function checkForDID(domain) {
  const response = await fetch(
    `https://dns.google/resolve?name=_atproto.${domain}&type=TXT`
  )
  const data = await response.json()
  const records = data?.Answer?.filter((record) => record.type === 16) || []
  return records.some((record) => record.data.includes("did=did:plc:"))
}

;(async function () {
  const domain = getDomainName()
  const didFound = await checkForDID(domain)

  if (didFound) {
    chrome.runtime.sendMessage({ type: "DID_FOUND" })
  } else {
    chrome.runtime.sendMessage({ type: "DID_NOT_FOUND" })
  }
})()

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "GET_DOMAIN") {
    sendResponse({ domain: getDomainName() })
  }
})
