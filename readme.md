# RemitCompare — Live Remittance Rate Comparison

A side-by-side comparison of what different money-transfer providers would
give a recipient, built on top of the live mid-market exchange rate — not
just a spot converter, but the tool an OFW or diaspora sender would
actually want before choosing where to send money.

**Live demo:** _add your GitHub Pages link here_

## Why this project

A generic currency converter answers "what's the exchange rate?" A
remittance sender's real question is "which provider gets my family the
most money, right now?" RemitCompare starts from the live mid-market rate
and lays out what a handful of common providers would likely offer,
ranked by net amount received.

## Important note on the numbers

Remittance providers don't expose free, CORS-open rate APIs, so this demo
applies a set of **illustrative, clearly-labeled margins and fees** on top
of the live mid-market rate to approximate each provider's likely offer —
it does not call the providers directly. The mid-market rate itself is
live and real. Turning this into a production tool means replacing
`PROVIDER_PROFILES` in `script.js` with real partner-API integrations or a
licensed rate-aggregation feed. This distinction is disclosed in the app
itself, not just here.

## Features

- Live mid-market exchange rate for any supported currency pair
- Side-by-side provider comparison, sorted by best net amount received
- Common corridors pre-loaded (PHP, USD, AED, SGD, SAR, HKD) for OFW/
  diaspora remittance use cases
- Clear "best value" badge and transparent fee breakdown per provider
- No backend, no login, no API key required

## Tech stack

- Vanilla JavaScript (ES2020+)
- [open.er-api.com](https://www.exchangerate-api.com/) — free, keyless
  exchange-rate API

## Running locally

```bash
git clone https://github.com/arjayb/RemitCompare.git
cd RemitCompare
npx serve .
```

## Possible next steps

- Replace modeled provider margins with real partner APIs
- Add more currency corridors and cash-pickup-specific providers
- Historical "best day to send" chart

## License

MIT
