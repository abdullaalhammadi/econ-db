import { ApiDataset } from '../types/Dataset';

const API_BASE_URL = '/api';

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      credentials: 'include', // Send cookies for session management
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: `HTTP error! status: ${response.status}` }));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

export async function getDatasets(): Promise<ApiDataset[]> {
  return request<ApiDataset[]>('/indicators');
}

export async function getDatasetVersions(indicatorId: string): Promise<ApiDataset[]> {
  return request<ApiDataset[]>(`/indicators/${indicatorId}/versions`);
}

export async function getDatasetVersion(indicatorId: string, version: number): Promise<ApiDataset> {
  return request<ApiDataset>(`/indicators/${indicatorId}/versions/${version}`);
}

export async function createDataset(dataset: Omit<ApiDataset, 'version' | 'created_at' | 'updated_at'>): Promise<{ message: string; version: number; is_new_version: boolean }> {
  return request('/indicators', {
    method: 'POST',
    body: JSON.stringify(dataset),
  });
}

export async function deleteDataset(indicatorId: string): Promise<{ message: string }> {
  return request(`/indicators/${indicatorId}`, {
    method: 'DELETE',
  });
}

// Auth methods
export async function login(username, password) {
  return request('/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

export async function register(username, password) {
  return request('/register', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

export async function logout() {
  return request('/logout', {
    method: 'POST',
  });
}

export async function getStatus(): Promise<{ logged_in: boolean; user?: { username: string } }> {
  return request('/status');
}
