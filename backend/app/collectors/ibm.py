import requests
import logging
import re
from app.collectors.base import BaseCollector
from app.config.profile import PROFILE

class IbmCollector(BaseCollector):
    
    URL = "https://www-api.ibm.com/search/api/v2"
    
    def collect(self):
        jobs = []
        
        # Flatten profile skills to search
        all_skills = set()
        for cat, skills in PROFILE.items():
            for s in skills:
                all_skills.add(s)
                
        headers = {
            'accept': 'application/json, text/plain, */*',
            'accept-language': 'en-US,en;q=0.6',
            'content-type': 'application/json',
            'origin': 'https://www.ibm.com',
            'priority': 'u=1, i',
            'referer': 'https://www.ibm.com/',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36'
        }
        
        from_param = 0
        size_param = 100
        total_hits = 1 # Initialize to 1 to enter the loop
        
        while from_param < total_hits:
            payload = {
                "appId": "careers",
                "scopes": ["careers2"],
                "query": {
                    "bool": {
                        "should": [
                            {"match": {"title": "Software"}},
                            {"match": {"title": "Developer"}},
                            {"match": {"title": "Cloud"}},
                            {"match": {"title": "Technology"}},
                            {"match": {"title": "Engineer"}},
                            {"match": {"title": "Data"}},
                            {"match": {"title": "Architect"}},
                            {"match": {"title": "Backend"}},
                            {"match": {"title": "Frontend"}},
                            {"match": {"title": "Full Stack"}}
                        ],
                        "minimum_should_match": 1
                    }
                },
                "size": size_param,
                "from": from_param,
                # We request all necessary fields. _id might be useful for url construction if 'url' is missing, but IBM provides 'url' directly.
                "_source": ["title", "url", "description", "field_keyword_17", "field_keyword_19"]
            }
            
            try:
                response = requests.post(self.URL, headers=headers, json=payload)
                response.raise_for_status()
                data = response.json()
            except Exception as e:
                logging.error(f"Error al conectar con la API de IBM: {e}")
                break
                
            # Update total_hits from the first response
            if from_param == 0:
                total_hits = data.get("hits", {}).get("total", {}).get("value", 0)
                logging.info(f"IBM API reporta un total de {total_hits} vacantes.")
                
            page_hits = data.get("hits", {}).get("hits", [])
            if not page_hits:
                break
                
            for hit in page_hits:
                source = hit.get("_source", {})
                job_info = {}
                
                job_info["company"] = "IBM"
                job_info["name"] = source.get("title", "")
                job_info["publication_date"] = None
                
                # IBM sometimes stores remote/hybrid info in field_keyword_17 or field_keyword_19
                modality_raw = source.get("field_keyword_17", "")
                modality_lower = modality_raw.lower() if isinstance(modality_raw, str) else ""
                
                if "remote" in modality_lower:
                    job_info["modality"] = "Remote"
                elif "hybrid" in modality_lower:
                    job_info["modality"] = "Hybrid"
                else:
                    # Skip on-site or unspecified modalities
                    continue
                    
                job_info["url"] = source.get("url", "")
                
                # Extract skills
                clean_desc = re.sub(r'<[^>]+>', ' ', source.get("description", ""))
                raw_skills = set()
                search_text = (job_info["name"] + " " + clean_desc).lower()
                
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
                
            from_param += size_param
            
        # Prioritize Remote over Hybrid
        jobs.sort(key=lambda x: 0 if x.get("modality") == "Remote" else 1)
        
        # Limit to 150 total after prioritizing
        final_jobs = jobs[:150]
        logging.info(f"Extracción finalizada. Retornando {len(final_jobs)} vacantes (Priorizando Remotas).")
        return final_jobs

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    collector = IbmCollector()
    jobs = collector.collect()
    print(f"Jobs encontrados: {len(jobs)}")
    for job in jobs[:5]:
        print(f"Titulo: {job['name']}")
        print(f"URL: {job['url']}")
        print(f"Skills: {job['skills']}")
        print(f"Modalidad: {job['modality']}\n")
