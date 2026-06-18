from collections import Counter

from app.collectors.epam import EpamCollector

collector = EpamCollector()

jobs = collector.collect()

skills_counter = Counter()

for job in jobs:

    for skill in job.get("skills", []):

        skills_counter[skill] += 1

for skill, count in skills_counter.most_common(100):

    print(f"{count:5} | {skill}")