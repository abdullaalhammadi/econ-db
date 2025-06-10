import { Dataset, DatasetWithVersions, DatasetVersion } from '../types/Dataset';

const STORAGE_KEY = 'datasets_with_versions';

export const saveDataset = (dataset: Dataset, versionNotes?: string): void => {
  const existingDatasets = getDatasetsWithVersions();
  const timestamp = new Date().toISOString();
  
  // Check if dataset with same ID exists
  const existingIndex = existingDatasets.findIndex(d => d.indicator_id === dataset.indicator_id);
  
  if (existingIndex >= 0) {
    // Update existing dataset with new version
    const existing = existingDatasets[existingIndex];
    const newVersion = existing.current_version + 1;
    
    const newDataset: Dataset = {
      ...dataset,
      version: newVersion,
      version_notes: versionNotes,
      created_at: timestamp,
      updated_at: timestamp
    };
    
    const newVersionEntry: DatasetVersion = {
      version: newVersion,
      dataset: newDataset,
      created_at: timestamp,
      version_notes: versionNotes
    };
    
    existing.versions.push(newVersionEntry);
    existing.current_version = newVersion;
    existing.latest_dataset = newDataset;
    existing.latest_dataset.updated_at = timestamp;
    
    existingDatasets[existingIndex] = existing;
  } else {
    // Create new dataset with version 1
    const newDataset: Dataset = {
      ...dataset,
      version: 1,
      version_notes: versionNotes || 'Initial version',
      created_at: timestamp,
      updated_at: timestamp
    };
    
    const newDatasetWithVersions: DatasetWithVersions = {
      indicator_id: dataset.indicator_id,
      current_version: 1,
      latest_dataset: newDataset,
      versions: [{
        version: 1,
        dataset: newDataset,
        created_at: timestamp,
        version_notes: versionNotes || 'Initial version'
      }]
    };
    
    existingDatasets.push(newDatasetWithVersions);
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existingDatasets));
};

export const getDatasetsWithVersions = (): DatasetWithVersions[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const getDatasets = (): Dataset[] => {
  const datasetsWithVersions = getDatasetsWithVersions();
  return datasetsWithVersions.map(d => d.latest_dataset);
};

export const deleteDataset = (indicatorId: string): void => {
  const datasets = getDatasetsWithVersions();
  const filtered = datasets.filter(d => d.indicator_id !== indicatorId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
};

export const getDatasetById = (indicatorId: string): Dataset | undefined => {
  const datasets = getDatasetsWithVersions();
  const found = datasets.find(d => d.indicator_id === indicatorId);
  return found?.latest_dataset;
};

export const getDatasetWithVersions = (indicatorId: string): DatasetWithVersions | undefined => {
  const datasets = getDatasetsWithVersions();
  return datasets.find(d => d.indicator_id === indicatorId);
};

export const getDatasetVersion = (indicatorId: string, version: number): Dataset | undefined => {
  const datasetWithVersions = getDatasetWithVersions(indicatorId);
  const versionEntry = datasetWithVersions?.versions.find(v => v.version === version);
  return versionEntry?.dataset;
};

// Migration function to convert old storage format to new format
export const migrateOldDatasets = (): void => {
  const oldStorageKey = 'datasets';
  const oldData = localStorage.getItem(oldStorageKey);
  
  if (oldData && !localStorage.getItem(STORAGE_KEY)) {
    const oldDatasets: Dataset[] = JSON.parse(oldData);
    const timestamp = new Date().toISOString();
    
    const migratedDatasets: DatasetWithVersions[] = oldDatasets.map(dataset => ({
      indicator_id: dataset.indicator_id,
      current_version: 1,
      latest_dataset: {
        ...dataset,
        version: 1,
        version_notes: 'Migrated from old version',
        created_at: timestamp,
        updated_at: timestamp
      },
      versions: [{
        version: 1,
        dataset: {
          ...dataset,
          version: 1,
          version_notes: 'Migrated from old version',
          created_at: timestamp,
          updated_at: timestamp
        },
        created_at: timestamp,
        version_notes: 'Migrated from old version'
      }]
    }));
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(migratedDatasets));
    localStorage.removeItem(oldStorageKey);
  }
};