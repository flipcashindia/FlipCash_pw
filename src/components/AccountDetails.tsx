import React, { useState } from "react";

// Helper for form inputs
const FormInput: React.FC<{
  label: string;
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isReadOnly?: boolean;
}> = ({ label, id, value, onChange, isReadOnly = false }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <input
      type="text"
      id={id}
      value={value}
      onChange={onChange}
      readOnly={isReadOnly}
      className={`w-full p-3 border rounded-lg ${
        isReadOnly
          ? "bg-gray-100 text-gray-500 cursor-not-allowed"
          : "border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
      }`}
    />
  </div>
);

const AccountDetails: React.FC = () => {
  // Mock data would come from a prop or context
  const [formData, setFormData] = useState({
    firstName: "Rohan",
    lastName: "",
    email: "rohan@example.com",
    mobile: "+91 98765 43210",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg border border-gray-100 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Edit Account Details</h1>
      <form className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormInput
            label="First Name"
            id="firstName"
            value={formData.firstName}
            onChange={handleChange}
          />
          <FormInput
            label="Last Name"
            id="lastName"
            value={formData.lastName}
            onChange={handleChange}
          />
        </div>
        <FormInput
          label="Email Address"
          id="email"
          value={formData.email}
          onChange={handleChange}
        />
        <FormInput
          label="Mobile Number (Read-only)"
          id="mobile"
          value={formData.mobile}
          onChange={handleChange}
          isReadOnly
        />
        <div className="pt-4">
          <button
            type="submit"
            className="px-8 py-3 bg-black text-white font-semibold rounded-lg shadow-md hover:bg-gray-800 transition-colors"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default AccountDetails;