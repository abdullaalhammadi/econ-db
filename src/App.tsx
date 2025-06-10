import React, { useState } from 'react';
import Navigation from './components/Navigation';
import UploadForm from './components/UploadForm';
import DatasetList from './components/DatasetList';

function App() {
  const [activeTab, setActiveTab] = useState<'upload' | 'list'>('upload');

  const handleUploadSuccess = () => {
    setActiveTab('list');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="py-8">
        {activeTab === 'upload' ? (
          <UploadForm onUploadSuccess={handleUploadSuccess} />
        ) : (
          <DatasetList />
        )}
      </main>
    </div>
  );
}

export default App;