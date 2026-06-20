import requests
from datetime import datetime

from app.collectors.base import BaseCollector

class SoftekCollector(BaseCollector):

    BASE_URL = (
       "https://jobs.softtek.com/api/pcsx/search?domain=softtek.com&location=Mexico&start={}"
    )

    def collect(self):
        try:
            jobs = []
            start = 0
            
            while True:
                response = requests.get(self.BASE_URL.format(start))
                response.raise_for_status()
                
                data = response.json().get("data", {})
                positions = data.get("positions", [])
                
                if not positions:
                    break
                
                for position in positions:
                    work_location = position.get("workLocationOption", "").lower()
                    # La API actualmente está devolviendo 'hybrid' en lugar de 'remote' para esta búsqueda,
                    # por lo que aceptamos ambos para que no devuelva 0 vacantes.
                    if "remote" in work_location:
                    #if "remote" in work_location or "hybrid" in work_location:
                        
                        # Extraer palabras del título como 'skills' ya que Softtek no las provee en este endpoint
                        raw_skills = position.get("skills", [])
                        if not raw_skills:
                            title_words = position.get("name", "").replace("/", " ").replace("-", " ").split()
                            raw_skills = [w for w in title_words if len(w) > 2]

                        job = {
                            "name": position.get("name"),
                            "company": "Softtek",
                            "url": f"https://jobs.softtek.com{position.get('positionUrl', '')}",
                            "skills": raw_skills,
                            "publication_date": datetime.fromtimestamp(position.get("creationTs", 0)).isoformat() if position.get("creationTs") else None
                        }
                        jobs.append(job)
                
                start += 10
                
            return jobs
            
        except Exception as e:
            print(f"Error al conectar con Softtek: {e}")
            return []

if __name__ == "__main__":

    collector = SoftekCollector()

    jobs = collector.collect()

    print(f"Jobs encontrados: {len(jobs)}")

    for job in jobs[:5]:
        print(job.get("name", "Sin nombre"))
