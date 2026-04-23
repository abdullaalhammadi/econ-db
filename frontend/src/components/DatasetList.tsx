import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Eye, Trash2, Calendar, User, FileText, Clock, Grid3X3, List, Filter, X } from 'lucide-react';
import { Dataset } from '../types/Dataset';
import { getDatasets, deleteDataset, migrateOldDatasets } from '../utils/storage';
import DomainChip from './DomainChip';

type ViewMode = 'card' | 'list';

interface DatasetListProps {
  isAdmin?: boolean;
}

const DatasetList: React.FC<DatasetListProps> = ({ isAdmin = false }) => {
  const navigate = useNavigate();
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('card');
  const [showSidebar, setShowSidebar] = useState(false);
  const [sourceFilter, setSourceFilter] = useState<string>('');
  const [domainFilter, setDomainFilter] = useState<string>('');

  useEffect(() => {
    migrateOldDatasets();
    loadDatasets();
  }, []);

  const loadDatasets = async () => {
    try {
      setLoading(true);
      setError(null);
      const storedDatasets = await getDatasets();
      setDatasets(storedDatasets);
    } catch (err) {
      console.error('Failed to load datasets:', err);
      setError('Failed to load datasets. Please check your backend connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (indicatorId: string) => {
    if (window.confirm('Are you sure you want to delete this dataset and all its versions?')) {
      try {
        await deleteDataset(indicatorId);
        await loadDatasets();
      } catch (err) {
        console.error('Failed to delete dataset:', err);
        setError('Failed to delete dataset. Please try again.');
      }
    }
  };

  const handleView = (dataset: Dataset) => {
    navigate(`/datasets/${dataset.indicator_id}`);
  };


  const filteredDatasets = datasets.filter(dataset => {
    const matchesSearch = dataset.indicator_name_en.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dataset.indicator_name_ar.includes(searchTerm) ||
      dataset.indicator_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dataset.added_by.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSource = !sourceFilter || dataset.source === sourceFilter;
    const matchesDomain = !domainFilter || dataset.domain === domainFilter;
    
    return matchesSearch && matchesSource && matchesDomain;
  });

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading datasets...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
          <div className="text-red-600 mb-4">
            <FileText className="h-16 w-16 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Connection Error</h3>
            <p>{error}</p>
          </div>
          <button
            onClick={loadDatasets}
            className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Dataset Library</h2>
        <p className="text-gray-600">Manage and explore your uploaded datasets with version control</p>
      </div>

      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search datasets by name, ID, or author..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className={`p-2 rounded-lg border ${showSidebar ? 'bg-blue-100 border-blue-300 text-blue-700' : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'} transition-colors`}
              title="Toggle Filters"
            >
              <Filter className="h-5 w-5" />
            </button>
            
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('card')}
                className={`p-2 ${viewMode === 'card' ? 'bg-blue-100 text-blue-700' : 'bg-white text-gray-600 hover:bg-gray-50'} transition-colors`}
                title="Card View"
              >
                <Grid3X3 className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 border-l border-gray-300 ${viewMode === 'list' ? 'bg-blue-100 text-blue-700' : 'bg-white text-gray-600 hover:bg-gray-50'} transition-colors`}
                title="List View"
              >
                <List className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        {showSidebar && (
          <div className="w-64 bg-white rounded-lg border border-gray-200 p-4 h-fit">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
              <button
                onClick={() => setShowSidebar(false)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Source
                </label>
                <select
                  value={sourceFilter}
                  onChange={(e) => setSourceFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Sources</option>
                  {Array.from(new Set(datasets.map(d => d.source).filter(Boolean))).map(source => (
                    <option key={source} value={source}>{source}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Domain
                </label>
                <select
                  value={domainFilter}
                  onChange={(e) => setDomainFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Domains</option>
                  <option value="Demographic">Demographic</option>
                  <option value="Social">Social</option>
                  <option value="Health">Health</option>
                  <option value="Education">Education</option>
                  <option value="Housing">Housing</option>
                  <option value="Energy">Energy</option>
                  <option value="Labor Market">Labor Market</option>
                  <option value="Economy">Economy</option>
                  <option value="Tourism">Tourism</option>
                </select>
              </div>
              
              {(sourceFilter || domainFilter) && (
                <button
                  onClick={() => {
                    setSourceFilter('');
                    setDomainFilter('');
                  }}
                  className="w-full px-3 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        )}

          <div className="flex-1">
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
              <div className={viewMode === 'card' ? "grid gap-6 md:grid-cols-2 lg:grid-cols-3" : "space-y-4"}>
                {viewMode === 'card' ? (
                  filteredDatasets.map((dataset) => (
                    <DatasetCard
                      key={dataset.indicator_id}
                      dataset={dataset}
                      onView={handleView}
                      onDelete={handleDelete}
                      isAdmin={isAdmin}
                    />
                  ))
                ) : (
                  <DatasetListView
                    datasets={filteredDatasets}
                    onView={handleView}
                    onDelete={handleDelete}
                    isAdmin={isAdmin}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
};

interface DatasetListViewProps {
  datasets: Dataset[];
  onView: (dataset: Dataset) => void;
  onDelete: (indicatorId: string) => void;
  isAdmin?: boolean;
}

const DatasetListView: React.FC<DatasetListViewProps> = ({ datasets, onView, onDelete, isAdmin = false }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Dataset
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Domain
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Added By
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Version
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {datasets.map((dataset) => (
              <tr key={dataset.indicator_id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {dataset.indicator_name_en}
                    </div>
                    <div className="text-sm text-gray-600" dir="rtl">
                      {dataset.indicator_name_ar}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="inline-block bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                    {dataset.indicator_id}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <DomainChip domain={dataset.domain || ''} size="sm" />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {dataset.added_by}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {new Date(dataset.added_date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  v{dataset.version}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onView(dataset)}
                      className="text-blue-600 hover:text-blue-900 flex items-center"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => onDelete(dataset.indicator_id)}
                        className="text-red-600 hover:text-red-900 flex items-center"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

interface DatasetCardProps {
  dataset: Dataset;
  onView: (dataset: Dataset) => void;
  onDelete: (indicatorId: string) => void;
  isAdmin?: boolean;
}

const DatasetCard: React.FC<DatasetCardProps> = ({ dataset, onView, onDelete, isAdmin = false }) => {

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300">
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
              <DomainChip domain={dataset.domain || ''} size="sm" />
              <div className="inline-flex items-center bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                v{dataset.version}
              </div>
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
            onClick={() => onView(dataset)}
            className={`${isAdmin ? 'flex-1' : 'w-full'} bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center justify-center`}
          >
            <Eye className="h-4 w-4 mr-2" />
            View Data
          </button>
          {isAdmin && (
            <button
              onClick={() => onDelete(dataset.indicator_id)}
              className="bg-red-100 text-red-700 py-2 px-4 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium flex items-center justify-center"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DatasetList;