from app.collectors.epam import EpamCollector
from app.collectors.softek import SoftekCollector
from app.collectors.accenture import AccentureCollector
from app.collectors.globant import GlobantCollector
from app.services.matcher_service import MatcherService

epam_collector = EpamCollector()
softek_collector = SoftekCollector()
accenture_collector = AccentureCollector()
globant_collector = GlobantCollector()
matcher = MatcherService()

epam_jobs = epam_collector.collect()
softek_jobs = softek_collector.collect()
accenture_jobs = accenture_collector.collect()
globant_jobs = globant_collector.collect()

print(f"Vacantes EPAM obtenidas: {len(epam_jobs)}")
print(f"Vacantes Softtek obtenidas: {len(softek_jobs)}")
print(f"Vacantes Accenture obtenidas: {len(accenture_jobs)}")
print(f"Vacantes Globant obtenidas: {len(globant_jobs)}")

jobs = epam_jobs + softek_jobs + accenture_jobs + globant_jobs

results = []

for job in jobs:

    result = matcher.score(job)

    seo = job.get("seo") or {}
    url_path = seo.get("url", "")
    full_url = f"https://careers.epam.com{url_path}" if url_path else "N/A"
    
    if job.get("company") in ["Softtek", "Accenture", "Globant"]:
        full_url = job.get("url", "N/A")

    results.append({
        "title": job.get("name", "N/A"),
        "score": result["score"],
        "matches": result["matches"],
        "skills": job.get("skills", []),
        "url": full_url,
        "company": job.get("company", "Desconocida"),
        "modality": job.get("modality", "Unknown")
    })

results.sort(
    key=lambda x: x["score"],
    reverse=True
)

from collections import defaultdict

jobs_by_company = defaultdict(list)
for job in results:
    if job["score"] > 0:
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
        print(f"Modalidad: {job['modality']}")

        print("\nMatches:")

        for category, skills in job["matches"].items():

            print(f"  {category}: {', '.join(skills)}")

        print("\nSkills:")
        print(", ".join(job["skills"]))