import React from "react";

// Helper for form inputs
const FormInput: React.FC<{
  label: string;
  id: string;
}> = ({ label, id }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
      {label} <span className="text-red-500">*</span>
    </label>
    <input
      type="text"
      id={id}
      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
    />
  </div>
);

const RaiseDispute: React.FC = () => {
  return (
    <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg border border-gray-100 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold">File a Dispute</h1>
      <p className="text-gray-600 mt-2 mb-6">
        If you have an issue with an order that you couldn't resolve, please let
        us know.
      </p>
      <form className="space-y-6">
        <FormInput label="Order ID" id="order_id" />
        <div>
          <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
            Reason for Dispute <span className="text-red-500">*</span>
          </label>
          <select
            id="reason"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
          >
            <option value="">Select a reason...</option>
            <option value="payment">Payment Issue</option>
            <option value="device">Device Condition MisMatch</option>
            <option value="customer">Customer No-Show</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Please provide details about your dispute <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            rows={5}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
        <div className="pt-4">
          <button
            type="submit"
            className="px-8 py-3 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 transition-colors"
          >
            Submit Dispute
          </button>
        </div>
      </form>
    </div>
  );
};

export default RaiseDispute;