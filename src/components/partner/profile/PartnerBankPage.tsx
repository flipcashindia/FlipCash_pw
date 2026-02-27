// src/pages/partner/profile/PartnerBankPage.tsx
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { partnerService } from '../../../api/services/partnerService';
import { useToast } from '../../../contexts/ToastContext';
import {
  Loader2, Banknote, Plus, X, Star, Shield,
  AlertCircle, Building2, CreditCard,
  CheckCircle, Clock,
} from 'lucide-react';
import { type PartnerBankAccount, type AddBankAccountRequest } from '../../../api/types/api';

// ── Helpers ───────────────────────────────────────────────────────────────────

const BANK_COLORS: Record<string, string> = {
  sbi: '#1a6fb4', hdfc: '#004c97', icici: '#f58220', axis: '#97144d',
  kotak: '#e31837', yes: '#0076bd', pnb: '#1d3e7a', bob: '#f68b1f',
};

const getBankColor = (bankName: string) => {
  const lower = bankName.toLowerCase();
  for (const [key, color] of Object.entries(BANK_COLORS)) {
    if (lower.includes(key)) return color;
  }
  return '#374151';
};

// ── Field — MUST be at module level, never inside another component ───────────
// ✅ FIX: Defined here (outside AddBankAccountForm) so React never sees a new
//         component type on re-render. Defining it inside caused unmount/remount
//         on every keystroke, which made inputs lose focus after one character.

const Field: React.FC<{
  label: string;
  name: string;
  placeholder: string;
  value: string;
  type?: string;
  icon?: React.ReactNode;
  error?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}> = ({ label, name, placeholder, value, type = 'text', icon, error, onChange }) => (
  <div>
    <label className="block text-xs font-semibold text-gray-600 mb-1.5">{label}</label>
    <div className="relative">
      {icon && (
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">{icon}</span>
      )}
      <input
        name={name}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        className={`w-full p-3.5 ${icon ? 'pl-10' : ''} border-2 rounded-xl text-sm focus:outline-none transition-colors ${
          error
            ? 'border-red-300 focus:border-red-400 bg-red-50'
            : 'border-gray-200 focus:border-[#FEC925]'
        }`}
      />
    </div>
    {error && (
      <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
        <AlertCircle size={11} />{error}
      </p>
    )}
  </div>
);

// ── BankCard ──────────────────────────────────────────────────────────────────

