from app.collectors.epam import EpamCollector
from app.collectors.softek import SoftekCollector
from app.collectors.accenture import AccentureCollector
from app.services.matcher_service import MatcherService
from datetime import datetime

def run_profile_match():
    epam_collector = EpamCollector()
    softek_collector = SoftekCollector()
    accenture_collector = AccentureCollector()
    matcher = MatcherService()

    epam_jobs = epam_collector.collect()
    softek_jobs = softek_collector.collect()
    accenture_jobs = accenture_collector.collect()

    jobs = epam_jobs + softek_jobs + accenture_jobs
    results = []

    for job in jobs:
        result = matcher.score(job)

        seo = job.get("seo") or {}
        url_path = seo.get("url", "")
        full_url = f"https://careers.epam.com{url_path}" if url_path else "N/A"
        
        if job.get("company") in ["Softtek", "Accenture"]:
            full_url = job.get("url", "N/A")

        results.append({
            "title": job.get("name", "N/A"),
            "score": result["score"],
            "matches": result["matches"],
            "skills": job.get("skills", []),
            "url": full_url,
            "company": job.get("company", "Desconocida")
        })

    # Ordenar por score por defecto
    results.sort(
        key=lambda x: x["score"],
        reverse=True
    )

    return {
        "jobs": results,
        "last_updated": datetime.now().isoformat()
    }
