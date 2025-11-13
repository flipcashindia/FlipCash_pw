// import React, { useState, useEffect } from 'react';
// import { useLeads } from '../../hooks/useLeads';
// import { useCatalog } from '../../hooks/useCatalog';
// import { useToast } from '../../contexts/ToastContext';
// import { LeadCard } from './LeadCard';
// import { LeadFilters } from './LeadFilters';
// import { Loader } from '../common/Loader';
// import { type LeadFilters as LeadFilterType } from '../../types/lead.types';

// interface NewLeadsFlowProps {
//   onSwitchTab: (tab: string) => void;
//   initialCategoryFilter?: string | null;
// }

// const NewLeadsFlow: React.FC<NewLeadsFlowProps> = ({ onSwitchTab, initialCategoryFilter }) => {
//   const { availableLeads, isLoading, claimLoading, loadAvailableLeads, claimLead } = useLeads();
//   const { categories, loadCategories } = useCatalog();
//   const toast = useToast();
//   const [filters, setFilters] = useState<LeadFilterType>({
//     page_size: 20,
//   });

//   useEffect(() => {
//     loadCategories();
//   }, []);

//   useEffect(() => {
//     if (initialCategoryFilter) {
//       const category = categories.find(c => c.name === initialCategoryFilter);
//       if (category) {
//         setFilters(prev => ({ ...prev, category: category.id }));
//       }
//     }
//   }, [initialCategoryFilter, categories]);

//   useEffect(() => {
//     loadAvailableLeads(filters);
//   }, [filters]);

//   const handleFilterChange = (newFilters: Partial<LeadFilterType>) => {
//     setFilters(prev => ({ ...prev, ...newFilters }));
//   };

//   const handleClaimLead = async (leadId: string) => {
//     try {
//       const result = await claimLead(leadId);
//       toast.success(`Lead claimed! Fee: ₹${result.claim_fee}`);
//       onSwitchTab('my-leads');
//     } catch (error) {
//       toast.error(error instanceof Error ? error.message : 'Failed to claim lead');
//     }
//   };

//   if (isLoading && availableLeads.length === 0) {
//     return <Loader />;
//   }

//   return (
//     <div className="space-y-6">
//       <div>
//         <h1 className="text-3xl font-bold text-gray-900">New Leads</h1>
//         <p className="text-gray-600 mt-1">Browse and claim available leads in your area</p>
//       </div>

//       <LeadFilters onFilterChange={handleFilterChange} categories={categories} />

//       {availableLeads.length === 0 ? (
//         <div className="text-center py-12">
//           <p className="text-gray-500 text-lg">No leads available at the moment</p>
//         </div>
//       ) : (
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {availableLeads.map((lead) => (
//             <LeadCard
//               key={lead.id}
//               lead={lead}
//               onClaim={handleClaimLead}
//               claimLoading={claimLoading}
//             />
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default NewLeadsFlow;