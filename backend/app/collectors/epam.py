import requests

from app.collectors.base import BaseCollector

class EpamCollector(BaseCollector):

    URL = (
        "https://careers.epam.com/api/jobs/v2/search/careers-i18n"
    )

    def collect(self):

        response = requests.get(
            self.URL,
            params={
                "from": 0,
                "size": 1000,
                "lang": "en",
                "websiteLocale": "en-us",
                "facets": "country=4060741400009317836"
            }
        )

        jobs = response.json()["data"]["jobs"]
        for job in jobs:
            job["company"] = "EPAM"
            job["publication_date"] = job.get("created_at")
        return jobs

if __name__ == "__main__":

    collector = EpamCollector()

    jobs = collector.collect()

    print(f"Jobs encontrados: {len(jobs)}")

    for job in jobs[:5]:
        print(job["name"])