class MatcherService:

    def score(self, job, profile_config: dict = None):
        if not profile_config:
            profile_config = {"categories": {}, "weights": {}}
            
        profile = profile_config.get("categories", {})
        profile_scores = profile_config.get("weights", {})

        skills = set(str(s).lower().strip() for s in job.get("skills", []))

        score = 0
        categories = {}
        category_breakdown = {}

        for category, category_skills in profile.items():
            lower_cat_skills = set(str(s).lower().strip() for s in category_skills)
            matches = skills.intersection(lower_cat_skills)
            if matches:
                categories[category] = list(matches)
                
                # Each match is worth 10 points originally
                # We multiply by the category percentage
                category_percentage = profile_scores.get(category, 100) / 100.0
                category_score = round(len(matches) * 10 * category_percentage, 2)
                
                category_breakdown[category] = category_score
                score += category_score

        return {
            "score": round(score, 2),
            "matches": categories,
            "category_breakdown": category_breakdown
        }