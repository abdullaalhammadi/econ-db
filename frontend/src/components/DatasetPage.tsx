import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Dataset } from '../types/Dataset';
import { getDatasets } from '../utils/storage';
import DatasetViewer from './DatasetViewer';
import { FileText } from 'lucide-react';

const DatasetPage: React.FC = () => {
  const { indicatorId } = useParams<{ indicatorId: string }>();
  const navigate = useNavigate();
  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDataset = async () => {
      if (!indicatorId) {
        setError('No dataset ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const datasets = await getDatasets();
        const found = datasets.find(d => d.indicator_id === indicatorId);

        if (found) {
          setDataset(found);
        } else {
          setError('Dataset not found');
        }
      } catch (err) {
        console.error('Failed to load dataset:', err);
        setError('Failed to load dataset');
      } finally {
        setLoading(false);
      }
    };

    loadDataset();
  }, [indicatorId]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dataset...</p>
        </div>
      </div>
    );
  }

  if (error || !dataset) {
    return (
      <div className="max-w-7xl mx-auto p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
          <FileText className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-red-700 mb-2">Dataset Not Found</h3>
          <p className="text-red-600 mb-4">{error || 'The requested dataset could not be found.'}</p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Dataset List
          </button>
        </div>
      </div>
    );
  }

  return (
    <DatasetViewer
      dataset={dataset}
      onBack={() => navigate('/')}
    />
  );
};

export default DatasetPage;
