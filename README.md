# Job Radar

## Descripción

Job Radar es una plataforma de inteligencia laboral diseñada para recopilar, normalizar, analizar y notificar vacantes de múltiples empresas y portales de empleo.

El sistema está construido bajo una arquitectura extensible basada en colectores (Collectors), permitiendo agregar nuevas fuentes de vacantes sin modificar el núcleo de la aplicación.

Ejemplos de fuentes:

* EPAM Careers
* softek Careers
* Aws Labs Careers
* New Relic Careers
* Dynatrace Careers
* Oracle Careers
* Microsoft Careers

---

# Objetivos

* Detectar nuevas vacantes automáticamente.
* Evitar vacantes duplicadas.
* Clasificar oportunidades según el perfil profesional del usuario.
* Analizar vacantes utilizando IA.
* Generar alertas por Telegram.
* Mantener histórico de tendencias tecnológicas.
* Facilitar la incorporación de nuevas fuentes de empleo.

---

# Arquitectura General

```text
                   Scheduler
                        |
                        V
                 Collector Service
                        |
        +---------------+---------------+
        |               |               |
        V               V               V

   EPAM API      softek API     Aws API

        +---------------+---------------+
                        |
                        V

                  Normalizer
                        |
                        V

                   PostgreSQL
                        |
                        V

                  Match Engine
                        |
                        V

                   AI Analysis
                        |
                        V

                 Notifications
```

---

# Flujo de ejecución

1. Scheduler ejecuta el proceso.
2. Cada Collector consulta una fuente de empleo.
3. Los resultados se normalizan.
4. Se almacenan en PostgreSQL.
5. Se detectan nuevas vacantes.
6. Se calcula un Match Score.
7. La IA analiza la vacante.
8. Se envía una notificación.

---

# Estructura del proyecto

```text
job-radar/

├── app/
│
├── collectors/
│   ├── base.py
│   ├── epam.py
│   ├── softek.py
│   ├── Aws.py
│   └── ...
│
├── models/
│   └── job.py
│
├── repositories/
│   └── job_repository.py
│
├── services/
│   ├── collector_service.py
│   ├── matcher_service.py
│   ├── notification_service.py
│   └── ai_service.py
│
├── database/
│   ├── db.py
│   └── models.py
│
├── scheduler/
│   └── scheduler.py
│
├── config/
│   └── settings.py
│
├── tests/
│
├── Dockerfile
├── docker-compose.yml
├── requirements.txt
└── README.md
```

---

# Concepto de Collector

Cada empresa implementa un Collector.

Ejemplo:

```python
class EpamCollector(BaseCollector):

    def collect(self):
        pass
```

Todos los Collectors deben devolver el mismo modelo de datos.

---

# Modelo Job

```python
@dataclass
class Job:

    external_id: str

    source: str

    title: str

    description: str

    url: str

    skills: list[str]

    countries: list[str]

    vacancy_type: str

    created_at: str
```

---

# Base de Datos

## jobs

Almacena las vacantes normalizadas.

Campos principales:

* source
* external_id
* title
* url
* created_at

Restricción:

```sql
UNIQUE(source, external_id)
```

Esto evita registros duplicados.

---

# Match Engine

El Match Engine calcula qué tan compatible es una vacante con el perfil del usuario.

Ejemplo:

| Skill      | Peso |
| ---------- | ---- |
| Python     | 20   |
| Docker     | 20   |
| Linux      | 20   |
| Kubernetes | 15   |
| New Relic  | 15   |
| Terraform  | 10   |

Resultado:

```text
Senior Python Engineer

Match Score: 92
```

---

# Integración con IA

La IA analiza:

* Compatibilidad
* Tecnologías faltantes
* Riesgos
* Recomendaciones

Ejemplo:

```text
Compatibilidad: 92%

Fortalezas:
- Python
- Docker
- Linux

Faltantes:
- Terraform

Recomendación:
Aplicar
```

---

# Notificaciones

Inicialmente:

* Telegram

Futuro:

* Gmail
* Discord
* Slack

---

# Configuración

Archivo:

```yaml
collectors:

  epam:
    enabled: true

  softek:
    enabled: true

  Aws:
    enabled: false
```

Permite habilitar o deshabilitar fuentes sin modificar código.

---

# Roadmap

## Fase 1

* EPAM Collector
* PostgreSQL
* Detección de nuevas vacantes

## Fase 2

* Telegram
* Match Engine

## Fase 3

* Gemini
* Análisis automático

## Fase 4

* softek Collector
* Aws Collector
* New Relic Collector

## Fase 5

* Dashboard Web
* Estadísticas históricas
* Tendencias tecnológicas

---

# Principios de diseño

* Cada empresa debe tener su propio Collector.
* Nunca mezclar lógica de distintas empresas.
* Todo dato debe normalizarse antes de almacenarse.
* El núcleo de la aplicación no debe depender de una fuente específica.
* Agregar una nueva empresa debe requerir únicamente crear un nuevo Collector.
* Evitar scraping cuando exista API pública.
* Mantener la aplicación Dockerizada desde el inicio.

---

# Meta final

Construir una plataforma capaz de monitorear cientos de fuentes de empleo, detectar oportunidades relevantes automáticamente y generar inteligencia laboral basada en tendencias, compatibilidad y análisis asistido por IA.
