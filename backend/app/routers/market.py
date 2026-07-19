from fastapi import APIRouter, Depends
from typing import List, Dict, Any

router = APIRouter(
    prefix="/market",
    tags=["market"]
)

@router.get("/overview")
def get_market_overview() -> Dict[str, Any]:
    return {
        "summary": {
            "active_jobs": 761,
            "monitored_companies": 12,
            "jobs_added_today": 24,
            "hiring_index": 92
        },
        "trends": {
            "active_jobs_trend": 5.2,
            "hiring_index_trend": 1.5
        },
        "evolution": [
            {"date": "2024-01-01", "vacancies": 650},
            {"date": "2024-02-01", "vacancies": 680},
            {"date": "2024-03-01", "vacancies": 640},
            {"date": "2024-04-01", "vacancies": 710},
            {"date": "2024-05-01", "vacancies": 761},
        ],
        "top_companies": [
            {"id": "epam", "name": "EPAM", "active_jobs": 145, "trend": 18, "trend_direction": "up"},
            {"id": "globant", "name": "Globant", "active_jobs": 132, "trend": 14, "trend_direction": "up"},
            {"id": "encora", "name": "Encora", "active_jobs": 89, "trend": 11, "trend_direction": "up"},
            {"id": "softtek", "name": "Softtek", "active_jobs": 76, "trend": 7, "trend_direction": "up"},
            {"id": "hcl", "name": "HCL", "active_jobs": 65, "trend": 5, "trend_direction": "up"}
        ],
        "modality": {
            "remote": 65,
            "hybrid": 25,
            "onsite": 10
        },
        "seniority": {
            "junior": 15,
            "mid": 45,
            "senior": 30,
            "lead": 8,
            "principal": 2
        },
        "top_technologies": [
            {"name": "Java", "percentage": 85},
            {"name": "React", "percentage": 78},
            {"name": "Python", "percentage": 72},
            {"name": ".NET", "percentage": 65},
            {"name": "Node", "percentage": 60},
            {"name": "Angular", "percentage": 55},
            {"name": "AWS", "percentage": 50},
            {"name": "Azure", "percentage": 45},
            {"name": "Docker", "percentage": 40},
            {"name": "Kubernetes", "percentage": 35}
        ],
        "trending_skills": [
            {"name": "GenAI", "time_period": "Últimos 30 días", "trend": 42, "trend_direction": "up"},
            {"name": "Kubernetes", "time_period": "Últimos 30 días", "trend": 18, "trend_direction": "up"},
            {"name": "Go", "time_period": "Últimos 30 días", "trend": 16, "trend_direction": "up"},
            {"name": "Rust", "time_period": "Últimos 30 días", "trend": 13, "trend_direction": "up"}
        ],
        "trending_companies": {
            "hiring_more": ["EPAM", "Globant", "Encora", "HCL"],
            "hiring_less": ["Oracle", "IBM", "Capgemini"]
        }
    }

@router.get("/companies")
def get_market_companies() -> List[Dict[str, Any]]:
    return [
        {
            "id": "epam",
            "name": "EPAM Systems",
            "logo": "https://logo.clearbit.com/epam.com",
            "hiring_score": 95,
            "active_jobs": 145,
            "weekly_trend": 18,
            "trend_direction": "up"
        },
        {
            "id": "globant",
            "name": "Globant",
            "logo": "https://logo.clearbit.com/globant.com",
            "hiring_score": 92,
            "active_jobs": 132,
            "weekly_trend": 14,
            "trend_direction": "up"
        },
        {
            "id": "encora",
            "name": "Encora",
            "logo": "https://logo.clearbit.com/encora.com",
            "hiring_score": 88,
            "active_jobs": 89,
            "weekly_trend": 11,
            "trend_direction": "up"
        },
        {
            "id": "oracle",
            "name": "Oracle",
            "logo": "https://logo.clearbit.com/oracle.com",
            "hiring_score": 75,
            "active_jobs": 45,
            "weekly_trend": -5,
            "trend_direction": "down"
        }
    ]

@router.get("/companies/{company_id}")
def get_company_market_stats(company_id: str) -> Dict[str, Any]:
    # Para cualquier empresa mandamos mock genérico pero con su ID
    return {
        "id": company_id,
        "name": company_id.capitalize(),
        "logo": f"https://logo.clearbit.com/{company_id}.com",
        "hiring_score": 85,
        "active_jobs": 120,
        "weekly_added_jobs": 15,
        "weekly_closed_jobs": 8,
        "daily_average_jobs": 2.5,
        "modality": {
            "remote": 70,
            "hybrid": 20,
            "onsite": 10
        },
        "top_technologies": [
            {"name": "React", "percentage": 80},
            {"name": "Node.js", "percentage": 75},
            {"name": "AWS", "percentage": 60}
        ],
        "history": [
            {"date": "2024-01-01", "vacancies": 100},
            {"date": "2024-02-01", "vacancies": 110},
            {"date": "2024-03-01", "vacancies": 105},
            {"date": "2024-04-01", "vacancies": 115},
            {"date": "2024-05-01", "vacancies": 120},
        ],
        "top_skills": [
            {"name": "TypeScript", "rank": 1},
            {"name": "React", "rank": 2},
            {"name": "AWS", "rank": 3},
            {"name": "Node.js", "rank": 4},
            {"name": "Docker", "rank": 5}
        ],
        "average_open_time_days": 18,
        "indicator_message": "La empresa está contratando un 18% más que el mes pasado"
    }
