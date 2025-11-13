export interface Dispute {
  id: string;
  lead: string;
  raised_by: string;
  raised_by_type: 'customer' | 'partner';
  reason: string;
  description: string;
  status: 'open' | 'under_review' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  evidence_urls: string[];
  resolution?: string;
  resolved_at?: string;
  resolved_by?: string;
  created_at: string;
  updated_at: string;
}

export interface DisputeFilters {
  status?: string;
  priority?: string;
  raised_by_type?: string;
  page?: number;
  page_size?: number;
}

export interface CreateDisputeRequest {
  lead: string;
  reason: string;
  description: string;
  evidence_urls?: string[];
}