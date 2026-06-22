import requests
from app.collectors.base import BaseCollector

class GreenhouseCollector(BaseCollector):

    COMPANIES = [
        "canonical",     # Linux, Ubuntu, Kubernetes
        "gitlab",        # DevOps, CI/CD
        "datadog",       # Observabilidad
        "newrelic",      # Observabilidad
        "cloudflare",    # Networking, Backend
        "elastic",       # Elasticsearch, Observabilidad
        "grafanalabs",   # Grafana, Monitoring
        "mongodb",       # Backend, Bases de datos
        "anthropic",
        "duolingo",
        "coinbase",
        "hackerrank",
        "reddit"
    ]

    BASE_URL = "https://boards-api.greenhouse.io/v1/boards/{}/jobs?content=true"

    def collect(self):
        all_jobs = []
        LATAM_KEYWORDS = ["mexico", "méxico", "brazil", "brasil", "argentina", "colombia", "chile", "peru", "perú", "costa rica", "uruguay", "latam", "latin america", "américa latina"]

        for company in self.COMPANIES:
            try:
                response = requests.get(
                    self.BASE_URL.format(company),
                    timeout=10
                )

                if response.status_code != 200:
                    continue

                data = response.json()
                jobs = data.get("jobs", [])

                for job in jobs:
                    location = job.get("location", {}).get("name", "")
                    modality = "Unknown"
                    if location:
                        location_lower = location.lower()
                        # Solo vacantes LATAM (opcional, pero se mantiene según el flujo)
                        if any(keyword in location_lower for keyword in LATAM_KEYWORDS):
                            if "remote" in location_lower or "remoto" in location_lower:
                                modality = "Remote"
                            else:
                                modality = "On-site/Hybrid"
                                
                            structured_job = {
                                "name": job.get("title"),
                                "company": company.capitalize(),
                                "publication_date": job.get("updated_at"),
                                "modality": modality,
                                "url": job.get("absolute_url"),
                                "skills": [] # Se pueden parsear despues
                            }
                            all_jobs.append(structured_job)

            except Exception as e:
                print(f"Error fetching {company}: {e}")
                
        return all_jobs

if __name__ == "__main__":
    collector = GreenhouseCollector()
    jobs = collector.collect()
    print(f"Vacantes encontradas (LATAM): {len(jobs)}")
    for job in jobs[:5]:
        print(f"\nTítulo: {job['name']}")
        print(f"Compañía: {job['company']}")
        print(f"URL: {job['url']}")