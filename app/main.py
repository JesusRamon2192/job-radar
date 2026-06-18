from app.services.collector_service import (
    CollectorService
)

service = CollectorService()

jobs = service.run()

print(f"Jobs encontrados: {len(jobs)}")