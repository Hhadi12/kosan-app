import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Navbar from '../components/Navbar';
import ComplaintCard from '../components/ComplaintCard';
import ComplaintFilters from '../components/ComplaintFilters';
import { getAllComplaints } from '../api/complaintApi';
import { useAuth } from '../contexts/AuthContext';
import {
  COMPLAINT_PAGE_TITLES,
  COMPLAINT_BUTTON_LABELS,
  COMPLAINT_ERROR_MESSAGES,
  COMPLAINT_EMPTY_MESSAGES,
} from '../utils/constants';

/**
 * ComplaintList Page
 *
 * Displays list of complaints with filters.
 * Admin: See all complaints
 * Tenant: See only own complaints
 */
const ComplaintList = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    priority: '',
    search: '',
  });

  useEffect(() => {
    fetchComplaints();
  }, [filters]);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const data = await getAllComplaints(filters);
      setComplaints(data);
    } catch (error) {
      console.error('Error fetching complaints:', error);
      toast.error(COMPLAINT_ERROR_MESSAGES.fetchComplaints);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({
      status: '',
      category: '',
      priority: '',
      search: '',
    });
  };

  const pageTitle = isAdmin()
    ? COMPLAINT_PAGE_TITLES.complaintList
    : COMPLAINT_PAGE_TITLES.myComplaints;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">{pageTitle}</h1>

          {/* Create Button (Tenant only) */}
          {!isAdmin() && (
            <button
              onClick={() => navigate('/keluhan/create')}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {COMPLAINT_BUTTON_LABELS.createComplaint}
            </button>
          )}
        </div>

        {/* Filters */}
        <ComplaintFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
        />

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Memuat keluhan...</p>
          </div>
        ) : complaints.length === 0 ? (
          /* Empty State */
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <p className="text-gray-500 text-lg">
              {filters.status || filters.category || filters.priority || filters.search
                ? COMPLAINT_EMPTY_MESSAGES.noComplaintsFilter
                : COMPLAINT_EMPTY_MESSAGES.noComplaints}
            </p>
            {!isAdmin() && !filters.status && !filters.category && (
              <button
                onClick={() => navigate('/keluhan/create')}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {COMPLAINT_BUTTON_LABELS.createComplaint}
              </button>
            )}
          </div>
        ) : (
          /* Complaint Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {complaints.map((complaint) => (
              <ComplaintCard key={complaint.id} complaint={complaint} />
            ))}
          </div>
        )}

        {/* Results Count */}
        {!loading && complaints.length > 0 && (
          <div className="mt-6 text-center text-gray-600">
            Menampilkan {complaints.length} keluhan
          </div>
        )}
      </div>
    </div>
  );
};

export default ComplaintList;
