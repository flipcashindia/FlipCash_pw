// src/pages/partner/profile/PartnerKycPage.tsx
import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { accountService } from '../../../api/services/accountService';
import { useToast } from '../../../contexts/ToastContext';
import {
  Loader2, Upload, CheckCircle, AlertCircle, Clock,
  Search, Shield, Eye, RefreshCw, User, FileText,
  Camera,
} from 'lucide-react';
import { type UserKYC } from '../../../api/types/api';

// ── Types & Constants ─────────────────────────────────────────────────────────

type DocType = 'aadhaar' | 'pan' | 'driving_license' | 'passport' | 'voter_id';

const DOC_TYPES: { value: DocType; label: string; hasBack: boolean; numberHint: string }[] = [
  { value: 'aadhaar',          label: 'Aadhaar Card',       hasBack: true,  numberHint: '12-digit Aadhaar number' },
  { value: 'pan',              label: 'PAN Card',           hasBack: false, numberHint: 'e.g., ABCDE1234F' },
  { value: 'driving_license',  label: 'Driving License',    hasBack: true,  numberHint: 'e.g., MH-0120110101234' },
  { value: 'voter_id',         label: 'Voter ID',           hasBack: true,  numberHint: 'e.g., ABC1234567' },
  { value: 'passport',         label: 'Passport',           hasBack: false, numberHint: 'e.g., A1234567' },
];

const STATUS_MAP = {
  pending:   { color: 'bg-amber-100 text-amber-700 border-amber-200',    icon: <Clock size={14} />,        label: 'Pending Submission',  desc: 'Submit your KYC documents to get verified' },
  submitted: { color: 'bg-blue-100 text-blue-700 border-blue-200',       icon: <Search size={14} />,       label: 'Under Review',        desc: 'Our team is reviewing your documents (1-2 business days)' },
  verified:  { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: <CheckCircle size={14} />, label: 'KYC Verified',       desc: 'Your identity has been verified successfully' },
  rejected:  { color: 'bg-red-100 text-red-700 border-red-200',          icon: <AlertCircle size={14} />,  label: 'Rejected',            desc: 'Please re-submit with correct documents' },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const StatusBanner: React.FC<{ status: UserKYC['status']; notes?: string }> = ({ status, notes }) => {
  const cfg = STATUS_MAP[status] || STATUS_MAP.pending;
  return (
    <div className={`flex items-start gap-3 p-4 rounded-xl border ${cfg.color}`}>
      <div className="flex-shrink-0 mt-0.5">{cfg.icon}</div>
      <div>
        <p className="font-bold text-sm">{cfg.label}</p>
        <p className="text-xs mt-0.5 opacity-80">{cfg.desc}</p>
        {notes && status === 'rejected' && (
          <p className="text-xs mt-2 font-semibold">Reason: {notes}</p>
        )}
      </div>
    </div>
  );
};

// ── Image Upload Slot ─────────────────────────────────────────────────────────

const ImageSlot: React.FC<{
  label: string;
  icon: React.ReactNode;
  file: File | null;
  existingUrl?: string | null;
  disabled: boolean;
  required?: boolean;
  onFile: (f: File | null) => void;
}> = ({ label, icon, file, existingUrl, disabled, required, onFile }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const preview = file ? URL.createObjectURL(file) : null;
  const displayUrl = preview || existingUrl;

  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div
        className={`relative rounded-xl overflow-hidden border-2 transition-all duration-150 ${
          disabled
            ? 'border-gray-200 cursor-default'
            : dragOver
            ? 'border-[#FEC925] bg-[#FEC925]/10 cursor-pointer'
            : file
            ? 'border-emerald-400 cursor-pointer'
            : 'border-dashed border-gray-300 hover:border-[#FEC925] cursor-pointer'
        }`}
        style={{ minHeight: 140 }}
        onClick={() => !disabled && inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); if (!disabled) setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => {
          e.preventDefault(); setDragOver(false);
          if (!disabled) onFile(e.dataTransfer.files[0] ?? null);
        }}
      >
        {displayUrl ? (
          <>
            <img src={displayUrl} alt={label} className="w-full h-36 object-cover" />
            {!disabled && (
              <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); window.open(displayUrl, '_blank'); }}
                  className="p-1.5 bg-white rounded-lg text-gray-700 hover:bg-gray-100"
                >
                  <Eye size={14} />
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onFile(null); }}
                  className="p-1.5 bg-white rounded-lg text-red-500 hover:bg-red-50"
                >
                  <RefreshCw size={14} />
                </button>
              </div>
            )}
            {file && (
              <div className="absolute bottom-0 left-0 right-0 bg-emerald-500/90 text-white text-xs py-1 px-2 flex items-center gap-1">
                <CheckCircle size={11} /> New file selected
              </div>
            )}
          </>
        ) : (
          <div className="h-36 flex flex-col items-center justify-center gap-2 text-gray-400 p-4">
            <div className="p-2.5 bg-gray-100 rounded-xl">{icon}</div>
            <p className="text-xs font-medium text-center">
              {disabled ? 'Not uploaded' : 'Click or drag to upload'}
            </p>
            {!disabled && <p className="text-xs text-gray-400">JPG or PNG</p>}
          </div>
        )}
      </div>
      {!disabled && (
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={e => onFile(e.target.files?.[0] ?? null)}
        />
      )}
    </div>
  );
};