const BankCard: React.FC<{
  account: PartnerBankAccount;
  totalAccounts: number;
  onDelete: (acc: PartnerBankAccount) => void;
  onSetPrimary: (acc: PartnerBankAccount) => void;
  isSettingPrimary: boolean;
  isDeletingId: string | null;
}> = ({ account: acc, totalAccounts, onDelete, onSetPrimary, isSettingPrimary, isDeletingId }) => {
  const bankColor     = getBankColor(acc.bank_name);
  const isThisDeleting = isDeletingId === acc.id;

  return (
    <div className={`relative overflow-hidden rounded-2xl border-2 transition-all duration-200 hover:shadow-md ${
      acc.is_primary
        ? 'border-[#FEC925] bg-gradient-to-br from-[#FEC925]/8 to-white shadow-sm'
        : 'border-gray-200 bg-white'
    }`}>
      {acc.is_primary && (
        <div className="absolute top-3.5 right-3.5">
          <div className="flex items-center gap-1 bg-[#FEC925] text-[#1a1a1a] text-xs font-extrabold px-2.5 py-1 rounded-full shadow-sm">
            <Star size={10} fill="currentColor" /> Primary
          </div>
        </div>
      )}

      <div className="p-5">
        {/* Bank Header */}
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0 shadow-sm"
            style={{ backgroundColor: bankColor }}
          >
            {acc.bank_name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-bold text-gray-900 text-sm leading-tight">{acc.bank_name}</p>
            <p className="text-xs text-gray-500 capitalize">{acc.account_type} Account</p>
          </div>
        </div>

        {/* Account details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Account Holder</span>
            <span className="text-xs font-semibold text-gray-800">{acc.account_holder_name}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Account Number</span>
            <span className="text-xs font-mono font-semibold text-gray-800">{acc.account_number_masked}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">IFSC Code</span>
            <span className="text-xs font-mono font-semibold text-gray-800">{acc.ifsc_code}</span>
          </div>
        </div>

        {/* Status & Actions */}
        <div className="flex items-center justify-between pt-3.5 border-t border-gray-100">
          <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${
            acc.is_verified
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-amber-100 text-amber-700'
          }`}>
            {acc.is_verified ? <CheckCircle size={12} /> : <Clock size={12} />}
            {acc.is_verified ? 'Verified' : 'Unverified'}
          </span>

          <div className="flex items-center gap-2">
            {!acc.is_primary && (
              <button
                onClick={() => onSetPrimary(acc)}
                disabled={isSettingPrimary || !acc.is_verified}
                title={!acc.is_verified ? 'Only verified accounts can be set as primary' : ''}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#1a1a1a] bg-[#FEC925] rounded-lg hover:bg-[#f0bc1a] active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isSettingPrimary ? <Loader2 size={12} className="animate-spin" /> : <Star size={12} />}
                Set Primary
              </button>
            )}
            {!acc.is_primary && (
              <button
                onClick={() => onDelete(acc)}
                disabled={isThisDeleting || totalAccounts === 1}
                title={totalAccounts === 1 ? 'Cannot delete your only bank account' : ''}
                className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {isThisDeleting ? <Loader2 size={14} className="animate-spin" /> : <X size={14} />}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ── AddBankAccountForm ────────────────────────────────────────────────────────

const AddBankAccountForm: React.FC<{
  isLoading: boolean;
  onSubmit: (data: AddBankAccountRequest) => void;
  onCancel: () => void;
}> = ({ isLoading, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<AddBankAccountRequest>({
    account_holder_name: '',
    account_number: '',
    ifsc_code: '',
    bank_name: '',
    account_type: 'savings',
  });
  const [confirmAccNo, setConfirmAccNo] = useState('');
  const [errors, setErrors]             = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'ifsc_code' ? value.toUpperCase() : value,
    }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.account_holder_name.trim()) errs.account_holder_name = 'Required';
    if (!formData.bank_name.trim())           errs.bank_name           = 'Required';
    if (!formData.account_number.trim())      errs.account_number      = 'Required';
    else if (formData.account_number !== confirmAccNo) errs.confirm    = 'Account numbers do not match';
    if (!formData.ifsc_code.trim())           errs.ifsc_code           = 'Required';
    else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.ifsc_code))
                                              errs.ifsc_code           = 'Invalid IFSC format (e.g. SBIN0001234)';
    return errs;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field
          label="Account Holder Name" name="account_holder_name"
          placeholder="As on bank records" value={formData.account_holder_name}
          icon={<CreditCard size={16} />} error={errors.account_holder_name}
          onChange={handleChange}
        />
        <Field
          label="Bank Name" name="bank_name"
          placeholder="e.g., State Bank of India" value={formData.bank_name}
          icon={<Building2 size={16} />} error={errors.bank_name}
          onChange={handleChange}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field
          label="Account Number" name="account_number" type="password"
          placeholder="Enter account number" value={formData.account_number}
          error={errors.account_number} onChange={handleChange}
        />
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">
            Confirm Account Number
          </label>
          <input
            type="text"
            value={confirmAccNo}
            placeholder="Re-enter account number"
            onChange={e => {
              setConfirmAccNo(e.target.value);
              if (errors.confirm) setErrors(p => ({ ...p, confirm: '' }));
            }}
            className={`w-full p-3.5 border-2 rounded-xl text-sm focus:outline-none transition-colors ${
              errors.confirm
                ? 'border-red-300 bg-red-50 focus:border-red-400'
                : 'border-gray-200 focus:border-[#FEC925]'
            }`}
          />
          {errors.confirm && (
            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
              <AlertCircle size={11} />{errors.confirm}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field
          label="IFSC Code" name="ifsc_code"
          placeholder="e.g., SBIN0001234" value={formData.ifsc_code}
          error={errors.ifsc_code} onChange={handleChange}
        />
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Account Type</label>
          <select
            name="account_type"
            value={formData.account_type}
            onChange={handleChange}
            className="w-full p-3.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#FEC925] bg-white"
          >
            <option value="savings">Savings Account</option>
            <option value="current">Current Account</option>
          </select>
        </div>
      </div>

      <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-xl">
        <Shield size={14} className="text-blue-500 flex-shrink-0" />
        <p className="text-xs text-blue-700">Your account details are encrypted and stored securely.</p>
      </div>

      <div className="flex gap-3 pt-1">
        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center gap-2 px-6 py-3 bg-[#FEC925] text-[#1a1a1a] rounded-xl font-bold text-sm shadow-sm hover:bg-[#f0bc1a] active:scale-95 transition-all disabled:opacity-50"
        >
          {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
          Add Bank Account
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-3 border-2 border-gray-200 text-gray-600 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────

export const PartnerBankPage: React.FC = () => {
  const toast       = useToast();
  const queryClient = useQueryClient();
  const [showForm, setShowForm]     = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: accounts, isLoading } = useQuery({
    queryKey: ['partnerBankAccounts'],
    queryFn:  partnerService.getBankAccounts,
  });

  const addMutation = useMutation({
    mutationFn: (payload: AddBankAccountRequest) => partnerService.addBankAccount(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partnerBankAccounts'] });
      toast.success('Bank account added!');
      setShowForm(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to add account.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (accountId: string) => partnerService.deleteBankAccount(accountId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partnerBankAccounts'] });
      toast.success('Bank account removed.');
      setDeletingId(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to remove account.');
      setDeletingId(null);
    },
  });

  const setPrimaryMutation = useMutation({
    mutationFn: (accountId: string) => partnerService.setPrimaryBankAccount(accountId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partnerBankAccounts'] });
      toast.success('Primary account updated!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to set primary.');
    },
  });

  const handleDelete = (acc: PartnerBankAccount) => {
    if (acc.is_primary) { toast.error('Cannot delete your primary bank account.'); return; }
    if (accounts && accounts.length === 1) { toast.error('Cannot delete your only bank account.'); return; }
    if (window.confirm(`Remove "${acc.bank_name}" account ending in ${acc.account_number_masked.slice(-4)}?`)) {
      setDeletingId(acc.id);
      deleteMutation.mutate(acc.id);
    }
  };

  const handleSetPrimary = (acc: PartnerBankAccount) => {
    if (!acc.is_verified) { toast.error('Only verified accounts can be set as primary.'); return; }
    setPrimaryMutation.mutate(acc.id);
  };

  const primaryAccount = accounts?.find(a => a.is_primary);
  const verifiedCount  = accounts?.filter(a => a.is_verified).length ?? 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900">Bank Accounts</h2>
          <p className="text-sm text-gray-500 mt-0.5">Manage your payout bank accounts</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#1a1a1a] text-white rounded-xl font-bold text-sm hover:bg-[#2d2d2d] transition-colors"
        >
          <Plus size={16} /> {showForm ? 'Close' : 'Add Account'}
        </button>
      </div>

      {/* Summary Cards */}
      {accounts && accounts.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
            <p className="text-2xl font-extrabold text-gray-900">{accounts.length}</p>
            <p className="text-xs text-gray-500 mt-0.5">Total Accounts</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
            <p className="text-2xl font-extrabold text-emerald-600">{verifiedCount}</p>
            <p className="text-xs text-gray-500 mt-0.5">Verified</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm col-span-2 sm:col-span-1">
            <p className="text-sm font-bold text-gray-900 truncate">{primaryAccount?.bank_name ?? '—'}</p>
            <p className="text-xs text-gray-500 mt-0.5">Primary Bank</p>
          </div>
        </div>
      )}

      {/* Add Form */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 md:px-8 py-5 border-b border-gray-100 flex items-center gap-3">
            <div className="p-2 bg-[#FEC925]/10 rounded-xl">
              <Plus size={18} className="text-[#1a1a1a]" />
            </div>
            <h3 className="font-bold text-gray-900">Add New Bank Account</h3>
          </div>
          <div className="p-6 md:p-8">
            <AddBankAccountForm
              isLoading={addMutation.isPending}
              onSubmit={addMutation.mutate}
              onCancel={() => setShowForm(false)}
            />
          </div>
        </div>
      )}

      {/* Accounts List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 md:px-8 py-5 border-b border-gray-100 flex items-center gap-3">
          <div className="p-2 bg-[#FEC925]/10 rounded-xl">
            <Banknote size={20} className="text-[#1a1a1a]" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">My Bank Accounts</h2>
            <p className="text-xs text-gray-500">Primary account is used for all payouts</p>
          </div>
        </div>

        <div className="p-6 md:p-8">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="h-48 bg-gray-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : accounts && accounts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {accounts.map(acc => (
                <BankCard
                  key={acc.id}
                  account={acc}
                  totalAccounts={accounts.length}
                  onDelete={handleDelete}
                  onSetPrimary={handleSetPrimary}
                  isSettingPrimary={setPrimaryMutation.isPending}
                  isDeletingId={deletingId}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Banknote size={28} className="text-gray-400" />
              </div>
              <h3 className="font-bold text-gray-700 mb-1">No bank accounts added</h3>
              <p className="text-sm text-gray-500 mb-4">Add a bank account to receive payouts</p>
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FEC925] text-[#1a1a1a] rounded-xl font-bold text-sm hover:bg-[#f0bc1a] transition-colors"
              >
                <Plus size={16} /> Add First Account
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
        <Shield size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-blue-700 leading-relaxed">
          New accounts require verification before they can receive payouts.
          Our team verifies accounts within 1–2 business days.
        </p>
      </div>
    </div>
  );
};