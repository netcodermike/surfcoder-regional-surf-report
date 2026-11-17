"""Refresh the location index from NOAA's active buoys reporting wave heights."""

import argparse
import json
import math
from pathlib import Path
from urllib.request import Request, urlopen
import xml.etree.ElementTree as ET

NDBC = 'https://www.ndbc.noaa.gov'


def fetch(path):
    request = Request(NDBC + path, headers={'User-Agent': 'SurfCoder Regional Surf Report'})
    with urlopen(request, timeout=25) as response:
        return response.read()


def catalog(active_xml, latest_text):
    active = ET.fromstring(active_xml)
    buoys = {station.get('id').upper(): station for station in active.findall('station')
             if station.get('type') == 'buoy' and station.get('id') and station.get('name')}
    header, *lines = latest_text.splitlines()
    columns = header.lstrip('#').split()
    station_col, height_col = (columns.index(name) for name in ('STN', 'WVHT'))
    reporting = set()
    for line in lines:
        if line.startswith('#'):
            continue
        fields = line.split()
        if len(fields) <= max(station_col, height_col):
            continue
        try:
            height = float(fields[height_col])
        except ValueError:
            continue
        if math.isfinite(height) and 0 <= height < 99:
            reporting.add(fields[station_col].upper())
    return {
        'catalogDateUtc': active.attrib['created'][:10],
        'stations': [
            {'id': key, 'name': buoys[key].attrib['name'],
             'lat': float(buoys[key].attrib['lat']), 'lon': float(buoys[key].attrib['lon'])}
            for key in sorted(reporting & buoys.keys())
        ],
    }


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', type=Path,
                        default=Path(__file__).resolve().parents[1] / 'src' / 'ndbc-stations.json')
    args = parser.parse_args()
    result = catalog(fetch('/activestations.xml'), fetch('/data/latest_obs/latest_obs.txt').decode('latin-1'))
    if not result['stations']:
        raise SystemExit('NOAA returned an empty wave buoy catalog.')
    records = ',\n'.join('    ' + json.dumps(station, ensure_ascii=False) for station in result['stations'])
    date = json.dumps(result['catalogDateUtc'])
    args.output.write_text('{\n  "catalogDateUtc": ' + date + ',\n  "stations": [\n' + records + '\n  ]\n}\n',
                           encoding='utf-8', newline='\n')
    print(f'Updated {len(result["stations"])} NOAA wave buoy locations.')
