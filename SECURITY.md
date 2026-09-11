# Security

Never commit or share a Technocore private-key JSON file.

The browser imports the Ed25519 private JWK directly with Web Crypto. It signs
`<room>|<nonce>|<text>` in the current tab and sends only the DID, signature,
nonce, and public message to the local proxy. The proxy is fixed to
`https://technocore.chat` and does not accept arbitrary upstream origins.

The browser intentionally does not persist the private key. Reloading the page
requires importing it again.
