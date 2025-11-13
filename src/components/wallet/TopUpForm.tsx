// import React, { useState } from 'react';
// import { walletService } from '../../api/services/walletService';
// import { useToast } from '../../contexts/ToastContext';
// import { Button } from '../common/Button';

// interface TopUpFormProps {
//   onSuccess: () => void;
// }

// const TopUpForm: React.FC<TopUpFormProps> = ({ onSuccess }) => {
//   const toast = useToast();
//   const [amount, setAmount] = useState('');
//   const [loading, setLoading] = useState(false);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     const numAmount = parseFloat(amount);
//     if (numAmount < 100) {
//       toast.error('Minimum top-up amount is ₹100');
//       return;
//     }

//     try {
//       setLoading(true);
//       const response = await walletService.topUp({ amount: numAmount, payment_method: 'upi' });
//       window.open(response.payment_url, '_blank');
//       toast.success('Redirecting to payment gateway');
//       onSuccess();
//     } catch (error) {
//       toast.error('Failed to initiate top-up');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit} className="space-y-4">
//       <div>
//         <label className="block text-sm font-medium text-gray-700 mb-1">
//           Enter Amount (₹) <span className="text-red-500">*</span>
//         </label>
//         <input
//           type="number"
//           placeholder="e.g. 1000"
//           value={amount}
//           onChange={(e) => setAmount(e.target.value)}
//           min="100"
//           className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
//           required
//         />
//         <p className="text-xs text-gray-500 mt-1">Minimum amount: ₹100</p>
//       </div>
//       <Button type="submit" loading={loading} variant="primary" size="lg" className="w-full">
//         Proceed to Payment
//       </Button>
//     </form>
//   );
// };

// export default TopUpForm;