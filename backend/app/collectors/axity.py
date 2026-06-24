import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin
import re
import time
import logging
import json

from app.collectors.base import BaseCollector
from app.config.profile import PROFILE

class AxityCollector(BaseCollector):

    BASE_URL = "https://www.talentoaxity.com"
    HEADERS = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }

    def __init__(self):
        # Flatten profile skills to search
        self.all_skills = set()
        for cat, skills in PROFILE.items():
            for s in skills:
                self.all_skills.add(s)
                
        # Extra keywords requested
        extra_keywords = [
            "Spring Batch", "Microservicios", "Spring Framework", "Spring Boot", 
            "Java", "React", "Angular", "Vue", "SQL", "MySQL", "Oracle", ".NET", "C#", "APX"
        ]
        for kw in extra_keywords:
            self.all_skills.add(kw)

    def extract_section(self, text, start_titles, end_titles=None):
        if isinstance(start_titles, str):
            start_titles = [start_titles]
        if end_titles is None:
            end_titles = []

        for start in start_titles:
            for end in end_titles:
                pattern = start + r"(.*?)" + end
                match = re.search(pattern, text, re.DOTALL | re.IGNORECASE)
                if match:
                    return match.group(1).strip()
                    
        for start in start_titles:
            pattern = start + r"(.*)"
            match = re.search(pattern, text, re.DOTALL | re.IGNORECASE)
            if match:
                return match.group(1).strip()

        return ""

    def get_job_links(self):
        try:
            response = requests.get(self.BASE_URL, headers=self.HEADERS, timeout=10)
            response.raise_for_status()
        except Exception as e:
            logging.error(f"Error fetching job links from Axity: {e}")
            return []

        soup = BeautifulSoup(response.text, "html.parser")
        jobs = []

        for link in soup.select("a.vb-job-title"):
            title = link.get_text(strip=True)
            href = link.get("href")
            if not href:
                continue

            jobs.append({
                "title": title,
                "url": urljoin(self.BASE_URL, href)
            })

        return jobs

    def extract_skills_from_text(self, text):
        raw_skills = set()
        text_lower = text.lower()
        
        for skill in self.all_skills:
            skill_lower = skill.lower()
            idx = text_lower.find(skill_lower)
            while idx != -1:
                prev_char = text_lower[idx-1] if idx > 0 else ' '
                next_char = text_lower[idx+len(skill_lower)] if idx + len(skill_lower) < len(text_lower) else ' '
                if not prev_char.isalnum() and not next_char.isalnum():
                    raw_skills.add(skill)
                    break
                idx = text_lower.find(skill_lower, idx + 1)
                
        return list(raw_skills)

    def parse_job_data(self, job_url):
        response = requests.get(job_url, headers=self.HEADERS, timeout=10)
        response.raise_for_status()

        soup = BeautifulSoup(response.text, "html.parser")
        text = soup.get_text("\n", strip=True)
        
        if "Just a moment..." in text or "Enable JavaScript and cookies" in text:
            raise Exception("Blocked by Cloudflare bot protection")

        requirements = self.extract_section(
            text,
            ["Requisitos", "Perfil del puesto", "Experiencia requerida", "Perfil del candidato"],
            ["Habilidades Técnicas Indispensables", "Conocimientos Indispensables", "Skills Indispensables", "Habilidades Técnicas", "Skills requeridos"]
        )

        required_skills = self.extract_section(
            text,
            ["Habilidades Técnicas Indispensables", "Conocimientos Indispensables", "Skills Indispensables", "Habilidades Técnicas", "Skills requeridos", "Conocimientos técnicos"],
            ["Habilidades Técnicas Deseables", "Conocimientos Deseables", "Competencias", "Actividades Principales", "Ofrecemos"]
        )
        
        skills_list = self.extract_skills_from_text(required_skills)
        
        # FALLBACK: If skills section is empty, extract from requirements
        if not skills_list and requirements:
            skills_list = self.extract_skills_from_text(requirements)

        # Extract modality
        text_lower = text.lower()
        modality = "Not specified"
        if "remoto" in text_lower or "home office" in text_lower or "remote" in text_lower:
            modality = "Remote"
        elif "híbrido" in text_lower or "hibrido" in text_lower or "hybrid" in text_lower:
            modality = "Hybrid"
        elif "presencial" in text_lower or "oficina" in text_lower or "on-site" in text_lower:
            modality = "On-site"
            
        # Extract publication date
        publication_date = None
        for script in soup.find_all("script", type="application/ld+json"):
            if script.string:
                try:
                    data = json.loads(script.string)
                    if isinstance(data, dict) and "datePosted" in data:
                        publication_date = data["datePosted"]
                    elif isinstance(data, list):
                        for item in data:
                            if isinstance(item, dict) and "datePosted" in item:
                                publication_date = item["datePosted"]
                except Exception:
                    pass

        return skills_list, modality, publication_date

    def collect(self):
        jobs = self.get_job_links()
        formatted_jobs = []

        for job in jobs:
            try:
                time.sleep(2)
                skills_list, modality, publication_date = self.parse_job_data(job["url"])
                
                # Database ready structure
                formatted_jobs.append({
                    "company": "Axity",
                    "title": job["title"],
                    "url": job["url"],
                    "skills": skills_list,
                    "publication_date": publication_date,
                    "modality": modality
                })
            except Exception as e:
                logging.error(f"Error procesando {job['url']}: {e}")

        return formatted_jobs


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    collector = AxityCollector()
    jobs = collector.collect()
    
    print(f"\nTotal vacantes listas para DB: {len(jobs)}")
    for job in jobs[:5]:
        print("=" * 80)
        print(f"Title: {job['title']}")
        print(f"URL: {job['url']}")
        print(f"Skills extraidas: {job['skills']}")