import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Eye, Trash2, Calendar, User, FileText, AlertCircle, CheckCircle, XCircle, Grid3X3, List, Filter, X, Clock } from 'lucide-react';
import { Dataset } from '../types/Dataset';
import { getMySubmissions, deleteMySubmission } from '../utils/api';
import DomainChip from './DomainChip';

type ViewMode = 'card' | 'list';
type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected';

const MySubmissions: React.FC = () => {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState<Dataset[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('card');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [showSidebar, setShowSidebar] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadSubmissions();
  }, []);

  const loadSubmissions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getMySubmissions();
      setSubmissions(data);
    } catch (err) {
      console.error('Failed to load submissions:', err);
      setError('Failed to load your submissions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (indicatorId: string, version: number) => {
    if (!window.confirm('Are you sure you want to delete this pending submission?')) {
      return;
    }

    const deleteKey = `${indicatorId}-${version}`;
    setDeletingId(deleteKey);

    try {
      await deleteMySubmission(indicatorId, version);
      await loadSubmissions(); // Reload the list
    } catch (err) {
      console.error('Failed to delete submission:', err);
      setError('Failed to delete submission. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleView = (submission: Dataset) => {
    // Navigate to dataset view for all submissions
    navigate(`/datasets/${submission.indicator_id}`);
  };

  // Filter submissions based on search and status
  const filteredSubmissions = useMemo(() => {
    let results = submissions;

    // Apply status filter
    if (statusFilter !== 'all') {
      results = results.filter(submission => {
        if (statusFilter === 'pending') return submission.approval_status === 'Pending Review';
        if (statusFilter === 'approved') return submission.approval_status === 'approved';
        if (statusFilter === 'rejected') return submission.approval_status === 'rejected';
        return true;
      });
    }

    // Apply search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      results = results.filter(submission =>
        submission.indicator_name_en.toLowerCase().includes(term) ||
        submission.indicator_name_ar.includes(term) ||
        submission.indicator_id.toLowerCase().includes(term) ||
        submission.notes?.toLowerCase().includes(term)
      );
    }

    return results;
  }, [submissions, statusFilter, searchTerm]);

  // Calculate status counts
  const statusCounts = useMemo(() => ({
    all: submissions.length,
    pending: submissions.filter(s => s.approval_status === 'Pending Review').length,
    approved: submissions.filter(s => s.approval_status === 'approved').length,
    rejected: submissions.filter(s => s.approval_status === 'rejected').length,
  }), [submissions]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your submissions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
          <div className="text-red-600 mb-4">
            <AlertCircle className="h-16 w-16 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Error Loading Submissions</h3>
            <p>{error}</p>
          </div>
          <button
            onClick={loadSubmissions}
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
        <h2 className="text-3xl font-bold text-gray-900 mb-2">My Submissions</h2>
        <p className="text-gray-600">Track the status of your uploaded datasets</p>
      </div>

      {/* Search and Filter Bar */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 z-10" />
            <input
              type="text"
              placeholder="Search submissions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 z-10"
                title="Clear search"
              >
                <X className="h-5 w-5" />
              </button>
            )}
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

        {/* Status Filter Tabs */}
        <div className="flex gap-2">
          {[
            { value: 'all', label: 'All', count: statusCounts.all },
            { value: 'pending', label: 'Pending', count: statusCounts.pending },
            { value: 'approved', label: 'Approved', count: statusCounts.approved },
            { value: 'rejected', label: 'Rejected', count: statusCounts.rejected },
          ].map(tab => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value as StatusFilter)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                statusFilter === tab.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-300'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="mb-4 text-sm text-gray-600">
        Showing {filteredSubmissions.length} of {submissions.length} submissions
      </div>

      {filteredSubmissions.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No submissions found</h3>
          <p className="text-gray-500 mb-4">
            {submissions.length === 0
              ? "You haven't submitted any datasets yet"
              : 'No submissions match your current filters'}
          </p>
          {submissions.length === 0 && (
            <button
              onClick={() => navigate('/upload')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Upload Your First Dataset
            </button>
          )}
        </div>
      ) : (
        <div className={viewMode === 'card' ? "grid gap-6 md:grid-cols-2 lg:grid-cols-3" : "space-y-4"}>
          {viewMode === 'card' ? (
            filteredSubmissions.map((submission) => (
              <SubmissionCard
                key={`${submission.indicator_id}-${submission.version}`}
                submission={submission}
                onView={handleView}
                onDelete={handleDelete}
                deletingId={deletingId}
              />
            ))
          ) : (
            <SubmissionListView
              submissions={filteredSubmissions}
              onView={handleView}
              onDelete={handleDelete}
              deletingId={deletingId}
            />
          )}
        </div>
      )}
    </div>
  );
};

