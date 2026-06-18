import requests
url = "https://jobs.softtek.com/api/pcsx/search?domain=softtek.com&location=Mexico&remote=true&start=0"
found = False
start = 0
while True:
    res = requests.get(f"https://jobs.softtek.com/api/pcsx/search?domain=softtek.com&location=Mexico&remote=true&start={start}")
    data = res.json().get("data", {})
    positions = data.get("positions", [])
    if not positions:
        break
    for p in positions:
        if str(p.get("positionId")) == "893393843647":
            print(f"Found! Name: {p.get('name')}, WorkLocation: {p.get('workLocationOption')}")
            found = True
    start += 10
if not found:
    print("Not found in the results.")
