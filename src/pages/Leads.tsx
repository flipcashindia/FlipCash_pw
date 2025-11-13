/*
=============================================================================
--- FLIPCASH: PARTNER BROWSE & CLAIM FLOW (UPGRADED v3.1 - FIXED) ---
=============================================================================
Updated to work with the backend Browse APIs.
All endpoints corrected to match the backend implementation.
=============================================================================
*/

import React, { useState, useEffect } from "react";
import {
  Search,
  MapPin,
  Check,
  ChevronLeft,
  Loader2,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  useQuery,
  useMutation,
  QueryClient,
  QueryClientProvider,
  type UseQueryResult,
  type UseMutationResult  // Add this import
} from "@tanstack/react-query";
import axios, { AxiosError } from "axios";

// Import your existing auth store
import { useAuthStore } from "../stores/authStore";
import { Link } from "react-router-dom";

// =========================================================================
// --- 1. API CLIENT SETUP ---
// =========================================================================

// Base URL includes /api/v1
const API_BASE_URL = 'http://localhost:8000/api/v1';

/**
 * Public API client (for non-authenticated routes, if needed)
 */
export const publicApiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Private API client (for authenticated routes)
 */
export const privateApiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Interceptor to automatically add the Bearer token
 */
privateApiClient.interceptors.request.use(
  (config) => {
    const { accessToken } = useAuthStore.getState();
    if (accessToken) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for 401/403 errors
privateApiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.error("Auth error, logging out.", error.response.data);
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

// =========================================================================
// --- 2. API TYPES ---
// =========================================================================

type ApiStatus = "idle" | "loading" | "success" | "error";

// API List Response Wrapper
type PaginatedResponse<T> = {
  count: number;
  results: T[];
  next?: string | null;
  previous?: string | null;
};

// GET /partner/browse/categories/
export type BrowseCategory = {
  id: string;
  name: string;
  slug: string;
  icon: string;
  available_lead_count: number;
};

// GET /partner/browse/categories/{id}/brands/
export type BrowseBrand = {
  id: string;
  name: string;
  slug: string;
  logo: string;
  available_lead_count: number;
};

// GET /partner/browse/brands/{id}/models/
export type BrowseModel = {
  id: string;
  name: string;
  primary_image: string;
  storage_options: string[];
  ram_options: string[];
  available_lead_count: number;
  slug: string;
  model_number: string;
  base_price: string;
  launch_year: number;
};

// GET /partner/browse/models/{id}/leads/
export type BrowseLead = {
  id: string;
  lead_number: string;
  device: {
    model_id: string;
    model_name: string;
    brand_name: string;
    category_name: string;
    storage: string;
    ram: string;
    color: string;
    image: string;
  };
  pricing: {
    estimated_price: string;
    claim_fee: string;
  };
  location: {
    city: string;
    postal_code: string;
  };
  schedule: {
    preferred_date: string;
    preferred_time_slot: string;
  };
  priority: {
    is_urgent: boolean;
    is_flagged: boolean;
    priority_score: number;
  };
  created_at: string;
  expires_at: string;
};

// GET /partner/browse/leads/{id}/ (Partial Detail)
export type BrowseLeadDetail = {
  id: string;
  lead_number: string;
  status: string;
  customer: {
    name: string;
    phone: string;
  };
  device: {
    model_id: string;
    model_name: string;
    brand_name: string;
    category_name: string;
    model_number: string;
    launch_year: number;
    storage: string;
    ram: string;
    color: string;
    images: { id: string; image: string; is_primary: boolean }[];
    base_price: string;
  };
  condition: {
    responses: Record<string, any>;
    photos: string[];
    customer_notes: string;
  };
  pricing: {
    estimated_price: string;
    pricing_version: string;
    claim_fee: string;
  };
  pickup: {
    address: {
      recipient_name: string;
      city: string;
      state: string;
      postal_code: string;
    };
    preferred_date: string;
    preferred_time_slot: string;
  };
  priority: {
    is_urgent: boolean;
    is_flagged: boolean;
    flagged_reason: string | null;
    priority_score: number;
  };
  created_at: string;
  booked_at: string;
  expires_at: string;
  can_claim: boolean;
};

// POST /partner/browse/leads/{id}/claim/
export type ClaimSuccessResponse = {
  success: boolean;
  message: string;
  lead: {
    id: string;
    lead_number: string;
    status: string;
    assigned_at: string;
  };
  transaction: {
    claim_fee: string;
    remaining_balance: string;
  };
  next_steps: string[];
};

// Error response for Claim (400)
export type ClaimErrorResponse = {
  success: boolean;
  error: string;
  detail: string;
  required_amount?: string;
  current_balance?: string;
};

// Unlocked Lead Detail (After Claim)
export type UnlockedLeadDetail = {
  id: string;
  lead_number: string;
  status: string;
  customer: {
    name: string;
    phone: string;
    address: {
      id: string;
      recipient_name: string;
      address_line1: string;
      address_line2?: string;
      city: string;
      state: string;
      postal_code: string;
      landmark?: string;
      latitude: string;
      longitude: string;
    };
  };
  device: BrowseLeadDetail["device"];
  condition: BrowseLeadDetail["condition"];
  pricing: BrowseLeadDetail["pricing"];
  pickup: BrowseLeadDetail["pickup"];
};

// =========================================================================
// --- 3. API SERVICE LAYER ---
// =========================================================================

const browseService = {
  /** GET /partner/browse/categories/ */
  getCategories: async (): Promise<PaginatedResponse<BrowseCategory>> => {
    const { data } = await privateApiClient.get("/partner/browse/categories/");
    return data;
  },

  /** GET /partner/browse/categories/{id}/brands/ */
  getBrands: async (
    categoryId: string
  ): Promise<PaginatedResponse<BrowseBrand>> => {
    const { data } = await privateApiClient.get(
      `/partner/browse/categories/${categoryId}/brands/`
    );
    return data;
  },

  /** GET /partner/browse/brands/{id}/models/ */
  getModels: async (
    brandId: string
  ): Promise<PaginatedResponse<BrowseModel>> => {
    const { data } = await privateApiClient.get(
      `/partner/browse/brands/${brandId}/models/`
    );
    return data;
  },

  /** GET /partner/browse/models/{id}/leads/ */
  getLeads: async (
    modelId: string
  ): Promise<PaginatedResponse<BrowseLead>> => {
    const { data } = await privateApiClient.get(
      `/partner/browse/models/${modelId}/leads/`
    );
    return data;
  },

  /** GET /partner/browse/leads/{id}/ */
  getLeadDetail: async (leadId: string): Promise<BrowseLeadDetail> => {
    const { data } = await privateApiClient.get(
      `/partner/browse/leads/${leadId}/`
    );
    return data;
  },

  /** POST /partner/browse/leads/{id}/claim/ */
  claimLead: async (leadId: string): Promise<ClaimSuccessResponse> => {
    const { data } = await privateApiClient.post(
      `/partner/browse/leads/${leadId}/claim/`,
      {}
    );
    return data;
  },
};

const myLeadsService = {
  /** GET /partner/browse/leads/{id}/ (After claim, returns full details) */
  getUnlockedLeadDetail: async (
    leadId: string
  ): Promise<UnlockedLeadDetail> => {
    const { data } = await privateApiClient.get(
      `/partner/browse/leads/${leadId}/`
    );
    return data;
  },
};

// =========================================================================
// --- 4. REACT QUERY HOOKS ---
// =========================================================================

const useGetBrowseCategories = () => {
  return useQuery({
    queryKey: ["browseCategories"],
    queryFn: () => browseService.getCategories(),
  });
};

const useGetBrowseBrands = (categoryId: string) => {
  return useQuery({
    queryKey: ["browseBrands", categoryId],
    queryFn: () => browseService.getBrands(categoryId),
    enabled: !!categoryId,
  });
};

const useGetBrowseModels = (brandId: string) => {
  return useQuery({
    queryKey: ["browseModels", brandId],
    queryFn: () => browseService.getModels(brandId),
    enabled: !!brandId,
  });
};

const useGetBrowseLeads = (modelId: string) => {
  return useQuery({
    queryKey: ["browseLeads", modelId],
    queryFn: () => browseService.getLeads(modelId),
    enabled: !!modelId,
  });
};

const useGetBrowseLeadDetail = (leadId: string | null) => {
  return useQuery({
    queryKey: ["browseLeadDetail", leadId],
    queryFn: () => browseService.getLeadDetail(leadId!),
    enabled: !!leadId,
  });
};

const useGetUnlockedLeadDetail = (leadId: string | null) => {
  return useQuery({
    queryKey: ["unlockedLeadDetail", leadId],
    queryFn: () => myLeadsService.getUnlockedLeadDetail(leadId!),
    enabled: !!leadId,
  });
};

const useClaimLead = () => {
  return useMutation
    ClaimSuccessResponse,
    AxiosError<ClaimErrorResponse>,
    string
  >({
    mutationFn: (leadId: string) => browseService.claimLead(leadId),
  });
};

// =========================================================================
// --- 5. REUSABLE UI COMPONENTS ---
// =========================================================================

const BrowseHeader: React.FC<{
  onBack: () => void;
  title: string;
  breadcrumbs?: string;
}> = ({ onBack, title, breadcrumbs }) => (
  <div className="relative flex items-center justify-center p-4 border-b bg-white sticky top-0 z-10">
    <button
      onClick={onBack}
      className="absolute left-4 text-gray-600 hover:text-black"
    >
      <ChevronLeft size={24} />
    </button>
    <div className="text-center">
      {breadcrumbs && (
        <span className="text-sm text-gray-500">{breadcrumbs}</span>
      )}
      <h2 className="text-lg font-semibold">{title}</h2>
    </div>
  </div>
);

const ApiStatusWrapper: React.FC<{
  query: UseQueryResult<any>;
  children: React.ReactNode;
  onRetry?: () => void;
}> = ({ query, children, onRetry }) => {
  if (query.isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 size={32} className="animate-spin text-yellow-500" />
      </div>
    );
  }

  if (query.isError) {
    return (
      <div className="flex flex-col justify-center items-center h-64 text-red-600 p-4">
        <AlertCircle size={32} />
        <h3 className="font-semibold mt-2">Error Loading Data</h3>
        <p className="text-sm text-gray-600 text-center mt-1">
          {query.error instanceof Error
            ? query.error.message
            : "Could not fetch data. Please try again later."}
        </p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-4 px-4 py-2 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-500 transition-colors"
          >
            Retry
          </button>
        )}
      </div>
    );
  }

  if (query.isSuccess) {
    return <>{children}</>;
  }

  return null;
};

