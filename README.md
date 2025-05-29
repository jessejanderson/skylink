# SkyLink - Bluesky DID Detector

[![Chrome Web Store](https://img.shields.io/chrome-web-store/v/aflpfginfpjhanhkmdpohpggpolfopmb)](https://chrome.google.com/webstore/detail/skylink-bluesky-did-detector/aflpfginfpjhanhkmdpohpggpolfopmb)
[![Firefox Add-ons](https://img.shields.io/amo/v/skylink-bluesky-did-detector)](https://addons.mozilla.org/en-US/firefox/addon/skylink-bluesky-did-detector)

A simple web extension that detects if the current website is connected to a Bluesky user.

Remember the good 'ol days of visiting someone's blog and being delighted when the "RSS" lit up in your browser? This is meant to capture that same magic. No more hunting on a page for a random bird icon to see if you can find their online profile.

![chrome_skyline_preview](https://user-images.githubusercontent.com/8367129/235382697-aedfda18-aab3-477b-b59c-c12cdd33bf9b.png)

## How it Works

SkyLink detects Decentralized Identifiers (DIDs) by checking both:

1. **DNS TXT Records**: Looking for a DID in the `_atproto` subdomain's TXT records
2. **HTTPS Well-Known**: Checking via the [alternative HTTPS method](https://psky.app/profile/emily.bsky.team/post/3juuaipn3q424) at `/.well-known/atproto-did`

When a profile is detected, the extension icon lights up blue. Click it to visit their Bluesky profile!

---

Bluesky is now open to everyone! The web app is at https://bsky.app.

You can find me there at [@adhdjesse.com](https://bsky.app/profile/adhdjesse.com)

**Contributors:**

- [@danielhuckmann.com](https://bsky.app/profile/danielhuckmann.com) - Firefox Support, Privacy & Security Enhancements
- [@aliceisjustplaying](https://bsky.app/profile/alice.bsky.sh) - HTTPS Method of DID Detection
