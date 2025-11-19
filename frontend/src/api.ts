import { Task } from './types';
import { getBackendUrl } from './config';

export interface ApiResponse {
  tasks: Task[];
  availability_zone?: string;
}

class ApiService {
  private baseUrl: string | null = null;
  public onAvailabilityZoneUpdate?: (zone: string) => void;

  private async getBaseUrl(): Promise<string> {
    if (!this.baseUrl) {
      this.baseUrl = await getBackendUrl();
    }
    return this.baseUrl;
  }

  private updateAvailabilityZone(data: any): void {
    if (data.availability_zone && this.onAvailabilityZoneUpdate) {
      this.onAvailabilityZoneUpdate(data.availability_zone);
    }
  }

  async getTasks(): Promise<Task[]> {
    const baseUrl = await this.getBaseUrl();
    const response = await fetch(`${baseUrl}/tasks`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    this.updateAvailabilityZone(data);
    return data.tasks || [];
  }

  async createTask(name: string, status: string, description: string): Promise<Task[]> {
    const baseUrl = await this.getBaseUrl();
    const response = await fetch(`${baseUrl}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, status, description }),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.error || 'Unknown error'}`);
    }
    const data = await response.json();
    this.updateAvailabilityZone(data);
    return data.tasks || [];
  }

  async updateTask(id: number, name: string, status: string, description: string): Promise<Task[]> {
    const baseUrl = await this.getBaseUrl();
    const response = await fetch(`${baseUrl}/tasks/update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id, name, status, description }),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.error || 'Unknown error'}`);
    }
    const data = await response.json();
    this.updateAvailabilityZone(data);
    return data.tasks || [];
  }

  async deleteTask(id: number): Promise<Task[]> {
    const baseUrl = await this.getBaseUrl();
    const response = await fetch(`${baseUrl}/tasks/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    this.updateAvailabilityZone(data);
    return data.tasks || [];
  }
}

export const apiService = new ApiService();
