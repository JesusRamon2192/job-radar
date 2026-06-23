from app.config.profile import PROFILE, PROFILE_SCORES

class MatcherService:

    def score(self, job):

        skills = set(job.get("skills", []))

        score = 0
        categories = {}
        category_breakdown = {}

        for category, category_skills in PROFILE.items():
            matches = skills.intersection(category_skills)
            if matches:
                categories[category] = list(matches)
                
                # Each match is worth 10 points originally
                # We multiply by the category percentage
                category_percentage = PROFILE_SCORES.get(category, 100) / 100.0
                category_score = round(len(matches) * 10 * category_percentage, 2)
                
                category_breakdown[category] = category_score
                score += category_score

        return {
            "score": round(score, 2),
            "matches": categories,
            "category_breakdown": category_breakdown
        }