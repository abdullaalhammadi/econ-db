import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Calendar, User, FileText, RefreshCw } from 'lucide-react';
import { getPendingApprovals, approveIndicator, rejectIndicator } from '../utils/api';
import { Dataset } from '../types/Dataset';

const AdminApproval: React.FC = () => {
  const [pendingIndicators, setPendingIndicators] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIndicator, setSelectedIndicator] = useState<Dataset | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchPendingIndicators();
  }, []);

  const fetchPendingIndicators = async () => {
    try {
      setLoading(true);
      const indicators = await getPendingApprovals();
      setPendingIndicators(indicators);
    } catch (error) {
      console.error('Failed to fetch pending indicators:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (indicatorId: string, version: number) => {
    setProcessingId(`${indicatorId}-${version}`);
    
    // Store the original indicator for potential rollback
    const originalIndicator = pendingIndicators.find(ind => 
      ind.indicator_id === indicatorId && (ind as any).version_number === version
    );
    
    // Remove from UI immediately (optimistic update)
    setPendingIndicators(prev => 
      prev.filter(indicator => 
        !(indicator.indicator_id === indicatorId && (indicator as any).version_number === version)
      )
    );
    
    try {
        await approveIndicator(indicatorId, version);
    } catch (error) {
      // Re-add the item back to UI if API call failed
      if (originalIndicator) {
        setPendingIndicators(prev => [...prev, originalIndicator]);
      }
      
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (indicatorId: string, version: number) => {
    setProcessingId(`${indicatorId}-${version}`);
    
    // Store the original indicator for potential rollback
    const originalIndicator = pendingIndicators.find(ind => 
      ind.indicator_id === indicatorId && (ind as any).version_number === version
    );
        
    // Remove from UI immediately (optimistic update)
    setPendingIndicators(prev => 
      prev.filter(indicator => 
        !(indicator.indicator_id === indicatorId && (indicator as any).version_number === version)
      )
    );
    
    // Close modal immediately
    setShowRejectModal(false);
    setRejectionReason('');
    setSelectedIndicator(null);
    
    try {
      await rejectIndicator(indicatorId, version, rejectionReason);
    } catch (error) {
      
      // Re-add the item back to UI if API call failed
      if (originalIndicator) {
        setPendingIndicators(prev => [...prev, originalIndicator]);
      }
      
    } finally {
      setProcessingId(null);
    }
  };

  const openRejectModal = (indicator: Dataset) => {
    setSelectedIndicator(indicator);
    setShowRejectModal(true);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-gray-600">Loading pending approvals...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Approval Dashboard</h1>
          <p className="mt-2 text-lg text-gray-600">
            Review and approve pending indicator submissions
          </p>
        </div>
        <button
          onClick={fetchPendingIndicators}
          disabled={loading}
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {pendingIndicators.length === 0 ? (
        <div className="text-center py-12">
          <CheckCircle className="mx-auto h-12 w-12 text-green-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No pending approvals</h3>
          <p className="mt-1 text-sm text-gray-500">All indicators have been reviewed.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {pendingIndicators.map((indicator) => (
            <div key={`${indicator.indicator_id}-${(indicator as any).version_number}`} className="bg-white shadow-lg rounded-lg border border-gray-200">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {indicator.indicator_name_en}
                    </h3>
                    {indicator.indicator_name_ar && (
                      <h4 className="text-lg text-gray-700 mb-3" dir="rtl">
                        {indicator.indicator_name_ar}
                      </h4>
                    )}
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        <span>Added by: {indicator.added_by}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>Date: {new Date(indicator.added_date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-2" />
                        <span>ID: {indicator.indicator_id}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Version {(indicator as any).version_number}
                        </span>
                      </div>
                    </div>

                    {indicator.notes && (
                      <div className="mb-4">
                        <h5 className="font-medium text-gray-900 mb-1">Notes:</h5>
                        <p className="text-gray-700 text-sm">{indicator.notes}</p>
                      </div>
                    )}

                    <div className="mb-4">
                      <h5 className="font-medium text-gray-900 mb-2">Data Preview:</h5>
                      {indicator.uploadedData && indicator.uploadedData.length > 0 ? (
                        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                          <div className="overflow-x-auto max-h-64">
                            <table className="w-full text-sm">
                              <thead className="bg-gray-50">
                                <tr>
                                  {Object.keys(indicator.uploadedData[0]).map((column, index) => (
                                    <th
                                      key={index}
                                      className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    >
                                      {column}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200">
                                {indicator.uploadedData.slice(0, 5).map((row, rowIndex) => (
                                  <tr key={rowIndex} className="hover:bg-gray-50">
                                    {Object.keys(indicator.uploadedData![0]).map((column, colIndex) => (
                                      <td
                                        key={colIndex}
                                        className="px-3 py-2 whitespace-nowrap text-xs text-gray-900"
                                      >
                                        {row[column] || '-'}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          <div className="px-3 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
                            Showing {Math.min(5, indicator.uploadedData.length)} of {indicator.uploadedData.length} records
                            {indicator.uploadedData.length > 5 && ' (first 5 rows)'}
                          </div>
                        </div>
                      ) : (
                        <div className="bg-gray-50 rounded p-3 text-center">
                          <p className="text-xs text-gray-500">No data available</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => handleApprove(indicator.indicator_id, (indicator as any).version_number || 1)}
                    disabled={processingId === `${indicator.indicator_id}-${(indicator as any).version_number}`}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {processingId === `${indicator.indicator_id}-${(indicator as any).version_number}` ? 'Processing...' : 'Approve'}
                  </button>
                  
                  <button
                    onClick={() => openRejectModal(indicator)}
                    disabled={processingId === `${indicator.indicator_id}-${(indicator as any).version_number}`}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedIndicator && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Reject Indicator: {selectedIndicator.indicator_id}
              </h3>
              <div className="mb-4">
                <label htmlFor="rejection-reason" className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for rejection (optional):
                </label>
                <textarea
                  id="rejection-reason"
                  rows={4}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                  placeholder="Please explain why this indicator is being rejected..."
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => handleReject(selectedIndicator.indicator_id, (selectedIndicator as any).version_number || 1)}
                  disabled={processingId === `${selectedIndicator.indicator_id}-${(selectedIndicator as any).version_number}`}
                  className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                >
                  {processingId === `${selectedIndicator.indicator_id}-${(selectedIndicator as any).version_number}` ? 'Rejecting...' : 'Confirm Rejection'}
                </button>
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectionReason('');
                    setSelectedIndicator(null);
                  }}
                  className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminApproval;