from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import pytest

from app.main import app
from app.database.db import Base, get_db
from app.models.user import UserModel
from app.models.user_job_status import UserJobStatusModel, JobStatusEnum

# Use a memory sqlite for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_status.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(scope="module")
def client():
    Base.metadata.create_all(bind=engine)
    with TestClient(app) as c:
        # Create a mock user
        db = TestingSessionLocal()
        user = UserModel(email="test_status@example.com", hashed_password="hashed")
        db.add(user)
        db.commit()
        db.close()
        yield c
    Base.metadata.drop_all(bind=engine)

def override_get_current_user():
    db = TestingSessionLocal()
    user = db.query(UserModel).filter(UserModel.email == "test_status@example.com").first()
    db.close()
    return user

app.dependency_overrides[app.router.dependencies[0].dependency] = override_get_current_user
# Actually, since get_current_user is used as a dependency in the routes directly, we need to override it properly
from app.utils.security import get_current_user, get_current_user_optional
app.dependency_overrides[get_current_user] = override_get_current_user
app.dependency_overrides[get_current_user_optional] = override_get_current_user

def test_create_and_update_status(client):
    job_url = "https://example.com/job1"
    
    # Create VIEWED
    response = client.post("/jobs/status", json={"job_id": job_url, "status": "VIEWED"})
    assert response.status_code == 200
    assert response.json()["status"] == "VIEWED"

    # Update to SAVED
    response = client.post("/jobs/status", json={"job_id": job_url, "status": "SAVED"})
    assert response.status_code == 200
    assert response.json()["status"] == "SAVED"

def test_prevent_status_downgrade(client):
    job_url = "https://example.com/job2"
    
    # Create SENT
    response = client.post("/jobs/status", json={"job_id": job_url, "status": "SENT"})
    assert response.status_code == 200
    assert response.json()["status"] == "SENT"
    
    # Try to downgrade to APPLIED
    response = client.post("/jobs/status", json={"job_id": job_url, "status": "APPLIED"})
    assert response.status_code == 400
    assert "Cannot change status from SENT" in response.json()["detail"]

def test_prevent_viewed_overwrite(client):
    job_url = "https://example.com/job3"
    
    # Create SAVED
    response = client.post("/jobs/status", json={"job_id": job_url, "status": "SAVED"})
    assert response.status_code == 200
    assert response.json()["status"] == "SAVED"
    
    # Try to set to VIEWED (should just return the current status, which is SAVED)
    response = client.post("/jobs/status", json={"job_id": job_url, "status": "VIEWED"})
    assert response.status_code == 200
    assert response.json()["status"] == "SAVED"

def test_reset_status(client):
    job_url = "https://example.com/job4"
    
    # Create APPLIED
    client.post("/jobs/status", json={"job_id": job_url, "status": "APPLIED"})
    
    # Reset
    response = client.delete(f"/jobs/status?job_id={job_url}")
    assert response.status_code == 200
    assert response.json()["detail"] == "Status reset successfully."
    
    # Get all statuses, should not contain job4
    response = client.get("/jobs/status")
    statuses = response.json()
    assert all(s["job_id"] != job_url for s in statuses)
