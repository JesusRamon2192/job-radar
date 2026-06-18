from app.collectors.epam import EpamCollector

class CollectorService:

    def run(self):

        collector = EpamCollector()

        jobs = collector.collect()

        return jobs