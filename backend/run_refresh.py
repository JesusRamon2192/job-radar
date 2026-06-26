from app.main import refresh_jobs_task

if __name__ == "__main__":
    print("Starting manual refresh...")
    refresh_jobs_task()
    print("Refresh finished!")
