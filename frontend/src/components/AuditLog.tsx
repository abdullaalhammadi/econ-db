import React, { useState, useEffect } from 'react';
import { History, Filter, ChevronLeft, ChevronRight, Calendar, User, FileText, RefreshCw } from 'lucide-react';
import { getAuditLogs } from '../utils/api';

interface AuditLogEntry {
  id: number;
  event_time: string;
  admin_user: string;
  action_type: string;
  target_user?: string;
  target_indicator?: string;
  old_value?: string;
  new_value?: string;
  details?: string;
}

interface AuditLogsResponse {
  logs: AuditLogEntry[];
  pagination: {
    page: number;
    per_page: number;
    total: number;
    pages: number;
  };
}

const AuditLog: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterLoading, setFilterLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    per_page: 25,
    total: 0,
    pages: 0
  });
  const [actionTypeFilter, setActionTypeFilter] = useState<string>('');

  const actionTypes = [
    { value: 'all', label: 'All Actions' },
    { value: 'role_update', label: 'Role Updates' },
    { value: 'indicator_approve', label: 'Indicator Approvals' },
    { value: 'indicator_reject', label: 'Indicator Rejections' },
    { value: 'indicator_upload', label: 'Data Uploads' },
    { value: 'indicator_delete', label: 'Data Deletions' }
  ];

  const fetchAuditLogs = async (isFiltering = false) => {
    try {
      if (isFiltering) {
        setFilterLoading(true);
      } else {
        setLoading(true);
      }
      
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        per_page: pagination.per_page.toString()
      });
      
      if (actionTypeFilter && actionTypeFilter !== 'all') {
        params.append('action_type', actionTypeFilter);
      }

      const response: AuditLogsResponse = await getAuditLogs(params.toString());
      setLogs(response.logs);
      setPagination(prev => ({
        ...prev,
        total: response.pagination.total,
        pages: response.pagination.pages
      }));
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
    } finally {
      if (isFiltering) {
        setFilterLoading(false);
      } else {
        setLoading(false);
      }
    }
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleFilterChange = (filter: string) => {
    setActionTypeFilter(filter);
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page when filtering
  };

  useEffect(() => {
    // On initial load, actionTypeFilter is '' and page is 1 with no logs
    const isInitialLoad = pagination.page === 1 && actionTypeFilter === '' && logs.length === 0;
    
    if (isInitialLoad) {
      fetchAuditLogs(); // Regular loading for initial load
    } else {
      fetchAuditLogs(true); // Skeleton loading for filter/page changes
    }
  }, [pagination.page, actionTypeFilter]);

  // Skeleton loading component
  const SkeletonRow = () => (
    <tr className="animate-pulse">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="h-4 w-4 bg-gray-200 rounded mr-2"></div>
          <div className="h-4 bg-gray-200 rounded w-32"></div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="h-4 w-4 bg-gray-200 rounded mr-2"></div>
          <div className="h-4 bg-gray-200 rounded w-20"></div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="bg-gray-200 rounded-full h-6 w-24"></div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-4 bg-gray-200 rounded w-24"></div>
      </td>
      <td className="px-6 py-4">
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </td>
    </tr>
  );

  const formatevent_time = (event_time: string) => {
    return new Date(event_time).toLocaleString();
  };

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'role_update':
        return <User className="h-4 w-4" />;
      case 'indicator_approve':
      case 'indicator_reject':
        return <FileText className="h-4 w-4" />;
      default:
        return <History className="h-4 w-4" />;
    }
  };

  const getActionColor = (actionType: string) => {
    switch (actionType) {
      case 'role_update':
        return 'bg-blue-100 text-blue-800';
      case 'indicator_approve':
        return 'bg-green-100 text-green-800';
      case 'indicator_reject':
        return 'bg-red-100 text-red-800';
      case 'indicator_upload':
        return 'bg-purple-100 text-purple-800';
      case 'indicator_delete':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatActionType = (actionType: string) => {
    return actionType.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (loading && logs.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-gray-600">Loading audit logs...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Audit Log</h1>
          <p className="mt-2 text-lg text-gray-600">
            Complete history of administrative actions
          </p>
        </div>
        <button
          onClick={() => fetchAuditLogs()}
          disabled={loading}
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center space-x-4">
          <Filter className="h-5 w-5 text-gray-400" />
          <div className="flex-1">
            <label htmlFor="action-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Action Type
            </label>
            <select
              id="action-filter"
              value={actionTypeFilter}
              onChange={(e) => handleFilterChange(e.target.value)}
              className="block w-full sm:w-64 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            >
              {actionTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {logs.length === 0 ? (
        <div className="text-center py-12">
          <History className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No audit logs found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {actionTypeFilter ? 'No logs match the selected filter.' : 'No administrative actions have been recorded yet.'}
          </p>
        </div>
      ) : (
        <>
          {/* Audit Log Entries */}
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      event_time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Admin User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Target
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Details
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filterLoading ? (
                    // Show skeleton rows during filtering
                    Array.from({ length: 5 }, (_, index) => (
                      <SkeletonRow key={`skeleton-${index}`} />
                    ))
                  ) : (
                    logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                          {formatevent_time(log.event_time)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <User className="h-4 w-4 text-gray-400 mr-2" />
                          {log.admin_user}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActionColor(log.action_type)}`}>
                          {getActionIcon(log.action_type)}
                          <span className="ml-1">{formatActionType(log.action_type)}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {log.target_user && (
                          <div className="text-sm">
                            <span className="font-medium">User:</span> {log.target_user}
                          </div>
                        )}
                        {log.target_indicator && (
                          <div className="text-sm">
                            <span className="font-medium">Indicator:</span> {log.target_indicator}
                          </div>
                        )}
                        {!log.target_user && !log.target_indicator && (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="max-w-xs">
                          {log.old_value && log.new_value && (
                            <div className="text-xs text-gray-600 mb-1">
                              <span className="text-red-600">{log.old_value}</span> → <span className="text-green-600">{log.new_value}</span>
                            </div>
                          )}
                          {log.details && (
                            <div className="text-sm break-words">{log.details}</div>
                          )}
                        </div>
                      </td>
                    </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="mt-6 flex items-center justify-between bg-white px-4 py-3 border border-gray-200 rounded-lg">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.pages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing{' '}
                    <span className="font-medium">{((pagination.page - 1) * pagination.per_page) + 1}</span>
                    {' '}to{' '}
                    <span className="font-medium">
                      {Math.min(pagination.page * pagination.per_page, pagination.total)}
                    </span>
                    {' '}of{' '}
                    <span className="font-medium">{pagination.total}</span>
                    {' '}results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page <= 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    
                    {/* Page numbers */}
                    {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                      let pageNum;
                      if (pagination.pages <= 5) {
                        pageNum = i + 1;
                      } else if (pagination.page <= 3) {
                        pageNum = i + 1;
                      } else if (pagination.page >= pagination.pages - 2) {
                        pageNum = pagination.pages - 4 + i;
                      } else {
                        pageNum = pagination.page - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            pageNum === pagination.page
                              ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    
                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page >= pagination.pages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AuditLog;