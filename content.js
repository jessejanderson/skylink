// Set up cross-browser compatibility
const runtime =
  typeof browser !== "undefined" ? browser.runtime : chrome.runtime
const storage =
  typeof browser !== "undefined" ? browser.storage.local : chrome.storage.local

// Make sure that we don't DoS the regex if someone supplies too large of a DID
// 1024 was arbitratily chosen to limit performance impact, I couldn't find any specicied limits on DID length
const MAX_DID_LENGTH = 1024

// Regular expression to validate the DID format
const didRegex =
  /^did:plc:([a-zA-Z0-9._-]+(:[a-zA-Z0-9._-]+)*|((%[0-9A-Fa-f]{2})|[a-zA-Z0-9._-])+(:((%[0-9A-Fa-f]{2})|[a-zA-Z0-9._-])+)*$)/

// Function to validate the DID string
function isValidDID(didString) {
  return didString.length <= MAX_DID_LENGTH && didRegex.test(didString)
}

// Function to get the domain name from the current hostname
function getDomainName() {
  const hostname = window.location.hostname
  return hostname.replace(/^www\./, "")
}

// Function to validate the domain name
function isValidDomain(domain) {
  const MAX_DOMAIN_LENGTH = 255

  if (domain.length > MAX_DOMAIN_LENGTH) {
    return false
  }

  try {
    // Use the build in URL constructor to validate the URL, if doesn't throw an error, the domain is valid
    // This is a better choice than a regex since it should properly support punycode/international domains
    new URL(`https://${domain}`)
    return true
  } catch (error) {
    // The URL constructor threw an error, so the domain is not valid
    return false
  }
}

// Function to check for a DID in the domain's TXT records
async function checkForDIDDNS(domain) {
  try {
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

    // We return the DID if we found one and it's valid
    return didRecord && isValidDID(didRecord.data.replace("did=", ""))
      ? didRecord.data.replace("did=", "")
      : null
  } catch (error) {
    return null
  }
}

// Function to check for a DID in the well-known (not .well-known) location
async function checkForDIDHTTPS(domain) {
  try {
    const response = await fetch(
      `https://${domain}/xrpc/com.atproto.identity.resolveHandle`
    )

    if (!response.headers.get("Content-Type")?.includes("application/json")) {
      throw new Error("Invalid Content-Type")
    }

    const data = await response.json()
    return data.did && isValidDID(data.did) ? data.did : null
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
      if (isValidDomain(domain)) {
        const domainDID = await checkForDIDDNS(domain)
        const httpsDID = await checkForDIDHTTPS(domain)

        if (domainDID) {
          runtime.sendMessage({ type: "DID_FOUND", did: domainDID })
        } else if (httpsDID) {
          runtime.sendMessage({ type: "DID_FOUND", did: httpsDID })
        } else {
          runtime.sendMessage({ type: "DID_NOT_FOUND" })
        }
      }
    })()

    // We listen for messages from the background script
    runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === "GET_DID") {
        const domain = getDomainName()
        if (isValidDomain(domain)) {
          checkForDIDDNS(domain)
            .then((did) => sendResponse({ did }))
            .catch(() => sendResponse({ did: null }))
          return true // Indicate that the response will be sent asynchronously.
        }
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
