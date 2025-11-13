export const API_ENDPOINTS = {
  AUTH: {
    REQUEST_OTP: '/api/v1/accounts/auth/otp/send/',
    VERIFY_OTP: '/api/v1/accounts/auth/otp/verify/',
    REFRESH_TOKEN: '/api/v1/accounts/auth/refresh/',
    LOGOUT: '/api/v1/accounts/auth/logout/',
  },

  USER: {
    PROFILE: '/api/v1/accounts/users/me/',
    UPDATE_PROFILE: '/api/v1/accounts/users/me/',
  },

  PARTNER: {
    PROFILE: '/api/v1/partners/me/',
    UPDATE_PROFILE: '/api/v1/partners/me/',
    REGISTER: '/api/v1/accounts/partner/signup/complete/',
    KYC_DOCUMENTS: '/api/v1/partners/kyc-documents/',
    KYC_SUBMIT: '/api/v1/partners/me/submit-kyc/',
    SERVICE_AREAS: '/api/v1/partners/service-areas/',
    BANK_ACCOUNTS: '/api/v1/partners/bank-accounts/',
    UPI_IDS: '/api/v1/partners/upi-ids/',
    METRICS: '/api/v1/partners/me/metrics/',
    EARNINGS: '/api/v1/partners/me/earnings/',
  },

  CATALOG: {
    CATEGORIES: 'catalog/categories/',
    BRANDS: 'catalog/brands/',
    MODELS: 'catalog/models/',
    MODEL_DETAIL: (id: string) => `catalog/models/${id}/`,
    SEARCH: 'catalog/search/',
  },

  PRICING: {
    ESTIMATE: '/api/v1/pricing/estimate/',
    RULES: '/api/v1/pricing/rules/',
    FACTORS: '/api/v1/pricing/factors/',
  },

  LEADS: {
    LIST: '/api/v1/leads/',
    DETAIL: (id: string) => `/api/v1/leads/${id}/`,
    CREATE: '/api/v1/leads/',
    CLAIM: (id: string) => `/api/v1/leads/${id}/claim/`,
    UNCLAIM: (id: string) => `/api/v1/leads/${id}/unclaim/`,
    MY_LEADS: '/api/v1/leads/my-leads/',
    AVAILABLE: '/api/v1/leads/available/',
    STATS: '/api/v1/leads/stats/',
    STATUS_HISTORY: (id: string) => `/api/v1/leads/${id}/status-history/`,
  },

  VISITS: {
    LIST: '/api/v1/visits/',
    DETAIL: (id: string) => `/api/v1/visits/${id}/`,
    CREATE: '/api/v1/visits/',
    CHECKIN: (id: string) => `/api/v1/visits/${id}/checkin/`,
    SUBMIT_INSPECTION: (id: string) => `/api/v1/visits/${id}/submit-inspection/`,
    FINALIZE: (id: string) => `/api/v1/visits/${id}/finalize/`,
    MY_VISITS: '/api/v1/visits/my-visits/',
  },

  WALLET: {
    MY_WALLET: '/api/v1/finance/my-wallet/',
    BALANCE: '/api/v1/finance/wallet/balance/',
    TRANSACTIONS: '/api/v1/finance/transactions/',
    TRANSACTION_DETAIL: (id: string) => `/api/v1/finance/transactions/${id}/`,
    TOP_UP: '/api/v1/finance/wallet/top-up/',
    STATISTICS: '/api/v1/finance/wallet/statistics/',
  },

  PAYOUTS: {
    LIST: '/api/v1/finance/payouts/',
    REQUEST: '/api/v1/finance/payouts/request/',
    DETAIL: (id: string) => `/api/v1/finance/payouts/${id}/`,
    STATUS: (id: string) => `/api/v1/finance/payouts/${id}/status/`,
    BENEFICIARIES: '/api/v1/finance/payout-beneficiaries/',
  },

  DISPUTES: {
    LIST: '/api/v1/ops/disputes/',
    CREATE: '/api/v1/ops/disputes/',
    DETAIL: (id: string) => `/api/v1/ops/disputes/${id}/`,
    UPDATE: (id: string) => `/api/v1/ops/disputes/${id}/`,
    MY_DISPUTES: '/api/v1/ops/disputes/my-disputes/',
  },

  MEDIA: {
    PRESIGN: '/api/v1/media/presign/',
    UPLOAD: '/api/v1/media/upload/',
  },

  NOTIFICATIONS: {
    LIST: '/api/v1/comms/notifications/',
    MARK_READ: (id: string) => `/api/v1/comms/notifications/${id}/mark-read/`,
    MARK_ALL_READ: '/api/v1/comms/notifications/mark-all-read/',
  },
};