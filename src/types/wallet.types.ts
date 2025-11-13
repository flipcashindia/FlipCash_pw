export interface Wallet {
  id: string;
  owner_type: 'user' | 'partner';
  owner_id: string;
  balance: number;
  currency: string;
  status: 'active' | 'frozen' | 'suspended';
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  wallet: string;
  type: 'credit' | 'debit';
  amount: number;
  balance_after: number;
  reference_type: string;
  reference_id: string;
  description: string;
  status: 'completed' | 'pending' | 'failed';
  metadata?: Record<string, any>;
  created_at: string;
}

export interface WalletStatistics {
  total_credited: number;
  total_debited: number;
  total_transactions: number;
  pending_amount: number;
  available_balance: number;
}

export interface TopUpRequest {
  amount: number;
  payment_method: 'upi' | 'card' | 'netbanking';
}

export interface TopUpResponse {
  payment_url: string;
  transaction_id: string;
  amount: number;
}