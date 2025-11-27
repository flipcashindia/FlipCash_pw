// src/routes/agentAppRoutes.tsx
// Route configuration for Agent-facing application
// These routes are for users with role='agent'

import { Route } from 'react-router-dom';
import {
  AgentDashboardPage,
  AgentLeadsPage,
  AgentLeadDetailPage,
  AgentProfilePage,
  AgentActivityPage,
} from '../pages/agent';

/**
 * Agent app routes to be included in the AgentLayout
 * 
 * These routes are for field agents who:
 * - View and accept assigned leads
 * - Start journeys to customer locations
 * - Check-in at locations with GPS verification
 * - Verify with customer's OTP code
 * - Conduct device inspections
 * - Re-estimate prices based on actual condition
 * - Complete deals with payment processing
 * 
 * Usage in App.tsx:
 * 
 * import { agentAppRoutes } from './routes/agentAppRoutes';
 * 
 * <Route path="/agent" element={<AgentRoute><AgentLayout /></AgentRoute>}>
 *   {agentAppRoutes}
 * </Route>
 */
export const agentAppRoutes = (
  <>
    {/* Dashboard - Overview with stats and pending leads */}
    <Route index element={<AgentDashboardPage />} />
    <Route path="dashboard" element={<AgentDashboardPage />} />
    
    {/* Leads List - View all assigned leads with filters */}
    <Route path="leads" element={<AgentLeadsPage />} />
    
    {/* Lead Detail - Full workflow for a single lead */}
    {/* Includes: Accept, Journey, Check-in, Verify, Inspect, Price, Complete */}
    <Route path="lead/:assignmentId" element={<AgentLeadDetailPage />} />
    
    {/* Activity - View history and completed leads */}
    <Route path="activity" element={<AgentActivityPage />} />
    
    {/* Profile - View and manage agent profile */}
    <Route path="profile" element={<AgentProfilePage />} />
  </>
);

export default agentAppRoutes;
