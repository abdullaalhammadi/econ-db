import React, { useState, useEffect } from 'react';
import { Search, Eye, Trash2, Calendar, User, FileText, Clock, GitBranch } from 'lucide-react';
import { Dataset } from '../types/Dataset';
import { getDatasets, deleteDataset, getDatasetsWithVersions, migrateOldDatasets } from '../utils/storage';
import DatasetViewer from './DatasetViewer';

const DatasetList: React.FC = () => {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);
  const [showViewer, setShowViewer] = useState(false);

  useEffect(() => {
    migrateOldDatasets();
    loadDatasets();
  }, []);

  const loadDatasets = () => {
    const storedDatasets = getDatasets();
    setDatasets(storedDatasets);
  };

  const handleDelete = (indicatorId: string) => {
    if (window.confirm('Are you sure you want to delete this dataset and all its versions?')) {
      deleteDataset(indicatorId);
      loadDatasets();
    }
  };

  const handleView = (dataset: Dataset) => {
    setSelectedDataset(dataset);
    setShowViewer(true);
  };

  const getVersionCount = (indicatorId: string): number => {
    const datasetsWithVersions = getDatasetsWithVersions();
    const found = datasetsWithVersions.find(d => d.indicator_id === indicatorId);
    return found?.versions.length || 1;
  };

  const filteredDatasets = datasets.filter(dataset =>
    dataset.indicator_name_en.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dataset.indicator_name_ar.includes(searchTerm) ||
    dataset.indicator_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dataset.added_by.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (showViewer && selectedDataset) {
    return (
      <DatasetViewer
        dataset={selectedDataset}
        onBack={() => {
          setShowViewer(false);
          setSelectedDataset(null);
        }}
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Dataset Library</h2>
        <p className="text-gray-600">Manage and explore your uploaded datasets with version control</p>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search datasets by name, ID, or author..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {filteredDatasets.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            {datasets.length === 0 ? 'No datasets uploaded yet' : 'No datasets match your search'}
          </h3>
          <p className="text-gray-500">
            {datasets.length === 0 
              ? 'Upload your first dataset to get started'
              : 'Try adjusting your search terms'
            }
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredDatasets.map((dataset) => {
            const versionCount = getVersionCount(dataset.indicator_id);
            return (
              <div
                key={dataset.indicator_id}
                className="bg-white rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-2">
                        {dataset.indicator_name_en}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2" dir="rtl">
                        {dataset.indicator_name_ar}
                      </p>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="inline-block bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                          ID: {dataset.indicator_id}
                        </div>
                        {versionCount > 1 && (
                          <div className="inline-flex items-center bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                            <GitBranch className="h-3 w-3 mr-1" />
                            {versionCount} versions
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <User className="h-4 w-4 mr-2" />
                      <span>Added by: {dataset.added_by}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>{new Date(dataset.added_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>v{dataset.version} • {new Date(dataset.updated_at).toLocaleDateString()}</span>
                    </div>
                    {dataset.fileName && (
                      <div className="flex items-center text-sm text-gray-600">
                        <FileText className="h-4 w-4 mr-2" />
                        <span className="truncate">{dataset.fileName}</span>
                      </div>
                    )}
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {dataset.notes}
                    </p>
                    {dataset.version_notes && (
                      <p className="text-xs text-blue-600 mt-1 italic">
                        Latest: {dataset.version_notes}
                      </p>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleView(dataset)}
                      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center justify-center"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Data
                    </button>
                    <button
                      onClick={() => handleDelete(dataset.indicator_id)}
                      className="bg-red-100 text-red-700 py-2 px-4 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium flex items-center justify-center"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DatasetList;