// ── Verified View ─────────────────────────────────────────────────────────────

const VerifiedKycView: React.FC<{ kyc: UserKYC }> = ({ kyc }) => {
  const docInfo = DOC_TYPES.find(d => d.value === kyc.document_type);
  return (
    <div className="space-y-6">
      <StatusBanner status="verified" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
          <p className="text-xs text-gray-500 mb-1">Document Type</p>
          <p className="font-bold text-gray-900">{docInfo?.label ?? kyc.document_type}</p>
        </div>
        <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
          <p className="text-xs text-gray-500 mb-1">Document Number</p>
          <p className="font-bold font-mono text-gray-900">{kyc.document_number}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {kyc.document_front_image && (
          <div>
            <p className="text-xs font-semibold text-gray-600 mb-2">Front Image</p>
            <a href={kyc.document_front_image} target="_blank" rel="noopener noreferrer">
              <img
                src={kyc.document_front_image}
                alt="Front"
                className="w-full h-36 object-cover rounded-xl border-2 border-emerald-200 hover:opacity-90 transition-opacity"
              />
            </a>
          </div>
        )}
        {kyc.document_back_image && (
          <div>
            <p className="text-xs font-semibold text-gray-600 mb-2">Back Image</p>
            <a href={kyc.document_back_image} target="_blank" rel="noopener noreferrer">
              <img
                src={kyc.document_back_image}
                alt="Back"
                className="w-full h-36 object-cover rounded-xl border-2 border-emerald-200 hover:opacity-90 transition-opacity"
              />
            </a>
          </div>
        )}
        {kyc.selfie_image && (
          <div>
            <p className="text-xs font-semibold text-gray-600 mb-2">Selfie</p>
            <a href={kyc.selfie_image} target="_blank" rel="noopener noreferrer">
              <img
                src={kyc.selfie_image}
                alt="Selfie"
                className="w-full h-36 object-cover rounded-xl border-2 border-emerald-200 hover:opacity-90 transition-opacity"
              />
            </a>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
        <Shield size={14} className="text-emerald-600 flex-shrink-0" />
        <p className="text-xs text-emerald-700">
          Your KYC is verified and locked. Contact support if you need to update your documents.
        </p>
      </div>
    </div>
  );
};

// ── Submission Form ───────────────────────────────────────────────────────────

const KycForm: React.FC<{
  existingKyc: UserKYC | null | undefined;
  isLoading: boolean;
  onSubmit: (fd: FormData) => void;
}> = ({ existingKyc, isLoading, onSubmit }) => {
  const [docType, setDocType] = useState<DocType>(existingKyc?.document_type as DocType ?? 'aadhaar');
  const [docNumber, setDocNumber] = useState(existingKyc?.document_number ?? '');
  const [frontImage, setFrontImage] = useState<File | null>(null);
  const [backImage, setBackImage]   = useState<File | null>(null);
  const [selfie, setSelfie]         = useState<File | null>(null);
  const [errors, setErrors]         = useState<Record<string, string>>({});

  const selectedDoc = DOC_TYPES.find(d => d.value === docType)!;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!docNumber.trim()) errs.docNumber = 'Document number is required';
    if (!frontImage && !existingKyc?.document_front_image) errs.front = 'Front image is required';
    if (!selfie && !existingKyc?.selfie_image)             errs.selfie = 'Selfie is required';
    return errs;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    const fd = new FormData();
    fd.append('document_type', docType);
    fd.append('document_number', docNumber);
    if (frontImage) fd.append('document_front_image', frontImage);
    if (backImage)  fd.append('document_back_image',  backImage);
    if (selfie)     fd.append('selfie_image',         selfie);
    onSubmit(fd);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Doc Type Selector */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2.5">Select Document Type</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          {DOC_TYPES.map(d => (
            <button
              key={d.value}
              type="button"
              onClick={() => { setDocType(d.value); setErrors({}); }}
              className={`py-2.5 px-3 rounded-xl border-2 text-xs font-semibold transition-all ${
                docType === d.value
                  ? 'border-[#FEC925] bg-[#FEC925]/10 text-gray-900'
                  : 'border-gray-200 text-gray-500 hover:border-gray-300'
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Document Number */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Document Number <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={docNumber}
          onChange={e => { setDocNumber(e.target.value.toUpperCase()); if (errors.docNumber) setErrors(p => ({...p, docNumber: ''})); }}
          placeholder={selectedDoc.numberHint}
          className={`w-full p-3.5 border-2 rounded-xl font-mono text-sm focus:outline-none transition-colors ${
            errors.docNumber ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-[#FEC925]'
          }`}
        />
        {errors.docNumber && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={11} />{errors.docNumber}</p>}
      </div>

      {/* Images */}
      <div className={`grid gap-4 ${selectedDoc.hasBack ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2'}`}>
        <div>
          <ImageSlot
            label="Front Image"
            icon={<FileText size={20} />}
            file={frontImage}
            existingUrl={existingKyc?.document_front_image}
            disabled={false}
            required
            onFile={f => { setFrontImage(f); if (errors.front) setErrors(p => ({...p, front: ''})); }}
          />
          {errors.front && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={11} />{errors.front}</p>}
        </div>
        {selectedDoc.hasBack && (
          <ImageSlot
            label="Back Image"
            icon={<FileText size={20} />}
            file={backImage}
            existingUrl={existingKyc?.document_back_image}
            disabled={false}
            onFile={setBackImage}
          />
        )}
        <div>
          <ImageSlot
            label="Selfie with Document"
            icon={<Camera size={20} />}
            file={selfie}
            existingUrl={existingKyc?.selfie_image}
            disabled={false}
            required
            onFile={f => { setSelfie(f); if (errors.selfie) setErrors(p => ({...p, selfie: ''})); }}
          />
          {errors.selfie && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={11} />{errors.selfie}</p>}
        </div>
      </div>

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-2">
        <p className="text-xs font-bold text-blue-800">Tips for a successful KYC</p>
        <ul className="space-y-1">
          {[
            'Ensure all text on the document is clearly visible',
            'Use good lighting — avoid shadows',
            'For selfie, hold the document next to your face',
            'Avoid uploading blurry or cropped images',
          ].map(tip => (
            <li key={tip} className="flex items-start gap-1.5 text-xs text-blue-700">
              <CheckCircle size={11} className="mt-0.5 flex-shrink-0" />
              {tip}
            </li>
          ))}
        </ul>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#FEC925] text-[#1a1a1a] rounded-xl font-bold text-base shadow-md hover:bg-[#f0bc1a] active:scale-[0.99] transition-all disabled:opacity-50"
      >
        {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Upload size={20} />}
        {existingKyc ? 'Re-submit KYC' : 'Submit KYC'}
      </button>
    </form>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────

export const PartnerKycPage: React.FC = () => {
  const toast = useToast();
  const queryClient = useQueryClient();

  const { data: kycData, isLoading } = useQuery({
    queryKey: ['userKyc'],
    queryFn: accountService.getKyc,
  });

  const kycMutation = useMutation({
    mutationFn: (fd: FormData) => accountService.uploadKyc(fd),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userKyc'] });
      toast.success('KYC submitted successfully! We will review within 1-2 business days.');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'KYC submission failed. Please try again.');
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-20 bg-gray-100 rounded-2xl" />
        <div className="h-12 bg-gray-100 rounded-2xl" />
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-40 bg-gray-100 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  const isVerified  = kycData?.status === 'verified';
  const isSubmitted = kycData?.status === 'submitted';
  const canSubmit   = !isVerified && !isSubmitted;

  return (
    <div className="space-y-6">
      {/* ── Header Card ── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#1a1a1a] to-[#2d2d2d] rounded-2xl p-6 shadow-xl">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#FEC925] rounded-full blur-3xl opacity-15" />
        <div className="relative flex items-center gap-4">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${
            isVerified ? 'bg-emerald-500' : 'bg-[#FEC925]'
          }`}>
            {isVerified ? <Shield size={26} className="text-white" /> : <User size={26} className="text-[#1a1a1a]" />}
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white">Identity Verification (KYC)</h1>
            <p className="text-gray-400 text-sm mt-0.5">
              {isVerified
                ? 'Your identity is verified'
                : 'Required to start receiving leads'}
            </p>
          </div>
          {kycData && (
            <div className="ml-auto">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${STATUS_MAP[kycData.status]?.color}`}>
                {STATUS_MAP[kycData.status]?.icon}
                {STATUS_MAP[kycData.status]?.label}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── Content ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 md:px-8 py-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">
            {isVerified ? 'Verified Documents' : isSubmitted ? 'Submitted Documents' : 'Submit Your Documents'}
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            {isVerified
              ? 'Your documents are locked after verification'
              : 'Upload clear photos of your government-issued ID'}
          </p>
        </div>

        <div className="p-6 md:p-8">
          {isVerified ? (
            <VerifiedKycView kyc={kycData!} />
          ) : isSubmitted ? (
            <div className="space-y-6">
              <StatusBanner status="submitted" />
              {/* Show submitted data read-only */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <p className="text-xs text-gray-500 mb-1">Document Type</p>
                  <p className="font-bold text-gray-900">
                    {DOC_TYPES.find(d => d.value === kycData?.document_type)?.label ?? kycData?.document_type}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <p className="text-xs text-gray-500 mb-1">Document Number</p>
                  <p className="font-bold font-mono text-gray-900">{kycData?.document_number}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {kycData?.document_front_image && (
                  <div>
                    <p className="text-xs font-semibold text-gray-600 mb-2">Front Image</p>
                    <img src={kycData.document_front_image} alt="Front" className="w-full h-36 object-cover rounded-xl border-2 border-gray-200" />
                  </div>
                )}
                {kycData?.document_back_image && (
                  <div>
                    <p className="text-xs font-semibold text-gray-600 mb-2">Back Image</p>
                    <img src={kycData.document_back_image} alt="Back" className="w-full h-36 object-cover rounded-xl border-2 border-gray-200" />
                  </div>
                )}
                {kycData?.selfie_image && (
                  <div>
                    <p className="text-xs font-semibold text-gray-600 mb-2">Selfie</p>
                    <img src={kycData.selfie_image} alt="Selfie" className="w-full h-36 object-cover rounded-xl border-2 border-gray-200" />
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              {kycData && <StatusBanner status={kycData.status} notes={kycData.rejection_notes} />}
              {canSubmit && (
                <div className="mt-6">
                  <KycForm
                    existingKyc={kycData}
                    isLoading={kycMutation.isPending}
                    onSubmit={kycMutation.mutate}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};