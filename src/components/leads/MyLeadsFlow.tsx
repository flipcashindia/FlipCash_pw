// import React, { useState, useEffect } from 'react';
// import { useLeads } from '../../hooks/useLeads';
// import { useToast } from '../../contexts/ToastContext';
// import { LeadCard } from './LeadCard';
// import { Loader } from '../common/Loader';
// import { type LeadFilters as LeadFilterType } from '../../types/lead.types';

// interface MyLeadsFlowProps {
//   onSwitchTab: (tab: string) => void;
// }

// const MyLeadsFlow: React.FC<MyLeadsFlowProps> = ({ onSwitchTab }) => {
//   const { myLeads, isLoading, loadMyLeads } = useLeads();
//   const toast = useToast();
//   const [filters, setFilters] = useState<LeadFilterType>({ page_size: 20 });

//   useEffect(() => {
//     loadMyLeads(filters);
//   }, [filters]);

//   const handleFilterChange = (newFilters: Partial<LeadFilterType>) => {
//     setFilters(prev => ({ ...prev, ...newFilters }));
//   };

//   if (isLoading && myLeads.length === 0) {
//     return <Loader />;
//   }

//   return (
//     <div className="space-y-6">
//       <div>
//         <h1 className="text-3xl font-bold text-gray-900">My Leads</h1>
//         <p className="text-gray-600 mt-1">Leads you have claimed</p>
//       </div>

//       <div className="bg-white p-4 rounded-lg shadow-md">
//         <select
//           className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
//           onChange={(e) => handleFilterChange({ status: e.target.value || undefined })}
//         >
//           <option value="">All Status</option>
//           <option value="partner_assigned">Assigned</option>
//           <option value="in_progress">In Progress</option>
//           <option value="completed">Completed</option>
//         </select>
//       </div>

//       {myLeads.length === 0 ? (
//         <div className="text-center py-12">
//           <p className="text-gray-500 text-lg">You haven't claimed any leads yet</p>
//         </div>
//       ) : (
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {myLeads.map((lead) => (
//             <LeadCard key={lead.id} lead={lead} showActions={false} />
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default MyLeadsFlow;