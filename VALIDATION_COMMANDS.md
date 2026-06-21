# Comandos de Validación de DevRadar (QA)

Este documento contiene los comandos más útiles para administrar y validar el estado de las vacantes directamente en el servidor sin depender de la interfaz gráfica.

*Nota: Asegúrate de ejecutar estos comandos estando dentro de la carpeta raíz del proyecto (`/home/jesus/docker/compose/job-radar-qa`).*

## 1. Actualización Manual de Vacantes
Para forzar a DevRadar a extraer las vacantes de todas las compañías (incluyendo IBM, Globant, etc.) en este preciso momento:

```bash
./refresh.sh
```
*Este comando manda la señal al entorno de QA (puerto 8008) para correr el trabajo en segundo plano. Tomará aproximadamente de 1 a 2 minutos en finalizar.*

## 2. Validar Vacantes Directamente en la Base de Datos (PostgreSQL)
Para asegurarte de que las vacantes físicamente existen guardadas en la base de datos de Docker, puedes agruparlas y contarlas por empresa:

```bash
docker compose exec db psql -U admin -d devradar -c "SELECT company, COUNT(*) FROM jobs GROUP BY company;"
```
*Si IBM u otra empresa fue guardada exitosamente, aparecerá en esta tabla con su respectiva cantidad de vacantes.*

## 3. Validar Vacantes a través del API (Backend)
Para comprobar que el backend de FastAPI está logrando leer la base de datos y está listo para mandarle la información al frontend:

**Ver el total de vacantes en general:**
```bash
curl -s "http://localhost:8008/jobs" | grep -o '"total": *[0-9]*'
```

**Ver el total de vacantes de una empresa específica (Ej. IBM):**
```bash
curl -s "http://localhost:8008/jobs?company=IBM" | grep -o '"total": *[0-9]*'
```

## 4. Revisar Logs de Errores (Debugging)
Si la base de datos está vacía después de actualizar, puedes revisar los logs del contenedor del backend para detectar si algún colector (ej. IBM o Epam) falló:

```bash
docker compose logs --tail=100 backend
```
