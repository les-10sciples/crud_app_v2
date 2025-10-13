# Utilise l'image Python officielle
FROM python:3.10-slim

# Définit le répertoire de travail dans le conteneur
WORKDIR /app

# Installe les dépendances système nécessaires pour PostgreSQL
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copie les fichiers de requirements (créé à partir des dépendances identifiées)
COPY requirements.txt .

# Installe les dépendances Python
RUN pip install --no-cache-dir -r requirements.txt

# Copie tous les fichiers du backend
COPY . .

# Expose le port 5000
EXPOSE 5000

# Variable d'environnement pour l'URL de la DB (optionnelle)
ENV DB_URI=""

# Commande pour démarrer l'application
# Si DB_URI est défini, utilise-le, sinon fonctionne sans DB
CMD if [ -n "$DB_URI" ]; then \
        python backend.py --db-uri "$DB_URI"; \
    else \
        python backend.py; \
    fi
