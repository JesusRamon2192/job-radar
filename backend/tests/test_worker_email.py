import pytest
from unittest.mock import MagicMock
from datetime import datetime, timedelta

from app.worker import send_user_email_task
from app.database.db import SessionLocal
from app.services.email_service import EmailService
from app.models.user import UserModel
from app.models.job import JobModel

@pytest.fixture
def mock_cls_SessionLocal(mocker):
    return mocker.patch('app.worker.SessionLocal', spec=SessionLocal)

@pytest.fixture
def mock_cls_EmailService(mocker):
    return mocker.patch('app.worker.EmailService', spec=EmailService)

@pytest.fixture
def mock_cls_datetime(mocker):
    return mocker.patch('app.worker.datetime', spec=datetime)

def test_send_user_email_task_only_sends_new_jobs(mock_cls_datetime, mock_cls_EmailService, mock_cls_SessionLocal):
    # Setup mock datetime
    mock_now = datetime(2023, 10, 27, 12, 0, 0)
    mock_cls_datetime.utcnow.return_value = mock_now
    
    # Setup mock database session
    mock_session = MagicMock()
    mock_cls_SessionLocal.return_value = mock_session
    
    # Setup mock user and query
    mock_user = MagicMock(spec=UserModel)
    mock_user.id = 1
    mock_user_query = MagicMock()
    mock_user_query.filter.return_value.first.return_value = mock_user
    
    # Setup mock jobs and query
    mock_jobs = [MagicMock(spec=JobModel), MagicMock(spec=JobModel)]
    mock_job_query = MagicMock()
    mock_job_query.filter.return_value.all.return_value = mock_jobs
    
    # Configure the session to return the correct queries
    def query_side_effect(model_class):
        if model_class == UserModel:
            return mock_user_query
        elif model_class == JobModel:
            return mock_job_query
        return MagicMock()
        
    mock_session.query.side_effect = query_side_effect
    
    # Setup mock email service
    mock_email_service_instance = MagicMock(spec=EmailService)
    mock_cls_EmailService.return_value = mock_email_service_instance
    
    # Call the function
    send_user_email_task(1)
    
    # Assertions
    mock_session.query.assert_any_call(UserModel)
    mock_session.query.assert_any_call(JobModel)
    mock_email_service_instance.send_daily_jobs_email.assert_called_once_with(mock_user, mock_jobs)

def test_send_user_email_task_no_new_jobs(mock_cls_EmailService, mock_cls_SessionLocal):
    # Setup mock database session
    mock_session = MagicMock()
    mock_cls_SessionLocal.return_value = mock_session
    
    # Setup mock user and query
    mock_user = MagicMock(spec=UserModel)
    mock_user_query = MagicMock()
    mock_user_query.filter.return_value.first.return_value = mock_user
    
    # Setup mock jobs and query (NO JOBS)
    mock_job_query = MagicMock()
    mock_job_query.filter.return_value.all.return_value = []
    
    def query_side_effect(model_class):
        if model_class == UserModel:
            return mock_user_query
        elif model_class == JobModel:
            return mock_job_query
        return MagicMock()
        
    mock_session.query.side_effect = query_side_effect
    
    # Setup mock email service
    mock_email_service_instance = MagicMock(spec=EmailService)
    mock_cls_EmailService.return_value = mock_email_service_instance
    
    # Call the function
    send_user_email_task(1)
    
    # Verify the email service was NOT called because there are no new jobs
    mock_email_service_instance.send_daily_jobs_email.assert_not_called()
