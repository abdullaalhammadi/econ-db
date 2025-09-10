import { Dataset } from '../types/Dataset';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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

export async function getDatasets(): Promise<Dataset[]> {
  return request<Dataset[]>('/indicators');
}

export async function getDatasetVersions(indicatorId: string): Promise<Dataset[]> {
  return request<Dataset[]>(`/indicators/${indicatorId}/versions`);
}

export async function getDatasetVersion(indicatorId: string, version: number): Promise<Dataset> {
  return request<Dataset>(`/indicators/${indicatorId}/versions/${version}`);
}

export async function createDataset(dataset: Omit<Dataset, 'version' | 'created_at' | 'updated_at'>): Promise<{ message: string; version: number; is_new_version: boolean }> {
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

export async function getNextIndicatorId(): Promise<string> {
  try {
    const datasets = await getDatasets();
    const maxId = datasets.length > 0 
      ? Math.max(...datasets.map(d => {
          const match = d.indicator_id.match(/^IND(\d+)$/);
          return match ? parseInt(match[1]) : 0;
        }))
      : 0;
    return `IND${String(maxId + 1).padStart(3, '0')}`;
  } catch (error) {
    console.error('Failed to generate next indicator ID:', error);
    return 'IND001';
  }
}

// Admin methods
export async function checkAdminAccess(): Promise<{ is_admin: boolean }> {
  return request('/admin/check-access');
}

export async function getPendingApprovals(): Promise<Dataset[]> {
  return request('/admin/pending-approvals');
}

export async function approveIndicator(indicatorId: string, version: number): Promise<{ message: string }> {
  return request(`/admin/approve/${indicatorId}/${version}`, {
    method: 'POST',
  });
}

export async function rejectIndicator(indicatorId: string, version: number, reason: string): Promise<{ message: string }> {
  return request(`/admin/reject/${indicatorId}/${version}`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
}
