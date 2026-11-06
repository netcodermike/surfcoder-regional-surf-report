# SurfCoder Regional Surf Report

Choose a surf region or coordinates and compare live marine forecasts, swell periods, directions, and wind.

**Language:** JavaScript · **License:** MIT · **Data:** Local by default

## What it does

- Eleven regions and 26 coastal locations plus custom coordinates
- Seven-day live wave, swell and wind forecasts
- Local-time day selection, metric/imperial units, saved location and CSV

## Requirements

Node.js 22+ for tests; Python 3 for the optional local HTTP server.

## Install, validate, and run

```sh
npm install --ignore-scripts
npm test
npm start
```

Open http://127.0.0.1:8080 in a modern browser. TypeScript source compiles to `dist/` when running `npm test` or `npm run build`. Start audio with an explicit button click.

## Usage and examples

See [docs/usage.md](docs/usage.md) for a walkthrough and [docs/architecture.md](docs/architecture.md) for implementation details. Tests are deterministic and do not require an exchange, paid API, external model, microphone, or private data.

## Boundaries

Offshore grid forecasts do not resolve every beach break, tide, current, hazard, or local wind effect. Check conditions locally and follow lifeguard guidance.

## Privacy

No analytics or accounts are built in. Local file tools process only the paths you supply. For model-server and weather apps, the interface and usage guide identify the destination and the data sent. Do not commit personal input files, model credentials, or generated recordings.

## Development

Run the validation commands above before submitting changes. GitHub Actions runs these checks on pushes and pull requests. See the workflow for the reproducible toolchain. A successful workflow verifies the tested paths; manual audio-device behavior is documented separately.
