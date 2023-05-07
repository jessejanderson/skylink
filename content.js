// Set up cross-browser compatibility
const runtime =
  typeof browser !== "undefined" ? browser.runtime : chrome.runtime
const storage =
  typeof browser !== "undefined" ? browser.storage.local : chrome.storage.local

// Function to get the domain name from the current hostname
function getDomainName() {
  const hostname = window.location.hostname
  return hostname.replace(/^www\./, "")
}

// Function to check for a DID in the domain's TXT records
async function checkForDIDDNS(domain) {
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

// Function to check for a DID in the well-known (not .well-known) location
async function checkForDIDHTTPS(domain) {
  try {
    const response = await fetch(
      `https://${domain}/xrpc/com.atproto.identity.resolveHandle`
    )
    const data = await response.json()
    return data.did
  } catch (error) {
    return null
  }
}

// Main function to perform actions, but only if the privacy consent has been accepted
function performAction(privacyConsentAccepted) {
  // If the user has accepted the privacy consent
  if (privacyConsentAccepted) {
    // We check for a DID on the current domain
    ;(async function () {
      const domain = getDomainName()
      const domainDID = await checkForDIDDNS(domain)
      const httpsDID = await checkForDIDHTTPS(domain)

      if (domainDID) {
        runtime.sendMessage({ type: "DID_FOUND", did: domainDID })
      } else if (httpsDID) {
        runtime.sendMessage({ type: "DID_FOUND", did: httpsDID })
      } else {
        runtime.sendMessage({ type: "DID_NOT_FOUND" })
      }
    })()

    // We listen for messages from the background script
    runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === "GET_DID") {
        checkForDIDDNS(getDomainName())
          .then((did) => sendResponse({ did }))
          .catch(() => sendResponse({ did: null }))
        return true // Indicate that the response will be sent asynchronously.
      }
    })
  } else {
    // Do nothing since the consent form has not been accepted.
    return
  }
}

// Get the user's privacy consent from the storage and perform actions accordingly
storage.get("privacyConsentAccepted", ({ privacyConsentAccepted }) => {
  performAction(privacyConsentAccepted)
})
