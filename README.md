# SurfingCoder Regional Surf Report

Choose a surf region or coordinates and compare marine forecasts with measurements from nearby NOAA wave buoys.

**Language:** JavaScript · **License:** MIT · **Data:** Local by default

## What it does

- Twelve regions, including 46 named North Carolina beaches, plus custom coordinates
- Aligned seven-day charts for swell, NOAA tide predictions, and wind speed and direction
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

The seven-day explorer shows combined sea, swell, secondary and tertiary swell, and wind waves with height and period views. NOAA tide heights and Open-Meteo wind speed and direction have their own charts on the same timeline. Hover over any chart or select an hour to compare the forecasts. See [data sources and coverage](docs/weekly-forecast.md).

## Nearby buoys

The report opens at **Indian Beach, NC** unless a different location was explicitly saved. The nearest buoy’s recent observations appear by default beneath the charts. Pick from up to three stations in the wave buoy catalog within 250 km. For Indian Beach, NOAA station [41159, Onslow Bay Outer](https://www.ndbc.noaa.gov/station_page.php?station=41159), is about 33 miles away.

The 24-hour chart draws height lines for combined sea, swell, and wind waves. Matching circles show combined sea peak period, swell period, and wind-wave period. Use the legend checkboxes to toggle each layer. Wind waves start hidden. Hover, tap, or use the slider to inspect each observation. The table shows up to 36 hours, newest first, and includes peak, swell, and wind-wave periods when available.

The Surf Report fetches the [NOAA standard observations and detailed wave summaries](https://www.ndbc.noaa.gov/faq/rt_data_access.shtml) on demand through the SurfingCoder buoy service, which caches successful responses for three minutes. The scheduled GitHub data branch is a fallback when the live service cannot provide recent readings. The report checks for new records every five minutes while open and lets you refresh manually. Newer basic readings also come from the [buoy operator’s feed via SECOORA](https://erddap.secoora.org/erddap/tabledap/41159-lej3wave-lej3w-onslow-b.html) for station 41159 or the [NOAA CoastWatch buoy feed](https://coastwatch.pfeg.noaa.gov/erddap/tabledap/cwwcNDBCMet.html) for other stations. Basic readings within five minutes can supplement a matching NOAA sample. The report shows how far the detailed data goes if those measurements lag behind the basic feed. Missing measurements remain blank.

The service is a read-only [Sites endpoint](https://surfingcoder-buoy-api.dreamymanatee10.chatgpt.site). Its deployable Worker source is in [worker/index.js](worker/index.js). The report selects the service URL in src/buoys.js.

The site ships with a station catalog containing IDs, names, and coordinates. Refresh it with Python 3 when station deployments change.

    python scripts/update-buoy-catalog.py

The script joins NOAA’s Active Station List with its latest observations and keeps moored buoys reporting wave height. Updating it changes the nearby station choices. The report loads new readings from NOAA independently of catalog updates. It uses NOAA’s browser JSONP endpoint in a sandboxed frame, while the page renders the readings itself. When publishing at surfingcoder.com, copy the updated catalog to the site’s surf report directory.
