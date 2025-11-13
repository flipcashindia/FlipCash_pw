// src/pages/partner/profile/PartnerDocumentsPage.tsx
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { partnerService } from '../../../api/services/partnerService';
import { useToast } from '../../../contexts/ToastContext';
import { Loader2, Upload, FileText, X } from 'lucide-react';
import { type PartnerDocument, type PartnerDocumentType } from '../../../api/types/api';

const getStatusChip = (status: PartnerDocument['verification_status']) => {
  const styles = {
    pending: 'bg-yellow-100 text-yellow-800', //
    in_review: 'bg-blue-100 text-blue-800', //
    verified: 'bg-green-100 text-green-800', //
    rejected: 'bg-red-100 text-red-800', //
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold ${styles[status] || styles.pending}`}>
      {status.toUpperCase()}
    </span>
  );
};

export const PartnerDocumentsPage: React.FC = () => {
  const toast = useToast();
  const queryClient = useQueryClient();
  
  const { data: documents, isLoading: isLoadingDocs } = useQuery({
    queryKey: ['partnerDocuments'],
    queryFn: partnerService.getDocuments, //
  });

  const [docType, setDocType] = useState<PartnerDocumentType>('pan');
  const [docFile, setDocFile] = useState<File | null>(null);

  const uploadMutation = useMutation({
    mutationFn: (formData: FormData) => partnerService.uploadDocument(formData), //
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['partnerDocuments'] });
      toast.success(`${data.document_type.toUpperCase()} uploaded!`);
      setDocFile(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Document upload failed.');
    }
  });
  
  const deleteMutation = useMutation({
    mutationFn: (docId: string) => partnerService.deleteDocument(docId), //
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partnerDocuments'] });
      toast.success('Document deleted.');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to delete document.');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docFile) {
      toast.error('Please select a file to upload.');
      return;
    }
    const formData = new FormData();
    formData.append('document_type', docType); //
    formData.append('document_file', docFile); //
    uploadMutation.mutate(formData);
  };
  
  const handleDelete = (doc: PartnerDocument) => {
    if (doc.verification_status === 'verified') {
      toast.error('Cannot delete a verified document.'); //
      return;
    }
    if (window.confirm(`Are you sure you want to delete your ${doc.document_type.toUpperCase()}?`)) {
      deleteMutation.mutate(doc.id);
    }
  };

  return (
    <div className="space-y-8">
      {/* --- Upload Form --- */}
      <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-brand-black mb-6 pb-4 border-b">Upload Partner Documents</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-brand-black mb-2">Document Type</label>
              <select 
                value={docType}
                onChange={(e) => setDocType(e.target.value as PartnerDocumentType)}
                className="w-full p-3 border-2 border-gray-200 rounded-xl"
              >
                <option value="pan">PAN Card</option>
                <option value="aadhaar">Aadhaar Card</option>
                <option value="gst">GST Certificate</option>
                <option value="business_license">Business License</option>
                <option value="address_proof">Address Proof</option>
                <option value="photo">Photograph</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-brand-black mb-2">File</label>
              <input
                type="file"
                accept="image/png, image/jpeg, application/pdf" //
                onChange={(e) => setDocFile(e.target.files ? e.target.files[0] : null)}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-yellow/20 file:text-brand-black hover:file:bg-brand-yellow/40"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={uploadMutation.isPending}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-brand-yellow text-brand-black rounded-xl font-bold text-lg shadow-lg hover:shadow-xl disabled:opacity-50"
          >
            {uploadMutation.isPending ? <Loader2 className="animate-spin" /> : <Upload size={20} />}
            Upload Document
          </button>
        </form>
      </div>

      {/* --- Submitted Documents List --- */}
      <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-brand-black mb-6 pb-4 border-b">My Documents</h2>
        {isLoadingDocs ? (
          <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
        ) : (
          <div className="space-y-3">
            {documents && documents.length > 0 ? (
              documents.map(doc => (
                <div key={doc.id} className="flex items-center justify-between p-4 bg-brand-gray-light/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-brand-black" />
                    <div>
                      <a 
                        href={doc.document_url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="font-semibold text-brand-black hover:underline capitalize"
                      >
                        {doc.document_type.replace('_', ' ')}
                      </a>
                      <p className="text-xs text-gray-500">{doc.verification_notes}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusChip(doc.verification_status)}
                    <button 
                      onClick={() => handleDelete(doc)} 
                      disabled={deleteMutation.isPending}
                      className="text-brand-red hover:opacity-70 disabled:opacity-30"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">You have not uploaded any documents.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};