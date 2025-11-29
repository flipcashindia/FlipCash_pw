// src/pages/agent/AgentLeadsPage.tsx
// Agent Leads List - View and filter assigned leads

import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClipboardList,
  Search,
  // Filter,
  MapPin,
  Calendar,
  IndianRupee,
  ArrowRight,
  Loader2,
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  Navigation,
  Phone,
  RefreshCw,
  // ChevronDown,
} from 'lucide-react';
import { useAgentAssignments } from '../../hooks/useAgentApp';
// import type { AssignmentStatus } from '../../api/types/agentApp.types';

// FlipCash Colors
// const COLORS = {
//   primary: '#FEC925',
//   success: '#1B8A05',
//   error: '#FF0000',
//   black: '#1C1C1B',
// };

const STATUS_TABS = [
  { key: '', label: 'All', icon: ClipboardList },
  { key: 'assigned', label: 'New', icon: Clock },
  { key: 'accepted,en_route', label: 'Active', icon: Navigation },
  { key: 'checked_in,inspecting', label: 'In Progress', icon: Package },
  { key: 'completed', label: 'Completed', icon: CheckCircle2 },
];

const AgentLeadsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [searchQuery, setSearchQuery] = useState('');
  // const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  const currentStatus = searchParams.get('status') || '';
  
  const { 
    data: assignmentsData, 
    isLoading, 
    error, 
    refetch 
  } = useAgentAssignments({
    status: currentStatus || undefined,
  });

  const assignments = assignmentsData?.results || [];

  // Filter by search query
  const filteredAssignments = assignments.filter(assignment => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      assignment.lead_number.toLowerCase().includes(query) ||
      assignment.device_brand.toLowerCase().includes(query) ||
      assignment.device_model.toLowerCase().includes(query) ||
      assignment.customer_name.toLowerCase().includes(query) ||
      assignment.pickup_address?.city?.toLowerCase().includes(query)
    );
  });

  const handleTabChange = (status: string) => {
    if (status) {
      setSearchParams({ status });
    } else {
      setSearchParams({});
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      assigned: 'bg-blue-100 text-blue-700 border-blue-200',
      accepted: 'bg-[#FEC925]/20 text-[#b48f00] border-[#FEC925]',
      en_route: 'bg-purple-100 text-purple-700 border-purple-200',
      checked_in: 'bg-green-100 text-green-700 border-green-200',
      inspecting: 'bg-orange-100 text-orange-700 border-orange-200',
      completed: 'bg-[#1B8A05]/20 text-[#1B8A05] border-[#1B8A05]',
      cancelled: 'bg-red-100 text-red-700 border-red-200',
      rejected: 'bg-gray-100 text-gray-600 border-gray-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      assigned: 'New',
      accepted: 'Accepted',
      en_route: 'En Route',
      checked_in: 'At Location',
      inspecting: 'Inspecting',
      completed: 'Completed',
      cancelled: 'Cancelled',
      rejected: 'Rejected',
    };
    return labels[status] || status;
  };

  const getPriorityBadge = (priority: string) => {
    if (priority === 'normal') return null;
    
    const colors: Record<string, string> = {
      urgent: 'bg-[#FF0000] text-white',
      high: 'bg-orange-500 text-white',
      low: 'bg-gray-200 text-gray-600',
    };
    
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase ${colors[priority]}`}>
        {priority}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1C1C1B]">My Leads</h1>
          <p className="text-gray-500">Manage your assigned leads</p>
        </div>
        <button
          onClick={() => refetch()}
          className="p-2 text-gray-500 hover:text-[#FEC925] hover:bg-gray-100 rounded-lg transition"
        >
          <RefreshCw size={20} />
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by lead number, device, or location..."
          className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#FEC925] focus:outline-none transition"
        />
      </div>

      {/* Status Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {STATUS_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentStatus === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition font-semibold ${
                isActive
                  ? 'bg-[#FEC925] text-[#1C1C1B]'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Results Count */}
      <p className="text-sm text-gray-500">
        Showing {filteredAssignments.length} {filteredAssignments.length === 1 ? 'lead' : 'leads'}
      </p>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-10 h-10 animate-spin text-[#FEC925]" />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 text-center">
          <XCircle className="mx-auto text-red-500 mb-3" size={40} />
          <p className="text-red-700 font-semibold">Failed to load leads</p>
          <p className="text-red-600 text-sm">{(error as Error).message}</p>
          <button
            onClick={() => refetch()}
            className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-lg font-semibold hover:bg-red-200 transition"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && filteredAssignments.length === 0 && (
        <div className="bg-gray-50 rounded-2xl p-8 text-center">
          <Package className="mx-auto text-gray-300 mb-4" size={64} />
          <p className="text-gray-600 font-semibold text-lg">No leads found</p>
          <p className="text-gray-500 text-sm">
            {searchQuery
              ? 'Try a different search term'
              : currentStatus
              ? 'No leads in this category'
              : 'New leads will appear here when assigned'}
          </p>
        </div>
      )}

      {/* Leads List */}
      {!isLoading && !error && filteredAssignments.length > 0 && (
        <div className="space-y-3">
          <AnimatePresence>
            {filteredAssignments.map((assignment, index) => (
              <motion.div
                key={assignment.assignment_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
              >
                <LeadCard
                  assignment={assignment}
                  onClick={() => navigate(`/agent/lead/${assignment.assignment_id}`)}
                  getStatusColor={getStatusColor}
                  getStatusLabel={getStatusLabel}
                  getPriorityBadge={getPriorityBadge}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

// Lead Card Component
interface LeadCardProps {
  assignment: any;
  onClick: () => void;
  getStatusColor: (status: string) => string;
  getStatusLabel: (status: string) => string;
  getPriorityBadge: (priority: string) => React.ReactNode;
}

const LeadCard: React.FC<LeadCardProps> = ({
  assignment,
  onClick,
  getStatusColor,
  getStatusLabel,
  getPriorityBadge,
}) => {
  const isNew = assignment.assignment_status === 'assigned';
  const isActive = ['accepted', 'en_route', 'checked_in', 'inspecting'].includes(
    assignment.assignment_status
  );

  return (
    <button
      onClick={onClick}
      className={`w-full bg-white rounded-xl p-4 shadow-sm border-2 transition text-left group ${
        isNew
          ? 'border-[#FEC925] hover:shadow-lg'
          : isActive
          ? 'border-[#1B8A05]/30 hover:border-[#1B8A05] hover:shadow-md'
          : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
      }`}
    >
      {/* Header Row */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(assignment.assignment_status)}`}>
            {getStatusLabel(assignment.assignment_status)}
          </span>
          {getPriorityBadge(assignment.assignment_priority)}
        </div>
        <span className="text-xs text-gray-400 font-mono">
          #{assignment.lead_number}
        </span>
      </div>

      {/* Device Info */}
      <div className="mb-3">
        <p className="font-bold text-lg text-[#1C1C1B] group-hover:text-[#FEC925] transition">
          {assignment.device_brand} {assignment.device_model}
        </p>
        <p className="text-sm text-gray-500">
          {assignment.device_storage} • {assignment.device_color}
        </p>
      </div>

      {/* Details Row */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-600 mb-3">
        <span className="flex items-center gap-1">
          <MapPin size={14} className="text-gray-400" />
          {assignment.pickup_address?.city || 'N/A'}, {assignment.pickup_address?.state || ''}
        </span>
        <span className="flex items-center gap-1">
          <Calendar size={14} className="text-gray-400" />
          {assignment.preferred_date}
        </span>
        <span className="flex items-center gap-1">
          <Clock size={14} className="text-gray-400" />
          {assignment.preferred_time_slot}
        </span>
      </div>

      {/* Footer Row */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
            <span className="text-sm font-bold text-gray-600">
              {assignment.customer_name?.charAt(0)?.toUpperCase() || 'C'}
            </span>
          </div>
          <div>
            <p className="font-semibold text-sm text-[#1C1C1B]">
              {assignment.customer_name}
            </p>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <Phone size={10} />
              {assignment.customer_phone?.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="flex items-center gap-1 font-bold text-[#1B8A05]">
              <IndianRupee size={16} />
              <span>{parseFloat(assignment.estimated_price).toLocaleString('en-IN')}</span>
            </div>
            <p className="text-xs text-gray-500">Est. Price</p>
          </div>
          <ArrowRight 
            className="text-gray-400 group-hover:text-[#FEC925] transition" 
            size={20} 
          />
        </div>
      </div>

      {/* New Lead Indicator */}
      {isNew && (
        <div className="mt-3 pt-3 border-t border-[#FEC925]/30">
          <p className="text-sm font-semibold text-[#FEC925] flex items-center gap-2">
            <span className="w-2 h-2 bg-[#FEC925] rounded-full animate-pulse" />
            Tap to accept this lead
          </p>
        </div>
      )}
    </button>
  );
};

export default AgentLeadsPage;