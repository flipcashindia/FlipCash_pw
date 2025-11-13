import React from "react";

// Helper for form inputs
const FormInput: React.FC<{
  label: string;
  id: string;
  isRequired?: boolean;
}> = ({ label, id, isRequired = true }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
      {label} {isRequired && <span className="text-red-500">*</span>}
    </label>
    <input
      type="text"
      id={id}
      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
    />
  </div>
);

const Helpdesk: React.FC = () => {
  return (
    <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg border border-gray-100 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold">Submit a Help Request</h1>
      <p className="text-gray-600 mt-2 mb-6">
        Have an issue with an order or your account? Let us know.
      </p>
      <form className="space-y-6">
        <FormInput label="Subject" id="subject" />
        <FormInput label="Order ID (if applicable)" id="order_id" isRequired={false} />
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Please describe your issue <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            rows={5}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <div className="pt-4">
          <button
            type="submit"
            className="px-8 py-3 bg-teal-500 text-white font-semibold rounded-lg shadow-md hover:bg-teal-600 transition-colors"
          >
            Submit Ticket
          </button>
        </div>
      </form>
    </div>
  );
};

export default Helpdesk;