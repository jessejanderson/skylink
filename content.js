function getDomainName() {
  const hostname = window.location.hostname
  return hostname.replace(/^www\./, "")
}

async function checkForDID(domain) {
  // We use Google's DNS over HTTPS API to resolve the TXT record
  const response = await fetch(
    `https://dns.google/resolve?name=_atproto.${domain}&type=TXT`
  )
  const data = await response.json()

  // We use the TXT record type to avoid CORS issues
  const records = data?.Answer?.filter((record) => record.type === 16) || []

  // We filter out all records that are not TXT records
  const didRecord = records.find((record) =>
    record.data.includes("did=did:plc:")
  )

  // We return the DID if we found one
  return didRecord ? didRecord.data.replace("did=", "") : null
}

// We check for a DID on the current domain
;(async function () {
  const domain = getDomainName()
  const did = await checkForDID(domain)

  if (did) {
    chrome.runtime.sendMessage({ type: "DID_FOUND", did })
  } else {
    chrome.runtime.sendMessage({ type: "DID_NOT_FOUND" })
  }
})()

// We listen for messages from the background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "GET_DID") {
    checkForDID(getDomainName())
      .then((did) => sendResponse({ did }))
      .catch(() => sendResponse({ did: null }))
    return true // Indicate that the response will be sent asynchronously.
  }
})
