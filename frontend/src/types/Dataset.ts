export type DataRow = { [key: string]: string | number | boolean };

export interface Dataset {
  indicator_id: string;
  indicator_name_en: string;
  indicator_name_ar: string;
  added_by: string;
  qc_by: string;
  added_date: string;
  notes: string;
  source?: string;
  domain?: string;
  data?: File;
  uploadedData?: DataRow[];
  fileName?: string;
  version: number;
  version_notes?: string;
  created_at: string;
  updated_at: string;
  approval_status?: string;
  approved_by?: string;
  approval_date?: string;
  rejection_reason?: string;
}

export interface DatasetVersion {
  version: number;
  dataset: Dataset;
  created_at: string;
  version_notes?: string;
}

export interface DatasetWithVersions {
  indicator_id: string;
  current_version: number;
  versions: DatasetVersion[];
  latest_dataset: Dataset;
}

export interface FormErrors {
  indicator_id?: string;
  indicator_name_en?: string;
  indicator_name_ar?: string;
  added_by?: string;
  qc_by?: string;
  added_date?: string;
  notes?: string;
  source?: string;
  domain?: string;
  data?: string;
  version_notes?: string;
}