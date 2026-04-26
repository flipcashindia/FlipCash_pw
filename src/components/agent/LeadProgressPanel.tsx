// src/components/agent/LeadProgressPanel.tsx
// Comprehensive lead progress display — all stages, data, photos, pricing, docs
// Consumes GET /api/v1/partner-agents/my-leads/{assignmentId}/progress/

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, CheckCircle2, Navigation, MapPin, KeyRound, ClipboardList,
  FileCheck, ThumbsUp, ThumbsDown, Shield, CreditCard, BadgeCheck,
  XCircle, Clock, IndianRupee, Smartphone,
  ChevronDown, ChevronUp, ZoomIn, X, AlertTriangle, Loader2,
  Phone, CheckSquare, XSquare,
  Receipt,
  Wallet, ArrowUpRight, FileText, RefreshCw,
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

// ─────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────
interface Stage {
  key: string;
  label: string;
  description: string;
  icon: string;
  status: 'completed' | 'current' | 'pending' | 'failed';
  timestamp: string | null;
}

interface ProgressPayload {
  success: boolean;
  summary: {
    assignment_id: string;
    assignment_status: string;
    priority: string;
    is_active: boolean;
    is_completed: boolean;
    is_failed: boolean;
    assigned_at: string | null;
    completed_at: string | null;
    completion_notes: string;
    rating: number | null;
  };
  stage_timeline: Stage[];
  device: {
    brand: string; model: string; category: string;
    storage: string; color: string;
    estimated_price: string; lead_number: string; lead_id: string;
  };
  customer: {
    name: string; phone: string;
    address: { line1: string; line2: string; city: string; state: string; pincode: string; latitude: string | null; longitude: string | null; } | null;
    preferred_date: string | null;
    preferred_time_slot: string;
  };
  inspection: {
    visit_number: string; visit_id: string;
    verified_imei: string; imei_matches: boolean | null;
    device_powers_on: boolean | null;
    inspection_notes: string;
    inspection_photos: string[];
    verified_conditions: {
      screen_condition: string | null;
      body_condition: string | null;
      battery_health: number | null;
      accessories: Record<string, boolean>;
      functional_issues: string[];
      device_powers_on: boolean | null;
    };
    pricing_breakdown: {
      base_price: string;
      deductions: Array<{ reason: string; amount: string; type: string }>;
      additions?: Array<{ reason: string; amount: string; type: string }>;
      total_deductions: string;
      final_price: string;
    } | null;
    checklist_items: Array<{ id: string; name: string; category: string; status: string; notes: string; photo: string }>;
    submitted_at: string | null;
    duration_minutes: number | null;
    attribute_responses: Record<string, any>;
  } | null;
  pricing: {
    estimated_price: string | null;
    calculated_price: string | null;
    quoted_price: string | null;
    final_price: string | null;
    is_final: boolean;
    deductions: Array<{ reason: string; amount: string; type: string }>;
    additions?: Array<{ reason: string; amount: string; type: string }>;
    total_deductions: string | null;
    base_price: string | null;
  };
  customer_response: {
    has_responded: boolean;
    response: 'accepted' | 'rejected' | null;
    rejection_reason: string;
    responded_at: string | null;
  };
  kyc: {
    completed: boolean;
    documents: Array<{ id: string; document_type: string; file_url: string; verification_status: string; uploaded_at: string | null }>;
    notes: string;
  };
  payment: {
    completed: boolean;
    payment_method: string;
    amount: string | null;
    transaction_id: string | null;
    processed_at: string | null;
    wallet_balance_before: string | null;
    wallet_balance_after: string | null;
  };
  fetched_at: string;
}