const DetailSection: React.FC<{
  title?: string;
  items: { label: string; value: string | undefined | null | number }[];
  grid?: boolean;
}> = ({ title, items, grid = false }) => (
  <div className="border-t border-gray-200 pt-4">
    {title && (
      <h4 className="text-lg font-semibold mb-3 text-gray-900">{title}</h4>
    )}
    <div
      className={`space-y-2.5 ${
        grid ? "grid grid-cols-2 gap-x-4 gap-y-2.5" : ""
      }`}
    >
      {items.map(
        (item) =>
          (item.value || item.value === 0) && (
            <div
              key={item.label}
              className={
                grid
                  ? "flex flex-col"
                  : "flex justify-between items-start text-sm"
              }
            >
              <span className="text-gray-500 text-sm">{item.label}</span>
              <span className="font-medium text-gray-900 text-right text-sm">
                {item.value}
              </span>
            </div>
          )
      )}
    </div>
  </div>
);

// =========================================================================
// --- 6. BROWSE FLOW COMPONENTS ---
// =========================================================================

// --- VIEW 1: CATEGORIES ---

const CategoryCard: React.FC<{
  category: BrowseCategory;
  onClick: () => void;
}> = ({ category, onClick }) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.2 }}
    onClick={onClick}
    className="bg-white rounded-lg shadow-md border border-gray-100 p-4 flex flex-col items-center text-center cursor-pointer hover:shadow-lg hover:border-yellow-400 transition-all"
  >
    <img
      src={category.icon}
      alt={category.name}
      onError={(e) =>
        (e.currentTarget.src = "https://placehold.co/80x80/f5f5f5/cccccc?text=?")
      }
      className="w-20 h-20 object-contain mb-3"
    />
    <h3 className="font-semibold text-gray-900">{category.name}</h3>
    <p className="text-sm text-gray-500">
      {category.available_lead_count} Leads
    </p>
  </motion.div>
);

