function getDomainName() {
  const hostname = window.location.hostname
  return hostname.replace(/^www\./, "")
}

async function checkForDID(domain) {
  const response = await fetch(
    `https://dns.google/resolve?name=_atproto.${domain}&type=TXT`
  )
  const data = await response.json()

  const records = data?.Answer?.filter((record) => record.type === 16) || []

  const didRecord = records.find((record) =>
    record.data.includes("did=did:plc:")
  )

  return didRecord ? didRecord.data.replace("did=", "") : null
}

;(async function () {
  const domain = getDomainName()
  const did = await checkForDID(domain)

  if (did) {
    chrome.runtime.sendMessage({ type: "DID_FOUND", did })
  } else {
    chrome.runtime.sendMessage({ type: "DID_NOT_FOUND" })
  }
})()

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "GET_DID") {
    checkForDID(getDomainName())
      .then((did) => sendResponse({ did }))
      .catch(() => sendResponse({ did: null }))
    return true // Indicate that the response will be sent asynchronously.
  }
})
