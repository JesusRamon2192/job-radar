from app.collectors.hcl import HclCollector
from app.services.cache_service import CacheService

c = HclCollector()
jobs = c.collect()
CacheService.save_raw_jobs("hcl", jobs)
print(f"Saved {len(jobs)} hcl jobs")
