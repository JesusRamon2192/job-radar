import logging
import requests
from app.collectors.base import BaseCollector

LATAM_COUNTRIES = [
    "Mexico", "Colombia", "Argentina", "Chile", "Peru", "Costa Rica", "Brazil", "Uruguay", "Bolivia", "Ecuador"
]

class CapgeminiCollector(BaseCollector):

    def __init__(self):
        self.base_url = "https://cg-jobstream-api.azurewebsites.net/api/job-search"
        self.session = requests.Session()

    def collect(self):
        all_jobs = []
        size = 50 
        
        for country in LATAM_COUNTRIES:
            page = 1
            while True:
                params = {
                    "location": country,
                    "size": size,
                    "page": page
                }
                
                try:
                    r = self.session.get(self.base_url, params=params)
                    r.raise_for_status()
                    data = r.json()
                    
                    jobs = data.get("data", [])
                    if not jobs:
                        break
                        
                    for job in jobs:
                        title = job.get("title", "")
                        location = job.get("location", "N/A")
                        url = job.get("apply_job_url", "")
                        publication_date = job.get("updated_at", None)
                        description = job.get("description_stripped", "")
                        
                        skills = []
                        modality = "Unknown"
                        
                        desc_lower = description.lower()
                        if "híbrido" in desc_lower or "hibrido" in desc_lower or "hibrida" in desc_lower:
                            modality = "Híbrido"
                        elif "remoto" in desc_lower or "home office" in desc_lower:
                            modality = "Remoto"
                        elif "presencial" in desc_lower:
                            modality = "Presencial"

                        tech_keywords = ["python", "java", "react", "angular", "sql", "aws", "gcp", "azure", "cloud", "javascript", "typescript", "node.js"]
                        for kw in tech_keywords:
                            if kw in desc_lower:
                                display_kw = kw.capitalize() if kw not in ["aws", "gcp", "sql"] else kw.upper()
                                if kw == "node.js": display_kw = "Node.js"
                                if kw == "typescript": display_kw = "TypeScript"
                                if kw == "javascript": display_kw = "JavaScript"
                                skills.append(display_kw)
                        
                        all_jobs.append({
                            "company": "Capgemini",
                            "name": title,
                            "location": location,
                            "skills": list(set(skills)),
                            "url": url,
                            "modality": modality,
                            "publication_date": publication_date
                        })
                    
                    total = data.get("total", 0)
                    if len([j for j in all_jobs if j["location"].startswith(country) or country in j["location"] or True]) >= total:
                        # Since we append all jobs to a single list, we should check how many jobs we got FOR THIS COUNTRY
                        pass
                        
                    # Better to just check how many we added in this page
                    # Or check page * size >= total
                    if page * size >= total:
                        break
                        
                    page += 1
                    
                except Exception as e:
                    logging.error(f"Error extrayendo Capgemini en {country} página {page}: {e}")
                    break
                
        return all_jobs

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    collector = CapgeminiCollector()
    jobs = collector.collect()
    print(f"Total jobs encontrados para Capgemini: {len(jobs)}")
    if jobs:
        print("Muestra de un payload:")
        print(jobs[0])