const BrowseCategoriesView: React.FC<{
  onSelectCategory: (category: BrowseCategory) => void;
}> = ({ onSelectCategory }) => {
  const query = useGetBrowseCategories();

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="relative flex items-center justify-center p-4 border-b bg-white sticky top-0 z-10">
        <h2 className="text-lg font-semibold">Browse New Devices</h2>
      </div>
      <ApiStatusWrapper query={query} onRetry={() => query.refetch()}>
        <div className="p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {query.data?.results.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              onClick={() => onSelectCategory(category)}
            />
          ))}
        </div>
      </ApiStatusWrapper>
    </div>
  );
};

// --- VIEW 2: BRANDS ---

const BrandCard: React.FC<{
  brand: BrowseBrand;
  onClick: () => void;
}> = ({ brand, onClick }) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.2 }}
    onClick={onClick}
    className="bg-white rounded-lg shadow-md border border-gray-100 p-4 flex flex-col items-center text-center cursor-pointer hover:shadow-lg hover:border-yellow-400 transition-all"
  >
    <img
      src={brand.logo}
      alt={brand.name}
      onError={(e) =>
        (e.currentTarget.src = "https://placehold.co/80x80/f5f5f5/cccccc?text=?")
      }
      className="w-20 h-20 object-contain mb-3"
    />
    <h3 className="font-semibold text-gray-900">{brand.name}</h3>
    <p className="text-sm text-gray-500">{brand.available_lead_count} Leads</p>
  </motion.div>
);

const BrowseBrandsView: React.FC<{
  category: BrowseCategory;
  onSelectBrand: (brand: BrowseBrand) => void;
  onBack: () => void;
}> = ({ category, onSelectBrand, onBack }) => {
  const query = useGetBrowseBrands(category.id);

  return (
    <div className="bg-gray-50 min-h-screen">
      <BrowseHeader onBack={onBack} title={category.name} />
      <ApiStatusWrapper query={query} onRetry={() => query.refetch()}>
        <div className="p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {query.data?.results.map((brand) => (
            <BrandCard
              key={brand.id}
              brand={brand}
              onClick={() => onSelectBrand(brand)}
            />
          ))}
        </div>
      </ApiStatusWrapper>
    </div>
  );
};

