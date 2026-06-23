import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin
import re

BASE_URL = "https://www.talentoaxity.com"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}


def get_job_links():
    response = requests.get(BASE_URL, headers=HEADERS)
    response.raise_for_status()

    soup = BeautifulSoup(response.text, "html.parser")

    jobs = []

    for link in soup.select("a.vb-job-title"):
        title = link.get_text(strip=True)
        href = link.get("href")

        if not href:
            continue

        jobs.append({
            "title": title,
            "url": urljoin(BASE_URL, href)
        })

    return jobs


def extract_section(text, start_title, end_titles=None):
    if end_titles is None:
        end_titles = []

    pattern = start_title + r"(.*)"

    for end in end_titles:
        pattern = start_title + r"(.*?)" + end
        match = re.search(pattern, text, re.DOTALL | re.IGNORECASE)
        if match:
            return match.group(1).strip()

    match = re.search(pattern, text, re.DOTALL | re.IGNORECASE)

    return match.group(1).strip() if match else ""


def parse_job(job_url):
    response = requests.get(job_url, headers=HEADERS)
    response.raise_for_status()

    soup = BeautifulSoup(response.text, "html.parser")

    text = soup.get_text("\n", strip=True)

    data = {
        "url": job_url,
        "description": "",
        "requirements": "",
        "required_skills": "",
        "desired_skills": ""
    }

    data["description"] = extract_section(
        text,
        "Descripción",
        ["Requisitos"]
    )

    data["requirements"] = extract_section(
        text,
        "Requisitos",
        ["Habilidades Técnicas Indispensables"]
    )

    data["required_skills"] = extract_section(
        text,
        "Habilidades Técnicas Indispensables",
        ["Habilidades Técnicas Deseables"]
    )

    data["desired_skills"] = extract_section(
        text,
        "Habilidades Técnicas Deseables",
        ["Actividades Principales", "Competencias Blandas"]
    )

    return data


def main():
    jobs = get_job_links()

    print(f"\nVacantes encontradas: {len(jobs)}\n")

    for idx, job in enumerate(jobs[:5], start=1):
        print("=" * 100)
        print(f"[{idx}] {job['title']}")
        print(job["url"])

        try:
            detail = parse_job(job["url"])

            print("\nREQUISITOS")
            print("-" * 50)
            print(detail["requirements"][:500])

            print("\nSKILLS INDISPENSABLES")
            print("-" * 50)
            print(detail["required_skills"][:500])

            print("\nSKILLS DESEABLES")
            print("-" * 50)
            print(detail["desired_skills"][:500])

        except Exception as e:
            print(f"Error: {e}")

        print()


if __name__ == "__main__":
    main()