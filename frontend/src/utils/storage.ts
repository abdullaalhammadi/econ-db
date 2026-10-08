import { Dataset, DatasetWithVersions, DatasetVersion } from '../types/Dataset';
import * as apiClient from './api';

// Convert API dataset to frontend Dataset type
const convertApiDataset = (apiDataset: Dataset): Dataset => ({
  indicator_id: apiDataset.indicator_id,
  indicator_name_en: apiDataset.indicator_name_en,
  indicator_name_ar: apiDataset.indicator_name_ar,
  added_by: apiDataset.added_by,
  qc_by: apiDataset.qc_by,
  added_date: apiDataset.added_date,
  notes: apiDataset.notes,
  version_notes: apiDataset.version_notes,
  version: apiDataset.version,
  created_at: apiDataset.created_at,
  updated_at: apiDataset.updated_at,
  uploadedData: apiDataset.uploadedData,
  source: apiDataset.source,
  domain: apiDataset.domain,
  approval_status: apiDataset.approval_status,
  approved_by: apiDataset.approved_by,
  approval_date: apiDataset.approval_date,
  rejection_reason: apiDataset.rejection_reason
});

export const saveDataset = async (dataset: Dataset): Promise<void> => {
  try {
    const result = await apiClient.createDataset({
      indicator_id: dataset.indicator_id,
      indicator_name_en: dataset.indicator_name_en,
      indicator_name_ar: dataset.indicator_name_ar,
      added_by: dataset.added_by,
      source: dataset.source,
      domain: dataset.domain,
      qc_by: dataset.qc_by,
      added_date: dataset.added_date,
      notes: dataset.notes,
      version_notes: dataset.version_notes,
      uploadedData: dataset.uploadedData || [],
    });

    console.log(result.message, `Version: ${result.version}`);
  } catch (error) {
    console.error('Failed to save dataset:', error);
    throw error;
  }
};

export const getDatasets = async (): Promise<Dataset[]> => {
  try {
    const apiDatasets = await apiClient.getDatasets();
    return apiDatasets.map(convertApiDataset);
  } catch (error) {
    console.error('Failed to fetch datasets:', error);
    return [];
  }
};

export const deleteDataset = async (indicatorId: string): Promise<void> => {
  try {
    await apiClient.deleteDataset(indicatorId);
  } catch (error) {
    console.error('Failed to delete dataset:', error);
    throw error;
  }
};

export const getDatasetById = async (indicatorId: string): Promise<Dataset | undefined> => {
  try {
    const dataset = await apiClient.getIndicatorById(indicatorId);
    return convertApiDataset(dataset);
  } catch (error) {
    console.error('Failed to fetch dataset:', error);
    return undefined;
  }
};

export const getDatasetWithVersions = async (indicatorId: string): Promise<DatasetWithVersions | undefined> => {
  try {
    const versions = await apiClient.getDatasetVersions(indicatorId);
    if (versions.length === 0) return undefined;

    const convertedVersions: DatasetVersion[] = versions.map(v => ({
      version: v.version,
      dataset: convertApiDataset(v),
      created_at: v.created_at,
      version_notes: `Version ${v.version}`,
    }));

    return {
      indicator_id: indicatorId,
      current_version: Math.max(...versions.map(v => v.version)),
      versions: convertedVersions,
      latest_dataset: convertApiDataset(versions[0]), // First item is latest due to DESC order
    };
  } catch (error) {
    console.error('Failed to fetch dataset versions:', error);
    return undefined;
  }
};

export const getDatasetVersion = async (indicatorId: string, version: number): Promise<Dataset | undefined> => {
  try {
    const apiDataset = await apiClient.getDatasetVersion(indicatorId, version);
    return convertApiDataset(apiDataset);
  } catch (error) {
    console.error('Failed to fetch dataset version:', error);
    return undefined;
  }
};

export const getDatasetsWithVersions = async (): Promise<DatasetWithVersions[]> => {
  try {
    const datasets = await getDatasets();
    const datasetsWithVersions: DatasetWithVersions[] = [];

    for (const dataset of datasets) {
      const versions = await apiClient.getDatasetVersions(dataset.indicator_id);
      const convertedVersions: DatasetVersion[] = versions.map(v => ({
        version: v.version,
        dataset: convertApiDataset(v),
        created_at: v.created_at,
        version_notes: `Version ${v.version}`,
      }));

      datasetsWithVersions.push({
        indicator_id: dataset.indicator_id,
        current_version: dataset.version,
        versions: convertedVersions,
        latest_dataset: dataset,
      });
    }

    return datasetsWithVersions;
  } catch (error) {
    console.error('Failed to fetch datasets with versions:', error);
    return [];
  }
};

// Migration function - no longer needed with backend
export const migrateOldDatasets = (): void => {
  // Remove old localStorage data if it exists
  localStorage.removeItem('datasets');
  localStorage.removeItem('datasets_with_versions');
};