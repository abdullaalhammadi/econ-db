const API_BASE_URL = '/api';

export interface ApiDataset {
  indicator_id: string;
  indicator_name_en: string;
  indicator_name_ar: string;
  added_by: string;
  qc_by: string;
  added_date: string;
  notes: string;
  version: number;
  created_at: string;
  updated_at: string;
  uploadedData: any[];
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

class ApiClient {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async getDatasets(): Promise<ApiDataset[]> {
    return this.request<ApiDataset[]>('/indicators');
  }

  async getDatasetVersions(indicatorId: string): Promise<ApiDataset[]> {
    return this.request<ApiDataset[]>(`/indicators/${indicatorId}/versions`);
  }

  async getDatasetVersion(indicatorId: string, version: number): Promise<ApiDataset> {
    return this.request<ApiDataset>(`/indicators/${indicatorId}/versions/${version}`);
  }

  async createDataset(dataset: {
    indicator_id: string;
    indicator_name_en: string;
    indicator_name_ar: string;
    added_by: string;
    qc_by: string;
    added_date: string;
    notes: string;
    uploadedData: any[];
  }): Promise<{ message: string; version: number; is_new_version: boolean }> {
    return this.request('/indicators', {
      method: 'POST',
      body: JSON.stringify(dataset),
    });
  }

  async deleteDataset(indicatorId: string): Promise<{ message: string }> {
    return this.request(`/indicators/${indicatorId}`, {
      method: 'DELETE',
    });
  }
}

export const apiClient = new ApiClient();