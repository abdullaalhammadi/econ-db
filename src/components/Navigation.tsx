import React from 'react';
import { Upload, Database } from 'lucide-react';

interface NavigationProps {
  activeTab: 'upload' | 'list';
  onTabChange: (tab: 'upload' | 'list') => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <Database className="h-8 w-8 text-blue-600" />
            <h1 className="text-xl font-bold text-gray-900">Economic Indicator Database</h1>
          </div>
          
          <nav className="flex space-x-1">
            <button
              onClick={() => onTabChange('upload')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'upload'
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Upload className="h-4 w-4 inline mr-2" />
              Upload Dataset
            </button>
            <button
              onClick={() => onTabChange('list')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'list'
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Database className="h-4 w-4 inline mr-2" />
              View Datasets
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Navigation;