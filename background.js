// Set up cross-browser compatibility
const runtime =
  typeof browser !== "undefined" ? browser.runtime : chrome.runtime
const tabs = typeof browser !== "undefined" ? browser.tabs : chrome.tabs
const storage =
  typeof browser !== "undefined" ? browser.storage.local : chrome.storage.local
const action = typeof browser !== "undefined" ? browser.action : chrome.action

// Make sure that we don't DoS the regex if someone supplies too large of a DID
const MAX_DID_LENGTH = 255

// Regular expression to validate the DID format
// https://w3c.github.io/did-core/#did-syntax
const didRegex =
  /^did:plc:([a-zA-Z0-9._-]+(:[a-zA-Z0-9._-]+)*|((%[0-9A-Fa-f]{2})|[a-zA-Z0-9._-])+(:((%[0-9A-Fa-f]{2})|[a-zA-Z0-9._-])+)*$)/

// Function to validate the DID string
function isValidDID(didString) {
  return didString.length <= MAX_DID_LENGTH && didRegex.test(didString)
}

// Function to get the domain name from the current hostname
function getDomainName(url) {
  const hostname = new URL(url).hostname
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

// Map to store tabs with DIDs
const tabsWithDID = new Map()

// URL of the Bluesky Web Applications
const bskyAppUrl = "https://bsky.app"

// Function to set the extension icon
function setIcon(tabId, iconName) {
  action.setIcon({ path: iconName, tabId })
}

// Main function to perform actions, but only if the privacy consent has been accepted
function performAction(tab) {
  storage.get("privacyConsentAccepted", ({ privacyConsentAccepted }) => {
    // If the user has accepted the privacy consent
    if (privacyConsentAccepted) {
      const domain = getDomainName(tab.url)
      if (isValidDomain(domain)) {
        checkForDIDDNS(domain).then((domainDID) => {
          if (domainDID) {
            setIcon(tab.id, "logo48.png")
            tabsWithDID.set(tab.id, domainDID)
          } else {
            checkForDIDHTTPS(domain).then((httpsDID) => {
              if (httpsDID) {
                setIcon(tab.id, "logo48.png")
                tabsWithDID.set(tab.id, httpsDID)
              } else {
                setIcon(tab.id, "logo48_gray.png")
                tabsWithDID.delete(tab.id)
              }
            })
          }
        })
      }
    }
  })
}

// Execute performAction when a tab is updated
tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.active) {
    performAction(tab)
  }
})

// On extension installation, check if privacy consent was already accepted and show it if not
runtime.onInstalled.addListener(() => {
  storage.get("privacyConsentAccepted", ({ privacyConsentAccepted }) => {
    if (
      typeof privacyConsentAccepted === "undefined" ||
      !privacyConsentAccepted
    ) {
      tabs.create({ url: "privacy_consent.html" })
    }
  })
})

// On extension installation, set the icon to gray for all tabs
runtime.onInstalled.addListener(() => {
  tabs.query({}, (tabs) => {
    tabs.forEach((tab) => setIcon(tab.id, "logo48_gray.png"))
  })
})

// Open the consent page if it hasn't been accepted and the user clicks on the extension icon
action.onClicked.addListener(() => {
  storage.get("privacyConsentAccepted", ({ privacyConsentAccepted }) => {
    if (
      typeof privacyConsentAccepted === "undefined" ||
      !privacyConsentAccepted
    ) {
      tabs.create({ url: "privacy_consent.html" })
    }
  })
})

// When the extension icon is clicked, open the profile page if there's a DID
action.onClicked.addListener((tab) => {
  const did = tabsWithDID.get(tab.id)
  if (did) {
    const newUrl = `${bskyAppUrl}/profile/${did}`
    tabs.create({ url: newUrl })
  }
})
