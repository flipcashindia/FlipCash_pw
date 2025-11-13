// import React, { useState } from 'react';
// import { Wallet as WalletIcon, Landmark } from 'lucide-react';
// import { useToast } from '../../contexts/ToastContext';
// import { Button } from '../common/Button';

// type WithdrawTab = 'upi' | 'bank';

// interface WithdrawFormProps {
//   availableBalance: number;
// }

// const WithdrawForm: React.FC<WithdrawFormProps> = ({ availableBalance }) => {
//   const toast = useToast();
//   const [tab, setTab] = useState<WithdrawTab>('upi');
//   const [upiData, setUpiData] = useState({ upi_id: '', amount: '' });
//   const [bankData, setBankData] = useState({ account_number: '', ifsc: '', amount: '' });
//   const [loading, setLoading] = useState(false);

//   const handleUpiSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     const amount = parseFloat(upiData.amount);
//     if (amount > availableBalance) {
//       toast.error('Insufficient balance');
//       return;
//     }
//     toast.info('Withdrawal feature will be available soon');
//   };

//   const handleBankSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     const amount = parseFloat(bankData.amount);
//     if (amount > availableBalance) {
//       toast.error('Insufficient balance');
//       return;
//     }
//     toast.info('Withdrawal feature will be available soon');
//   };

//   return (
//     <div className="bg-white p-6 rounded-xl shadow-md border">
//       <div className="flex border-b mb-4">
//         <button onClick={() => setTab('upi')} className={`flex items-center gap-2 px-4 py-3 font-semibold ${tab === 'upi' ? 'border-b-2 border-teal-500 text-teal-600' : 'text-gray-500'}`}>
//           <WalletIcon size={18} />
//           UPI
//         </button>
//         <button onClick={() => setTab('bank')} className={`flex items-center gap-2 px-4 py-3 font-semibold ${tab === 'bank' ? 'border-b-2 border-teal-500 text-teal-600' : 'text-gray-500'}`}>
//           <Landmark size={18} />
//           Bank Transfer
//         </button>
//       </div>

//       {tab === 'upi' && (
//         <form onSubmit={handleUpiSubmit} className="space-y-4">
//           <div>
//             <label className="block text-sm font-medium mb-1">UPI ID <span className="text-red-500">*</span></label>
//             <input type="text" placeholder="yourname@bank" value={upiData.upi_id} onChange={(e) => setUpiData({ ...upiData, upi_id: e.target.value })} className="w-full p-3 border rounded-lg" required />
//           </div>
//           <div>
//             <label className="block text-sm font-medium mb-1">Amount (₹) <span className="text-red-500">*</span></label>
//             <input type="number" placeholder="e.g. 500" value={upiData.amount} onChange={(e) => setUpiData({ ...upiData, amount: e.target.value })} className="w-full p-3 border rounded-lg" min="100" required />
//           </div>
//           <Button type="submit" loading={loading} variant="primary" size="lg" className="w-full">
//             Withdraw to UPI
//           </Button>
//         </form>
//       )}

//       {tab === 'bank' && (
//         <form onSubmit={handleBankSubmit} className="space-y-4">
//           <div>
//             <label className="block text-sm font-medium mb-1">Account Number <span className="text-red-500">*</span></label>
//             <input type="text" value={bankData.account_number} onChange={(e) => setBankData({ ...bankData, account_number: e.target.value })} className="w-full p-3 border rounded-lg" required />
//           </div>
//           <div>
//             <label className="block text-sm font-medium mb-1">IFSC Code <span className="text-red-500">*</span></label>
//             <input type="text" value={bankData.ifsc} onChange={(e) => setBankData({ ...bankData, ifsc: e.target.value })} className="w-full p-3 border rounded-lg" required />
//           </div>
//           <div>
//             <label className="block text-sm font-medium mb-1">Amount (₹) <span className="text-red-500">*</span></label>
//             <input type="number" placeholder="e.g. 500" value={bankData.amount} onChange={(e) => setBankData({ ...bankData, amount: e.target.value })} className="w-full p-3 border rounded-lg" min="100" required />
//           </div>
//           <Button type="submit" loading={loading} variant="primary" size="lg" className="w-full">
//             Withdraw to Bank
//           </Button>
//         </form>
//       )}
//     </div>
//   );
// };

// export default WithdrawForm;