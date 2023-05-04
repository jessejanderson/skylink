// Set up cross-browser compatibility
const runtime = typeof browser !== 'undefined' ? browser.runtime : chrome.runtime;
const tabs = typeof browser !== 'undefined' ? browser.tabs : chrome.tabs;
const storage = typeof browser !== 'undefined' ? browser.storage.local : chrome.storage.local;
const action = typeof browser !== 'undefined' ? browser.action : chrome.action;

// On extension installation, check if privacy consent was already accepted and show it if not
runtime.onInstalled.addListener(() => {
  storage.get("privacyConsentAccepted", ({ privacyConsentAccepted }) => {
    if (typeof privacyConsentAccepted === "undefined" || !privacyConsentAccepted) {
      tabs.create({ url: "privacy_consent.html" });
    }
  });
});

// If the message 'SHOW_CONSENT' is received, open the privacy consent tab
runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'SHOW_CONSENT') {
    tabs.create({ url: "privacy_consent.html" });
  }
});

// Map to store tabs with DIDs
const tabsWithDID = new Map();

// URL of the Bluesky Web Applications
const bskyAppUrl = 'https://staging.bsky.app';

// Function to set the extension icon
function setIcon(tabId, iconName) {
  action.setIcon({ path: iconName, tabId });
}

// On extension installation, set the icon to gray for all tabs
runtime.onInstalled.addListener(() => {
  tabs.query({}, (tabs) => {
    tabs.forEach((tab) => setIcon(tab.id, 'logo48_gray.png'));
  });
});

// When a message is received from the DNS check, set the icon color to blue.
runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "DID_FOUND") {
    setIcon(sender.tab.id, "logo48.png");
    tabsWithDID.set(sender.tab.id, message.did);
  } else {
    setIcon(sender.tab.id, "logo48_gray.png");
    tabsWithDID.delete(sender.tab.id);
  }
});

// When the extension icon is clicked, open the profile page if there's a DID
action.onClicked.addListener((tab) => {
  const did = tabsWithDID.get(tab.id);
  if (did) {
    const newUrl = `${bskyAppUrl}/profile/${did}`;
    tabs.create({ url: newUrl });
  }
});
