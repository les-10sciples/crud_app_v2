import { load } from 'js-yaml';

interface Config {
  backend_url: string;
  availability_zone: string;
}

let backendUrl: string | null = null;
let availabilityZone: string | null = null;

export async function getBackendUrl(): Promise<string> {
  if (backendUrl) {
    return backendUrl;
  }

  try {
    const response = await fetch('/config.yaml');
    const yamlText = await response.text();
    const config = load(yamlText) as Config;
    backendUrl = config.backend_url;
    availabilityZone = config.availability_zone;
    return backendUrl;
  } catch (error) {
    console.error('Erreur lors du chargement de la configuration:', error);
    // Valeur par défaut si le fichier config n'est pas trouvé
    return 'http://localhost:5000';
  }
}

export async function getFrontendAvailabilityZone(): Promise<string> {
  if (availabilityZone) {
    return availabilityZone;
  }

  try {
    const response = await fetch('/config.yaml');
    const yamlText = await response.text();
    const config = load(yamlText) as Config;
    backendUrl = config.backend_url;
    availabilityZone = config.availability_zone;
    return availabilityZone;
  } catch (error) {
    console.error('Erreur lors du chargement de la configuration:', error);
    // Valeur par défaut si le fichier config n'est pas trouvé
    return 'A';
  }
}
