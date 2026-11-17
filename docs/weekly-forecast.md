# Seven-day swell explorer

The controls sit above the full-width seven-day graph. Switch between height and period and toggle the combined sea, swell, secondary and tertiary swell, and wind-wave series. Hover over the chart for the visible series at an hour. Tap or click the chart or use the keyboard slider to update the readout below it. Open the hourly table for the full seven-day prediction in chronological order, or open the daily maximum table for a comparison by day. Forecast timestamps use local time-zone abbreviations such as EST or EDT.

The existing Open-Meteo best-match marine endpoint still supplies seven days in one request. Newly requested fields are swell direction, secondary/tertiary swell height/period/direction, and wind-wave height/period/direction. See [the provider documentation](https://open-meteo.com/en/docs/marine-weather-api). Availability varies by model and location; unavailable series are disabled, missing samples create gaps, and missing daily values remain dashes. A Nags Head live check returned 168 hourly secondary-swell samples; tertiary swell was unavailable in best-match data.

Wave heights are significant modeled heights, not breaking-wave observations. Combined sea includes the components; heights cannot be added arithmetically. Swell partition ordering can change between hours and is not persistent storm tracking. All times use the selected location's IANA timezone. The existing feet/metres selector also updates the weekly graph.

Use the **Nearby buoys** view for timestamped offshore measurements from NOAA stations.

The height graph shows height on the left axis and period in seconds on the right. Blue dots plot the selected Period dots series at sampled hours. Combined sea is selected by default when it is available and visible. Use the picker to inspect another visible series, or hover or select an hour for the exact values.

## Tides and wind

Tide predictions have a separate height scale directly below the swell chart. The app requests six-minute predictions from [NOAA CO-OPS](https://api.tidesandcurrents.noaa.gov/api/prod/) and aligns them with the same seven local days. Heights use the station's Mean Lower Low Water (MLLW) datum. Indian Beach uses [Atlantic Beach Triple S Pier](https://tidesandcurrents.noaa.gov/noaatidepredictions.html?id=8656590) on the ocean side. Other locations use the nearest NOAA reference prediction station within 80 km (50 mi), when one is available. Astronomical tides omit weather-driven effects such as storm surge.

The wind chart plots hourly [Open-Meteo](https://open-meteo.com/en/docs) wind speed at 10 m in mph or km/h. Arrows point in the direction the wind is blowing toward. Hover or select an hour for the wind's compass direction of origin. Hover, tap, or use the forecast hour slider to line up the same hour across all available charts. The swell chart remains available when NOAA tides or the wind forecast are unavailable.
