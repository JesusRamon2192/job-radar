from app.collectors.epam import EpamCollector
from app.services.matcher_service import MatcherService

collector = EpamCollector()
matcher = MatcherService()

jobs = collector.collect()

results = []

for job in jobs:

    result = matcher.score(job)

    seo = job.get("seo") or {}
    url_path = seo.get("url", "")
    full_url = f"https://careers.epam.com{url_path}" if url_path else "N/A"

    results.append({
        "title": job["name"],
        "score": result["score"],
        "matches": result["matches"],
        "skills": job.get("skills", []),
        "url": full_url
    })

results.sort(
    key=lambda x: x["score"],
    reverse=True
)

for job in results[:10]:

    print("\n" + "=" * 80)

    print(f"Titulo : {job['title']}")
    print(f"Score  : {job['score']}")
    print(f"URL    : {job['url']}")

    print("\nMatches:")

    for category, skills in job["matches"].items():

        print(f"  {category}: {', '.join(skills)}")

    print("\nSkills:")
    print(", ".join(job["skills"]))