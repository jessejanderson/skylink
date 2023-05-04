// Set up cross-browser compatibility
const runtime = typeof browser !== 'undefined' ? browser.runtime : chrome.runtime;
const tabs = typeof browser !== 'undefined' ? browser.tabs : chrome.tabs;
const storage = typeof browser !== 'undefined' ? browser.storage.local : chrome.storage.local;

// Main function to perform actions, but only if the privacy consent has been accepted
function performAction(privacyConsentAccepted) {
  // If the user has accepted the privacy consent
  if (privacyConsentAccepted) {
    // Function to get the domain name from the current hostname
    function getDomainName() {
      const hostname = window.location.hostname;
      return hostname.replace(/^www\./, '');
    }

    // Function to check for a DID in the domain's TXT records
    async function checkForDID(domain) {
      const response = await fetch(
        `https://dns.google/resolve?name=_atproto.${domain}&type=TXT`
      );
      const data = await response.json();

      const records = data?.Answer?.filter((record) => record.type === 16) || [];

      const didRecord = records.find((record) =>
        record.data.includes("did=did:plc:")
      );

      return didRecord ? didRecord.data.replace("did=", "") : null;
    }

    // Immediately invoked function to check for a DID and send a message based on the result
    (async function () {
      const domain = getDomainName();
      const did = await checkForDID(domain);

      if (did) {
        runtime.sendMessage({ type: "DID_FOUND", did });
      } else {
        runtime.sendMessage({ type: "DID_NOT_FOUND" });
      }
    })();

    // Listener for the 'GET_DOMAIN' message and respond with the domain
    runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === 'GET_DOMAIN') {
        sendResponse({ domain: getDomainName() });
      }
    });
  } else {
    // Do nothing since the consent form has not been accepted.
    return;
  }
}

// Get the user's privacy consent from the storage and perform actions accordingly
storage.get("privacyConsentAccepted", ({ privacyConsentAccepted }) => {
  performAction(privacyConsentAccepted);
});
