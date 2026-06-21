import json
from app.collectors.globant import GlobantCollector
from app.services.matcher_service import MatcherService

collector = GlobantCollector()
matcher = MatcherService()

jobs = collector.collect()
print(f"Vacantes Globant obtenidas: {len(jobs)}")

results = []
for job in jobs:
    result = matcher.score(job)
    
    if result["score"] > 0:
        results.append({
            "title": job.get("name", "N/A"),
            "score": result["score"],
            "matches": result["matches"],
            "skills": job.get("skills", []),
            "url": job.get("url", "N/A"),
            "company": job.get("company", "Globant"),
            "modality": job.get("modality", "Unknown")
        })

results.sort(key=lambda x: x["score"], reverse=True)

print(f"\n\n{'#' * 80}")
print(f"### TOP VACANTES - GLOBANT ###")
print(f"{'#' * 80}")

for job in results:
    print("\n" + "=" * 80)
    print(f"Titulo : {job['title']}")
    print(f"Score  : {job['score']}")
    print(f"URL    : {job['url']}")
    print(f"Compañia : {job['company']}")
    print(f"Modalidad: {job['modality']}")
    print("\nMatches:")
    for category, skills in job["matches"].items():
        print(f"  {category}: {', '.join(skills)}")
    print("\nSkills:")
    print(", ".join(job["skills"]))
