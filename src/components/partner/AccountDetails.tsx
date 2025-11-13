// import React, { useState, useEffect } from "react";
// import { usePartner } from "../../hooks/usePartner";
// import { useToast } from "../../contexts/ToastContext";
// import { partnerService } from "../../api/services/partnerService";


// const FormInput: React.FC<{
//   label: string;
//   id: string;
//   value: string;
//   onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
//   isReadOnly?: boolean;
// }> = ({ label, id, value, onChange, isReadOnly = false }) => (
//   <div>
//     <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
//       {label}
//     </label>
//     <input
//       type="text"
//       id={id}
//       value={value}
//       onChange={onChange}
//       readOnly={isReadOnly}
//       className={`w-full p-3 border rounded-lg ${
//         isReadOnly
//           ? "bg-gray-100 text-gray-500 cursor-not-allowed"
//           : "border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
//       }`}
//     />
//   </div>
// );

// const AccountDetails: React.FC = () => {
//   const { partner, loadProfile } = usePartner();
//   const toast = useToast();
//   const [formData, setFormData] = useState({
//     business_name: "",
//     pan_number: "",
//     gstin: "",
//   });
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     if (partner) {
//       setFormData({
//         business_name: partner.business_name || "",
//         pan_number: partner.pan_number || "",
//         gstin: partner.gstin || "",
//       });
//     }
//   }, [partner]);

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { id, value } = e.target;
//     setFormData((prev) => ({ ...prev, [id]: value }));
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     try {
//       setLoading(true);
//       await partnerService.updateProfile(formData);
//       await loadProfile();
//       toast.success("Profile updated successfully");
//     } catch (error) {
//       toast.error("Failed to update profile");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg border border-gray-100 max-w-3xl mx-auto">
//       <h1 className="text-3xl font-bold mb-6">Edit Account Details</h1>
//       <form className="space-y-6" onSubmit={handleSubmit}>
//         <FormInput
//           label="Business Name"
//           id="business_name"
//           value={formData.business_name}
//           onChange={handleChange}
//         />
//         <FormInput
//           label="PAN Number"
//           id="pan_number"
//           value={formData.pan_number}
//           onChange={handleChange}
//           isReadOnly
//         />
//         <FormInput
//           label="GSTIN"
//           id="gstin"
//           value={formData.gstin}
//           onChange={handleChange}
//         />
//         <div className="pt-4">
//           <button
//             type="submit"
//             disabled={loading}
//             className="px-8 py-3 bg-black text-white font-semibold rounded-lg shadow-md hover:bg-gray-800 transition-colors disabled:opacity-50"
//           >
//             {loading ? "Saving..." : "Save Changes"}
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default AccountDetails;