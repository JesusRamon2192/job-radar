import requests
import logging
import re
from app.collectors.base import BaseCollector
from app.config.profile import PROFILE

class HclCollector(BaseCollector):
    
    URL = "https://careers.hcltech.com/services/recruiting/v1/jobs"
    
    def collect(self):
        jobs = []
        
        # Flatten profile skills to search
        all_skills = set()
        for cat, skills in PROFILE.items():
            for s in skills:
                all_skills.add(s)
                
        headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
        
        page_num = 1
        total_jobs = 1  # Initialize to enter loop
        processed_jobs = 0
        
        # Paginación para extraer las vacantes
        while processed_jobs < total_jobs:
            payload = {
                "locale": "en_US",
                "pageNumber": page_num,
                "keywords": "",
                "location": "",
                "facetFilters": {
                    # Filtrar en primera instancia por los países de LATAM
                    "custCountryRegion": [
                        "Mexico", "Brazil", "Colombia", "Argentina", 
                        "Chile", "Peru", "Costa Rica", "Guatemala",
                        "Uruguay", "Panama"
                    ]
                },
                "brand": "",
                "skills": [],
                "categoryId": 0
            }
            
            try:
                response = requests.post(self.URL, headers=headers, json=payload)
                response.raise_for_status()
                data = response.json()
            except Exception as e:
                logging.error(f"Error al conectar con la API de HCL: {e}")
                break
                
            if page_num == 1:
                total_jobs = data.get("totalJobs", 0)
                logging.info(f"HCL API reporta un total de {total_jobs} vacantes en LATAM.")
                if total_jobs == 0:
                    break
                    
            page_hits = data.get("jobSearchResult", [])
            if not page_hits:
                break
                
            for hit in page_hits:
                source = hit.get("response", {})
                job_info = {}
                
                job_info["company"] = "HCL"
                job_info["name"] = source.get("unifiedStandardTitle", "")
                job_info["publication_date"] = source.get("unifiedStandardStart")
                
                # Construir la URL con el city, urlTitle y el ID
                city = source.get("custprimecity", "Others").replace(" ", "-")
                url_title = source.get("urlTitle", "")
                job_id = source.get("id", "")
                
                if city and url_title and job_id:
                    job_info["url"] = f"https://careers.hcltech.com/job/{city}-{url_title}/{job_id}"
                else:
                    job_info["url"] = "https://careers.hcltech.com/"
                
                # Inferir modalidad a partir del título o la ciudad ya que la API list no provee description completa
                search_for_modality = (job_info["name"] + " " + source.get("custprimecity", "")).lower()
                if "remote" in search_for_modality or "remoto" in search_for_modality:
                    job_info["modality"] = "Remote"
                elif "hybrid" in search_for_modality or "hibrido" in search_for_modality or "híbrido" in search_for_modality:
                    job_info["modality"] = "Hybrid"
                else:
                    job_info["modality"] = "No especificada"
                
                # Extract skills from title
                raw_skills = set()
                search_text = job_info["name"].lower()
                
                for skill in all_skills:
                    skill_lower = skill.lower()
                    idx = search_text.find(skill_lower)
                    while idx != -1:
                        prev_char = search_text[idx-1] if idx > 0 else ' '
                        next_char = search_text[idx+len(skill_lower)] if idx + len(skill_lower) < len(search_text) else ' '
                        if not prev_char.isalnum() and not next_char.isalnum():
                            raw_skills.add(skill)
                            break
                        idx = search_text.find(skill_lower, idx + 1)
                
                if not raw_skills and job_info["name"]:
                    title_words = job_info["name"].replace("/", " ").replace("-", " ").split()
                    raw_skills.update([w for w in title_words if len(w) > 2])
                
                job_info["skills"] = list(raw_skills)

                jobs.append(job_info)
                processed_jobs += 1
                
            page_num += 1
            
        # Priorizar remotas e híbridas como fue solicitado
        jobs.sort(key=lambda x: 0 if x.get("modality") == "Remote" else (1 if x.get("modality") == "Hybrid" else 2))
        
        logging.info(f"Extracción finalizada para HCL. Retornando {len(jobs)} vacantes.")
        return jobs

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    collector = HclCollector()
    jobs = collector.collect()
    print(f"Jobs encontrados: {len(jobs)}")
    for job in jobs[:5]:
        print(f"Titulo: {job['name']}")
        print(f"URL: {job['url']}")
        print(f"Skills: {job['skills']}")
        print(f"Modalidad: {job['modality']}\n")
