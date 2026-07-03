from app.collectors.epam import EpamCollector
from app.collectors.softek import SoftekCollector
from app.collectors.accenture import AccentureCollector
from app.collectors.globant import GlobantCollector
from app.collectors.ibm import IbmCollector
from app.collectors.greenhouse import GreenhouseCollector
from app.collectors.axity import AxityCollector
from app.collectors.hcl import HclCollector
from app.services.cache_service import CacheService

def run_profile_match(force_refresh=False):
    collectors = {
        "epam": EpamCollector(),
        "softek": SoftekCollector(),
        "accenture": AccentureCollector(),
        "globant": GlobantCollector(),
        "ibm": IbmCollector(),
        "greenhouse": GreenhouseCollector(),
        "axity": AxityCollector(),
        "hcl": HclCollector()
    }
    
    all_raw_jobs = []
    
    for name, collector in collectors.items():
        cached_jobs = None if force_refresh else CacheService.get_raw_jobs(name)
        if cached_jobs is not None:
            all_raw_jobs.extend(cached_jobs)
        else:
            try:
                jobs = collector.collect()
                if not jobs:
                    print(f"Warning: {name} returned 0 jobs, keeping old cache if any.")
                    old_jobs = CacheService.get_raw_jobs(name)
                    if old_jobs:
                        all_raw_jobs.extend(old_jobs)
                    continue

                # Format url for epam if missing domain
                if name == "epam":
                    for job in jobs:
                        seo = job.get("seo") or {}
                        url_path = seo.get("url", "")
                        job["url"] = f"https://careers.epam.com{url_path}" if url_path else "N/A"
                elif name == "axity":
                    for job in jobs:
                        job["url"] = job.get("url", "N/A")
                
                CacheService.save_raw_jobs(name, jobs)
                all_raw_jobs.extend(jobs)
            except Exception as e:
                print(f"Error collecting from {name}: {e}")
                old_jobs = CacheService.get_raw_jobs(name)
                if old_jobs:
                    all_raw_jobs.extend(old_jobs)

    CacheService.save_last_updated()

    return {
        "jobs": all_raw_jobs,
        "last_updated": CacheService.get_last_updated()
    }
