from app.collectors.epam import EpamCollector
from app.collectors.softek import SoftekCollector
from app.services.matcher_service import MatcherService

epam_collector = EpamCollector()
softek_collector = SoftekCollector()
matcher = MatcherService()

epam_jobs = epam_collector.collect()
softek_jobs = softek_collector.collect()

print(f"Vacantes EPAM obtenidas: {len(epam_jobs)}")
print(f"Vacantes Softtek obtenidas: {len(softek_jobs)}")

jobs = epam_jobs + softek_jobs

results = []

for job in jobs:

    result = matcher.score(job)

    seo = job.get("seo") or {}
    url_path = seo.get("url", "")
    full_url = f"https://careers.epam.com{url_path}" if url_path else "N/A"
    
    if job.get("company") == "Softtek":
        full_url = job.get("url", "https://jobs.softtek.com/")

    results.append({
        "title": job.get("name", "N/A"),
        "score": result["score"],
        "matches": result["matches"],
        "skills": job.get("skills", []),
        "url": full_url,
        "company": job.get("company", "Desconocida")
    })

results.sort(
    key=lambda x: x["score"],
    reverse=True
)

from collections import defaultdict

jobs_by_company = defaultdict(list)
for job in results:
    jobs_by_company[job["company"]].append(job)

for company, company_jobs in jobs_by_company.items():
    print(f"\n\n{'#' * 80}")
    print(f"### TOP 10 VACANTES - {company.upper()} ###")
    print(f"{'#' * 80}")
    
    for job in company_jobs[:10]:
        print("\n" + "=" * 80)

        print(f"Titulo : {job['title']}")
        print(f"Score  : {job['score']}")
        print(f"URL    : {job['url']}")
        print(f"Compañia : {job['company']}")

        print("\nMatches:")

        for category, skills in job["matches"].items():

            print(f"  {category}: {', '.join(skills)}")

        print("\nSkills:")
        print(", ".join(job["skills"]))