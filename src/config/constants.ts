export const CACHE_KEYS = {
  CATALOG_CATEGORIES: 'fc_catalog_categories',
  CATALOG_BRANDS: 'fc_catalog_brands',
  CATALOG_MODELS: 'fc_catalog_models',
  USER_PREFERENCES: 'fc_user_prefs',
  PARTNER_PROFILE: 'fc_partner_profile',
  WALLET_BALANCE: 'fc_wallet_balance',
};

export const CACHE_TTL = {
  CATALOG: 24 * 60 * 60 * 1000, // 24 hours
  MODELS: 12 * 60 * 60 * 1000,  // 12 hours
  PROFILE: 60 * 60 * 1000,       // 1 hour
  WALLET: 5 * 60 * 1000,         // 5 minutes
};

export const LEAD_STATUS = {
  NEW: 'new',
  PARTNER_ASSIGNED: 'partner_assigned',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export const KYC_STATUS = {
  PENDING: 'pending',
  SUBMITTED: 'submitted',
  UNDER_REVIEW: 'under_review',
  VERIFIED: 'verified',
  REJECTED: 'rejected',
} as const;

export const TRANSACTION_TYPE = {
  CREDIT: 'credit',
  DEBIT: 'debit',
} as const;

export const VISIT_STATUS = {
  SCHEDULED: 'scheduled',
  PARTNER_EN_ROUTE: 'partner_en_route',
  ARRIVED: 'arrived',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export const DISPUTE_STATUS = {
  OPEN: 'open',
  UNDER_REVIEW: 'under_review',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
} as const;

export const PAYOUT_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const;