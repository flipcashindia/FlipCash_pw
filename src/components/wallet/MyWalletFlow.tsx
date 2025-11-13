// import React, { useState, useEffect } from 'react';
// import { useWallet } from '../../hooks/useWallet';
// import { useToast } from '../../contexts/ToastContext';
// import { Wallet as WalletIcon, ArrowRight } from 'lucide-react';
// import { formatCurrency } from '../../utils/formatters';
// import TransactionHistory from './TransactionHistory';
// import { Loader } from '../common/Loader';

// type WalletView = 'wallet' | 'passbook' | 'withdraw';

// const MyWalletFlow: React.FC = () => {
//   const { wallet, transactions, statistics, isLoading, loadWallet, loadTransactions } = useWallet();
//   const toast = useToast();
//   const [view, setView] = useState<WalletView>('wallet');
//   const [topUpAmount, setTopUpAmount] = useState('');

//   useEffect(() => {
//     loadWallet();
//   }, []);

//   const handleTopUpSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     toast.info('Top-up feature will be integrated with payment gateway');
//     setTopUpAmount('');
//   };

//   if (isLoading && !wallet) {
//     return <Loader />;
//   }

//   if (view === 'passbook') {
//     return (
//       <TransactionHistory
//         onBack={() => setView('wallet')}
//         transactions={transactions}
//       />
//     );
//   }

//   if (view === 'withdraw') {
//     return (
//       <div className="max-w-4xl mx-auto">
//         <button
//           onClick={() => setView('wallet')}
//           className="mb-6 text-teal-600 hover:text-teal-700 font-medium"
//         >
//           ← Back to Wallet
//         </button>
//         <div className="bg-white p-6 rounded-xl shadow-md">
//           <h2 className="text-2xl font-bold mb-6">Withdraw Funds</h2>
//           <p className="text-gray-600">Withdrawal feature coming soon</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-4xl mx-auto space-y-8">
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         <div className="lg:col-span-1 bg-teal-500 text-white p-6 rounded-xl shadow-lg">
//           <div className="flex items-center space-x-2 mb-2">
//             <WalletIcon size={18} />
//             <span className="text-lg font-semibold">Available Balance</span>
//           </div>
//           <p className="text-5xl font-bold mt-2">{formatCurrency(wallet?.balance || 0)}</p>
//         </div>

//         <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md border">
//           <h3 className="text-2xl font-semibold mb-2">Transactions</h3>
//           <p className="text-gray-600 mb-4">View all your credits, debits, and withdrawal history.</p>
//           <div className="flex gap-4">
//             <button
//               onClick={() => {
//                 loadTransactions();
//                 setView('passbook');
//               }}
//               className="flex items-center space-x-2 text-teal-600 font-semibold hover:text-teal-700"
//             >
//               <span>View Passbook</span>
//               <ArrowRight size={18} />
//             </button>
//             <button
//               onClick={() => setView('withdraw')}
//               className="flex items-center space-x-2 text-teal-600 font-semibold hover:text-teal-700"
//             >
//               <span>Withdraw Funds</span>
//               <ArrowRight size={18} />
//             </button>
//           </div>
//         </div>
//       </div>

//       <div className="bg-white p-6 rounded-xl shadow-md border">
//         <h3 className="text-2xl font-semibold mb-2">Top-Up Wallet</h3>
//         <p className="text-gray-600 mb-6">Add funds to your wallet to claim new leads.</p>
//         <form className="space-y-4 max-w-md" onSubmit={handleTopUpSubmit}>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Enter Amount (₹) <span className="text-red-500">*</span>
//             </label>
//             <input
//               type="number"
//               placeholder="e.g. 1000"
//               value={topUpAmount}
//               onChange={(e) => setTopUpAmount(e.target.value)}
//               min="0"
//               className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
//               required
//             />
//           </div>
//           <button
//             type="submit"
//             className="px-6 py-3 bg-teal-500 text-white font-semibold rounded-lg shadow hover:bg-teal-600"
//           >
//             Proceed to Payment
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default MyWalletFlow;