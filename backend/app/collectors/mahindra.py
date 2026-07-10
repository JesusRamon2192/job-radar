import logging
import requests
from bs4 import BeautifulSoup
from app.collectors.base import BaseCollector

BASE_URL = "https://careers.techmahindra.com/CurrentOpportunity.aspx"

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 Chrome/138.0 Safari/537.36"
    )
}

LATAM_COUNTRIES = [
    "MEX", "COL", "ARG", "CHL", "PER", "CRI", "BRA", "URY", "BOL", "ECU" 
]

class TechMahindraCollector(BaseCollector):

    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update(HEADERS)

    def _get_hidden_fields(self, soup=None):
        if soup is None:
            r = self.session.get(BASE_URL)
            r.raise_for_status()
            soup = BeautifulSoup(r.text, "html.parser")
            
        payload = {}
        for hidden in soup.select("input[type=hidden]"):
            payload[hidden.get("name")] = hidden.get("value", "")
        return payload

    def collect(self):
        all_jobs = []
        for country in LATAM_COUNTRIES:
            try:
                # Get initial state
                initial_r = self.session.get(BASE_URL)
                initial_soup = BeautifulSoup(initial_r.text, "html.parser")
                
                payload = self._get_hidden_fields(initial_soup)
                payload.update({
                    "ctl00$ContentPlaceHolder1$txtAdvanceSearch": "",
                    "ctl00$ContentPlaceHolder1$ddlCity": "0",
                    "ctl00$ContentPlaceHolder1$ddlCountry": country,
                    "ctl00$ContentPlaceHolder1$ddlState": "0",
                    "ctl00$ContentPlaceHolder1$ddlMinExp": "0",
                    "ctl00$ContentPlaceHolder1$ddlTotExpYears": "0",
                    "ctl00$ContentPlaceHolder1$txt_Job_RefrenceId": "",
                    "ctl00$ContentPlaceHolder1$btnSearchJobs": "Search"
                })

                r = self.session.post(BASE_URL, data=payload)
                r.raise_for_status()
                soup = BeautifulSoup(r.text, "html.parser")
                
                current_page = 1
                while True:
                    job_cards = soup.select("div.joblisting td")
                    
                    for card in job_cards:
                        title_div = card.find("div", style=lambda value: value and "margin-bottom: 5px; margin-top: 5px; font-size: 13px;" in value)
                        if not title_div:
                            continue
                        title = title_div.text.strip()
                        
                        ps = card.find("p")
                        skills = []
                        location = "N/A"
                        experience = "N/A"
                        
                        if ps:
                            for b in ps.find_all("b"):
                                label = b.text.strip()
                                next_node = b.next_sibling
                                val = next_node.strip().lstrip(':').strip() if next_node else ""
                                
                                if "Skill Set" in label:
                                    skills = [val] if val else []
                                elif "Experience" in label:
                                    experience = val
                                elif "Location" in label:
                                    location = val

                        link = card.find("a")
                        url = f"https://careers.techmahindra.com/{link['href']}" if link else "N/A"
                        
                        all_jobs.append({
                            "company": "TechMahindra",
                            "name": title,
                            "location": location,
                            "skills": skills,
                            "url": url,
                            "modality": "Unknown",
                            "publication_date": None
                        })
                    
                    # Pagination logic
                    next_page_link = None
                    for p in soup.select("a.page_enabled"):
                        if p.text == str(current_page + 1):
                            next_page_link = p
                            break
                            
                    if not next_page_link:
                        break # No more pages
                        
                    href = next_page_link.get("href", "")
                    target = href.replace("javascript:__doPostBack('", "").split("','")[0]
                    
                    payload = self._get_hidden_fields(soup)
                    payload.update({
                        "__EVENTTARGET": target,
                        "__EVENTARGUMENT": "",
                        "ctl00$ContentPlaceHolder1$txtAdvanceSearch": "",
                        "ctl00$ContentPlaceHolder1$ddlCity": "0",
                        "ctl00$ContentPlaceHolder1$ddlCountry": country,
                        "ctl00$ContentPlaceHolder1$ddlState": "0",
                        "ctl00$ContentPlaceHolder1$ddlMinExp": "0",
                        "ctl00$ContentPlaceHolder1$ddlTotExpYears": "0",
                        "ctl00$ContentPlaceHolder1$txt_Job_RefrenceId": "",
                    })
                    
                    r = self.session.post(BASE_URL, data=payload)
                    r.raise_for_status()
                    soup = BeautifulSoup(r.text, "html.parser")
                    current_page += 1

            except Exception as e:
                logging.error(f"Error extrayendo TechMahindra para {country}: {e}")
                
        return all_jobs

if __name__ == "__main__":
    collector = TechMahindraCollector()
    jobs = collector.collect()
    print(f"Total jobs encontrados para LATAM: {len(jobs)}")
    if jobs:
        print("Muestra de un payload:")
        print(jobs[0])