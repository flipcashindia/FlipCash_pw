// src/pages/partner/ClaimedLeadDetailPage.tsx
/**
 * Claimed Lead Detail Page
 * Complete activity center for claimed leads
 * Shows: Visit status, wallet deductions, chat, timeline, actions
 */

import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { usePartnerVisitWorkflow } from '../../hooks/usePartnerVisitWorkflow';
import { useWallet } from '../../hooks/useWallet';
import {
  ChevronLeft,
  Package,
  MapPin,
  Calendar,
  Phone,
  User,
  IndianRupee,
  AlertCircle,
  MessageSquare,
  FileText,
  Camera,
  Shield,
  Wallet,
  XCircle,
  ArrowRight,
  Copy,
  Check,
} from 'lucide-react';
import { VisitStatusTracker } from './VisitStatusTracker';
import { ChatBox } from './ChatBox';
import { ActivityTimeline } from './ActivityTimeline';
import { InspectionForm } from './InpectionForm'

const ClaimedLeadDetailPage: React.FC = () => {
  const { leadId } = useParams<{ leadId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'chat' | 'timeline'>('overview');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Fetch visit data
  const { visit, isLoading, error, startVisit, startInspection, cancelVisit } = 
    usePartnerVisitWorkflow(leadId);
  
  const { balance } = useWallet();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FEC925]"></div>
      </div>
    );
  }

  if (error || !visit) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-[#1C1C1B] mb-2">Lead Not Found</h2>
        <p className="text-gray-600 mb-6">This lead may have been cancelled or doesn't exist.</p>
        <button
          onClick={() => navigate('/partner/my-leads')}
          className="px-6 py-3 bg-[#FEC925] text-[#1C1C1B] font-semibold rounded-lg hover:bg-[#e6b31f]"
        >
          Back to My Leads
        </button>
      </div>
    );
  }

  const handleCopyCode = () => {
    if (visit.verification_code_masked) {
      navigator.clipboard.writeText(visit.verification_code_masked);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const statusColors: Record<string, string> = {
    scheduled: 'bg-gray-100 text-gray-700',
    en_route: 'bg-blue-100 text-blue-700',
    arrived: 'bg-green-100 text-green-700',
    in_progress: 'bg-[#FEC925] bg-opacity-20 text-[#1C1C1B]',
    completed: 'bg-green-500 text-white',
    cancelled: 'bg-red-100 text-red-700',
    no_show: 'bg-orange-100 text-orange-700',
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/partner/my-leads')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-[#1C1C1B]">Lead Details</h1>
          <p className="text-gray-600">Lead #{visit.lead_number}</p>
        </div>
        <div className={`px-4 py-2 rounded-lg font-semibold ${statusColors[visit.status] || 'bg-gray-100 text-gray-700'}`}>
          {visit.status_display}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Visit Status Tracker */}
          <VisitStatusTracker visit={visit} />

          {/* Device Details Card */}
          <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
            <h2 className="text-xl font-bold text-[#1C1C1B] mb-4 flex items-center gap-2">
              <Package className="w-6 h-6 text-[#FEC925]" />
              Device Information
            </h2>
            <div className="flex gap-6">
              <img
                src={visit.lead?.device_image || 'https://placehold.co/150x150/f5f5f5/cccccc?text=Device'}
                alt={visit.device_name}
                className="w-32 h-32 rounded-lg object-cover"
              />
              <div className="flex-1 space-y-3">
                <h3 className="text-2xl font-bold text-[#1C1C1B]">{visit.device_name}</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-600">Storage</p>
                    <p className="font-semibold">{visit.lead?.device_storage || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">RAM</p>
                    <p className="font-semibold">{visit.lead?.device_ram || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Color</p>
                    <p className="font-semibold">{visit.lead?.device_color || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">IMEI</p>
                    <p className="font-semibold font-mono text-xs">
                      {visit.lead?.device_imei || 'To be verified'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Details Card */}
          <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
            <h2 className="text-xl font-bold text-[#1C1C1B] mb-4 flex items-center gap-2">
              <User className="w-6 h-6 text-[#FEC925]" />
              Customer Information
            </h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-[#F5F5F5] rounded-lg">
                <User className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="text-xs text-gray-600">Name</p>
                  <p className="font-semibold text-[#1C1C1B]">{visit.customer_name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-[#F5F5F5] rounded-lg">
                <Phone className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="text-xs text-gray-600">Phone</p>
                  <a
                    href={`tel:${visit.customer_phone}`}
                    className="font-semibold text-[#1C1C1B] hover:text-[#FEC925]"
                  >
                    {visit.customer_phone}
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-[#F5F5F5] rounded-lg">
                <MapPin className="w-5 h-5 text-gray-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-gray-600">Pickup Address</p>
                  <p className="font-semibold text-[#1C1C1B]">
                    {visit.lead?.pickup_address?.line1}
                    {visit.lead?.pickup_address?.line2 && `, ${visit.lead.pickup_address.line2}`}
                  </p>
                  <p className="text-sm text-gray-600">
                    {visit.lead?.pickup_address?.city}, {visit.lead?.pickup_address?.state}{' '}
                    {visit.lead?.pickup_address?.postal_code}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-xl border-2 border-gray-200">
            <div className="border-b border-gray-200 px-6">
              <div className="flex gap-6">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`py-4 px-2 border-b-2 font-semibold transition-colors ${
                    activeTab === 'overview'
                      ? 'border-[#FEC925] text-[#1C1C1B]'
                      : 'border-transparent text-gray-600 hover:text-[#1C1C1B]'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('chat')}
                  className={`py-4 px-2 border-b-2 font-semibold transition-colors flex items-center gap-2 ${
                    activeTab === 'chat'
                      ? 'border-[#FEC925] text-[#1C1C1B]'
                      : 'border-transparent text-gray-600 hover:text-[#1C1C1B]'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  Chat
                </button>
                <button
                  onClick={() => setActiveTab('timeline')}
                  className={`py-4 px-2 border-b-2 font-semibold transition-colors ${
                    activeTab === 'timeline'
                      ? 'border-[#FEC925] text-[#1C1C1B]'
                      : 'border-transparent text-gray-600 hover:text-[#1C1C1B]'
                  }`}
                >
                  Timeline
                </button>
              </div>
            </div>

            <div className="p-6">
              {activeTab === 'overview' && (
                <div className="space-y-4">
                  {/* Schedule Info */}
                  <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-blue-900 font-semibold">Scheduled Visit</p>
                      <p className="text-blue-700">
                        {visit.scheduled_date} at {visit.scheduled_time_slot}
                      </p>
                    </div>
                  </div>

                  {/* Verification Code (if not verified) */}
                  {!visit.is_code_verified && visit.verification_code_masked && (
                    <div className="p-4 bg-[#FEC925] bg-opacity-10 border-2 border-[#FEC925] rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-semibold text-[#1C1C1B]">Verification Code</p>
                        <button
                          onClick={handleCopyCode}
                          className="p-2 hover:bg-[#FEC925] rounded-lg transition-colors"
                        >
                          {copiedCode ? (
                            <Check className="w-4 h-4 text-green-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      <p className="text-3xl font-bold text-[#1C1C1B] font-mono tracking-wider">
                        {visit.verification_code_masked}
                      </p>
                      <p className="text-sm text-gray-600 mt-2">
                        Ask customer for this code upon arrival
                      </p>
                    </div>
                  )}

                  {/* Notes */}
                  {visit.lead?.customer_notes && (
                    <div className="p-4 bg-[#F5F5F5] rounded-lg">
                      <p className="text-sm font-semibold text-gray-700 mb-1">Customer Notes:</p>
                      <p className="text-gray-600">{visit.lead.customer_notes}</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'chat' && <ChatBox visitId={visit.id} />}

              {activeTab === 'timeline' && <ActivityTimeline visitId={visit.id} />}
            </div>
          </div>

          {/* Inspection Form (if status is arrived) */}
          {visit.status === 'arrived' && (
            <InspectionForm visitId={visit.id} leadId={visit.lead?.id} />
          )}
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Wallet Impact Card */}
          <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
            <h3 className="text-lg font-bold text-[#1C1C1B] mb-4 flex items-center gap-2">
              <Wallet className="w-5 h-5 text-[#FEC925]" />
              Wallet Impact
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                <span className="text-gray-600">Claim Fee</span>
                <span className="font-semibold text-red-600">-₹50</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                <span className="text-gray-600">Amount Blocked</span>
                <span className="font-semibold text-[#FEC925]">
                  ₹{parseFloat(visit.lead?.estimated_price || '0').toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Current Balance</span>
                <span className="font-bold text-[#1C1C1B]">
                  ₹{parseFloat(balance?.available_balance || '0').toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          {/* Pricing Info */}
          <div className="bg-gradient-to-br from-[#FEC925] to-[#e6b31f] rounded-xl p-6 text-[#1C1C1B]">
            <p className="text-sm font-semibold opacity-90 mb-2">Estimated Value</p>
            <div className="flex items-baseline gap-1 mb-4">
              <IndianRupee className="w-6 h-6" />
              <span className="text-4xl font-bold">
                {parseFloat(visit.lead?.estimated_price || '0').toLocaleString('en-IN')}
              </span>
            </div>
            {visit.partner_recommended_price && (
              <>
                <p className="text-sm font-semibold opacity-90 mb-2">Your Assessment</p>
                <div className="flex items-baseline gap-1">
                  <IndianRupee className="w-5 h-5" />
                  <span className="text-2xl font-bold">
                    {parseFloat(visit.partner_recommended_price).toLocaleString('en-IN')}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {visit.status === 'scheduled' && (
              <button
                onClick={() => startVisit()}
                className="w-full py-3 bg-[#FEC925] hover:bg-[#e6b31f] text-[#1C1C1B] font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <ArrowRight className="w-5 h-5" />
                Start Journey
              </button>
            )}

            {visit.status === 'arrived' && (
              <button
                onClick={() => startInspection()}
                className="w-full py-3 bg-[#1B8A05] hover:bg-[#176f04] text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Camera className="w-5 h-5" />
                Start Inspection
              </button>
            )}

            {visit.status !== 'completed' && visit.status !== 'cancelled' && (
              <button
                onClick={() => setShowCancelModal(true)}
                className="w-full py-3 bg-white border-2 border-red-500 text-red-600 font-semibold rounded-lg hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
              >
                <XCircle className="w-5 h-5" />
                Cancel Visit
              </button>
            )}
          </div>

          {/* Quick Links */}
          <div className="bg-[#F5F5F5] rounded-xl p-4">
            <h4 className="font-semibold text-[#1C1C1B] mb-3">Quick Links</h4>
            <div className="space-y-2 text-sm">
              <Link
                to="/partner/wallet"
                className="flex items-center gap-2 text-gray-700 hover:text-[#FEC925] transition-colors"
              >
                <Wallet className="w-4 h-4" />
                View Wallet
              </Link>
              <Link
                to="/partner/my-leads"
                className="flex items-center gap-2 text-gray-700 hover:text-[#FEC925] transition-colors"
              >
                <FileText className="w-4 h-4" />
                My Leads
              </Link>
              <Link
                to="/partner/support"
                className="flex items-center gap-2 text-gray-700 hover:text-[#FEC925] transition-colors"
              >
                <Shield className="w-4 h-4" />
                Get Support
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <CancelVisitModal
          visitId={visit.id}
          onClose={() => setShowCancelModal(false)}
          onCancel={(reason) => {
            cancelVisit(reason);
            setShowCancelModal(false);
            navigate('/partner/my-leads');
          }}
        />
      )}
    </div>
  );
};

// Cancel Visit Modal Component
const CancelVisitModal: React.FC<{
  visitId: string;
  onClose: () => void;
  onCancel: (reason: string) => void;
}> = ({ onClose, onCancel }) => {
  const [reason, setReason] = useState('');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <h3 className="text-xl font-bold text-[#1C1C1B] mb-4">Cancel Visit</h3>
        <p className="text-gray-600 mb-4">
          Please provide a reason for cancellation. Note: Claim fee (₹50) is non-refundable.
        </p>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Enter reason (minimum 10 characters)"
          className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-[#FEC925] focus:outline-none resize-none"
          rows={4}
          minLength={10}
        />
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50"
          >
            Keep Visit
          </button>
          <button
            onClick={() => onCancel(reason)}
            disabled={reason.length < 10}
            className="flex-1 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Confirm Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClaimedLeadDetailPage;










