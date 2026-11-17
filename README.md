# SurfingCoder Regional Surf Report

Choose a surf region or coordinates and compare marine forecasts with measurements from nearby NOAA wave buoys.

**Language:** JavaScript · **License:** MIT · **Data:** Local by default

## What it does

- Twelve regions, including 46 named North Carolina beaches, plus custom coordinates
- Seven-day live wave, swell and wind forecasts
- Recent NOAA buoy observations ranked by distance from the selected location
- Full-width seven-day swell graph with hover readings and a collapsible chronological hourly forecast in local time
- Metric/imperial units, saved location and CSV

## Requirements

Node.js 22+ for tests; Python 3 for the optional local HTTP server.

## Install, validate, and run

```sh
node --test tests/core.test.js
python -m http.server 8080 --bind 127.0.0.1
```

Open http://127.0.0.1:8080 in a modern browser. The app runs directly from its HTML, CSS, and JavaScript files.

## Usage and examples

See [docs/usage.md](docs/usage.md) for a walkthrough and [docs/architecture.md](docs/architecture.md) for implementation details. Tests are deterministic and do not require an exchange, paid API, external model, microphone, or private data.

## Boundaries

Offshore grid forecasts do not resolve every beach break, tide, current, hazard, or local wind effect. Check conditions locally and follow lifeguard guidance.

## Privacy

No analytics or accounts are built in. Local file tools process only the paths you supply. For model-server and weather apps, the interface and usage guide identify the destination and the data sent. Do not commit personal input files, model credentials, or generated recordings.

## Development

Run the validation commands above before submitting changes. GitHub Actions runs these checks on pushes and pull requests. See the workflow for the reproducible toolchain. A successful workflow verifies the tested paths; manual audio-device behavior is documented separately.

## North Carolina beaches

Choose **North Carolina** under Your region, then choose a named beach under Forecast location. The 46 locations are grouped into five coastal areas. See [the beach catalogue](docs/north-carolina-beaches.md). Nearby beaches may share an offshore model cell; named presets do not imply beach-specific observations.

## Seven-day swell explorer

The live demo now includes separate combined-sea, swell, secondary/tertiary swell, and wind-wave graphs with height/period views, component toggles, an hourly readout, and daily maximum tables. Missing model components remain unavailable. See [data and limitations](docs/weekly-forecast.md). All new graph data is from Open-Meteo; no buoy observations are implied.

## Nearby buoys

The report opens at **Indian Beach, NC** unless a different location was explicitly saved. Select **Nearby buoys** to see the three closest stations in the wave buoy catalog within 250 km. For Indian Beach, NOAA station [41159, Onslow Bay Outer](https://www.ndbc.noaa.gov/station_page.php?station=41159), is about 33 miles away.

The nearby view shows significant wave height, peak period, wave direction, water temperature, and the available readings from the past 36 hours, newest first. For station 41159 it uses the [buoy operator’s feed via SECOORA](https://erddap.secoora.org/erddap/tabledap/41159-lej3wave-lej3w-onslow-b.html), with the [NOAA CoastWatch NDBC dataset](https://coastwatch.pfeg.noaa.gov/erddap/tabledap/cwwcNDBCMet.html) as a fallback. Other stations use NOAA CoastWatch. Readings older than three hours are marked. The display uses your chosen units and your browser’s local time. Choose **Station and recent history** for additional records, including the swell and wind-wave breakdown when NOAA provides it. **Search nearby on NOAA** covers stations outside the app’s catalog.

The site ships with a station catalog containing IDs, names, and coordinates. Refresh it with Python 3 when station deployments change.

    python scripts/update-buoy-catalog.py

The script joins NOAA’s Active Station List with its latest observations and keeps moored buoys reporting wave height. Updating it changes the nearby station choices. The report loads new readings from NOAA independently of catalog updates. It uses NOAA’s browser JSONP endpoint in a sandboxed frame, while the page renders the readings itself. When publishing at surfingcoder.com, copy the updated catalog to the site’s surf report directory.
