#!/bin/bash
echo "Iniciando actualización manual de vacantes (DevRadar)..."
curl -X POST http://localhost:8008/refresh
echo ""
echo "¡Comando enviado! La tarea de actualización corre en el fondo."
