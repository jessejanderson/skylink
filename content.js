var data

function getDomainName() {
  const hostname = window.location.hostname
  return hostname.replace(/^www\./, "")
}

async function checkForDID(domain) {
  const response = await fetch(
    `https://dns.google/resolve?name=_atproto.${domain}&type=TXT`
  )
  data = await response.json()
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

function getDID(domain) {
  const records = data?.Answer?.filter((record) => record.type === 16) || []
  console.log(records.filter((record) => record.data.includes("did=did:plc:"))[0]["data"])
  return records.filter((record) => record.data.includes("did=did:plc:"))[0]["data"].substring(4)
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "GET_DOMAIN") {
    sendResponse({ domain: getDomainName() })
  }
  if (message.type === "GET_DID") {
    sendResponse({ did: getDID(getDomainName()) })
  }
})
