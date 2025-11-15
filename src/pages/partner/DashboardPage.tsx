// src/pages/partner/DashboardPage.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  FileText,
  // Wallet,
  TrendingUp,
  Clock,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { usePartnerStore } from '../../stores/usePartnerStore';

const DashboardPage: React.FC = () => {
  const { partner } = usePartnerStore();

  const stats = [
    { label: 'Active Leads', value: '0', icon: FileText, color: 'blue', change: '+0%' },
    { label: 'Completed', value: '0', icon: CheckCircle2, color: 'green', change: '+0%' },
    { label: 'In Progress', value: '0', icon: Clock, color: 'yellow', change: '+0%' },
    { label: 'Total Earnings', value: '₹0', icon: TrendingUp, color: 'purple', change: '+0%' },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {partner?.business_name || 'Partner'}!
        </h1>
        <p className="text-gray-600 mt-1">Here's what's happening with your business today.</p>
      </div>

      {/* Quick Stats */}
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
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
        <div className="flex flex-col items-center justify-center py-12">
          <FileText size={48} className="text-gray-300 mb-3" />
          <p className="text-gray-500">No recent activity</p>
          <p className="text-sm text-gray-400">Start claiming leads to see your activity here</p>
        </div>
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
          {/* <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <span className="text-gray-600">Service Areas</span>
            <span className="font-medium text-gray-900">
              {partner?.service_areas?.length || 0} configured
            </span>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;