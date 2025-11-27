// src/routes/agentRoutes.tsx
// Route configuration for partner agents management

import { Route } from 'react-router-dom';
import AgentsPage from '../pages/partner/AgentsPage';

/**
 * Agent routes to be included in the partner layout
 * 
 * Usage in App.tsx:
 * 
 * import { agentRoutes } from './routes/agentRoutes';
 * 
 * <Route path="/partner" element={<PartnerLayout />}>
 *   {agentRoutes}
 * </Route>
 */
export const agentRoutes = (
  <>
    {/* Main agents page */}
    <Route path="agents" element={<AgentsPage />} />
    
    {/* Future routes can be added here */}
    {/* <Route path="agents/:agentId" element={<AgentDetailPage />} /> */}
    {/* <Route path="agents/:agentId/assignments" element={<AgentAssignmentsPage />} /> */}
  </>
);

export default agentRoutes;