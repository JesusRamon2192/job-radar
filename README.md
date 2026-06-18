# Job Radar Web Application

Aplicación web Full Stack para analizar y puntuar vacantes de trabajo (Job Radar), ahora con interfaz de usuario moderna y Dockerizada.

## Arquitectura

- **Backend**: FastAPI (Python 3.11). Expone endpoints para consultar trabajos cacheados en memoria y refrescarlos re-ejecutando los scrapers.
- **Frontend**: React + Vite + TypeScript con TailwindCSS. Proporciona una interfaz moderna con filtros, tarjetas y dashboard.
- **Infraestructura**: Docker y Docker Compose para levantar ambos servicios.

## Despliegue

Asegúrate de tener instalado [Docker](https://docs.docker.com/get-docker/) y Docker Compose.

1. Clona el repositorio y ubícate en la carpeta raíz.
2. Construye y levanta los contenedores:
   ```bash
   docker compose up --build
   ```
3. Accede a la aplicación:
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - Backend API Docs: [http://localhost:8000/docs](http://localhost:8000/docs)

## Estructura de Carpetas

```
project/
├── backend/                  # Código FastAPI y scrapers
│   ├── app/                  # Lógica de la aplicación
│   ├── requirements.txt      # Dependencias de Python
├── frontend/                 # Proyecto React (Vite)
├── docker-compose.yml        # Orquestación de servicios
├── Dockerfile.backend        # Imagen de Docker para el backend
├── Dockerfile.frontend       # Imagen de Docker para el frontend
└── README.md                 # Este archivo
```

## Endpoints Principales (Backend)

- `GET /jobs`: Retorna las vacantes (con soporte para filtros: `company`, `min_score`, `search`).
- `GET /jobs/top`: Retorna el top N de vacantes (default 10).
- `POST /refresh`: Dispara la recolección de datos y la evaluación en segundo plano.

## Mejoras Futuras Recomendadas

1. **Base de Datos Persistente**: Sustituir la caché en memoria por una base de datos real (PostgreSQL o MongoDB) para mantener histórico de vacantes.
2. **Tareas Programadas (Cron)**: Configurar Celery o el programador interno para actualizar las vacantes automáticamente cada N horas.
3. **Paginación Avanzada**: Implementar paginación en el backend y frontend para manejar miles de registros eficientemente.
4. **Autenticación**: Añadir un login simple si la herramienta es para uso privado de un equipo de reclutamiento o para candidatos específicos.
