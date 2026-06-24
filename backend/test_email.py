import os
import sys

# Add the app directory to the sys path if needed
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database.db import SessionLocal
from app.models.user import UserModel
from app.models.job import JobModel
from app.services.email_service import EmailService

def send_test_email():
    db = SessionLocal()
    try:
        # Fetch the test user
        user = db.query(UserModel).filter(UserModel.email == "jesus.ramon2192@gmail.com").first()
        if not user:
            print("❌ El usuario de prueba no existe. Asegúrate de haber reiniciado el contenedor del backend.")
            return

        # Fetch some jobs to simulate
        jobs = db.query(JobModel).order_by(JobModel.id.desc()).limit(3).all()
        if not jobs:
            print("❌ No hay vacantes en la base de datos para enviar.")
            return

        print(f"✅ Usuario encontrado: {user.email}")
        print(f"✅ Vacantes encontradas: {len(jobs)}")
        print("Enviando correo...")

        email_service = EmailService()
        email_service.send_daily_jobs_email(user, jobs)
        
        print("✅ Proceso terminado.")
    finally:
        db.close()

if __name__ == "__main__":
    send_test_email()