// ─────────────────────────────────────────────────────────
// HOOK: useLeadProgress
// ─────────────────────────────────────────────────────────
export function useLeadProgress(assignmentId: string, enabled = true) {
  const [data, setData] = useState<ProgressPayload | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetch = async () => {
    if (!assignmentId) return;
    setIsLoading(prev => data ? false : prev === false ? true : prev); // only show loader on first load
    try {
      const token = useAuthStore.getState().accessToken;
      const res = await window.fetch(
        `${import.meta.env.VITE_API_BASE_URL}/partner-agents/my-leads/${assignmentId}/progress/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('res in lead details: ', res.json());
      
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json: ProgressPayload = await res.json();
      setData(json);
      setError(null);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!enabled || !assignmentId) return;
    setIsLoading(true);
    fetch();
    // Poll every 6 s while in active status
    intervalRef.current = setInterval(fetch, 6000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [assignmentId, enabled]);

  return { data, isLoading, error, refetch: fetch };
}

// ─────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────
const STAGE_ICONS: Record<string, React.FC<any>> = {
  user: User, 'check-circle': CheckCircle2, navigation: Navigation,
  'map-pin': MapPin, key: KeyRound, clipboard: ClipboardList,
  'file-check': FileCheck, 'thumbs-up': ThumbsUp, shield: Shield,
  'credit-card': CreditCard, 'badge-check': BadgeCheck,
};

const fmt = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : null;

const money = (v: string | null | number) =>
  v == null ? '—' : `₹${parseFloat(String(v)).toLocaleString('en-IN')}`;

// ─────────────────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────────────────

/** Collapsible card wrapper */
const Card: React.FC<{
  title: string;
  icon: React.ReactNode;
  badge?: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
  accent?: string;    // tailwind border color
}> = ({ title, icon, badge, defaultOpen = false, children, accent = 'border-gray-200' }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={`bg-white rounded-2xl border-2 ${accent} overflow-hidden`}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition"
      >
        <div className="flex items-center gap-2">
          {icon}
          <span className="font-bold text-[#1C1C1B] text-sm">{title}</span>
          {badge}
        </div>
        {open ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-1">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/** Two-column key-value row */
const Row: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="flex justify-between items-start py-1.5 border-b border-gray-100 last:border-0">
    <span className="text-xs text-gray-500 font-medium">{label}</span>
    <span className="text-xs text-[#1C1C1B] font-semibold text-right max-w-[60%]">{value}</span>
  </div>
);

/** Pill badge */
const Pill: React.FC<{ color: string; children: React.ReactNode }> = ({ color, children }) => (
  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${color}`}>
    {children}
  </span>
);

/** Photo grid with lightbox */
const PhotoGrid: React.FC<{ photos: string[]; label?: string }> = ({ photos, label }) => {
  const [lightbox, setLightbox] = useState<string | null>(null);
  if (!photos.length) return null;
  return (
    <>
      {label && <p className="text-xs font-semibold text-gray-500 mb-2 mt-3">{label}</p>}
      <div className="grid grid-cols-3 gap-2">
        {photos.map((p, i) => (
          <button
            key={i}
            onClick={() => setLightbox(p)}
            className="relative group aspect-square rounded-xl overflow-hidden border-2 border-gray-100 hover:border-[#FEC925] transition"
          >
            <img src={p} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition flex items-center justify-center">
              <ZoomIn size={20} className="text-white opacity-0 group-hover:opacity-100 transition" />
            </div>
          </button>
        ))}
      </div>
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-[9999] flex items-center justify-center p-4"
            onClick={() => setLightbox(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-w-sm w-full"
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={() => setLightbox(null)}
                className="absolute -top-10 right-0 p-2 text-white hover:text-gray-300"
              >
                <X size={24} />
              </button>
              <img src={lightbox} alt="Full" className="w-full rounded-2xl" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// ─────────────────────────────────────────────────────────
// STAGE TIMELINE STRIP
// ─────────────────────────────────────────────────────────
const StageTimeline: React.FC<{ stages: Stage[] }> = ({ stages }) => {
  const completedCount = stages.filter(s => s.status === 'completed').length;
  const total = stages.length;
  const pct = ((completedCount) / (total - 1)) * 100;

  return (
    <div className="bg-white rounded-2xl border-2 border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="font-bold text-[#1C1C1B] text-sm">Progress</span>
        <span className="text-xs text-gray-500">{completedCount}/{total} steps</span>
      </div>

      {/* Linear progress bar */}
      <div className="h-1.5 bg-gray-200 rounded-full mb-5 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-[#FEC925] to-[#1B8A05] rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>

      {/* Stage bubbles — horizontally scrollable */}
      <div className="overflow-x-auto pb-2">
        <div className="flex gap-0 relative min-w-max">
          {stages.map((stage, i) => {
            const Icon = STAGE_ICONS[stage.icon] || BadgeCheck;
            const isLast = i === stages.length - 1;

            const bubbleColor =
              stage.status === 'completed' ? 'bg-[#1B8A05] text-white border-[#1B8A05]' :
              stage.status === 'current'   ? 'bg-[#FEC925] text-[#1C1C1B] border-[#FEC925] ring-4 ring-[#FEC925]/30' :
              stage.status === 'failed'    ? 'bg-red-500 text-white border-red-500' :
                                             'bg-white text-gray-400 border-gray-200';

            const lineColor =
              i < stages.length - 1 && stages[i + 1].status !== 'pending'
                ? 'bg-[#1B8A05]'
                : 'bg-gray-200';

            return (
              <div key={stage.key} className="flex items-start">
                {/* Bubble + label */}
                <div className="flex flex-col items-center w-14">
                  <div className={`w-9 h-9 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${bubbleColor}`}>
                    {stage.status === 'completed' ? (
                      <CheckCircle2 size={16} />
                    ) : stage.status === 'failed' ? (
                      <XCircle size={16} />
                    ) : (
                      <Icon size={15} />
                    )}
                  </div>
                  <span className={`text-[9px] text-center mt-1 font-semibold leading-tight w-14 ${
                    stage.status === 'current' ? 'text-[#1C1C1B]' :
                    stage.status === 'completed' ? 'text-[#1B8A05]' :
                    stage.status === 'failed' ? 'text-red-500' : 'text-gray-400'
                  }`}>
                    {stage.label}
                  </span>
                  {stage.timestamp && (
                    <span className="text-[8px] text-gray-400 text-center mt-0.5">{fmt(stage.timestamp)}</span>
                  )}
                </div>

                {/* Connector line */}
                {!isLast && (
                  <div className="flex items-center mt-4 mx-0.5">
                    <div className={`h-0.5 w-4 rounded-full transition-all ${lineColor}`} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────
// INSPECTION DETAILS CARD
// ─────────────────────────────────────────────────────────
const InspectionCard: React.FC<{ inspection: NonNullable<ProgressPayload['inspection']> }> = ({ inspection }) => {
  const cond = inspection.verified_conditions;

  const condBadge = (val: string | null) => {
    if (!val) return null;
    const colors: Record<string, string> = {
      excellent: 'bg-green-100 text-green-700',
      good: 'bg-blue-100 text-blue-700',
      fair: 'bg-yellow-100 text-yellow-700',
      poor: 'bg-orange-100 text-orange-700',
      broken: 'bg-red-100 text-red-700',
      damaged: 'bg-red-100 text-red-700',
    };
    return <Pill color={colors[val] || 'bg-gray-100 text-gray-700'}>{val}</Pill>;
  };

  const attrKeys = Object.keys(inspection.attribute_responses).filter(k =>
    !['screen_condition', 'body_condition', 'battery_health', 'accessories', 'functional_issues'].includes(k)
  );

  return (
    <Card
      title="Inspection Results"
      icon={<ClipboardList size={16} className="text-[#FEC925]" />}
      badge={<Pill color="bg-[#1B8A05]/10 text-[#1B8A05]">Submitted</Pill>}
      defaultOpen
      accent="border-[#FEC925]/40"
    >
      {/* IMEI row */}
      <Row label="IMEI" value={
        <span className="font-mono flex items-center gap-1">
          {inspection.verified_imei || '—'}
          {inspection.imei_matches != null && (
            inspection.imei_matches
              ? <CheckCircle2 size={12} className="text-[#1B8A05]" />
              : <XCircle size={12} className="text-red-500" />
          )}
        </span>
      } />
      <Row label="Powers On" value={
        inspection.device_powers_on
          ? <Pill color="bg-green-100 text-green-700">Yes</Pill>
          : <Pill color="bg-red-100 text-red-700">No</Pill>
      } />

      {/* Physical condition */}
      {(cond.screen_condition || cond.body_condition) && (
        <div className="grid grid-cols-2 gap-2 my-3">
          <div className="bg-gray-50 rounded-xl p-2.5">
            <p className="text-[10px] text-gray-500 mb-1">Screen</p>
            {condBadge(cond.screen_condition) ?? <span className="text-xs text-gray-400">—</span>}
          </div>
          <div className="bg-gray-50 rounded-xl p-2.5">
            <p className="text-[10px] text-gray-500 mb-1">Body</p>
            {condBadge(cond.body_condition) ?? <span className="text-xs text-gray-400">—</span>}
          </div>
        </div>
      )}

      {/* Battery */}
      {cond.battery_health != null && (
        <div className="my-3">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-500">Battery Health</span>
            <span className="font-bold text-[#1B8A05]">{cond.battery_health}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${cond.battery_health > 70 ? 'bg-[#1B8A05]' : cond.battery_health > 40 ? 'bg-yellow-400' : 'bg-red-500'}`}
              style={{ width: `${cond.battery_health}%` }}
            />
          </div>
        </div>
      )}

      {/* Functional issues */}
      {cond.functional_issues && cond.functional_issues.length > 0 && (
        <div className="my-3 p-3 bg-red-50 rounded-xl border border-red-100">
          <p className="text-xs font-bold text-red-700 mb-2 flex items-center gap-1">
            <AlertTriangle size={12} /> Functional Issues
          </p>
          <div className="flex flex-wrap gap-1.5">
            {cond.functional_issues.map((issue, i) => (
              <span key={i} className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-semibold capitalize">
                {issue.replace(/_/g, ' ')}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Accessories */}
      {Object.keys(cond.accessories || {}).length > 0 && (
        <div className="my-3">
          <p className="text-xs font-semibold text-gray-500 mb-2">Accessories</p>
          <div className="grid grid-cols-2 gap-1.5">
            {Object.entries(cond.accessories).map(([k, v]) => (
              <div key={k} className={`flex items-center gap-1.5 p-2 rounded-lg border text-xs font-medium ${v ? 'border-green-200 bg-green-50 text-green-700' : 'border-gray-200 bg-gray-50 text-gray-400'}`}>
                {v ? <CheckSquare size={12} /> : <XSquare size={12} />}
                {k.replace(/_available|_/g, ' ').trim()}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dynamic attributes (any other responses) */}
      {attrKeys.length > 0 && (
        <div className="my-3">
          <p className="text-xs font-semibold text-gray-500 mb-2">Inspection Criteria</p>
          <div className="space-y-1">
            {attrKeys.map(k => {
              const val = inspection.attribute_responses[k];
              const isPass = val === true || val === 'Yes' || val === 'Working' || val === 'true';
              const isFail = val === false || val === 'No' || val === 'false';
              return (
                <div key={k} className="flex justify-between items-center py-1 border-b border-gray-100 last:border-0">
                  <span className="text-xs text-gray-600 capitalize">{k.replace(/_/g, ' ')}</span>
                  {isPass ? <Pill color="bg-green-100 text-green-700">✓</Pill>
                  : isFail ? <Pill color="bg-red-100 text-red-700">✗</Pill>
                  : <span className="text-xs font-semibold text-gray-700">{String(val)}</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Photos */}
      <PhotoGrid photos={inspection.inspection_photos} label="Device Photos" />

      {/* Notes */}
      {inspection.inspection_notes && (
        <div className="mt-3 p-3 bg-gray-50 rounded-xl">
          <p className="text-[10px] text-gray-500 font-semibold mb-1">Inspector Notes</p>
          <p className="text-xs text-gray-700 leading-relaxed">{inspection.inspection_notes}</p>
        </div>
      )}

      {inspection.submitted_at && (
        <p className="text-[10px] text-gray-400 mt-2 text-right">
          Submitted {fmt(inspection.submitted_at)}
          {inspection.duration_minutes ? ` · ${inspection.duration_minutes} min` : ''}
        </p>
      )}
    </Card>
  );
};

// ─────────────────────────────────────────────────────────
// PRICING BREAKDOWN CARD
// ─────────────────────────────────────────────────────────
const PricingCard: React.FC<{ pricing: ProgressPayload['pricing'] }> = ({ pricing }) => {
  if (!pricing.final_price && !pricing.calculated_price) return null;

  const finalAmount = pricing.final_price || pricing.calculated_price;
  const deductions = pricing.deductions || [];
  const additions = pricing.additions || [];

  return (
    <Card
      title="Price Breakdown"
      icon={<IndianRupee size={16} className="text-[#1B8A05]" />}
      badge={pricing.is_final ? <Pill color="bg-[#1B8A05]/10 text-[#1B8A05]">FINAL</Pill> : undefined}
      defaultOpen
      accent="border-[#1B8A05]/30"
    >
      {/* Big price display */}
      <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-100">
        <span className="text-xs text-gray-500">Original Estimate</span>
        <span className="font-bold text-gray-700">{money(pricing.estimated_price)}</span>
      </div>

      {/* Deductions */}
      {deductions.length > 0 && (
        <div className="space-y-1.5 mb-3">
          {deductions.map((d, i) => (
            <div key={i} className="flex justify-between items-center">
              <span className="text-xs text-gray-600 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" />
                {d.reason}
              </span>
              <span className="text-xs font-semibold text-red-600">
                -{money(d.amount)}
              </span>
            </div>
          ))}
          <div className="flex justify-between pt-1.5 border-t border-gray-100">
            <span className="text-xs font-bold text-gray-700">Total Deductions</span>
            <span className="text-xs font-bold text-red-600">-{money(pricing.total_deductions)}</span>
          </div>
        </div>
      )}

      {/* Additions */}
      {additions.length > 0 && (
        <div className="space-y-1.5 mb-3">
          {additions.map((a, i) => (
            <div key={i} className="flex justify-between items-center">
              <span className="text-xs text-gray-600">{a.reason}</span>
              <span className="text-xs font-semibold text-green-600">+{money(a.amount)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Final price */}
      <div className="bg-gradient-to-r from-[#1B8A05]/10 to-[#16a34a]/10 border border-[#1B8A05]/30 rounded-xl p-3 flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500">Final Offer Price</p>
          <p className="text-[10px] text-gray-400">System calculated</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-black text-[#1B8A05]">{money(finalAmount)}</p>
        </div>
      </div>
    </Card>
  );
};

// ─────────────────────────────────────────────────────────
// CUSTOMER RESPONSE CARD
// ─────────────────────────────────────────────────────────
const CustomerResponseCard: React.FC<{
  cr: ProgressPayload['customer_response'];
  finalPrice: string | null;
}> = ({ cr, finalPrice }) => {
  if (!cr.has_responded) {
    return (
      <div className="bg-white rounded-2xl border-2 border-blue-200 p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <Loader2 size={20} className="text-blue-500 animate-spin" />
          </div>
          <div>
            <p className="font-bold text-[#1C1C1B] text-sm">Waiting for Customer</p>
            <p className="text-xs text-gray-500">Customer will accept or reject on their app</p>
          </div>
        </div>
      </div>
    );
  }

  const accepted = cr.response === 'accepted';
  return (
    <div className={`rounded-2xl border-2 p-4 ${accepted ? 'bg-green-50 border-[#1B8A05]' : 'bg-red-50 border-red-400'}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {accepted
            ? <ThumbsUp size={20} className="text-[#1B8A05]" />
            : <ThumbsDown size={20} className="text-red-600" />}
          <span className={`font-bold text-sm ${accepted ? 'text-[#1B8A05]' : 'text-red-600'}`}>
            Customer {accepted ? 'Accepted' : 'Rejected'}
          </span>
        </div>
        {accepted && finalPrice && (
          <span className="text-sm font-black text-[#1B8A05]">{money(finalPrice)}</span>
        )}
      </div>
      {!accepted && cr.rejection_reason && (
        <p className="text-xs text-red-600 bg-red-100 rounded-lg p-2 mt-1">
          Reason: {cr.rejection_reason}
        </p>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────
// KYC CARD
// ─────────────────────────────────────────────────────────
const KYCCard: React.FC<{ kyc: ProgressPayload['kyc'] }> = ({ kyc }) => {
  if (!kyc.completed) return null;

  const typeLabels: Record<string, string> = {
    aadhaar: 'Aadhaar Card',
    pan: 'PAN Card',
    driving_license: 'Driving License',
    passport: 'Passport',
    voter_id: 'Voter ID',
    id_proof: 'ID Proof',
    address_proof: 'Address Proof',
    customer_signature: 'Signature',
    device_bill: 'Device Bill',
    device_warranty: 'Warranty',
  };

  const photoUrls = kyc.documents
    .filter(d => d.file_url && d.file_url.match(/\.(jpg|jpeg|png|webp|gif)$/i))
    .map(d => `https://flend.flipcash.in/media/${d.file_url}`);
    
  return (
    <Card
      title="KYC Documents"
      icon={<Shield size={16} className="text-[#1B8A05]" />}
      badge={<Pill color="bg-[#1B8A05]/10 text-[#1B8A05]">Verified</Pill>}
      defaultOpen
      accent="border-[#1B8A05]/30"
    >
      <div className="space-y-1.5 mb-3">
        {kyc.documents.map(doc => (
          <div key={doc.id} className="flex items-center justify-between py-1">
            <span className="text-xs text-gray-600 flex items-center gap-1.5">
              <FileText size={12} className="text-gray-400" />
              {typeLabels[doc.document_type] || doc.document_type}
            </span>
            <Pill color={
              doc.verification_status === 'verified' ? 'bg-green-100 text-green-700' :
              doc.verification_status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
              'bg-gray-100 text-gray-600'
            }>
              {doc.verification_status}
            </Pill>
          </div>
        ))}
      </div>
      {/*  add this string before photoUrls 'https://flend.flipcash.in/media/' */}
      <PhotoGrid photos={photoUrls} label="Captured Documents" />
      {kyc.notes && (
        <p className="text-xs text-gray-600 mt-2 bg-gray-50 rounded-lg p-2">{kyc.notes}</p>
      )}
    </Card>
  );
};

// ─────────────────────────────────────────────────────────
// PAYMENT CARD
// ─────────────────────────────────────────────────────────
const PaymentCard: React.FC<{ payment: ProgressPayload['payment'] }> = ({ payment }) => {
  if (!payment.completed) return null;

  const isCash = payment.payment_method === 'cash';
  return (
    <Card
      title="Payment Details"
      icon={<Receipt size={16} className="text-[#FEC925]" />}
      badge={<Pill color="bg-[#1B8A05]/10 text-[#1B8A05]">Processed</Pill>}
      defaultOpen
      accent="border-[#FEC925]/40"
    >
      {/* Payment method banner */}
      <div className={`flex items-center gap-3 p-3 rounded-xl mb-3 ${isCash ? 'bg-[#FEC925]/10' : 'bg-blue-50'}`}>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isCash ? 'bg-[#FEC925]/20' : 'bg-blue-100'}`}>
          {isCash ? <IndianRupee size={20} className="text-[#b48f00]" /> : <Wallet size={20} className="text-blue-600" />}
        </div>
        <div>
          <p className="text-xs text-gray-500">Payment Method</p>
          <p className="font-bold text-[#1C1C1B] text-sm">{isCash ? 'Cash Payment' : 'Partner Wallet'}</p>
        </div>
        <div className="ml-auto text-right">
          <p className="text-xs text-gray-500">Amount</p>
          <p className="font-black text-[#1B8A05] text-lg">{money(payment.amount)}</p>
        </div>
      </div>

      {payment.transaction_id && (
        <Row label="Transaction ID" value={<span className="font-mono text-[10px]">{payment.transaction_id}</span>} />
      )}
      {payment.processed_at && (
        <Row label="Processed At" value={fmt(payment.processed_at) || '—'} />
      )}

      {/* Wallet balance change */}
      {payment.wallet_balance_before != null && payment.wallet_balance_after != null && (
        <div className="mt-3 p-3 bg-gray-50 rounded-xl">
          <p className="text-xs font-semibold text-gray-500 mb-2">Wallet Impact</p>
          <div className="flex items-center justify-between">
            <div className="text-center">
              <p className="text-[10px] text-gray-400">Before</p>
              <p className="text-sm font-bold text-gray-700">{money(payment.wallet_balance_before)}</p>
            </div>
            <ArrowUpRight size={16} className={parseFloat(payment.wallet_balance_after) > parseFloat(payment.wallet_balance_before!) ? 'text-[#1B8A05]' : 'text-red-500'} />
            <div className="text-center">
              <p className="text-[10px] text-gray-400">After</p>
              <p className={`text-sm font-bold ${parseFloat(payment.wallet_balance_after) > parseFloat(payment.wallet_balance_before!) ? 'text-[#1B8A05]' : 'text-red-500'}`}>
                {money(payment.wallet_balance_after)}
              </p>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

// ─────────────────────────────────────────────────────────
// DEAL COMPLETE BANNER
// ─────────────────────────────────────────────────────────
const DealCompleteBanner: React.FC<{ summary: ProgressPayload['summary']; finalPrice: string | null }> = ({ summary, finalPrice }) => {
  if (!summary.is_completed) return null;
  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="bg-gradient-to-r from-[#1B8A05] to-[#16a34a] rounded-2xl p-5 text-white shadow-lg"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
          <BadgeCheck size={28} className="text-white" />
        </div>
        <div>
          <p className="font-black text-lg">Deal Completed! 🎉</p>
          <p className="text-white/80 text-xs">All steps successfully finished</p>
        </div>
      </div>
      {finalPrice && (
        <div className="bg-white/15 rounded-xl px-4 py-3 flex justify-between items-center">
          <span className="text-white/80 text-sm">Final Deal Value</span>
          <span className="text-2xl font-black">{money(finalPrice)}</span>
        </div>
      )}
      {summary.completed_at && (
        <p className="text-white/60 text-xs mt-2 text-right">Completed {fmt(summary.completed_at)}</p>
      )}
    </motion.div>
  );
};

// ─────────────────────────────────────────────────────────
// MAIN EXPORT: LeadProgressPanel
// ─────────────────────────────────────────────────────────
interface LeadProgressPanelProps {
  assignmentId: string;
  /** Called when we detect assignment status has changed (e.g., customer responded) */
  onStatusChange?: (newStatus: string) => void;
}

const LeadProgressPanel: React.FC<LeadProgressPanelProps> = ({ assignmentId, onStatusChange }) => {
  const { data, isLoading, error, refetch } = useLeadProgress(assignmentId, !!assignmentId);
  const prevStatusRef = useRef<string | null>(null);

  // Notify parent on status change
  useEffect(() => {
    if (!data) return;
    const s = data.summary.assignment_status;
    if (prevStatusRef.current && prevStatusRef.current !== s) {
      onStatusChange?.(s);
    }
    prevStatusRef.current = s;
  }, [data?.summary.assignment_status]);

  if (isLoading && !data) {
    return (
      <div className="flex flex-col gap-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-gray-100 rounded-2xl h-24 animate-pulse" />
        ))}
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle size={18} className="text-red-500" />
          <span className="text-sm text-red-700">Failed to load progress</span>
        </div>
        <button onClick={refetch} className="p-2 hover:bg-red-100 rounded-lg">
          <RefreshCw size={16} className="text-red-600" />
        </button>
      </div>
    );
  }

  if (!data) return null;

  const { summary, stage_timeline, device, customer, inspection, pricing, customer_response, kyc, payment } = data;

  return (
    <div className="space-y-3">

      {/* Refresh indicator */}
      {!summary.is_completed && !summary.is_failed && (
        <div className="flex items-center justify-between px-1">
          <span className="text-[10px] text-gray-400 flex items-center gap-1">
            <Clock size={10} /> Live · updates every 6s
          </span>
          <button onClick={refetch} className="p-1 hover:bg-gray-100 rounded-lg">
            <RefreshCw size={12} className="text-gray-400" />
          </button>
        </div>
      )}

      {/* Deal complete banner */}
      <DealCompleteBanner summary={summary} finalPrice={pricing.final_price} />

      {/* Stage Timeline */}
      <StageTimeline stages={stage_timeline} />

      {/* Device + Schedule */}
      <Card title="Device & Schedule" icon={<Smartphone size={16} className="text-[#FEC925]" />}>
        <Row label="Device" value={`${device.brand} ${device.model}`} />
        <Row label="Storage / Color" value={`${device.storage} · ${device.color}`} />
        <Row label="Estimated Price" value={money(device.estimated_price)} />
        {customer.preferred_date && (
          <Row label="Scheduled" value={`${customer.preferred_date} · ${customer.preferred_time_slot}`} />
        )}
      </Card>

      {/* Customer */}
      <Card title="Customer" icon={<User size={16} className="text-[#FEC925]" />}>
        <Row label="Name" value={customer.name} />
        <Row label="Phone" value={
          <a href={`tel:${customer.phone}`} className="text-blue-600 flex items-center gap-1">
            <Phone size={10} /> {customer.phone}
          </a>
        } />
        {customer.address && (
          <Row label="Address" value={
            <span className="text-right">
              {customer.address.line1}{customer.address.line2 ? `, ${customer.address.line2}` : ''}<br />
              {customer.address.city}, {customer.address.state}
            </span>
          } />
        )}
      </Card>

      {/* Inspection — only when available */}
      {inspection && <InspectionCard inspection={inspection} />}

      {/* Pricing — only when calculated */}
      {(pricing.final_price || pricing.calculated_price) && <PricingCard pricing={pricing} />}

      {/* Customer response — when inspection submitted */}
      {summary.assignment_status !== 'assigned' &&
       summary.assignment_status !== 'accepted' &&
       summary.assignment_status !== 'en_route' &&
       summary.assignment_status !== 'checked_in' &&
       summary.assignment_status !== 'code_verified' &&
       summary.assignment_status !== 'inspecting' && (
        <CustomerResponseCard cr={customer_response} finalPrice={pricing.final_price} />
      )}

      {/* KYC */}
      {kyc.completed && <KYCCard kyc={kyc} />}

      {/* Payment */}
      {payment.completed && <PaymentCard payment={payment} />}

      {/* Failed state */}
      {summary.is_failed && (
        <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <XCircle size={20} className="text-red-600" />
            <span className="font-bold text-red-700">
              {summary.assignment_status === 'customer_rejected' ? 'Customer Rejected' :
               summary.assignment_status === 'cancelled' ? 'Cancelled' : 'Rejected'}
            </span>
          </div>
          {summary.completion_notes && (
            <p className="text-xs text-red-600">{summary.completion_notes}</p>
          )}
        </div>
      )}

      {/* Last fetch time */}
      <p className="text-[9px] text-gray-300 text-center">
        Last updated {fmt(data.fetched_at)}
      </p>
    </div>
  );
};

export default LeadProgressPanel;