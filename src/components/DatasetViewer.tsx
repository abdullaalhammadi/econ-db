import React, { useState, useEffect } from 'react';
import { ArrowLeft, Download, FileText, User, Calendar, MessageSquare, Clock, GitBranch, ChevronDown, ChevronUp, Link, Check } from 'lucide-react';
import { Dataset } from '../types/Dataset';
import { getDatasetWithVersions, getDatasetVersion } from '../utils/storage';

interface DatasetViewerProps {
  dataset: Dataset;
  onBack: () => void;
}

const DatasetViewer: React.FC<DatasetViewerProps> = ({ dataset: initialDataset, onBack }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedVersion, setSelectedVersion] = useState(initialDataset.version);
  const [dataset, setDataset] = useState(initialDataset);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [versions, setVersions] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  
  const itemsPerPage = 10;

  useEffect(() => {
    const loadVersions = async () => {
      try {
        const datasetWithVersions = await getDatasetWithVersions(initialDataset.indicator_id);
        if (datasetWithVersions) {
          const versionDatasets = datasetWithVersions.versions.map(v => v.dataset);
          setVersions(versionDatasets);
        }
      } catch (error) {
        console.error('Failed to load versions:', error);
      }
    };
    loadVersions();
  }, [initialDataset.indicator_id]);

  useEffect(() => {
    const loadVersionData = async () => {
      if (selectedVersion !== initialDataset.version) {
        setLoading(true);
        try {
          const versionData = await getDatasetVersion(initialDataset.indicator_id, selectedVersion);
          if (versionData) {
            setDataset(versionData);
          }
        } catch (error) {
          console.error('Failed to load version data:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setDataset(initialDataset);
      }
      setCurrentPage(1);
    };

    loadVersionData();
  }, [selectedVersion, initialDataset]);

  const data = dataset.uploadedData || [];
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const currentData = data.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const columns = data.length > 0 ? Object.keys(data[0]) : [];
  const sortedVersions = [...versions].sort((a, b) => b.version - a.version);

  const convertJsonToCsv = (jsonData: any[]): string => {
    if (jsonData.length === 0) return '';
    
    const headers = Object.keys(jsonData[0]);
    const csvHeaders = headers.join(',');
    
    const csvRows = jsonData.map(row => 
      headers.map(header => {
        const value = row[header];
        // Handle values that contain commas, quotes, or newlines
        if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value || '';
      }).join(',')
    );
    
    return [csvHeaders, ...csvRows].join('\n');
  };

  const downloadCSV = async () => {
    if (data.length === 0) return;

    try {
      // Convert JSON data to CSV
      const csvContent = convertJsonToCsv(data);
      
      // Create and download the file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${dataset.indicator_id}_v${dataset.version}_data.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download CSV:', error);
    }
  };

  const copyApiUrl = async () => {
    const baseUrl = window.location.origin;
    const apiUrl = `${baseUrl}/api/indicators/${dataset.indicator_id}/versions/${dataset.version}/data`;
    
    try {
      await navigator.clipboard.writeText(apiUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = apiUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    }
  };

  const handleVersionChange = (version: number) => {
    setSelectedVersion(version);
    setShowVersionHistory(false);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading version data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-8">
      <div className="mb-6">
        <button
          onClick={onBack}
          className="flex items-center text-blue-600 hover:text-blue-700 font-medium mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dataset List
        </button>
        
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {dataset.indicator_name_en}
              </h1>
              <p className="text-lg text-gray-700 mb-4" dir="rtl">
                {dataset.indicator_name_ar}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                ID: {dataset.indicator_id}
              </div>
              <div className="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full">
                Version {dataset.version}
              </div>
            </div>
          </div>

          {versions.length > 1 && (
            <div className="mb-4">
              <div className="relative">
                <button
                  onClick={() => setShowVersionHistory(!showVersionHistory)}
                  className="flex items-center justify-between w-full md:w-auto bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition-colors"
                >
                  <div className="flex items-center">
                    <GitBranch className="h-4 w-4 mr-2" />
                    <span>Version {selectedVersion} of {versions.length}</span>
                  </div>
                  {showVersionHistory ? <ChevronUp className="h-4 w-4 ml-2" /> : <ChevronDown className="h-4 w-4 ml-2" />}
                </button>
                
                {showVersionHistory && (
                  <div className="absolute top-full left-0 right-0 md:right-auto md:w-80 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto">
                    <div className="p-2">
                      <h3 className="text-sm font-semibold text-gray-700 mb-2 px-2">Version History</h3>
                      {sortedVersions.map((version) => (
                        <button
                          key={version.version}
                          onClick={() => handleVersionChange(version.version)}
                          className={`w-full text-left p-3 rounded-lg transition-colors ${
                            selectedVersion === version.version
                              ? 'bg-blue-50 border border-blue-200'
                              : 'hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-sm">Version {version.version}</span>
                            <span className="text-xs text-gray-500">
                              {new Date(version.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          {version.version_notes && (
                            <p className="text-xs text-gray-600 line-clamp-2">{version.version_notes}</p>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="flex items-center text-gray-600">
              <User className="h-5 w-5 mr-2" />
              <div>
                <p className="text-sm font-medium">Added by</p>
                <p className="font-semibold">{dataset.added_by}</p>
              </div>
            </div>
            <div className="flex items-center text-gray-600">
              <User className="h-5 w-5 mr-2" />
              <div>
                <p className="text-sm font-medium">QC by</p>
                <p className="font-semibold">{dataset.qc_by}</p>
              </div>
            </div>
            <div className="flex items-center text-gray-600">
              <Calendar className="h-5 w-5 mr-2" />
              <div>
                <p className="text-sm font-medium">Date added</p>
                <p className="font-semibold">{new Date(dataset.added_date).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="flex items-start text-gray-600">
              <MessageSquare className="h-5 w-5 mr-2 mt-0.5" />
              <div>
                <p className="text-sm font-medium mb-1">Notes</p>
                <p className="text-gray-800 text-sm">{dataset.notes}</p>
              </div>
            </div>
            {dataset.version_notes && (
              <div className="flex items-start text-gray-600">
                <Clock className="h-5 w-5 mr-2 mt-0.5" />
                <div>
                  <p className="text-sm font-medium mb-1">Version Notes</p>
                  <p className="text-gray-800 text-sm">{dataset.version_notes}</p>
                </div>
              </div>
            )}
          </div>

          {/* Always show data info and action buttons when data exists */}
          {data.length > 0 && (
            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center text-gray-600">
                  <FileText className="h-5 w-5 mr-2" />
                  <span className="font-medium">
                    {dataset.fileName || `${dataset.indicator_id}_data`}
                  </span>
                  <span className="ml-2 text-sm">({data.length} rows)</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={copyApiUrl}
                    className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center"
                  >
                    {copiedUrl ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Link className="h-4 w-4 mr-2" />
                        Copy API URL
                      </>
                    )}
                  </button>
                  <button
                    onClick={downloadCSV}
                    className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download CSV
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {data.length > 0 ? (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Dataset Contents</h2>
                <p className="text-sm text-gray-600 mt-1">Version {dataset.version} data</p>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <button
                  onClick={copyApiUrl}
                  className="flex items-center hover:text-purple-600 transition-colors cursor-pointer"
                  title="Click to copy API URL"
                >
                  <Link className="h-4 w-4 mr-1" />
                  <span className="hover:underline">
                    {copiedUrl ? 'API URL Copied!' : 'REST API Available'}
                  </span>
                </button>
                <div className="bg-gray-100 px-3 py-1 rounded-full font-mono text-xs">
                  GET /api/indicators/{dataset.indicator_id}/versions/{dataset.version}
                </div>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {columns.map((column, index) => (
                    <th
                      key={index}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentData.map((row, rowIndex) => (
                  <tr key={rowIndex} className="hover:bg-gray-50">
                    {columns.map((column, colIndex) => (
                      <td
                        key={colIndex}
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                      >
                        {row[column] || '-'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to{' '}
                {Math.min(currentPage * itemsPerPage, data.length)} of {data.length} entries
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="px-3 py-1 text-sm font-medium text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 text-center">
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Data Available</h3>
          <p className="text-gray-500">The uploaded file could not be processed or contains no data.</p>
        </div>
      )}
    </div>
  );
};

export default DatasetViewer;