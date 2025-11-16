// src/pages/partner/DashboardPage.tsx
/**
 * Updated Partner Dashboard
 * Shows real-time stats, recent activity, and quick actions
 * With proper error handling for each section
 */

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Package,
  FileText,
  Wallet,
  TrendingUp,
  Clock,
  CheckCircle2,
  ArrowRight,
  MapPin,
  Calendar,
  IndianRupee,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { usePartnerStore } from '../../stores/usePartnerStore';
import { useVisits } from '../../hooks/usePartnerVisitWorkflow';
import { useWallet } from '../../hooks/useWallet';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { partner } = usePartnerStore();
  
  // Fetch data with error handling
  const { data: visitsData, isLoading: visitsLoading, error: visitsError } = useVisits();
  const { balance, stats: walletStats, error: walletError } = useWallet();

  // ✅ Safe array handling - ensure visits is always an array
  const visits = Array.isArray(visitsData) ? visitsData : [];

  const activeLeads = visits.filter((v) => 
    ['scheduled', 'en_route', 'in_progress'].includes(v.status)
  ).length;

  const completedLeads = visits.filter((v) => v.status === 'completed').length;
  const inProgressLeads = visits.filter((v) => v.status === 'in_progress').length;
  const totalEarnings = walletStats?.total_credits || '0';

  const stats = [
    {
      label: 'Active Leads',
      value: activeLeads,
      icon: FileText,
      color: 'blue',
      change: '+' + Math.round((activeLeads / Math.max(visits.length, 1)) * 100) + '%',
    },
    {
      label: 'Completed',
      value: completedLeads,
      icon: CheckCircle2,
      color: 'green',
      change: '+' + Math.round((completedLeads / Math.max(visits.length, 1)) * 100) + '%',
    },
    {
      label: 'In Progress',
      value: inProgressLeads,
      icon: Clock,
      color: 'yellow',
      change: inProgressLeads > 0 ? 'Active' : 'None',
    },
    {
      label: 'Total Earnings',
      value: `₹${parseFloat(totalEarnings).toLocaleString('en-IN')}`,
      icon: TrendingUp,
      color: 'purple',
      change: walletStats?.this_month_topups ? 
        '+₹' + parseFloat(walletStats.this_month_topups).toLocaleString('en-IN') : 
        '₹0',
    },
  ];

  const recentVisits = visits.slice(0, 5);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      scheduled: 'bg-gray-100 text-gray-700',
      en_route: 'bg-blue-100 text-blue-700',
      arrived: 'bg-green-100 text-green-700',
      in_progress: 'bg-yellow-100 text-yellow-700',
      completed: 'bg-green-500 text-white',
      cancelled: 'bg-red-100 text-red-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {partner?.business_name || 'Partner'}!
        </h1>
        <p className="text-gray-600 mt-1">Here's what's happening with your business today.</p>
      </div>

      {/* Wallet Quick View */}
      {walletError ? (
        <ErrorSection 
          title="Wallet Information" 
          message="Unable to load wallet data. Please refresh the page."
        />
      ) : (
        <div className="bg-gradient-to-br from-[#FEC925] to-[#e6b31f] rounded-xl p-6 text-[#1C1C1B]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold opacity-90 mb-2">Available Balance</p>
              <div className="flex items-baseline gap-2 mb-4">
                <Wallet className="w-6 h-6" />
                <span className="text-4xl font-bold">
                  ₹{parseFloat(balance?.available_balance || '0').toLocaleString('en-IN')}
                </span>
              </div>
              <p className="text-sm opacity-80">
                Blocked: ₹{(parseFloat(balance?.balance || '0') - parseFloat(balance?.available_balance || '0')).toLocaleString('en-IN')}
              </p>
            </div>
            <Link
              to="/partner/wallet"
              className="px-6 py-3 bg-[#1C1C1B] hover:bg-opacity-90 text-white font-semibold rounded-lg transition-colors"
            >
              Manage Wallet
            </Link>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      {visitsError ? (
        <ErrorSection 
          title="Statistics" 
          message="Unable to load statistics. Some data may be unavailable."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`w-12 h-12 rounded-lg bg-${stat.color}-50 flex items-center justify-center`}
                  >
                    <Icon size={24} className={`text-${stat.color}-600`} />
                  </div>
                  <span className={`text-sm font-medium text-${stat.color}-600`}>
                    {stat.change}
                  </span>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Browse Catalog */}
        <Link
          to="/partner/catalog"
          className="group bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-xl p-8 text-black hover:shadow-xl transition-all"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-3">
                <Package size={32} />
                <h3 className="text-2xl font-bold">Browse Catalog</h3>
              </div>
              <p className="text-black/80 mb-4">
                Discover available leads and claim devices
              </p>
              <div className="flex items-center space-x-2 font-semibold group-hover:translate-x-1 transition-transform">
                <span>Get Started</span>
                <ArrowRight size={20} />
              </div>
            </div>
          </div>
        </Link>

        {/* My Leads */}
        <Link
          to="/partner/my-leads"
          className="group bg-white rounded-xl p-8 border-2 border-gray-200 hover:border-yellow-400 hover:shadow-lg transition-all"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-3">
                <FileText size={32} className="text-yellow-600" />
                <h3 className="text-2xl font-bold text-gray-900">My Leads</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Track and manage your active leads
              </p>
              <div className="flex items-center space-x-2 font-semibold text-yellow-600 group-hover:translate-x-1 transition-transform">
                <span>View Leads</span>
                <ArrowRight size={20} />
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
          <Link
            to="/partner/my-leads"
            className="text-sm text-[#FEC925] hover:underline font-semibold"
          >
            View All
          </Link>
        </div>

        {visitsLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#FEC925]" />
          </div>
        ) : visitsError ? (
          <div className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="w-12 h-12 text-red-500 mb-3" />
            <p className="text-gray-500">Unable to load recent activity</p>
            <p className="text-sm text-gray-400">Please try refreshing the page</p>
          </div>
        ) : recentVisits.length > 0 ? (
          <div className="space-y-3">
            {recentVisits.map((visit) => (
              <button
                key={visit.id}
                onClick={() => navigate(`/partner/my-leads/${visit.lead_number}`)}
                className="w-full p-4 border border-gray-200 rounded-lg hover:border-[#FEC925] hover:bg-gray-50 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`px-3 py-1 rounded-lg text-sm font-semibold ${getStatusColor(visit.status)}`}>
                      {visit.status_display}
                    </div>
                    <div className="text-left flex-1">
                      <p className="font-semibold text-gray-900 group-hover:text-[#FEC925] transition-colors">
                        {visit.device_name}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {visit.scheduled_date}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {/* {visit.lead?.pickup_address?.city || 'N/A'} */}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="flex items-center gap-1 font-bold text-gray-900">
                        <IndianRupee className="w-4 h-4" />
                        {/* <span>{parseFloat(visit.lead?.estimated_price || '0').toLocaleString('en-IN')}</span> */}
                      </div>
                      <p className="text-xs text-gray-500">Est. Price</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-[#FEC925]" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <FileText size={48} className="text-gray-300 mb-3" />
            <p className="text-gray-500">No recent activity</p>
            <p className="text-sm text-gray-400">Start claiming leads to see your activity here</p>
          </div>
        )}
      </div>

      {/* Partner Status */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Account Status</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <span className="text-gray-600">Partner Status</span>
            <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium capitalize">
              {partner?.status || 'Active'}
            </span>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <span className="text-gray-600">Business Name</span>
            <span className="font-medium text-gray-900">{partner?.business_name || 'N/A'}</span>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <span className="text-gray-600">Total Leads Claimed</span>
            <span className="font-medium text-gray-900">{visits.length}</span>
          </div>
          <div className="flex items-center justify-between py-3">
            <span className="text-gray-600">Completion Rate</span>
            <span className="font-medium text-gray-900">
              {visits.length > 0 ? Math.round((completedLeads / visits.length) * 100) : 0}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ✅ Error Section Component
const ErrorSection: React.FC<{ title: string; message: string }> = ({ title, message }) => {
  return (
    <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-2">
        <AlertCircle className="w-6 h-6 text-red-600" />
        <h3 className="text-lg font-semibold text-red-900">{title}</h3>
      </div>
      <p className="text-red-700 text-sm">{message}</p>
    </div>
  );
};

export default DashboardPage;