// --- VIEW 3: MODELS ---

const ModelCard: React.FC<{
  model: BrowseModel;
  onClick: () => void;
}> = ({ model, onClick }) => (
  <motion.div
    layout
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.2 }}
    onClick={onClick}
    className="bg-white rounded-lg shadow-md border border-gray-100 p-4 flex items-center space-x-4 cursor-pointer hover:shadow-lg hover:border-yellow-400 transition-all"
  >
    <img
      src={model.primary_image}
      alt={model.name}
      onError={(e) =>
        (e.currentTarget.src = "https://placehold.co/64x64/f5f5f5/cccccc?text=?")
      }
      className="w-16 h-16 object-contain rounded-lg bg-gray-100 flex-shrink-0"
    />
    <div className="flex-1 min-w-0">
      <h3 className="font-semibold text-gray-900 truncate">{model.name}</h3>
      <p className="text-sm text-gray-500 truncate">
        {model.storage_options?.join(", ")}
      </p>
      <p className="text-sm font-medium text-yellow-600 mt-1">
        {model.available_lead_count} Leads Available
      </p>
    </div>
    <ChevronRight size={20} className="text-gray-400 flex-shrink-0" />
  </motion.div>
);

const BrowseModelsView: React.FC<{
  category: BrowseCategory;
  brand: BrowseBrand;
  onSelectModel: (model: BrowseModel) => void;
  onBack: () => void;
}> = ({ category, brand, onSelectModel, onBack }) => {
  const query = useGetBrowseModels(brand.id);

  return (
    <div className="bg-gray-50 min-h-screen">
      <BrowseHeader
        onBack={onBack}
        title={brand.name}
        breadcrumbs={category.name}
      />
      <ApiStatusWrapper query={query} onRetry={() => query.refetch()}>
        <div className="p-4 space-y-4">
          {query.data?.results.map((model) => (
            <ModelCard
              key={model.id}
              model={model}
              onClick={() => onSelectModel(model)}
            />
          ))}
        </div>
      </ApiStatusWrapper>
    </div>
  );
};

// --- VIEW 4: LEADS ---

const LeadCard: React.FC<{
  lead: BrowseLead;
  onClick: () => void;
}> = ({ lead, onClick }) => (
  <motion.div
    layout
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.2 }}
    className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md border border-gray-100"
  >
    <div className="flex items-center space-x-4 min-w-0">
      <img
        src={lead.device.image}
        alt={lead.device.model_name}
        onError={(e) =>
          (e.currentTarget.src = "https://placehold.co/64x64/f5f5f5/cccccc?text=?")
        }
        className="w-16 h-16 object-cover rounded-lg bg-gray-100 flex-shrink-0"
      />
      <div className="min-w-0">
        <h3 className="font-semibold text-lg text-gray-900 truncate">
          {lead.device.model_name}
        </h3>
        <p className="text-sm text-gray-500 truncate">
          {lead.device.storage} / {lead.device.ram} / {lead.device.color}
        </p>
        <p className="text-sm text-gray-500 truncate">
          <MapPin size={12} className="inline -mt-1" />{" "}
          {lead.location.city}, {lead.location.postal_code}
        </p>
      </div>
    </div>
    <div className="text-right flex-shrink-0 ml-4">
      <p className="font-bold text-lg text-gray-900">
        ₹{parseFloat(lead.pricing.estimated_price).toLocaleString("en-IN")}
      </p>
      <button
        onClick={onClick}
        className="mt-1 px-5 py-2 bg-yellow-400 text-black font-semibold rounded-lg text-sm hover:bg-yellow-500 transition-colors"
      >
        View Details
      </button>
    </div>
  </motion.div>
);

const BrowseLeadsView: React.FC<{
  category: BrowseCategory;
  brand: BrowseBrand;
  model: BrowseModel;
  onSelectLead: (leadId: string) => void;
  onBack: () => void;
}> = ({ category, brand, model, onSelectLead, onBack }) => {
  const query = useGetBrowseLeads(model.id);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredLeads = query.data?.results.filter((lead) => {
    const search = searchQuery.toLowerCase();
    return (
      lead.device.model_name.toLowerCase().includes(search) ||
      lead.location.city.toLowerCase().includes(search) ||
      lead.location.postal_code.includes(search)
    );
  });

  return (
    <div className="bg-gray-50 min-h-screen">
      <BrowseHeader
        onBack={onBack}
        title={model.name}
        breadcrumbs={`${category.name} > ${brand.name}`}
      />
      <div className="p-4 space-y-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search by city, pincode..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
          <Search
            size={20}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
        </div>

        <ApiStatusWrapper query={query} onRetry={() => query.refetch()}>
          {filteredLeads && filteredLeads.length > 0 ? (
            filteredLeads.map((lead) => (
              <LeadCard
                key={lead.id}
                lead={lead}
                onClick={() => onSelectLead(lead.id)}
              />
            ))
          ) : (
            <div className="text-center py-12 text-gray-500">
              <h3 className="text-xl font-semibold">No Leads Found</h3>
              <p>No leads are currently available for this model.</p>
            </div>
          )}
        </ApiStatusWrapper>
      </div>
    </div>
  );
};

