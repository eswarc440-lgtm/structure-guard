import requests

URL = "https://apsac.ap.gov.in/geoserver/Andhra-RoadNetwork/wms"

params = {
    "service": "WMS",
    "version": "1.1.1",
    "request": "GetCapabilities",
}

response = requests.get(URL, params=params, timeout=60)

print("Status:", response.status_code)
print("Content-Type:", response.headers.get("content-type"))
print("Size:", len(response.content), "bytes")

if response.ok:
    with open("data/raw/roads/apsac_roads_capabilities.xml", "wb") as f:
        f.write(response.content)

    print("Saved successfully.")
else:
    print(response.text[:1000])