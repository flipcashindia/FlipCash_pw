import { type Location } from './common.types';

export interface Visit {
  id: string;
  lead: string;
  partner: string;
  status: 'scheduled' | 'partner_en_route' | 'arrived' | 'in_progress' | 'completed' | 'cancelled';
  scheduled_date: string;
  scheduled_time_slot: string;
  checkin_time?: string;
  checkin_location?: Location;
  checkout_time?: string;
  inspection_data?: InspectionData;
  final_price?: number;
  partner_decision: 'accepted' | 'rejected' | 'counter_offer' | 'pending';
  customer_decision?: 'accepted' | 'rejected' | 'pending';
  counter_offer_price?: number;
  rejection_reason?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface InspectionData {
  physical_condition: {
    body: string;
    screen: string;
    camera: string;
    buttons: string;
    ports: string;
  };
  functional_tests: {
    display: boolean;
    touch: boolean;
    wifi: boolean;
    bluetooth: boolean;
    camera_front: boolean;
    camera_back: boolean;
    speaker: boolean;
    microphone: boolean;
    charging: boolean;
    battery_health?: number;
  };
  imei_verified: boolean;
  accessories_present: string[];
  inspection_images: string[];
  inspector_notes: string;
}

export interface CheckinRequest {
  location: Location;
}

export interface InspectionRequest {
  inspection_data: InspectionData;
  recommended_price: number;
  partner_notes?: string;
}

export interface FinalizeRequest {
  final_price: number;
  payment_method: 'cash' | 'upi' | 'bank_transfer';
  payment_proof?: string;
  customer_signature?: string;
}