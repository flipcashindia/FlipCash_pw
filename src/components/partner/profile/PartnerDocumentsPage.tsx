// src/pages/partner/profile/PartnerDocumentsPage.tsx
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { partnerService } from '../../../api/services/partnerService';
import { useToast } from '../../../contexts/ToastContext';
import {
  Loader2, Upload, FileText, X, Eye, RefreshCw,
  CheckCircle, Clock, AlertCircle, Search, Shield,
  FileImage, FileBadge,
} from 'lucide-react';
import { type PartnerDocument, type PartnerDocumentType } from '../../../api/types/api';

// ── Types ─────────────────────────────────────────────────────────────────────

interface DocTypeOption {
  value: PartnerDocumentType;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const DOC_TYPES: DocTypeOption[] = [
  { value: 'pan',              label: 'PAN Card',        icon: <FileBadge size={16} />, description: 'Permanent Account Number' },
  { value: 'aadhaar',         label: 'Aadhaar Card',    icon: <Shield size={16} />,    description: '12-digit UID' },
  { value: 'gst',             label: 'GST Certificate', icon: <FileText size={16} />,  description: 'Business GST registration' },
  { value: 'business_license',label: 'Business License',icon: <FileBadge size={16} />, description: 'Trade / Shop license' },
  { value: 'address_proof',   label: 'Address Proof',   icon: <FileText size={16} />,  description: 'Utility bill, rent deed etc.' },
  { value: 'photo',           label: 'Photograph',      icon: <FileImage size={16} />, description: 'Passport size photo' },
];

const STATUS_CONFIG = {
  pending:   { color: 'bg-amber-100 text-amber-700 border-amber-200',   icon: <Clock size={12} />,        label: 'Pending' },
  in_review: { color: 'bg-blue-100 text-blue-700 border-blue-200',      icon: <Search size={12} />,       label: 'In Review' },
  verified:  { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: <CheckCircle size={12} />, label: 'Verified' },
  rejected:  { color: 'bg-red-100 text-red-700 border-red-200',         icon: <AlertCircle size={12} />,  label: 'Rejected' },
};

// ── Status Chip ───────────────────────────────────────────────────────────────

const StatusChip: React.FC<{ status: PartnerDocument['verification_status'] }> = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${cfg.color}`}>
      {cfg.icon}
      {cfg.label}
    </span>
  );
};

// ── Document Card ─────────────────────────────────────────────────────────────

const DocumentCard: React.FC<{
  doc: PartnerDocument;
  onDelete: (doc: PartnerDocument) => void;
  onReplace: (doc: PartnerDocument) => void;
  isDeleting: boolean;
}> = ({ doc, onDelete, onReplace, isDeleting }) => {
  const typeInfo = DOC_TYPES.find(t => t.value === doc.document_type);
  const isVerified = doc.verification_status === 'verified';
  const canReplace = !isVerified;
  const isImage = doc.document_url?.match(/\.(jpg|jpeg|png|webp|gif)$/i);

  return (
    <div className={`relative rounded-2xl border-2 overflow-hidden transition-all duration-200 hover:shadow-md ${
      isVerified ? 'border-emerald-200 bg-emerald-50/30' : 
      doc.verification_status === 'rejected' ? 'border-red-200 bg-red-50/20' :
      'border-gray-200 bg-white'
    }`}>
      {/* Verified ribbon */}
      {isVerified && (
        <div className="absolute top-3 right-3">
          <div className="flex items-center gap-1 bg-emerald-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
            <CheckCircle size={11} /> Verified
          </div>
        </div>
      )}

      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* Document Preview / Icon */}
          <div className={`w-16 h-16 rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden border-2 ${
            isVerified ? 'border-emerald-200 bg-emerald-50' : 'border-gray-200 bg-gray-50'
          }`}>
            {doc.document_url && isImage ? (
              <img
                src={doc.document_url}
                alt={doc.document_type}
                className="w-full h-full object-cover"
              />
            ) : doc.document_url ? (
              <FileText size={24} className={isVerified ? 'text-emerald-500' : 'text-gray-400'} />
            ) : (
              <FileText size={24} className="text-gray-300" />
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-gray-900 capitalize text-sm">
                {typeInfo?.label || doc.document_type.replace(/_/g, ' ')}
              </h3>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">{typeInfo?.description}</p>
            <div className="mt-2">
              <StatusChip status={doc.verification_status} />
            </div>
            {doc.verification_notes && (
              <p className={`text-xs mt-2 p-2 rounded-lg ${
                doc.verification_status === 'rejected' ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-600'
              }`}>
                {doc.verification_notes}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
          {doc.document_url && (
            <a
              href={doc.document_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Eye size={14} /> View Document
            </a>
          )}
          {canReplace && (
            <button
              onClick={() => onReplace(doc)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#1a1a1a] bg-[#FEC925] rounded-lg hover:bg-[#f0bc1a] transition-colors"
            >
              <RefreshCw size={14} /> Re-upload
            </button>
          )}
          {!isVerified && (
            <button
              onClick={() => onDelete(doc)}
              disabled={isDeleting}
              className="ml-auto flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-40"
            >
              <X size={14} /> Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Upload Form ───────────────────────────────────────────────────────────────

const UploadForm: React.FC<{
  prefillType?: PartnerDocumentType;
  isLoading: boolean;
  onSubmit: (fd: FormData) => void;
  onCancel?: () => void;
}> = ({ prefillType, isLoading, onSubmit, onCancel }) => {
  const [docType, setDocType] = useState<PartnerDocumentType>(prefillType ?? 'pan');
  const [docFile, setDocFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docFile) return;
    const fd = new FormData();
    fd.append('document_type', docType);
    fd.append('document_file', docFile);
    onSubmit(fd);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) setDocFile(file);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Doc Type Picker */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2.5">Document Type</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {DOC_TYPES.map(t => (
            <button
              key={t.value}
              type="button"
              onClick={() => setDocType(t.value)}
              className={`flex items-center gap-2 p-3 rounded-xl border-2 text-left transition-all text-xs font-semibold ${
                docType === t.value
                  ? 'border-[#FEC925] bg-[#FEC925]/10 text-gray-900'
                  : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <span className={docType === t.value ? 'text-[#1a1a1a]' : 'text-gray-400'}>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Drop Zone */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Upload File</label>
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-150 ${
            dragOver
              ? 'border-[#FEC925] bg-[#FEC925]/10'
              : docFile
              ? 'border-emerald-400 bg-emerald-50'
              : 'border-gray-300 bg-gray-50 hover:border-[#FEC925] hover:bg-[#FEC925]/5'
          }`}
        >
          <input
            type="file"
            accept="image/png,image/jpeg,application/pdf"
            onChange={(e) => setDocFile(e.target.files?.[0] ?? null)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          {docFile ? (
            <div className="flex items-center justify-center gap-2">
              <CheckCircle size={20} className="text-emerald-500" />
              <span className="text-sm font-semibold text-emerald-700">{docFile.name}</span>
              <span className="text-xs text-gray-500">({(docFile.size / 1024).toFixed(0)} KB)</span>
            </div>
          ) : (
            <div>
              <Upload size={28} className="mx-auto text-gray-400 mb-2" />
              <p className="text-sm font-semibold text-gray-600">Drop file here or click to browse</p>
              <p className="text-xs text-gray-400 mt-1">JPG, PNG, PDF up to 10MB</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isLoading || !docFile}
          className="flex items-center gap-2 px-6 py-3 bg-[#FEC925] text-[#1a1a1a] rounded-xl font-bold text-sm shadow-sm hover:bg-[#f0bc1a] active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
          Upload Document
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-3 border-2 border-gray-200 text-gray-600 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────

export const PartnerDocumentsPage: React.FC = () => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [replaceDoc, setReplaceDoc] = useState<PartnerDocument | null>(null);

  const { data: documents, isLoading: isLoadingDocs } = useQuery({
    queryKey: ['partnerDocuments'],
    queryFn: partnerService.getDocuments,
  });

  const uploadMutation = useMutation({
    mutationFn: (formData: FormData) => partnerService.uploadDocument(formData),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['partnerDocuments'] });
      toast.success(`${DOC_TYPES.find(t => t.value === data.document_type)?.label ?? data.document_type} uploaded successfully!`);
      setShowUploadForm(false);
      setReplaceDoc(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Document upload failed.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (docId: string) => partnerService.deleteDocument(docId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partnerDocuments'] });
      toast.success('Document deleted.');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to delete document.');
    },
  });

  const handleDelete = (doc: PartnerDocument) => {
    if (doc.verification_status === 'verified') {
      toast.error('Cannot delete a verified document.');
      return;
    }
    if (window.confirm(`Delete your ${doc.document_type.replace(/_/g, ' ')} document?`)) {
      deleteMutation.mutate(doc.id);
    }
  };

  const handleReplace = (doc: PartnerDocument) => {
    setReplaceDoc(doc);
    setShowUploadForm(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Stats
  const verifiedCount = documents?.filter(d => d.verification_status === 'verified').length ?? 0;
  const totalCount = documents?.length ?? 0;

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900">Partner Documents</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Upload and manage your verification documents
          </p>
        </div>
        <div className="flex items-center gap-3">
          {totalCount > 0 && (
            <span className="text-sm font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full">
              {verifiedCount}/{totalCount} verified
            </span>
          )}
          <button
            onClick={() => { setShowUploadForm(!showUploadForm); setReplaceDoc(null); }}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#1a1a1a] text-white rounded-xl font-bold text-sm hover:bg-[#2d2d2d] transition-colors"
          >
            <Upload size={16} />
            Upload New
          </button>
        </div>
      </div>

      {/* ── Re-upload (replace) Banner ── */}
      {replaceDoc && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <RefreshCw size={18} className="text-amber-600" />
            <h3 className="font-bold text-amber-800">
              Re-uploading: {DOC_TYPES.find(t => t.value === replaceDoc.document_type)?.label}
            </h3>
          </div>
          <UploadForm
            prefillType={replaceDoc.document_type}
            isLoading={uploadMutation.isPending}
            onSubmit={uploadMutation.mutate}
            onCancel={() => setReplaceDoc(null)}
          />
        </div>
      )}

      {/* ── New Upload Form ── */}
      {showUploadForm && !replaceDoc && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
          <h3 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
            <Upload size={18} className="text-[#FEC925]" />
            Upload New Document
          </h3>
          <UploadForm
            isLoading={uploadMutation.isPending}
            onSubmit={uploadMutation.mutate}
            onCancel={() => setShowUploadForm(false)}
          />
        </div>
      )}

      {/* ── Documents List ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 md:px-8 py-5 border-b border-gray-100 flex items-center gap-3">
          <div className="p-2 bg-[#FEC925]/10 rounded-xl">
            <FileText size={20} className="text-[#1a1a1a]" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Submitted Documents</h2>
            <p className="text-xs text-gray-500">Verified documents are locked; others can be re-uploaded</p>
          </div>
        </div>

        <div className="p-6 md:p-8">
          {isLoadingDocs ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-28 bg-gray-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : documents && documents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {documents.map(doc => (
                <DocumentCard
                  key={doc.id}
                  doc={doc}
                  onDelete={handleDelete}
                  onReplace={handleReplace}
                  isDeleting={deleteMutation.isPending}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FileText size={28} className="text-gray-400" />
              </div>
              <h3 className="font-bold text-gray-700 mb-1">No documents yet</h3>
              <p className="text-sm text-gray-500 mb-4">Upload your identity and business documents to get verified</p>
              <button
                onClick={() => setShowUploadForm(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FEC925] text-[#1a1a1a] rounded-xl font-bold text-sm hover:bg-[#f0bc1a] transition-colors"
              >
                <Upload size={16} /> Upload First Document
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Required Documents Checklist ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 md:px-8 py-5 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">Required Documents Checklist</h2>
        </div>
        <div className="p-6 md:p-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {DOC_TYPES.map(t => {
            const submitted = documents?.find(d => d.document_type === t.value);
            const isVerified = submitted?.verification_status === 'verified';
            const isPending = submitted && !isVerified;
            return (
              <div key={t.value} className={`flex items-center gap-3 p-3 rounded-xl border ${
                isVerified ? 'border-emerald-200 bg-emerald-50' :
                isPending  ? 'border-amber-200 bg-amber-50/50' :
                             'border-gray-200 bg-gray-50'
              }`}>
                <div className={`p-1.5 rounded-lg ${
                  isVerified ? 'bg-emerald-100 text-emerald-600' :
                  isPending  ? 'bg-amber-100 text-amber-600' :
                               'bg-gray-100 text-gray-400'
                }`}>
                  {isVerified ? <CheckCircle size={14} /> : isPending ? <Clock size={14} /> : t.icon}
                </div>
                <div>
                  <p className={`text-xs font-bold ${isVerified ? 'text-emerald-700' : isPending ? 'text-amber-700' : 'text-gray-500'}`}>
                    {t.label}
                  </p>
                  <p className="text-xs text-gray-400">
                    {isVerified ? 'Verified' : isPending ? `Status: ${submitted?.verification_status}` : 'Not uploaded'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};