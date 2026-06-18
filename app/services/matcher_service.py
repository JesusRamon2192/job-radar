from app.config.profile import PROFILE

class MatcherService:

    def score(self, job):

        skills = set(job.get("skills", []))

        score = 0

        categories = {}

        for category, category_skills in PROFILE.items():

            matches = skills.intersection(category_skills)

            if matches:

                categories[category] = list(matches)

                score += len(matches) * 10

        return {
            "score": score,
            "matches": categories
        }