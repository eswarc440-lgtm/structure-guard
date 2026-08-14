import json
import requests

CONFIG = "data/raw/apsac_layers.json"

with open(CONFIG, "r", encoding="utf-8") as f:
    config = json.load(f)

base = config["base_wms"]

print("=" * 80)
print("APSAC LAYER AVAILABILITY CHECK")
print("=" * 80)

for layer in config["layers"]:
    workspace = layer["workspace"]

    url = (
        f"{base}/{workspace}/wms"
        f"?service=WMS"
        f"&version=1.3.0"
        f"&request=GetCapabilities"
    )

    try:
        r = requests.get(url, timeout=20)

        if r.status_code == 200 and "WMS_Capabilities" in r.text:
            status = "AVAILABLE"
        elif r.status_code == 200 and "ServiceException" not in r.text:
            status = "RESPONDED"
        else:
            status = f"FAILED ({r.status_code})"

    except Exception as e:
        status = f"ERROR: {e}"

    print(f"{layer['category']:15} "
          f"{layer['name']:25} "
          f"{status}")

print("=" * 80)