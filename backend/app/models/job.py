from dataclasses import dataclass

@dataclass
class Job:

    external_id: str

    source: str

    title: str

    description: str

    url: str

    skills: list

    countries: list

    vacancy_type: str

    created_at: str