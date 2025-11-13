import React, { } from 'react';
// import { usePartner } from '../../hooks/usePartner';
// import { useImageUpload } from '../../hooks/useImageUpload';
// import { useToast } from '../../contexts/ToastContext';
// import { partnerService } from '../../api/services/partnerService';
// import { Upload, CheckCircle } from 'lucide-react';
// import { Loader } from '../common/Loader';

interface KYCVerificationProps {
  partnerData: { name: string; email: string; mobile: string };
  onKycComplete: () => void;
}

const KYCVerification: React.FC<KYCVerificationProps> = ({ }) => {
  // const { partner, loadProfile } = usePartner();
  // const { uploadImages, uploading } = useImageUpload();
  // const toast = useToast();
  // const [documents, setDocuments] = useState({
  //   aadhaar: null as File | null,
  //   pan: null as File | null,
  //   bank_proof: null as File | null,
  // });
//   const [submitting, setSubmitting] = useState(false);

//   const handleFileChange = (type: keyof typeof documents, file: File | null) => {
//     setDocuments(prev => ({ ...prev, [type]: file }));
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
    
//     if (!documents.aadhaar || !documents.pan || !documents.bank_proof) {
//       toast.error('Please upload all required documents');
//       return;
//     }
// // 
//     try {
//       setSubmitting(true);

//       const files = [documents.aadhaar, documents.pan, documents.bank_proof];
//       const urls = await uploadImages(files);

//       await partnerService.uploadKYCDocument(new FormData());
      
//       await partnerService.submitKYC();
//       toast.success('KYC documents submitted successfully!');
      
//       await loadProfile();
//       onKycComplete();
//     } catch (error) {
//       toast.error('Failed to submit KYC documents');
//     } finally {
//       setSubmitting(false);
//     }
//   };

  // if (uploading || submitting) {
  //   return <Loader />;
  // }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-2">Complete KYC Verification</h1>
        <p className="text-gray-600 mb-8">Upload your documents to get verified</p>

        {/* <form onSubmit={handleSubmit} className="space-y-6">
          {['aadhaar', 'pan', 'bank_proof'].map((docType) => (
            <div key={docType} className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                {docType.replace('_', ' ')} <span className="text-red-500">*</span>
              </label>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => handleFileChange(docType as keyof typeof documents, e.target.files?.[0] || null)}
                className="w-full"
              />
              {documents[docType as keyof typeof documents] && (
                <div className="mt-2 flex items-center text-green-600">
                  <CheckCircle size={16} className="mr-1" />
                  <span className="text-sm">{documents[docType as keyof typeof documents]?.name}</span>
                </div>
              )}
            </div>
          ))} */}

          {/* <button
            type="submit"
            disabled={submitting}
            className="w-full bg-teal-500 text-white py-3 rounded-lg font-semibold hover:bg-teal-600 disabled:opacity-50"
          >
            Submit KYC
          </button>
        </form> */}
      </div>
    </div>
  );
};

export default KYCVerification;