// --- VIEW 5: LEAD DETAIL (PARTIAL / MASKED) ---

const BrowseLeadDetailView: React.FC<{
  leadId: string;
  onClaim: (lead: BrowseLeadDetail) => void;
  onBack: () => void;
}> = ({ leadId, onClaim, onBack }) => {
  const query = useGetBrowseLeadDetail(leadId);
  const lead = query.data;

  const handleClaim = () => {
    if (lead) {
      onClaim(lead);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <BrowseHeader onBack={onBack} title="Lead Preview" />
      <ApiStatusWrapper query={query} onRetry={() => query.refetch()}>
        {lead && (
          <>
            <div className="p-6 bg-white lg:max-w-4xl lg:mx-auto lg:my-6 lg:rounded-lg lg:shadow-xl lg:border lg:border-gray-100">
              <main className="lg:grid lg:grid-cols-2 lg:gap-8">
                <div className="space-y-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-2xl font-bold">
                        {lead.device.model_name}
                      </h3>
                      <p className="text-2xl font-bold text-green-600 mt-1">
                        Est. Price: ₹
                        {parseFloat(lead.pricing.estimated_price).toLocaleString(
                          "en-IN"
                        )}
                      </p>
                    </div>
                    <img
                      src={
                        lead.device.images.find((i) => i.is_primary)?.image ||
                        lead.device.images[0]?.image
                      }
                      alt={lead.device.model_name}
                      onError={(e) =>
                        (e.currentTarget.src = "https://placehold.co/96x96/f5f5f5/cccccc?text=?")
                      }
                      className="w-24 h-24 object-cover rounded-lg bg-gray-100"
                    />
                  </div>
                  <DetailSection
                    title="Highlights"
                    grid
                    items={[
                      {
                        label: "Device Category",
                        value: lead.device.category_name,
                      },
                      {
                        label: "Device Summary",
                        value: lead.condition.responses?.body_condition,
                      },
                      {
                        label: "Device Age",
                        value: lead.condition.responses?.device_age,
                      },
                    ]}
                  />
                  {lead.condition.customer_notes && (
                    <p className="text-xs text-gray-500 italic ml-4 -mt-3">
                      comment : {lead.condition.customer_notes}
                    </p>
                  )}
                </div>
                <div className="space-y-5 mt-5 lg:mt-0">
                  <DetailSection
                    title="Pickup & Location Info"
                    items={[
                      {
                        label: "Pickup Area / City / Pincode",
                        value: `${lead.pickup.address.city}, ${lead.pickup.address.postal_code}`,
                      },
                      {
                        label: "Pickup Slot / Preferred Time",
                        value: `${lead.pickup.preferred_date} / ${lead.pickup.preferred_time_slot}`,
                      },
                      { label: "View in Maps", value: "Unlock after claim" },
                    ]}
                  />
                  <DetailSection
                    title="Customer Data (Masked)"
                    items={[
                      {
                        label: "Customer Name",
                        value: lead.customer.name,
                      },
                      {
                        label: "Phone Number",
                        value: lead.customer.phone,
                      },
                    ]}
                  />
                  <p className="text-sm text-gray-500 pt-2">
                    Full customer details and address unlock after claim.
                  </p>
                  <p
                    className={`font-semibold text-lg ${
                      lead.can_claim ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    Lead Status :{" "}
                    {lead.can_claim ? "Available to Claim" : "Not Available"}
                  </p>
                </div>
              </main>
            </div>
            <footer className="p-4 bg-white border-t sticky bottom-0 z-10 space-y-2 lg:rounded-b-lg lg:max-w-4xl lg:mx-auto">
              <div className="p-3 bg-gray-100 rounded-md text-sm text-gray-700 border border-gray-200">
                A claim fee of{" "}
                <strong className="text-black">
                  ₹{parseFloat(lead.pricing.claim_fee).toLocaleString("en-IN")}
                </strong>{" "}
                will be deducted from your wallet to claim this lead.
              </div>
              <button
                onClick={handleClaim}
                disabled={!lead.can_claim}
                className="w-full py-3 bg-yellow-400 text-black font-semibold rounded-lg text-base hover:bg-yellow-500 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {lead.can_claim ? "Claim Lead" : "Lead Cannot Be Claimed"}
              </button>
            </footer>
          </>
        )}
      </ApiStatusWrapper>
    </div>
  );
};

// =========================================================================
// --- 7. CLAIM FLOW COMPONENTS ---
// =========================================================================

// --- VIEW 6: CONFIRM CLAIM ---

const ConfirmClaimView: React.FC<{
  lead: BrowseLeadDetail;
  onConfirm: () => void;
  onBack: () => void;
  mutation: ReturnType<typeof useClaimLead>;
}> = ({ lead, onConfirm, onBack, mutation }) => {
  const apiError = mutation.isError
    ? mutation.error.response?.data?.detail || mutation.error.message
    : null;

  return (
    <div className="bg-gray-50 min-h-screen">
      <BrowseHeader onBack={onBack} title="Confirm Claim" />
      <div className="p-6 bg-white lg:max-w-4xl lg:mx-auto lg:my-6 lg:rounded-lg lg:shadow-xl lg:border lg:border-gray-100">
        <main className="lg:grid lg:grid-cols-2 lg:gap-8">
          <div>
            <h3 className="text-2xl font-bold mb-6">Claim Lead</h3>
            <DetailSection
              items={[
                { label: "Device", value: lead.device.model_name },
                {
                  label: "Estimated Price",
                  value: `₹${parseFloat(
                    lead.pricing.estimated_price
                  ).toLocaleString("en-IN")}`,
                },
                {
                  label: "Pickup Area",
                  value: `${lead.pickup.address.city}, ${lead.pickup.address.postal_code}`,
                },
                {
                  label: "Pickup Slot",
                  value: `${lead.pickup.preferred_date} / ${lead.pickup.preferred_time_slot}`,
                },
                {
                  label: "Claim Fee",
                  value: `₹${parseFloat(lead.pricing.claim_fee).toLocaleString(
                    "en-IN"
                  )}`,
                },
              ]}
            />
          </div>
          <div className="mt-6 lg:mt-0">
            <ul className="list-disc list-inside space-y-2 text-sm text-gray-600 bg-gray-50 p-4 rounded-md border border-gray-200">
              <li>
                You're about to claim this lead. Please review the details.
              </li>
              <li>
                Full customer details unlock instantly - lead moves to My Leads.
              </li>
              <li>
                Claiming debits your wallet, reveals contact, and assigns the
                lead to you.
              </li>
              <li>
                Claiming confirms your commitment to visit on time.
              </li>
            </ul>
            {apiError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
                <strong>Claim Failed:</strong> {apiError}
              </div>
            )}
          </div>
        </main>
      </div>
      <footer className="p-4 bg-white border-t sticky bottom-0 z-10 flex space-x-3 lg:rounded-b-lg lg:max-w-4xl lg:mx-auto">
        <button
          onClick={onBack}
          disabled={mutation.isPending}
          className="w-full py-3 bg-white border border-gray-300 text-black font-semibold rounded-lg text-base hover:bg-gray-100 transition-colors disabled:bg-gray-200"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={mutation.isPending}
          className="w-full py-3 bg-yellow-400 text-black font-semibold rounded-lg text-base hover:bg-yellow-500 transition-colors disabled:bg-gray-300"
        >
          {mutation.isPending ? (
            <Loader2 className="mx-auto animate-spin" />
          ) : (
            "Confirm & Claim"
          )}
        </button>
      </footer>
    </div>
  );
};

// --- VIEW 7: CLAIM SUCCESS ---

const ClaimSuccessView: React.FC<{
  lead: BrowseLeadDetail;
  claimResponse: ClaimSuccessResponse;
  onViewDetails: () => void;
  onGoToMyLeads: () => void;
}> = ({ lead, claimResponse, onViewDetails, onGoToMyLeads }) => (
  <div className="bg-gray-50 min-h-screen">
    <BrowseHeader onBack={onGoToMyLeads} title="Claim Confirmed" />
    <div className="p-6 bg-white lg:max-w-2xl lg:mx-auto lg:my-6 lg:rounded-lg lg:shadow-xl lg:border lg:border-gray-100">
      <main className="p-6 flex flex-col items-center text-center">
        <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center">
          <Check size={48} className="text-white" />
        </div>
        <h3 className="text-2xl font-bold mt-6">
          {claimResponse.message}
        </h3>
        <div className="w-full text-left my-6">
          <DetailSection
            items={[
              { label: "Device", value: lead.device.model_name },
              {
                label: "Estimated Price",
                value: `₹${parseFloat(
                  lead.pricing.estimated_price
                ).toLocaleString("en-IN")}`,
              },
              {
                label: "Pickup Area",
                value: `${lead.pickup.address.city}, ${lead.pickup.address.postal_code}`,
              },
              { label: "Lead ID", value: lead.lead_number },
            ]}
          />
        </div>
        <p className="text-sm text-gray-600">
          Full address and contact number are now available in My Leads.
        </p>
      </main>
    </div>
    <footer className="p-4 bg-white border-t sticky bottom-0 z-10 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 lg:rounded-b-lg lg:max-w-2xl lg:mx-auto">
      <button
        onClick={onGoToMyLeads}
        className="w-full py-3 bg-white border border-gray-300 text-black font-semibold rounded-lg text-base hover:bg-gray-100 transition-colors"
      >
        Go to My Leads
      </button>
      <button
        onClick={onViewDetails}
        className="w-full py-3 bg-yellow-400 text-black font-semibold rounded-lg text-base hover:bg-yellow-500 transition-colors"
      >
        View Lead Details
      </button>
    </footer>
  </div>
);

// --- VIEW 8: UNLOCKED LEAD DETAIL ---

const UnlockedLeadDetailView: React.FC<{
  leadId: string;
  onGoToMyLeads: () => void;
  onBack: () => void;
}> = ({ leadId, onGoToMyLeads, onBack }) => {
  const query = useGetUnlockedLeadDetail(leadId);
  const lead = query.data;

  const fullAddress = lead
    ? [
        lead.customer.address.address_line1,
        lead.customer.address.address_line2,
        lead.customer.address.city,
        lead.customer.address.state,
        lead.customer.address.postal_code,
      ]
        .filter(Boolean)
        .join(", ")
    : "";

  return (
    <div className="bg-gray-50 min-h-screen">
      <BrowseHeader onBack={onBack} title="Lead Details" />
      <ApiStatusWrapper query={query} onRetry={() => query.refetch()}>
        {lead && (
          <>
            <div className="p-6 bg-white lg:max-w-4xl lg:mx-auto lg:my-6 lg:rounded-lg lg:shadow-xl lg:border lg:border-gray-100">
              <main className="lg:grid lg:grid-cols-2 lg:gap-8">
                <div className="space-y-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-2xl font-bold">
                        {lead.device.model_name}
                      </h3>
                      <p className="text-2xl font-bold text-green-600 mt-1">
                        ₹
                        {parseFloat(
                          lead.pricing.estimated_price
                        ).toLocaleString("en-IN")}
                      </p>
                    </div>
                    <img
                      src={
                        lead.device.images.find((i) => i.is_primary)?.image ||
                        lead.device.images[0]?.image
                      }
                      alt={lead.device.model_name}
                      onError={(e) =>
                        (e.currentTarget.src = "https://placehold.co/96x96/f5f5f5/cccccc?text=?")
                      }
                      className="w-24 h-24 object-cover rounded-lg bg-gray-100"
                    />
                  </div>
                  <DetailSection
                    title="Highlights"
                    grid
                    items={[
                      {
                        label: "Device Category",
                        value: lead.device.category_name,
                      },
                      {
                        label: "Device Summary",
                        value: lead.condition.responses?.body_condition,
                      },
                      {
                        label: "Device Age",
                        value: lead.condition.responses?.device_age,
                      },
                    ]}
                  />
                </div>
                <div className="space-y-5 mt-5 lg:mt-0">
                  <DetailSection
                    title="Pickup & Location Info (Unlocked)"
                    items={[
                      {
                        label: "Pickup Address",
                        value: fullAddress,
                      },
                      {
                        label: "Pickup Slot",
                        value: `${lead.pickup.preferred_date} / ${lead.pickup.preferred_time_slot}`,
                      },
                    ]}
                  />
                  <div className="border-t border-gray-200 pt-4">
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        fullAddress
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 text-sm text-blue-600 hover:underline"
                    >
                      <MapPin size={16} />
                      <span>Open in Google Maps</span>
                    </a>
                  </div>
                  <DetailSection
                    title="Customer Data (Unlocked)"
                    items={[
                      { label: "Customer Name", value: lead.customer.name },
                      {
                        label: "Phone Number",
                        value: lead.customer.phone,
                      },
                    ]}
                  />
                  <p className="text-sm text-gray-500 pt-2">
                    Track your visit, update progress, and complete the deal.
                  </p>
                  <p className="font-semibold text-blue-600 text-lg">
                    Lead Status : {lead.status}
                  </p>
                </div>
              </main>
            </div>
            <footer className="p-4 bg-white border-t sticky bottom-0 z-10 lg:rounded-b-lg lg:max-w-4xl lg:mx-auto">
              <button
                onClick={onGoToMyLeads}
                className="w-full py-3 bg-yellow-400 text-black font-semibold rounded-lg text-base hover:bg-yellow-500 transition-colors"
              >
                Go to My Leads
              </button>
            </footer>
          </>
        )}
      </ApiStatusWrapper>
    </div>
  );
};

// =========================================================================
// --- 8. MASTER COMPONENT ---
// =========================================================================

type BrowseView =
  | "categories"
  | "brands"
  | "models"
  | "leads"
  | "leadDetail"
  | "confirmClaim"
  | "claimSuccess"
  | "unlockedDetail";

const PartnerBrowseFlow: React.FC = () => {
  const [view, setView] = useState<BrowseView>("categories");

  const [selectedCategory, setSelectedCategory] =
    useState<BrowseCategory | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<BrowseBrand | null>(null);
  const [selectedModel, setSelectedModel] = useState<BrowseModel | null>(null);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

  const [leadToClaim, setLeadToClaim] = useState<BrowseLeadDetail | null>(null);
  const claimMutation = useClaimLead();

  const handleSelectCategory = (category: BrowseCategory) => {
    setSelectedCategory(category);
    setView("brands");
  };

  const handleSelectBrand = (brand: BrowseBrand) => {
    setSelectedBrand(brand);
    setView("models");
  };

  const handleSelectModel = (model: BrowseModel) => {
    setSelectedModel(model);
    setView("leads");
  };

  const handleSelectLead = (leadId: string) => {
    setSelectedLeadId(leadId);
    setView("leadDetail");
  };

  const handleClaimLead = (lead: BrowseLeadDetail) => {
    setLeadToClaim(lead);
    claimMutation.reset();
    setView("confirmClaim");
  };

  const handleConfirmClaim = () => {
    if (!leadToClaim) return;

    claimMutation.mutate(leadToClaim.id, {
      onSuccess: () => {
        setView("claimSuccess");
      },
      onError: () => {
        // Error handled in component
      },
    });
  };

  const handleGoToMyLeads = () => {
    // Reset state and go back to categories
    setView("categories");
    setSelectedCategory(null);
    setSelectedBrand(null);
    setSelectedModel(null);
    setSelectedLeadId(null);
    setLeadToClaim(null);
    claimMutation.reset();
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={view}
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -50 }}
        transition={{ duration: 0.15 }}
      >
        {view === "categories" && (
          <BrowseCategoriesView onSelectCategory={handleSelectCategory} />
        )}

        {view === "brands" && selectedCategory && (
          <BrowseBrandsView
            category={selectedCategory}
            onSelectBrand={handleSelectBrand}
            onBack={() => setView("categories")}
          />
        )}

        {view === "models" && selectedCategory && selectedBrand && (
          <BrowseModelsView
            category={selectedCategory}
            brand={selectedBrand}
            onSelectModel={handleSelectModel}
            onBack={() => setView("brands")}
          />
        )}

        {view === "leads" && selectedCategory && selectedBrand && selectedModel && (
          <BrowseLeadsView
            category={selectedCategory}
            brand={selectedBrand}
            model={selectedModel}
            onSelectLead={handleSelectLead}
            onBack={() => setView("models")}
          />
        )}

        {view === "leadDetail" && selectedLeadId && (
          <BrowseLeadDetailView
            leadId={selectedLeadId}
            onClaim={handleClaimLead}
            onBack={() => setView("leads")}
          />
        )}

        {view === "confirmClaim" && leadToClaim && (
          <ConfirmClaimView
            lead={leadToClaim}
            onConfirm={handleConfirmClaim}
            onBack={() => setView("leadDetail")}
            mutation={claimMutation}
          />
        )}

        {view === "claimSuccess" &&
          leadToClaim &&
          claimMutation.data && (
            <ClaimSuccessView
              lead={leadToClaim}
              claimResponse={claimMutation.data}
              onViewDetails={() => setView("unlockedDetail")}
              onGoToMyLeads={handleGoToMyLeads}
            />
          )}

        {view === "unlockedDetail" && selectedLeadId && (
          <UnlockedLeadDetailView
            leadId={selectedLeadId}
            onGoToMyLeads={handleGoToMyLeads}
            onBack={() => setView("claimSuccess")}
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
};

// =========================================================================
// --- 9. APP WRAPPER ---
// =========================================================================

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    },
  },
});

// FIXED VERSION: The main component with auth check at the beginning
const Leads = () => {
  // Get authentication state from the store
  const { user, isAuthenticated } = useAuthStore();
  const isPartner = user?.role === 'partner';
  
  // Check loading state separately to prevent premature auth check
  const { isLoading } = useAuthStore((state) => ({ isLoading: state.isLoading }));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <Loader2 size={48} className="animate-spin text-yellow-500" />
      </div>
    );
  }

  // If not authenticated or not a partner, show friendly message
  if (!isAuthenticated() || !isPartner) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
        <h2 className="text-2xl font-bold mb-4">Partner Access Required</h2>
        <p className="text-gray-600 mb-6 text-center">
          You need to be logged in as a partner to view leads.
        </p>
        <div className="flex gap-4">
          <Link 
            to="/login" 
            className="bg-brand-yellow hover:bg-yellow-500 text-black font-medium py-2 px-4 rounded"
          >
            Partner Login
          </Link>
          <Link 
            to="/partner-signup" 
            className="bg-white border border-gray-300 hover:bg-gray-100 text-gray-800 font-medium py-2 px-4 rounded"
          >
            Become a Partner
          </Link>
        </div>
      </div>
    );
  }

  // Only render the actual content when authenticated and a partner
  return (
    <QueryClientProvider client={queryClient}>
      <PartnerBrowseFlow />
    </QueryClientProvider>
  );
};

export default Leads;