// src/pages/partner/profile/PartnerKycPage.tsx
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { accountService } from '../../../api/services/accountService';
import { useToast } from '../../../contexts/ToastContext';
import { Loader2, Upload, CheckCircle } from 'lucide-react';
import { type UserKYC } from '../../../api/types/api';

// Helper component to show status
const getStatusChip = (status: UserKYC['status']) => {
  const styles = {
    pending: 'bg-yellow-100 text-yellow-800', //
    submitted: 'bg-blue-100 text-blue-800',
    verified: 'bg-green-100 text-green-800', //
    rejected: 'bg-red-100 text-red-800', //
  };
  return (
    <span className={`px-3 py-1 rounded-full text-sm font-bold ${styles[status] || styles.pending}`}>
      {status.toUpperCase()}
    </span>
  );
};

// Helper component for file inputs
const FileInput: React.FC<{label: string, file: File | null, setFile: (f: File | null) => void, existingUrl: string | null | undefined, disabled: boolean}> = 
  ({ label, file, setFile, existingUrl, disabled }) => (
  <div>
    <label className="block text-sm font-semibold text-brand-black mb-2">{label}</label>
    {existingUrl && !file ? (
      <img src={existingUrl} alt={label} className="w-full h-32 object-cover rounded-lg border-2 border-gray-200" />
    ) : (
      <input
        type="file"
        accept="image/png, image/jpeg"
        onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-yellow/20 file:text-brand-black hover:file:bg-brand-yellow/40"
        disabled={disabled}
      />
    )}
    {file && (
      <p className="text-sm text-green-600 mt-2 flex items-center gap-1"><CheckCircle size={16} /> {file.name}</p>
    )}
  </div>
);


export const PartnerKycPage: React.FC = () => {
  const toast = useToast();
  const queryClient = useQueryClient();
  
  const { data: kycData, isLoading: isLoadingKyc } = useQuery({
    queryKey: ['userKyc'],
    queryFn: accountService.getKyc, //
  });

  const [docType, setDocType] = useState<'aadhaar' | 'pan' | 'driving_license' | 'passport' | 'voter_id'>('aadhaar');
  const [docNumber, setDocNumber] = useState('');
  const [frontImage, setFrontImage] = useState<File | null>(null);
  const [backImage, setBackImage] = useState<File | null>(null);
  const [selfie, setSelfie] = useState<File | null>(null);

  const kycMutation = useMutation({
    mutationFn: (formData: FormData) => accountService.uploadKyc(formData), //
    onSuccess: (_data) => {
      queryClient.invalidateQueries({ queryKey: ['userKyc'] });
      toast.success('KYC documents submitted successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'KYC submission failed.');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docNumber || !frontImage || !selfie) {
      toast.error('Please fill all required fields and upload images.');
      return;
    }

    const formData = new FormData();
    formData.append('document_type', docType); //
    formData.append('document_number', docNumber); //
    formData.append('document_front_image', frontImage); //
    formData.append('selfie_image', selfie); //
    if (backImage) {
      formData.append('document_back_image', backImage); //
    }
    
    kycMutation.mutate(formData);
  };

  if (isLoadingKyc) {
    return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;
  }

  const isVerified = kycData?.status === 'verified';

  return (
    <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg">
      <div className="flex justify-between items-center mb-6 pb-4 border-b">
        <h2 className="text-2xl font-bold text-brand-black">Identity Verification (KYC)</h2>
        {kycData && getStatusChip(kycData.status)}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-brand-black mb-2">Document Type</label>
          <select 
            value={docType}
            onChange={(e) => setDocType(e.target.value as any)}
            className="w-full p-3 border-2 border-gray-200 rounded-xl"
            disabled={isVerified}
          >
            <option value="aadhaar">Aadhaar Card</option>
            <option value="pan">PAN Card</option>
            <option value="driving_license">Driving License</option>
            <option value="voter_id">Voter ID</option>
            <option value="passport">Passport</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-brand-black mb-2">Document Number</label>
          <input
            type="text"
            placeholder={isVerified ? (kycData?.document_number || '') : "Enter document number"}
            value={docNumber}
            onChange={(e) => setDocNumber(e.target.value)}
            className="w-full p-3 border-2 border-gray-200 rounded-xl disabled:bg-gray-100"
            disabled={isVerified}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FileInput label="Front Image" file={frontImage} setFile={setFrontImage} existingUrl={kycData?.document_front_image} disabled={isVerified} />
          <FileInput label="Back Image (if any)" file={backImage} setFile={setBackImage} existingUrl={kycData?.document_back_image} disabled={isVerified} />
        </div>
        <FileInput label="Selfie" file={selfie} setFile={setSelfie} existingUrl={kycData?.selfie_image} disabled={isVerified} />

        {!isVerified && (
          <button
            type="submit"
            disabled={kycMutation.isPending}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-brand-yellow text-brand-black rounded-xl font-bold text-lg shadow-lg hover:shadow-xl disabled:opacity-50"
          >
            {kycMutation.isPending ? <Loader2 className="animate-spin" /> : <Upload size={20} />}
            Submit KYC
          </button>
        )}
      </form>
    </div>
  );
};