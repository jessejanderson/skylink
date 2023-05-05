// Set up cross-browser compatibility
const runtime = typeof browser !== 'undefined' ? browser.runtime : chrome.runtime;
const storage = typeof browser !== 'undefined' ? browser.storage.local : chrome.storage.local;
const management = typeof browser !== 'undefined' ? browser.management : chrome.management;

document.getElementById("accept").addEventListener("click", function () {
    storage.set({ privacyConsentAccepted: true });
    window.close();
  });

  document.getElementById("decline").addEventListener("click", function () {
    management.uninstallSelf({ showConfirmDialog: true });
  });
