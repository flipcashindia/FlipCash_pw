import React, { useState } from "react";
import {
  ArrowRight,
  Wallet as WalletIcon,
  Landmark,
  ChevronLeft,
} from "lucide-react";

// Import the new component
import TransactionHistory from "./TransactionHistory";
import type { Transaction } from "./TransactionHistory";

// --- Types ---
type WalletView = "wallet" | "passbook" | "withdraw"; // <-- 'topup' removed, 'withdraw' added
type WithdrawTab = "upi" | "bank";

// --- Mock Data (No Change) ---
const mockTransactions: Transaction[] = [
  {
    id: "tx1",
    type: "debit",
    title: "Withdrawal to UPI (rohan@bank)",
    date: "Oct 28, 2025",
    amount: 500.0,
    status: "Completed",
  },
  {
    id: "tx2",
    type: "credit",
    title: "Refund for Order #FCSALE-12345",
    date: "Oct 25, 2025",
    amount: 2901.0,
    status: "Completed",
  },
  {
    id: "tx3",
    type: "credit",
    title: "Cashback Applied",
    date: "Oct 24, 2025",
    amount: 100.0,
    status: "Completed",
  },
  {
    id: "tx4",
    type: "debit",
    title: "Withdrawal to Bank (Pending)",
    date: "Oct 22, 2025",
    amount: 1000.0,
    status: "Pending",
  },
];

// --- [Sub-Component] Main Wallet View (Rebuilt) ---
const WalletView: React.FC<{
  onViewPassbook: () => void;
  onViewWithdraw: () => void; // <-- New prop
}> = ({ onViewPassbook, onViewWithdraw }) => {
  const [amount, setAmount] = useState("");

  const handleTopUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Proceeding to add ₹${amount} to your wallet.`);
    // In a real app, this would redirect to a payment gateway
    setAmount(""); // Clear amount after submission
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Balance Card */}
        <div className="lg:col-span-1 bg-teal-500 text-white p-6 rounded-xl shadow-lg flex flex-col justify-center">
          <div className="flex items-center space-x-2">
            <WalletIcon size={18} />
            <span className="text-lg font-semibold">Available Balance</span>
          </div>
          <p className="text-5xl font-bold mt-2">₹2401.00</p>
        </div>

        {/* Transactions Card (Updated) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md border border-gray-100 flex flex-col justify-center">
          <h3 className="text-2xl font-semibold">Transactions</h3>
          <p className="text-gray-600 mt-1">
            View all your credits, debits, and withdrawal history.
          </p>
          <div className="flex items-center space-x-6 mt-4">
            <button
              onClick={onViewPassbook}
              className="flex items-center space-x-2 text-teal-600 font-semibold hover:text-teal-700"
            >
              <span>View Passbook</span>
              <ArrowRight size={18} />
            </button>
            {/* --- [NEW] Withdraw Link --- */}
            <button
              onClick={onViewWithdraw}
              className="flex items-center space-x-2 text-teal-600 font-semibold hover:text-teal-700"
            >
              <span>Withdraw Funds</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Top-Up Funds (Replaces Withdraw) */}
      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
        <h3 className="text-2xl font-semibold">Top-Up Wallet</h3>
        <p className="text-gray-600 mt-1">Add funds to your wallet to claim new leads.</p>
        <form className="space-y-4 max-w-md mt-6" onSubmit={handleTopUpSubmit}>
          <div>
            <label
              htmlFor="topup_amount"
              className="block text-sm font-medium text-gray-700"
            >
              Enter Amount (₹) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="topup_amount"
              placeholder="e.g. 1000"
              value={amount}
              onChange={(e) => {
                if (e.target.value === "" || parseFloat(e.target.value) >= 0) {
                  setAmount(e.target.value);
                }
              }}
              min="0"
              className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              required
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-teal-500 text-white font-semibold rounded-lg shadow hover:bg-teal-600"
          >
            Proceed to Payment
          </button>
        </form>
      </div>
    </div>
  );
};

// --- [NEW SUB-COMPONENT] Withdraw View ---
// (This holds the logic that used to be in WalletView)
const WithdrawView: React.FC<{
  onBack: () => void;
}> = ({ onBack }) => {
  const [withdrawTab, setWithdrawTab] = useState<WithdrawTab>("upi");

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Withdraw Funds</h1>
        <button
          onClick={onBack}
          className="flex items-center space-x-1 text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          <ChevronLeft size={16} />
          <span>Back to Wallet</span>
        </button>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
        <div className="flex border-b mt-4">
          <button
            onClick={() => setWithdrawTab("upi")}
            className={`flex items-center space-x-2 px-4 py-3 font-semibold ${
              withdrawTab === "upi"
                ? "border-b-2 border-teal-500 text-teal-600"
                : "text-gray-500"
            }`}
          >
            <WalletIcon size={18} />
            <span>UPI</span>
          </button>
          <button
            onClick={() => setWithdrawTab("bank")}
            className={`flex items-center space-x-2 px-4 py-3 font-semibold ${
              withdrawTab === "bank"
                ? "border-b-2 border-teal-500 text-teal-600"
                : "text-gray-500"
            }`}
          >
            <Landmark size={18} />
            <span>Bank Transfer</span>
          </button>
        </div>
        <div className="mt-6">
          {withdrawTab === "upi" && (
            <form className="space-y-4 max-w-md">
              <div>
                <label
                  htmlFor="upi_id"
                  className="block text-sm font-medium text-gray-700"
                >
                  Enter UPI ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="upi_id"
                  placeholder="yourname@bank"
                  className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label
                  htmlFor="upi_amount"
                  className="block text-sm font-medium text-gray-700"
                >
                  Enter Amount (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="upi_amount"
                  placeholder="e.g. 500"
                  className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  min="0"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 bg-teal-500 text-white font-semibold rounded-lg shadow hover:bg-teal-600"
              >
                Withdraw Now
              </button>
            </form>
          )}
          {withdrawTab === "bank" && (
            <form className="space-y-4 max-w-md">
              <div>
                <label
                  htmlFor="bank_name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Bank Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="bank_name"
                  className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label
                  htmlFor="acc_number"
                  className="block text-sm font-medium text-gray-700"
                >
                  Account Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="acc_number"
                  className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label
                  htmlFor="ifsc"
                  className="block text-sm font-medium text-gray-700"
                >
                  IFSC Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="ifsc"
                  className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
               <div>
                <label
                  htmlFor="bank_amount"
                  className="block text-sm font-medium text-gray-700"
                >
                  Enter Amount (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="bank_amount"
                  placeholder="e.g. 500"
                  className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  min="0"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 bg-teal-500 text-white font-semibold rounded-lg shadow hover:bg-teal-600"
              >
                Withdraw Now
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};


// --- [MASTER COMPONENT] (Updated) ---
const MyWalletFlow: React.FC = () => {
  const [view, setView] = useState<WalletView>("wallet");

  switch (view) {
    case "wallet":
      return (
        <WalletView
          onViewPassbook={() => setView("passbook")}
          onViewWithdraw={() => setView("withdraw")} // <-- New handler
        />
      );
    case "passbook":
      return (
        <TransactionHistory
          onBack={() => setView("wallet")}
          transactions={mockTransactions}
        />
      );
    // --- [NEW CASE] ---
    case "withdraw":
      return <WithdrawView onBack={() => setView("wallet")} />;
    // --- [REMOVED] 'topup' case is gone ---
    default:
      return (
        <WalletView
          onViewPassbook={() => setView("passbook")}
          onViewWithdraw={() => setView("withdraw")} // <-- New handler
        />
      );
  }
};

export default MyWalletFlow;