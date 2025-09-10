import React, { useState, useEffect } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { Dataset, FormErrors } from '../types/Dataset';
import { saveDataset, getDatasetWithVersions, migrateOldDatasets } from '../utils/storage';
import { parseCSV, readFileAsText } from '../utils/fileParser';
import { getStatus, getNextIndicatorId } from '../utils/api';
import { DataRow } from '../types/Dataset';

interface UploadFormProps {
  onUploadSuccess: () => void;
}

const UploadForm: React.FC<UploadFormProps> = ({ onUploadSuccess }) => {
  const [formData, setFormData] = useState<Omit<Dataset, 'uploadedData' | 'fileName' | 'version' | 'created_at' | 'updated_at'>>({
    indicator_id: '',
    indicator_name_en: '',
    indicator_name_ar: '',
    added_by: '',
    qc_by: '',
    added_date: new Date().toISOString().split('T')[0],
    notes: '',
    source: '',
    domain: '',
    data: undefined,
  });

  const [versionNotes, setVersionNotes] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [existingDataset, setExistingDataset] = useState<Dataset | null>(null);
  const [isNewVersion, setIsNewVersion] = useState(false);

  useEffect(() => {
    migrateOldDatasets();
    
    // Auto-populate "added by" field with current user and generate indicator ID
    const initializeForm = async () => {
      try {
        const [status, nextId] = await Promise.all([
          getStatus(),
          getNextIndicatorId()
        ]);
        
        setFormData(prev => ({
          ...prev,
          added_by: status.logged_in && status.user ? status.user.username : '',
          indicator_id: nextId
        }));
      } catch (error) {
        console.error('Error initializing form:', error);
      }
    };

    initializeForm();
  }, []);

  useEffect(() => {
    const checkExistingDataset = async () => {
      if (formData.indicator_id) {
        try {
          const existing = await getDatasetWithVersions(formData.indicator_id);
          if (existing) {
            setExistingDataset(existing.latest_dataset);
            setIsNewVersion(true);
          } else {
            setExistingDataset(null);
            setIsNewVersion(false);
          }
        } catch (error) {
          console.error('Error checking existing dataset:', error);
          setExistingDataset(null);
          setIsNewVersion(false);
        }
      } else {
        setExistingDataset(null);
        setIsNewVersion(false);
      }
    };

    checkExistingDataset();
  }, [formData.indicator_id]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.indicator_name_en) newErrors.indicator_name_en = 'English name is required';
    if (!formData.indicator_name_ar) newErrors.indicator_name_ar = 'Arabic name is required';
    if (!formData.qc_by) newErrors.qc_by = 'QC by field is required';
    if (!formData.added_date) newErrors.added_date = 'Date is required';
    if (!formData.notes) newErrors.notes = 'Notes are required';
    if (!formData.data) newErrors.data = 'Data file is required';
    if (isNewVersion && !versionNotes.trim()) {
      newErrors.version_notes = 'Version notes are required for updates';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
      if (!validTypes.includes(file.type) && !file.name.endsWith('.csv') && !file.name.endsWith('.xlsx')) {
        setErrors({ ...errors, data: 'Please upload a CSV or Excel file' });
        return;
      }
      setFormData({ ...formData, data: file });
      setErrors({ ...errors, data: undefined });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {

      let uploadedData: DataRow[] = [];
      
      if (formData.data) {
        if (formData.data.name.endsWith('.csv')) {
          const content = await readFileAsText(formData.data);
          uploadedData = parseCSV(content);
        }
      }

      const dataset: Dataset = {
        ...formData,
        uploadedData,
        fileName: formData.data?.name,
        version: 1, // Will be overridden by backend
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      await saveDataset(dataset, versionNotes || undefined);
      
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        onUploadSuccess();
      }, 2000);

      // Reset form but keep current user in "added by" and generate new indicator ID
      try {
        const [status, nextId] = await Promise.all([
          getStatus(),
          getNextIndicatorId()
        ]);
        const currentUser = status.logged_in && status.user ? status.user.username : '';
        
        setFormData({
          indicator_id: nextId,
          indicator_name_en: '',
          indicator_name_ar: '',
          added_by: currentUser,
          qc_by: '',
          added_date: new Date().toISOString().split('T')[0],
          notes: '',
          source: '',
          domain: '',
          data: undefined,
        });
      } catch (error) {
        console.error('Error resetting form:', error);
        setFormData({
          indicator_id: 'IND001',
          indicator_name_en: '',
          indicator_name_ar: '',
          added_by: '',
          qc_by: '',
          added_date: new Date().toISOString().split('T')[0],
          notes: '',
          source: '',
          domain: '',
          data: undefined,
        });
      }
      setVersionNotes('');
      setExistingDataset(null);
      setIsNewVersion(false);
      
    } catch (error) {
      console.error('Upload failed:', error);
      setErrors({ data: 'Failed to process file. Please check your backend connection.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClasses = "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors";
  const errorInputClasses = "w-full px-4 py-3 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors";

  if (showSuccess) {
    return (
      <div className="max-w-2xl mx-auto p-8">
        <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
          <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-green-800 mb-2">
            {isNewVersion ? 'New Version Uploaded Successfully!' : 'Dataset Uploaded Successfully!'}
          </h2>
          <p className="text-green-600">
            {isNewVersion 
              ? 'Your dataset has been updated with a new version.'
              : 'Your dataset has been processed and saved to the database.'
            }
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-8">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
        <div className="text-center mb-8">
          <Upload className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900">Upload New Dataset</h2>
          <p className="text-gray-600 mt-2">Fill in all required information and upload your data file</p>
        </div>

        {isNewVersion && existingDataset && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start">
              <Info className="h-5 w-5 text-amber-600 mr-2 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-amber-800 mb-1">Updating Existing Dataset</h3>
                <p className="text-sm text-amber-700 mb-2">
                  This will create version {existingDataset.version + 1} of "{existingDataset.indicator_name_en}"
                </p>
                <div className="text-xs text-amber-600">
                  <p>Current version: {existingDataset.version}</p>
                  <p>Last updated: {new Date(existingDataset.updated_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Indicator ID
              </label>
              <input
                type="text"
                value={formData.indicator_id}
                readOnly
                className={`${inputClasses} bg-gray-50 cursor-not-allowed`}
                placeholder="Auto-generated serial number"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Added Date *
              </label>
              <input
                type="date"
                value={formData.added_date}
                onChange={(e) => setFormData({ ...formData, added_date: e.target.value })}
                className={errors.added_date ? errorInputClasses : inputClasses}
              />
              {errors.added_date && (
                <p className="text-red-600 text-sm mt-1 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.added_date}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Indicator Name (English) *
            </label>
            <input
              type="text"
              value={formData.indicator_name_en}
              onChange={(e) => setFormData({ ...formData, indicator_name_en: e.target.value })}
              className={errors.indicator_name_en ? errorInputClasses : inputClasses}
              placeholder="Enter indicator name in English"
            />
            {errors.indicator_name_en && (
              <p className="text-red-600 text-sm mt-1 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.indicator_name_en}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Indicator Name (Arabic) *
            </label>
            <input
              type="text"
              value={formData.indicator_name_ar}
              onChange={(e) => setFormData({ ...formData, indicator_name_ar: e.target.value })}
              className={errors.indicator_name_ar ? errorInputClasses : inputClasses}
              placeholder="اسم المؤشر بالعربية"
              dir="rtl"
            />
            {errors.indicator_name_ar && (
              <p className="text-red-600 text-sm mt-1 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.indicator_name_ar}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Added By *
              </label>
              <input
                type="text"
                value={formData.added_by}
                readOnly
                className={`${errors.added_by ? errorInputClasses : inputClasses} bg-gray-50 cursor-not-allowed`}
                placeholder="Automatically filled with current user"
              />
              {errors.added_by && (
                <p className="text-red-600 text-sm mt-1 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.added_by}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                QC By *
              </label>
              <input
                type="text"
                value={formData.qc_by}
                onChange={(e) => setFormData({ ...formData, qc_by: e.target.value })}
                className={errors.qc_by ? errorInputClasses : inputClasses}
                placeholder="Quality control reviewer"
              />
              {errors.qc_by && (
                <p className="text-red-600 text-sm mt-1 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.qc_by}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Notes *
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className={errors.notes ? errorInputClasses : inputClasses}
              rows={4}
              placeholder="Enter any additional notes or comments..."
            />
            {errors.notes && (
              <p className="text-red-600 text-sm mt-1 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.notes}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Source
              </label>
              <input
                type="text"
                value={formData.source || ''}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                className={errors.source ? errorInputClasses : inputClasses}
                placeholder="Data source (e.g., IMF, World Bank, etc.)"
              />
              {errors.source && (
                <p className="text-red-600 text-sm mt-1 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.source}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Domain
              </label>
              <input
                type="text"
                value={formData.domain || ''}
                onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                className={errors.domain ? errorInputClasses : inputClasses}
                placeholder="Data domain (e.g., Economics, Finance, etc.)"
              />
              {errors.domain && (
                <p className="text-red-600 text-sm mt-1 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.domain}
                </p>
              )}
            </div>
          </div>

          {isNewVersion && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Version Notes *
              </label>
              <textarea
                value={versionNotes}
                onChange={(e) => setVersionNotes(e.target.value)}
                className={errors.version_notes ? errorInputClasses : inputClasses}
                rows={3}
                placeholder="Describe what changed in this version..."
              />
              {errors.version_notes && (
                <p className="text-red-600 text-sm mt-1 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.version_notes}
                </p>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Data File *
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer text-blue-600 hover:text-blue-700 font-medium"
              >
                Click to upload CSV or Excel file
              </label>
              <p className="text-gray-500 text-sm mt-1">or drag and drop</p>
              {formData.data && (
                <p className="text-green-600 text-sm mt-2 font-medium">
                  Selected: {formData.data.name}
                </p>
              )}
            </div>
            {errors.data && (
              <p className="text-red-600 text-sm mt-1 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.data}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting 
              ? (isNewVersion ? 'Uploading New Version...' : 'Uploading...') 
              : (isNewVersion ? 'Upload New Version' : 'Upload Dataset')
            }
          </button>
        </form>
      </div>
    </div>
  );
};

export default UploadForm;