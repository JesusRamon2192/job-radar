import requests
import logging
import re
from app.collectors.base import BaseCollector
from app.config.profile import PROFILE

class GlobantCollector(BaseCollector):

    URL = "https://career.globant.com/api/sap/job-requisition-v1"

    def collect(self):
        jobs = []
        payload = {}
        
        try:
            response = requests.post(self.URL, json=payload)
            response.raise_for_status()
            data = response.json()
        except Exception as e:
            logging.error(f"Error al conectar con la API de Globant: {e}")
            return []
            
        page_jobs = data.get("jobRequisition", [])
        
        # Flatten profile skills to search
        all_skills = set()
        for cat, skills in PROFILE.items():
            for s in skills:
                all_skills.add(s)
                
        for job in page_jobs:
            job_info = {}
            job_info["company"] = "Globant"
            job_info["name"] = job.get("jobTitle", "")
            job_info["publication_date"] = job.get("createdDateTime")
            
            # Extract modality
            location = job.get("location", "").lower()
            description = job.get("jobDescription", "").lower()
            if "remote" in location or "remote" in description:
                job_info["modality"] = "Remote"
            elif "hybrid" in location or "hybrid" in description:
                job_info["modality"] = "Hybrid"
            else:
                job_info["modality"] = "On-site"
                
            job_id = job.get("jobReqId", "")
            job_info["url"] = f"https://career.globant.com/job-description/?id={job_id}"
            
            # Remove HTML tags from description
            clean_desc = re.sub(r'<[^>]+>', ' ', job.get("jobDescription", ""))
            
            # Extract skills by matching predefined skills
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
            
            # Fallback to basic title extraction if no profile skills found
            if not raw_skills and job_info["name"]:
                title_words = job_info["name"].replace("/", " ").replace("-", " ").split()
                raw_skills.update([w for w in title_words if len(w) > 2])
            
            job_info["skills"] = list(raw_skills)
            
            jobs.append(job_info)
            
        return jobs

if __name__ == "__main__":
    collector = GlobantCollector()
    jobs = collector.collect()
    print(f"Jobs encontrados: {len(jobs)}")
    for job in jobs[:5]:
        print(f"Titulo: {job['name']}")
        print(f"URL: {job['url']}")
        print(f"Skills: {job['skills']}")
        print(f"Modalidad: {job['modality']}\n")
