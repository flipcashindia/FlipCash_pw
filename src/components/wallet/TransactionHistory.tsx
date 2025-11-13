// import React from "react";
// import { ArrowUpCircle, ArrowDownCircle, ChevronLeft } from "lucide-react";
// import { type Transaction } from "../../types/wallet.types";
// import { formatCurrency, formatDate } from "../../utils/formatters";

// interface TransactionHistoryProps {
//   onBack: () => void;
//   transactions: Transaction[];
// }

// const TransactionHistory: React.FC<TransactionHistoryProps> = ({ onBack, transactions }) => {
//   return (
//     <div className="max-w-4xl mx-auto">
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-3xl font-bold">Transaction History</h1>
//         <button onClick={onBack} className="flex items-center space-x-1 text-sm font-medium text-blue-600 hover:text-blue-800">
//           <ChevronLeft size={16} />
//           <span>Back to Wallet</span>
//         </button>
//       </div>

//       <div className="bg-white rounded-xl shadow-md border border-gray-100 divide-y divide-gray-200">
//         {transactions.length === 0 ? (
//           <div className="p-8 text-center text-gray-500">No transactions found</div>
//         ) : (
//           transactions.map((tx) => {
//             const isCredit = tx.type === "credit";
//             const isPending = tx.status === "pending";
//             return (
//               <div key={tx.id} className="p-4 flex items-center justify-between">
//                 <div className="flex items-center space-x-4">
//                   {isCredit ? (
//                     <ArrowUpCircle size={36} className="text-green-500 flex-shrink-0" />
//                   ) : (
//                     <ArrowDownCircle size={36} className="text-red-500 flex-shrink-0" />
//                   )}
//                   <div>
//                     <p className="font-semibold text-gray-900">{tx.description}</p>
//                     <p className="text-sm text-gray-500">{formatDate(tx.created_at)}</p>
//                   </div>
//                 </div>
//                 <div className="text-right">
//                   <p className={`font-semibold text-lg ${isCredit ? "text-green-600" : "text-gray-900"}`}>
//                     {isCredit ? "+" : ""}{formatCurrency(tx.amount)}
//                   </p>
//                   <p className={`text-sm font-medium ${isPending ? "text-yellow-600" : "text-green-600"}`}>
//                     {tx.status}
//                   </p>
//                 </div>
//               </div>
//             );
//           })
//         )}
//       </div>
//     </div>
//   );
// };

// export default TransactionHistory;