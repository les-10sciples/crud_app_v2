import { load } from 'js-yaml';

let backendUrl: string | null = null;

export async function getBackendUrl(): Promise<string> {
  if (backendUrl) {
    return backendUrl;
  }

  try {
    const response = await fetch('/config.yaml');
    const yamlText = await response.text();
    const config = load(yamlText) as { backend_url: string };
    backendUrl = config.backend_url;
    return backendUrl;
  } catch (error) {
    console.error('Erreur lors du chargement de la configuration:', error);
    // Valeur par défaut si le fichier config n'est pas trouvé
    return 'http://localhost:5000';
  }
}
