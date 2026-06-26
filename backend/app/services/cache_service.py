import json
import redis
import os
from typing import List, Dict

redis_url = os.getenv("REDIS_URL", "redis://redis:6379/0")
redis_client = redis.from_url(redis_url, decode_responses=True)

class CacheService:
    @staticmethod
    def save_raw_jobs(source: str, jobs: List[Dict], expire_seconds: int = 43200): # 12 hours
        """Save raw scraped jobs to Redis."""
        key = f"jobs:raw:{source}"
        redis_client.set(key, json.dumps(jobs), ex=expire_seconds)
        
    @staticmethod
    def get_raw_jobs(source: str) -> List[Dict]:
        """Get raw scraped jobs from Redis."""
        key = f"jobs:raw:{source}"
        data = redis_client.get(key)
        if data:
            return json.loads(data)
        return None
        
    @staticmethod
    def save_last_updated():
        from datetime import datetime, timezone
        redis_client.set("jobs:last_updated", datetime.now(timezone.utc).isoformat())
        
    @staticmethod
    def get_last_updated() -> str:
        return redis_client.get("jobs:last_updated") or "Never"
