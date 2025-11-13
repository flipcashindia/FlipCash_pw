// src/pages/partner/profile/PartnerBankPage.tsx
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { partnerService } from '../../../api/services/partnerService';
import { useToast } from '../../../contexts/ToastContext';
import { Loader2, Banknote, Plus, X, Star } from 'lucide-react';
import { type PartnerBankAccount, type AddBankAccountRequest } from '../../../api/types/api';

const getStatusChip = (isVerified: boolean) => {
  return isVerified ? (
    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800">Verified</span>
  ) : (
    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800">Unverified</span>
  );
};

export const PartnerBankPage: React.FC = () => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);

  // This query now correctly receives an array from the service
  const { data: accounts, isLoading: isLoadingAccounts } = useQuery({
    queryKey: ['partnerBankAccounts'],
    queryFn: partnerService.getBankAccounts,
  });

  const addAccountMutation = useMutation({
    mutationFn: (payload: AddBankAccountRequest) => partnerService.addBankAccount(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partnerBankAccounts'] });
      toast.success('Bank account added successfully!');
      setShowForm(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to add account.');
    }
  });

  const deleteAccountMutation = useMutation({
    mutationFn: (accountId: string) => partnerService.deleteBankAccount(accountId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partnerBankAccounts'] });
      toast.success('Bank account removed.');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to remove account.');
    }
  });
  
  const setPrimaryMutation = useMutation({
    mutationFn: (accountId: string) => partnerService.setPrimaryBankAccount(accountId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partnerBankAccounts'] });
      toast.success('Primary account updated!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to set primary.');
    }
  });

  const handleDelete = (account: PartnerBankAccount) => {
    // Check 1: Cannot delete primary account
    if (account.is_primary) {
      toast.error('Cannot delete your primary bank account.');
      return;
    }
    
    // Check 2: Cannot delete the only bank account
    if (accounts && accounts.length === 1) {
      toast.error('You cannot delete your only bank account.');
      return;
    }

    // Confirmation
    if (window.confirm('Are you sure you want to delete this bank account?')) {
      deleteAccountMutation.mutate(account.id);
    }
  };

  const handleSetPrimary = (account: PartnerBankAccount) => {
    if (!account.is_verified) {
      toast.error('Only verified accounts can be set as primary.');
      return;
    }
    setPrimaryMutation.mutate(account.id);
  };

  return (
    <div className="space-y-8">
      {/* --- Add Account Form --- */}
      <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg">
        <div className="flex justify-between items-center mb-6 pb-4 border-b">
          <h2 className="text-2xl font-bold text-brand-black">Add Bank Account</h2>
          <button 
            onClick={() => setShowForm(!showForm)} 
            className="flex items-center gap-2 px-4 py-2 bg-brand-yellow text-brand-black rounded-lg font-bold text-sm"
          >
            <Plus size={18} /> {showForm ? 'Cancel' : 'Add New'}
          </button>
        </div>
        
        {showForm && (
          <AddBankAccountForm
            isLoading={addAccountMutation.isPending}
            onSubmit={addAccountMutation.mutate}
          />
        )}
      </div>
      
      {/* --- Accounts List --- */}
      <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-brand-black mb-6 pb-4 border-b">My Bank Accounts</h2>
        {isLoadingAccounts ? (
          <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
        ) : (
          <div className="space-y-4">
            {accounts && accounts.length > 0 ? (
              accounts.map(acc => (
                <div key={acc.id} className="flex items-start justify-between p-4 bg-brand-gray-light/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {acc.is_primary ? (
                      <Star size={20} className="text-brand-yellow" fill="#FEC925" />
                    ) : (
                      <Banknote size={20} className="text-gray-500" />
                    )}
                    <div>
                      <p className="font-semibold text-brand-black">{acc.bank_name}</p>
                      <p className="text-sm text-gray-600">
                        {acc.account_holder_name} - {acc.account_number_masked}
                      </p>
                    </div>
                    {getStatusChip(acc.is_verified)}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {!acc.is_primary && (
                       <button
                        onClick={() => handleSetPrimary(acc)}
                        disabled={setPrimaryMutation.isPending}
                        className="px-3 py-1 text-xs font-semibold text-brand-green bg-green-100 rounded-full hover:bg-green-200 disabled:opacity-50"
                      >
                       Set Primary
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(acc)}
                      disabled={deleteAccountMutation.isPending}
                      className="text-brand-red hover:opacity-70 disabled:opacity-30 p-1"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>
                ))
            ) : (
              // This correctly handles the "no accounts" case
              <p className="text-gray-500 text-center py-4">You have not added any bank accounts.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// --- Sub-component for the Add Bank Form ---
const AddBankAccountForm: React.FC<{
  isLoading: boolean;
  onSubmit: (data: AddBankAccountRequest) => void;
}> = ({ isLoading, onSubmit }) => {
  const [formData, setFormData] = useState<AddBankAccountRequest>({
    account_holder_name: '',
    account_number: '',
    ifsc_code: '',
    bank_name: '',
    account_type: 'savings',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // You could add client-side validation here before submitting
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input name="account_holder_name" value={formData.account_holder_name} onChange={handleChange} placeholder="Account Holder Name" className="w-full p-3 border-2 border-gray-200 rounded-lg" required />
        <input name="bank_name" value={formData.bank_name} onChange={handleChange} placeholder="Bank Name" className="w-full p-3 border-2 border-gray-200 rounded-lg" required />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <input name="account_number" value={formData.account_number} onChange={handleChange} placeholder="Account Number" className="w-full p-3 border-2 border-gray-200 rounded-lg" required />
        <input name="ifsc_code" value={formData.ifsc_code} onChange={handleChange} placeholder="IFSC Code" className="w-full p-3 border-2 border-gray-200 rounded-lg" required />
        <select name="account_type" value={formData.account_type} onChange={handleChange} className="w-full p-3 border-2 border-gray-200 rounded-lg bg-white">
          <option value="savings">Savings</option>
          <option value="current">Current</option>
        </select>
      </div>
      <button
        type="submit"
        disabled={isLoading}
        className="flex items-center justify-center gap-2 px-6 py-2 bg-brand-yellow text-brand-black rounded-lg font-bold text-sm disabled:opacity-50"
      >
        {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
        Add Account
      </button>
    </form>
  );
};