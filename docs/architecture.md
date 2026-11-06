# Implementation

The primary language is JavaScript. Core logic lives in `src/core.js` and is separated from the interaction/command interface where practical.

The static browser client joins Open-Meteo marine/wind forecasts by Unix timestamp and formats time in the returned location timezone. Marine forecasts use cell_selection=sea. Abort/sequence controls prevent an old location request from overwriting a new one. Wind failures do not hide available marine data. Values remain null when absent. Links attribute Open-Meteo and its source datasets. See official marine API documentation for licensing and commercial usage terms.

The buildless HTML shell uses accessible native inputs and buttons, a responsive CSS grid, and a canvas visualization. `ui.js` provides only shared display/audio primitives; the project-specific algorithms live in the core module. `app.js` owns resource lifecycles, interaction state, and error reporting. TypeScript projects compile with `tsc`; JavaScript projects run directly.

## Checks

The repository tests exercise the domain algorithm with valid examples and invalid/boundary cases. CI uses synthetic fixtures and does not start paid services or connect to user accounts. See `README.md` and `.github/workflows/ci.yml` for exact commands.

## Extending the project

Add format support or new operations with corresponding tests. Preserve validation and explicit format boundaries. Keep generated data and secrets outside source control.
