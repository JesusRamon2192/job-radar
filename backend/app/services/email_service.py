import os
import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import List
from jinja2 import Template

from app.models.job import JobModel
from app.models.user import UserModel

logger = logging.getLogger(__name__)

class EmailService:
    def __init__(self):
        self.smtp_server = "smtp.gmail.com"
        self.smtp_port = 587
        self.sender_email = os.environ.get("SMTP_USER", "")
        self.sender_password = os.environ.get("SMTP_PASSWORD", "")

    def send_daily_jobs_email(self, user: UserModel, jobs: List[JobModel]):
        if not jobs:
            return
            
        logger.info(f"Sending {len(jobs)} new jobs to {user.email} via Gmail SMTP")
        
        html_content = self._render_template(user, jobs)
        
        if not self.sender_email or not self.sender_password:
            logger.warning("SMTP credentials are not set. Printing email to console instead.")
            print(f"--- EMAIL TO {user.email} ---")
            print(html_content)
            print("-------------------------------")
            return

        message = MIMEMultipart("alternative")
        message["Subject"] = f"DevLATAM: ¡{len(jobs)} nuevas vacantes!"
        message["From"] = f"DevLATAM <{self.sender_email}>"
        message["To"] = user.email

        part = MIMEText(html_content, "html")
        message.attach(part)

        try:
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                server.login(self.sender_email, self.sender_password)
                server.sendmail(self.sender_email, user.email, message.as_string())
            logger.info("Email sent successfully!")
        except Exception as e:
            logger.error(f"Failed to send email: {e}")

    def _render_template(self, user: UserModel, jobs: List[JobModel]) -> str:
        template_str = """
        <html>
          <body style="font-family: Arial, sans-serif; background-color: #f4f4f9; padding: 20px; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h2 style="color: #2b6cb0; text-align: center;">¡Hola {{ user.email }}!</h2>
              <p style="text-align: center; font-size: 16px;">Hemos encontrado <strong>{{ jobs|length }}</strong> vacantes nuevas de las últimas 24 horas.</p>
              <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;">
              <ul style="list-style-type: none; padding: 0;">
                {% for job in jobs %}
                <li style="margin-bottom: 15px; padding: 15px; background-color: #f8fafc; border-left: 4px solid #3182ce; border-radius: 4px;">
                  <h3 style="margin: 0 0 5px 0; color: #2d3748;">{{ job.title }}</h3>
                  <p style="margin: 0 0 5px 0; font-size: 14px; color: #4a5568;"><strong>Compañía:</strong> {{ job.company }}</p>
                  <p style="margin: 0; font-size: 14px; color: #4a5568;">
                    <strong>Modalidad:</strong> {{ job.modality or 'No especificada' }} 
                    | <strong>Score:</strong> {{ job.score }}
                  </p>
                  {% if job.url %}
                    <a href="{{ job.url }}" style="display: inline-block; margin-top: 10px; padding: 8px 12px; background-color: #3182ce; color: white; text-decoration: none; border-radius: 4px; font-size: 14px;">Ver Vacante</a>
                  {% endif %}
                </li>
                {% endfor %}
              </ul>
              <div style="text-align: center; margin-top: 30px; font-size: 12px; color: #a0aec0;">
                <p>Estás recibiendo este correo porque eres un usuario registrado en DevLATAM.</p>
              </div>
            </div>
          </body>
        </html>
        """
        template = Template(template_str)
        return template.render(user=user, jobs=jobs)
