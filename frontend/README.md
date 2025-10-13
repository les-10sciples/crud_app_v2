# Frontend TodoList React/TypeScript

Frontend minimal pour l'application TodoList avec React et TypeScript.

## Configuration

Le fichier `public/config.yaml` contient l'URL du backend :
```yaml
backend_url: "http://localhost:5000"
```

## Installation et démarrage

```bash
# Installation des dépendances
npm install

# Démarrage en mode développement
npm run dev

# Build pour la production
npm run build
```

## Fonctionnalités

- Interface simple et moderne pour gérer les tâches
- Ajout, modification, suppression de tâches
- Gestion des statuts : À faire, En cours, Terminé
- Interface responsive
- Connexion automatique au backend via la configuration YAML

## Technologies utilisées

- React 18
- TypeScript
- Vite (build tool)
- js-yaml (pour lire la configuration)
- CSS inline (pas de framework CSS externe pour rester léger)

Le frontend sera accessible sur http://localhost:3000
