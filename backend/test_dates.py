import requests
import json

print("=== EPAM ===")
url_epam = "https://careers.epam.com/api/jobs/v2/search/careers-i18n"
try:
    resp_epam = requests.get(url_epam, params={"from": 0, "size": 1, "lang": "en", "websiteLocale": "en-us", "facets": "country=4060741400009317836"})
    job = resp_epam.json()["data"]["jobs"][0]
    print("Keys:", job.keys())
    for k, v in job.items():
        if 'date' in k.lower() or 'time' in k.lower() or 'create' in k.lower() or 'publish' in k.lower() or 'post' in k.lower():
            print(f"-> {k}: {v}")
except Exception as e:
    print("Error:", e)

print("\n=== SOFTEK ===")
url_softek = "https://jobs.softtek.com/api/pcsx/search?domain=softtek.com&location=Mexico&start=0"
try:
    resp_softek = requests.get(url_softek)
    job = resp_softek.json()["data"]["positions"][0]
    print("Keys:", job.keys())
    for k, v in job.items():
        if 'date' in k.lower() or 'time' in k.lower() or 'create' in k.lower() or 'publish' in k.lower() or 'post' in k.lower():
            print(f"-> {k}: {v}")
except Exception as e:
    print("Error:", e)

print("\n=== ACCENTURE ===")
url_accenture = "https://www.accenture.com/api/accenture/elastic/findjobs"
payload_accenture = {
    "startIndex": "0", "maxResultSize": "1", "jobCountry": "Mexico", "jobLanguage": "es",
    "countrySite": "mx-es", "sortBy": "2", "searchType": "vectorSearch", "enableQueryBoost": "true",
    "minScore": "0.6", "getFeedbackJudgmentEnabled": "true", "useCleanEmbedding": "true",
    "score": "true", "totalHits": "true", "debugQuery": "false", "jobFilters": "[]"
}
try:
    resp_acc = requests.post(url_accenture, data=payload_accenture)
    job = resp_acc.json().get("data", [])[0]
    print("Keys:", job.keys())
    for k, v in job.items():
        if 'date' in k.lower() or 'time' in k.lower() or 'create' in k.lower() or 'publish' in k.lower() or 'post' in k.lower():
            print(f"-> {k}: {v}")
except Exception as e:
    print("Error:", e)