// StatusBadge Component
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'Pending Review':
        return {
          icon: AlertCircle,
          bgColor: 'bg-yellow-100',
          textColor: 'text-yellow-800',
          label: 'Pending Review'
        };
      case 'approved':
        return {
          icon: CheckCircle,
          bgColor: 'bg-green-100',
          textColor: 'text-green-800',
          label: 'Approved'
        };
      case 'rejected':
        return {
          icon: XCircle,
          bgColor: 'bg-red-100',
          textColor: 'text-red-800',
          label: 'Rejected'
        };
      default:
        return {
          icon: AlertCircle,
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800',
          label: status
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.bgColor} ${config.textColor}`}>
      <Icon className="h-4 w-4 mr-1.5" />
      {config.label}
    </span>
  );
};

// SubmissionCard Component
interface SubmissionCardProps {
  submission: Dataset;
  onView: (submission: Dataset) => void;
  onDelete: (indicatorId: string, version: number) => void;
  deletingId: string | null;
}

const SubmissionCard: React.FC<SubmissionCardProps> = ({ submission, onView, onDelete, deletingId }) => {
  const isPending = submission.approval_status === 'Pending Review';
  const isDeleting = deletingId === `${submission.indicator_id}-${submission.version}`;

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-2">
              {submission.indicator_name_en}
            </h3>
            <p className="text-sm text-gray-600 mb-2" dir="rtl">
              {submission.indicator_name_ar}
            </p>
            <div className="flex items-center gap-2 mb-3">
              <div className="inline-block bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                ID: {submission.indicator_id}
              </div>
              <DomainChip domain={submission.domain || ''} size="sm" />
              <div className="inline-flex items-center bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded-full">
                v{submission.version}
              </div>
            </div>
            <StatusBadge status={submission.approval_status || 'unknown'} />
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="h-4 w-4 mr-2" />
            <span>Submitted: {new Date(submission.added_date).toLocaleDateString()}</span>
          </div>

          {submission.approved_by && (
            <div className="flex items-center text-sm text-gray-600">
              <User className="h-4 w-4 mr-2" />
              <span>
                {submission.approval_status === 'approved' ? 'Approved' : 'Rejected'} by: {submission.approved_by}
              </span>
            </div>
          )}

          {submission.approval_date && (
            <div className="flex items-center text-sm text-gray-600">
              <Clock className="h-4 w-4 mr-2" />
              <span>
                {submission.approval_status === 'approved' ? 'Approved' : 'Rejected'} on:{' '}
                {new Date(submission.approval_date).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>

        {submission.rejection_reason && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start">
              <XCircle className="h-5 w-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-900 mb-1">Rejection Reason:</p>
                <p className="text-sm text-red-800">{submission.rejection_reason}</p>
              </div>
            </div>
          </div>
        )}

        {submission.notes && (
          <div className="mb-4">
            <p className="text-sm text-gray-600 line-clamp-3">
              {submission.notes}
            </p>
          </div>
        )}

        <div className="flex space-x-2">
          <button
            onClick={() => onView(submission)}
            className={`${isPending ? 'flex-1' : 'w-full'} bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center justify-center`}
          >
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </button>

          {isPending && (
            <button
              onClick={() => onDelete(submission.indicator_id, submission.version)}
              disabled={isDeleting}
              className="bg-red-100 text-red-700 py-2 px-4 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium flex items-center justify-center disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// SubmissionListView Component
interface SubmissionListViewProps {
  submissions: Dataset[];
  onView: (submission: Dataset) => void;
  onDelete: (indicatorId: string, version: number) => void;
  deletingId: string | null;
}

const SubmissionListView: React.FC<SubmissionListViewProps> = ({ submissions, onView, onDelete, deletingId }) => {
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
                Version
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Submitted
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Reviewed By
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {submissions.map((submission) => {
              const isPending = submission.approval_status === 'Pending Review';
              const isDeleting = deletingId === `${submission.indicator_id}-${submission.version}`;

              return (
                <tr key={`${submission.indicator_id}-${submission.version}`} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {submission.indicator_name_en}
                      </div>
                      <div className="text-sm text-gray-600" dir="rtl">
                        {submission.indicator_name_ar}
                      </div>
                      {submission.rejection_reason && (
                        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-800">
                          <span className="font-medium">Rejection:</span> {submission.rejection_reason}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="inline-block bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded-full">
                      v{submission.version}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={submission.approval_status || 'unknown'} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {new Date(submission.added_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {submission.approved_by || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => onView(submission)}
                        className="text-blue-600 hover:text-blue-900 flex items-center"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </button>
                      {isPending && (
                        <button
                          onClick={() => onDelete(submission.indicator_id, submission.version)}
                          disabled={isDeleting}
                          className="text-red-600 hover:text-red-900 flex items-center disabled:opacity-50"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MySubmissions;
