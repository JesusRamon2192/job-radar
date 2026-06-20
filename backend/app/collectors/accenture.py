import requests
import logging
from app.collectors.base import BaseCollector

class AccentureCollector(BaseCollector):

    URL = "https://www.accenture.com/api/accenture/elastic/findjobs"

    def collect(self):
        jobs = []
        start_index = 0
        max_result_size = 50
        
        # Opcional: poner un límite de seguridad en la extracción si son demasiadas.
        # Por ahora extraemos todas como sugirió el diseño a menos que el usuario indique lo contrario.
        
        while True:
            payload = {
                "startIndex": str(start_index),
                "maxResultSize": str(max_result_size),
                "jobCountry": "Mexico",
                "jobLanguage": "es",
                "countrySite": "mx-es",
                "sortBy": "2",
                "searchType": "vectorSearch",
                "enableQueryBoost": "true",
                "minScore": "0.6",
                "getFeedbackJudgmentEnabled": "true",
                "useCleanEmbedding": "true",
                "score": "true",
                "totalHits": "true",
                "debugQuery": "false",
                "jobFilters": "[]"
            }
            
            try:
                response = requests.post(self.URL, data=payload)
                response.raise_for_status()
                data = response.json()
            except Exception as e:
                logging.error(f"Error al conectar con la API de Accenture: {e}")
                break
                
            page_jobs = data.get("data", [])
            
            for job in page_jobs:
                # Filtrar solo por trabajos remotos o híbridos
                remote_type = job.get("remoteType")
                if remote_type not in ["Remote", "Hybrid Eligible"]:
                    continue
                
                # Estandarizando el diccionario para el proyecto DevRadar
                job["company"] = "Accenture"
                job["name"] = job.get("title", "")
                job["publication_date"] = job.get("updateDate")
                job["modality"] = remote_type
                
                # Accenture devuelve URL parcial a veces o completa. Asegurar que este bien formada.
                raw_url = job.get("jobDetailUrl", "")
                raw_url = raw_url.replace("{0}", "mx-es")
                if raw_url.startswith("http"):
                    job["url"] = raw_url
                else:
                    job["url"] = f"https://www.accenture.com{raw_url}"
                
                # Extraer skills
                skills = job.get("skill", [])
                if isinstance(skills, str):
                    skills = [skills]
                
                workday_skills = job.get("workdaySkill", [])
                if isinstance(workday_skills, str):
                    workday_skills = [workday_skills]
                    
                job["skills"] = list(set(skills + workday_skills))
                
                jobs.append(job)
                
            total_hits_dict = data.get("totalHits", {})
            total_hits = total_hits_dict.get("total", 0)
            
            if not page_jobs or start_index + max_result_size >= total_hits:
                break
                
            start_index += max_result_size
            
        return jobs

if __name__ == "__main__":
    collector = AccentureCollector()
    jobs = collector.collect()
    print(f"Jobs encontrados: {len(jobs)}")
    for job in jobs[:5]:
        print(f"Titulo: {job['name']}")
        print(f"URL: {job['url']}")
        print(f"Skills: {job['skills']}\n")
