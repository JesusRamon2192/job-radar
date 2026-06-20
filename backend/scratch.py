import requests
import json
response = requests.get(
    "https://careers.epam.com/api/jobs/v2/search/careers-i18n",
    params={"from": 0, "size": 1, "lang": "en", "websiteLocale": "en-us", "facets": "country=4060741400009317836"}
)
print(json.dumps(response.json()["data"]["jobs"][0], indent=2))
