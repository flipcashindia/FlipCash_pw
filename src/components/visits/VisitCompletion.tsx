// import React, { useState } from 'react';
// import { visitsService } from '../../api/services/visitsService';
// import { useToast } from '../../contexts/ToastContext';
// import { formatCurrency } from '../../utils/formatters';
// import { Button } from '../common/Button';

// interface VisitCompletionProps {
//   visitId: string;
//   finalPrice: number;
//   onCompleteSuccess: () => void;
// }

// const VisitCompletion: React.FC<VisitCompletionProps> = ({ visitId, finalPrice, onCompleteSuccess }) => {
//   const toast = useToast();
//   const [completing, setCompleting] = useState(false);
//   const [paymentMethod, setPaymentMethod] = useState<'cash' | 'upi' | 'bank_transfer'>('cash');

//   const handleComplete = async () => {
//     try {
//       setCompleting(true);
//       await visitsService.finalize(visitId, { final_price: finalPrice, payment_method: paymentMethod });
//       toast.success('Visit completed successfully');
//       onCompleteSuccess();
//     } catch (error) {
//       toast.error('Failed to complete visit');
//     } finally {
//       setCompleting(false);
//     }
//   };

//   return (
//     <div className="bg-white p-6 rounded-xl shadow-lg">
//       <h2 className="text-2xl font-bold mb-4">Complete Visit</h2>
//       <div className="space-y-4">
//         <div className="bg-green-50 p-4 rounded-lg text-center">
//           <p className="text-sm text-gray-600">Final Price</p>
//           <p className="text-3xl font-bold text-green-600">{formatCurrency(finalPrice)}</p>
//         </div>
//         <div>
//           <label className="block text-sm font-medium mb-2">Payment Method</label>
//           <div className="space-y-2">
//             {(['cash', 'upi', 'bank_transfer'] as const).map((method) => (
//               <label key={method} className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
//                 <input type="radio" checked={paymentMethod === method} onChange={() => setPaymentMethod(method)} />
//                 <span className="capitalize">{method.replace('_', ' ')}</span>
//               </label>
//             ))}
//           </div>
//         </div>
//         <Button onClick={handleComplete} loading={completing} variant="primary" size="lg" className="w-full">
//           Complete Visit
//         </Button>
//       </div>
//     </div>
//   );
// };

// export default VisitCompletion;