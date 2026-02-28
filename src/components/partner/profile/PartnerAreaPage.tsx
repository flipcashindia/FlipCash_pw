// src/pages/partner/profile/PartnerAreaPage.tsx
/**
 * Partner Service Area Page
 *
 * City icons: each major city has a built-in landmark SVG (matches the reference design).
 * If the backend has uploaded an icon_url, that takes priority.
 * Icons use the FlipCash teal #1DB8A0 + dark outline #1C1C1B palette.
 */

import React, { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  partnerService,
  type AvailableCity,
  type ServiceZone,
} from '../../../api/services/partnerService';
import { useToast } from '../../../contexts/ToastContext';
import {
  Loader2, MapPin, X, Map, AlertCircle, CheckCircle,
  Search, ChevronDown, ChevronUp, Plus, Star,
} from 'lucide-react';
import { type ServiceArea } from '../../../api/types/api';

// ─────────────────────────────────────────────────────────────────────────────
// CITY LANDMARK SVG ICONS
// Each SVG is 80 × 80 viewBox, teal fill #1DB8A0 with #1C1C1B outlines
// matching the illustrated style in the reference screenshots.
// ─────────────────────────────────────────────────────────────────────────────

const CITY_ICONS: Record<string, React.FC<{ size?: number; className?: string }>> = {

  Delhi: ({ size = 64, className = '' }) => (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" className={className}>
      {/* India Gate arch */}
      <rect x="36" y="8" width="8" height="6" rx="1" fill="#1DB8A0" stroke="#1C1C1B" strokeWidth="1.5"/>
      <path d="M24 38 Q40 18 56 38" stroke="#1C1C1B" strokeWidth="2" fill="#1DB8A0" fillOpacity="0.3"/>
      <rect x="22" y="38" width="8" height="28" rx="1" fill="#1DB8A0" stroke="#1C1C1B" strokeWidth="1.5"/>
      <rect x="50" y="38" width="8" height="28" rx="1" fill="#1DB8A0" stroke="#1C1C1B" strokeWidth="1.5"/>
      <rect x="30" y="52" width="20" height="14" rx="1" fill="#1DB8A0" stroke="#1C1C1B" strokeWidth="1.5"/>
      <path d="M30 52 Q40 44 50 52" stroke="#1C1C1B" strokeWidth="1.5" fill="#1DB8A0"/>
      <rect x="18" y="64" width="44" height="4" rx="1" fill="#1C1C1B"/>
      {/* Lamp posts */}
      <line x1="16" y1="46" x2="16" y2="64" stroke="#1C1C1B" strokeWidth="1.5"/>
      <circle cx="16" cy="44" r="2.5" fill="#FEC925" stroke="#1C1C1B" strokeWidth="1"/>
      <line x1="64" y1="46" x2="64" y2="64" stroke="#1C1C1B" strokeWidth="1.5"/>
      <circle cx="64" cy="44" r="2.5" fill="#FEC925" stroke="#1C1C1B" strokeWidth="1"/>
    </svg>
  ),

  Mumbai: ({ size = 64, className = '' }) => (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" className={className}>
      {/* Gateway of India */}
      <path d="M20 64 L20 42 Q20 34 28 34 L52 34 Q60 34 60 42 L60 64" stroke="#1C1C1B" strokeWidth="2" fill="#1DB8A0" fillOpacity="0.2"/>
      {/* Main arch */}
      <path d="M28 64 L28 46 Q28 38 40 38 Q52 38 52 46 L52 64" fill="#1DB8A0" stroke="#1C1C1B" strokeWidth="1.5"/>
      <path d="M28 46 Q40 32 52 46" fill="none" stroke="#1C1C1B" strokeWidth="2"/>
      {/* Dome */}
      <ellipse cx="40" cy="26" rx="8" ry="6" fill="#1DB8A0" stroke="#1C1C1B" strokeWidth="1.5"/>
      <line x1="40" y1="20" x2="40" y2="14" stroke="#1C1C1B" strokeWidth="1.5"/>
      <circle cx="40" cy="13" r="2" fill="#FEC925" stroke="#1C1C1B" strokeWidth="1"/>
      {/* Side towers */}
      <rect x="16" y="44" width="8" height="20" rx="1" fill="#1DB8A0" stroke="#1C1C1B" strokeWidth="1.5"/>
      <path d="M16 44 Q20 38 24 44" fill="#1DB8A0" stroke="#1C1C1B" strokeWidth="1.5"/>
      <rect x="56" y="44" width="8" height="20" rx="1" fill="#1DB8A0" stroke="#1C1C1B" strokeWidth="1.5"/>
      <path d="M56 44 Q60 38 64 44" fill="#1DB8A0" stroke="#1C1C1B" strokeWidth="1.5"/>
      {/* Base */}
      <rect x="14" y="64" width="52" height="4" rx="1" fill="#1C1C1B"/>
    </svg>
  ),

  Bangalore: ({ size = 64, className = '' }) => (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" className={className}>
      {/* Vidhana Soudha style building */}
      {/* Dome */}
      <ellipse cx="40" cy="16" rx="10" ry="8" fill="#1DB8A0" stroke="#1C1C1B" strokeWidth="1.5"/>
      <line x1="40" y1="8" x2="40" y2="4" stroke="#1C1C1B" strokeWidth="1.5"/>
      <polygon points="40,2 42,6 38,6" fill="#FEC925" stroke="#1C1C1B" strokeWidth="0.5"/>
      {/* Main block */}
      <rect x="22" y="24" width="36" height="10" rx="1" fill="#1DB8A0" stroke="#1C1C1B" strokeWidth="1.5"/>
      <rect x="26" y="34" width="28" height="22" rx="1" fill="#1DB8A0" stroke="#1C1C1B" strokeWidth="1.5"/>
      {/* Columns */}
      {[30,36,42,48].map(x => (
        <rect key={x} x={x} y="34" width="4" height="22" rx="0.5" fill="white" fillOpacity="0.4" stroke="#1C1C1B" strokeWidth="1"/>
      ))}
      {/* Steps */}
      <rect x="20" y="56" width="40" height="4" rx="0.5" fill="#1DB8A0" stroke="#1C1C1B" strokeWidth="1.5"/>
      <rect x="16" y="60" width="48" height="4" rx="0.5" fill="#1DB8A0" stroke="#1C1C1B" strokeWidth="1.5"/>
      <rect x="12" y="64" width="56" height="4" rx="1" fill="#1C1C1B"/>
    </svg>
  ),

  Chennai: ({ size = 64, className = '' }) => (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" className={className}>
      {/* Kapaleeshwarar Temple gopuram */}
      {/* Tiered tower */}
      <polygon points="40,6 52,22 28,22" fill="#1DB8A0" stroke="#1C1C1B" strokeWidth="1.5"/>
      <rect x="30" y="22" width="20" height="8" rx="0.5" fill="#1DB8A0" stroke="#1C1C1B" strokeWidth="1.5"/>
      <polygon points="40,30 50,42 30,42" fill="#1DB8A0" stroke="#1C1C1B" strokeWidth="1.5"/>
      <rect x="28" y="42" width="24" height="8" rx="0.5" fill="#1DB8A0" stroke="#1C1C1B" strokeWidth="1.5"/>
      {/* Main hall */}
      <rect x="24" y="50" width="32" height="14" rx="1" fill="#1DB8A0" stroke="#1C1C1B" strokeWidth="1.5"/>
      {/* Columns */}
      {[28,34,40,46].map(x => (
        <rect key={x} x={x} y="52" width="3.5" height="12" rx="0.5" fill="white" fillOpacity="0.5" stroke="#1C1C1B" strokeWidth="0.5"/>
      ))}
      {/* Decorative dots on tiers */}
      {[8,10,12].map((y,i) => <circle key={i} cx={40} cy={y} r="1.5" fill="#FEC925"/>)}
      <rect x="16" y="64" width="48" height="4" rx="1" fill="#1C1C1B"/>
    </svg>
  ),

  Hyderabad: ({ size = 64, className = '' }) => (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" className={className}>
      {/* Charminar */}
      {/* 4 minarets */}
      {[18,54].map(x => [
        <rect key={`t-${x}`} x={x-3} y="14" width="6" height="28" rx="1" fill="#1DB8A0" stroke="#1C1C1B" strokeWidth="1.5"/>,
        <ellipse key={`d-${x}`} cx={x} cy="14" rx="5" ry="7" fill="#1DB8A0" stroke="#1C1C1B" strokeWidth="1.5"/>,
        <line key={`l-${x}`} x1={x} y1="7" x2={x} y2="4" stroke="#1C1C1B" strokeWidth="1.5"/>,
        <circle key={`c-${x}`} cx={x} cy="3" r="2" fill="#FEC925" stroke="#1C1C1B" strokeWidth="1"/>,
      ])}
      {/* Main arches */}
      <rect x="22" y="36" width="36" height="28" rx="1" fill="#1DB8A0" stroke="#1C1C1B" strokeWidth="1.5"/>
      {/* Centre arches */}
      <path d="M28 64 L28 50 Q28 44 34 44 Q40 44 40 50 L40 64" fill="white" fillOpacity="0.3" stroke="#1C1C1B" strokeWidth="1"/>
      <path d="M40 64 L40 50 Q40 44 46 44 Q52 44 52 50 L52 64" fill="white" fillOpacity="0.3" stroke="#1C1C1B" strokeWidth="1"/>
      {/* Top dome */}
      <ellipse cx="40" cy="36" rx="10" ry="7" fill="#1DB8A0" stroke="#1C1C1B" strokeWidth="1.5"/>
      <rect x="14" y="64" width="52" height="4" rx="1" fill="#1C1C1B"/>
    </svg>
  ),

  Kolkata: ({ size = 64, className = '' }) => (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" className={className}>
      {/* Howrah Bridge */}
      {/* Towers */}
      <rect x="12" y="22" width="10" height="44" rx="1" fill="#1DB8A0" stroke="#1C1C1B" strokeWidth="1.5"/>
      <rect x="58" y="22" width="10" height="44" rx="1" fill="#1DB8A0" stroke="#1C1C1B" strokeWidth="1.5"/>
      {/* Tower tops */}
      <polygon points="17,10 22,22 12,22" fill="#1DB8A0" stroke="#1C1C1B" strokeWidth="1.5"/>
      <polygon points="63,10 68,22 58,22" fill="#1DB8A0" stroke="#1C1C1B" strokeWidth="1.5"/>
      {/* Suspension cables */}
      <path d="M17 14 Q40 42 63 14" stroke="#1C1C1B" strokeWidth="1.5" fill="none"/>
      <path d="M17 18 Q40 46 63 18" stroke="#1C1C1B" strokeWidth="1" fill="none"/>
      {/* Vertical cables */}
      {[26,32,38,44,50,56].map(x => (
        <line key={x} x1={x} y1={22 + (x-17)*(46-22)/(63-17) - 2} x2={x} y2="56" stroke="#1C1C1B" strokeWidth="0.8"/>
      ))}
      {/* Bridge deck */}
      <rect x="10" y="54" width="60" height="6" rx="1" fill="#1DB8A0" stroke="#1C1C1B" strokeWidth="1.5"/>
      {/* River */}
      <path d="M8 66 Q20 62 32 66 Q44 70 56 66 Q68 62 72 66 L72 72 L8 72 Z" fill="#1DB8A0" fillOpacity="0.3" stroke="#1C1C1B" strokeWidth="1"/>
    </svg>
  ),

  Noida: ({ size = 64, className = '' }) => (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" className={className}>
      {/* Modern corporate high-rise cluster */}
      {/* Tall center tower */}
      <rect x="30" y="10" width="20" height="54" rx="2" fill="#1DB8A0" stroke="#1C1C1B" strokeWidth="1.5"/>
      {/* Windows center */}
      {[14,20,26,32,38,44,50].map(y => (
        <rect key={y} x="33" y={y} width="6" height="4" rx="0.5" fill="white" fillOpacity="0.6" stroke="#1C1C1B" strokeWidth="0.5"/>
        ))}
      {/* Antenna */}
      <line x1="40" y1="10" x2="40" y2="4" stroke="#1C1C1B" strokeWidth="1.5"/>
      <circle cx="40" cy="3" r="2" fill="#FEC925" stroke="#1C1C1B" strokeWidth="1"/>
      {/* Left mid-rise */}
      <rect x="12" y="28" width="16" height="36" rx="2" fill="#1DB8A0" stroke="#1C1C1B" strokeWidth="1.5"/>
      {[30,36,42,48,54].map(y => (
        <rect key={y} x="15" y={y} width="4" height="3" rx="0.5" fill="white" fillOpacity="0.5" stroke="#1C1C1B" strokeWidth="0.5"/>
      ))}
      {/* Right mid-rise */}
      <rect x="52" y="32" width="16" height="32" rx="2" fill="#1DB8A0" stroke="#1C1C1B" strokeWidth="1.5"/>
      {[34,40,46,52,58].map(y => (
        <rect key={y} x="55" y={y} width="4" height="3" rx="0.5" fill="white" fillOpacity="0.5" stroke="#1C1C1B" strokeWidth="0.5"/>
      ))}
      <rect x="10" y="64" width="60" height="4" rx="1" fill="#1C1C1B"/>
    </svg>
  ),

  Gurgaon: ({ size = 64, className = '' }) => (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" className={className}>
      {/* Cyber Hub / DLF Cyber City skyline */}
      {/* Tallest tower left */}
      <rect x="10" y="16" width="14" height="48" rx="2" fill="#1DB8A0" stroke="#1C1C1B" strokeWidth="1.5"/>
      {[18,24,30,36,42,48,54].map(y => (
        <rect key={y} x="13" y={y} width="5" height="3.5" rx="0.5" fill="white" fillOpacity="0.6" stroke="#1C1C1B" strokeWidth="0.3"/>
      ))}
      <line x1="17" y1="16" x2="17" y2="10" stroke="#1C1C1B" strokeWidth="1.5"/>
      <circle cx="17" cy="9" r="2" fill="#FEC925" stroke="#1C1C1B" strokeWidth="1"/>
      {/* Centre tower — tallest */}
      <rect x="30" y="8" width="20" height="56" rx="2" fill="#1DB8A0" stroke="#1C1C1B" strokeWidth="1.5"/>
      {[10,16,22,28,34,40,46,52,58].map(y => (
        <rect key={y} x="33" y={y} width="6" height="4" rx="0.5" fill="white" fillOpacity="0.5" stroke="#1C1C1B" strokeWidth="0.3"/>
      ))}
      <line x1="40" y1="8" x2="40" y2="3" stroke="#1C1C1B" strokeWidth="1.5"/>
      <circle cx="40" cy="2" r="2.5" fill="#FEC925" stroke="#1C1C1B" strokeWidth="1"/>
      {/* Right tower */}
      <rect x="56" y="22" width="14" height="42" rx="2" fill="#1DB8A0" stroke="#1C1C1B" strokeWidth="1.5"/>
      {[24,30,36,42,48,54,60].map(y => (
        <rect key={y} x="59" y={y} width="5" height="3.5" rx="0.5" fill="white" fillOpacity="0.6" stroke="#1C1C1B" strokeWidth="0.3"/>
      ))}
      <rect x="8" y="64" width="64" height="4" rx="1" fill="#1C1C1B"/>
    </svg>
  ),

  Pune: ({ size = 64, className = '' }) => (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" className={className}>
      {/* Shaniwar Wada inspired fort gate */}
      {/* Main gateway */}
      <rect x="24" y="30" width="32" height="34" rx="1" fill="#1DB8A0" stroke="#1C1C1B" strokeWidth="1.5"/>
      {/* Arch door */}
      <path d="M33 64 L33 48 Q33 40 40 40 Q47 40 47 48 L47 64" fill="#1C1C1B" fillOpacity="0.3" stroke="#1C1C1B" strokeWidth="1.5"/>
      {/* Battlements on top */}
      {[24,28,32,36,40,44,48,52].map(x => (
        <rect key={x} x={x} y="22" width="3" height="8" rx="0.5" fill="#1DB8A0" stroke="#1C1C1B" strokeWidth="1"/>
      ))}
      <rect x="22" y="30" width="36" height="4" rx="0.5" fill="#1DB8A0" stroke="#1C1C1B" strokeWidth="1.5"/>
      {/* Side towers */}
      <rect x="14" y="34" width="10" height="30" rx="1" fill="#1DB8A0" stroke="#1C1C1B" strokeWidth="1.5"/>
      {[36,42,48,54,60].map(y => (
        <rect key={y} x="16" y={y} width="6" height="3" rx="0.5" fill="white" fillOpacity="0.4" stroke="#1C1C1B" strokeWidth="0.5"/>
      ))}
      <rect x="12" y="28" width="12" height="6" rx="0.5" fill="#1DB8A0" stroke="#1C1C1B" strokeWidth="1.5"/>
      <rect x="56" y="34" width="10" height="30" rx="1" fill="#1DB8A0" stroke="#1C1C1B" strokeWidth="1.5"/>
      {[36,42,48,54,60].map(y => (
        <rect key={y} x="58" y={y} width="6" height="3" rx="0.5" fill="white" fillOpacity="0.4" stroke="#1C1C1B" strokeWidth="0.5"/>
      ))}
      <rect x="56" y="28" width="12" height="6" rx="0.5" fill="#1DB8A0" stroke="#1C1C1B" strokeWidth="1.5"/>
      <rect x="10" y="64" width="60" height="4" rx="1" fill="#1C1C1B"/>
    </svg>
  ),

  // Generic fallback for other cities
  _default: ({ size = 64, className = '' }) => (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" className={className}>
      <rect x="28" y="20" width="24" height="44" rx="2" fill="#1DB8A0" stroke="#1C1C1B" strokeWidth="1.5"/>
      {[22,28,34,40,46,52,58].map(y => (
        <rect key={y} x="31" y={y} width="7" height="4" rx="0.5" fill="white" fillOpacity="0.5" stroke="#1C1C1B" strokeWidth="0.5"/>
      ))}
      <line x1="40" y1="20" x2="40" y2="14" stroke="#1C1C1B" strokeWidth="1.5"/>
      <circle cx="40" cy="13" r="2" fill="#FEC925" stroke="#1C1C1B" strokeWidth="1"/>
      <rect x="12" y="36" width="14" height="28" rx="2" fill="#1DB8A0" stroke="#1C1C1B" strokeWidth="1.5"/>
      <rect x="54" y="40" width="14" height="24" rx="2" fill="#1DB8A0" stroke="#1C1C1B" strokeWidth="1.5"/>
      <rect x="10" y="64" width="60" height="4" rx="1" fill="#1C1C1B"/>
    </svg>
  ),
};

/** Return the right icon component for a city name. */
function getCityIcon(cityName: string): React.FC<{ size?: number; className?: string }> {
  return CITY_ICONS[cityName] ?? CITY_ICONS._default;
}

/** Render city icon: prefer backend icon_url, fallback to built-in SVG. */
const CityIcon: React.FC<{
  city: string;
  iconUrl?: string | null;
  size?: number;
  className?: string;
}> = ({ city, iconUrl, size = 56, className = '' }) => {
  if (iconUrl) {
    return (
      <img
        src={iconUrl}
        alt={city}
        width={size}
        height={size}
        className={`object-contain ${className}`}
        onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
      />
    );
  }
  const IconComponent = getCityIcon(city);
  return <IconComponent size={size} className={className} />;
};

// ─────────────────────────────────────────────────────────────────────────────
// CURRENT AREA CARD
// ─────────────────────────────────────────────────────────────────────────────

const AreaCard: React.FC<{
  area: ServiceArea;
  onDelete: (id: string) => void;
  onToggle: (id: string, is_active: boolean) => void;
  isDeleting: boolean;
}> = ({ area, onDelete, onToggle, isDeleting }) => {
  const pincodes = Array.isArray(area.postal_codes) ? area.postal_codes : [];
  const areaId   = (area as any).id as string;

  return (
    <div className={`relative rounded-2xl border-2 transition-all duration-200 hover:shadow-md overflow-hidden ${
      area.is_active ? 'border-gray-200 bg-white' : 'border-gray-100 bg-gray-50 opacity-75'
    }`}>
      <div className={`absolute top-0 left-0 w-1 h-full ${area.is_active ? 'bg-emerald-400' : 'bg-gray-300'}`} />

      <div className="p-5 pl-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {/* City icon */}
            <div className={`w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-xl ${area.is_active ? 'bg-emerald-50' : 'bg-gray-100'}`}>
              <CityIcon
                city={area.city || ''}
                iconUrl={(area as any).icon_url}
                size={36}
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-gray-900 text-sm">{area.name}</h3>
                <button
                  onClick={() => onToggle(areaId, !area.is_active)}
                  title={area.is_active ? 'Click to pause' : 'Click to reactivate'}
                  className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full cursor-pointer transition-colors ${
                    area.is_active
                      ? 'bg-emerald-100 text-emerald-700 hover:bg-red-100 hover:text-red-600'
                      : 'bg-gray-200 text-gray-500 hover:bg-emerald-100 hover:text-emerald-700'
                  }`}
                >
                  {area.is_active && <CheckCircle size={10} />}
                  {area.is_active ? 'Active' : 'Paused'}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                {[area.city, area.state].filter(Boolean).join(', ')}
              </p>
            </div>
          </div>

          <button
            onClick={() => onDelete(areaId)}
            disabled={isDeleting}
            className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0 disabled:opacity-30"
          >
            {isDeleting ? <Loader2 size={14} className="animate-spin" /> : <X size={14} />}
          </button>
        </div>

        {pincodes.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {pincodes.slice(0, 6).map((pin: string) => (
              <span key={pin} className="text-xs font-mono bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md">
                {pin}
              </span>
            ))}
            {pincodes.length > 6 && (
              <span className="text-xs bg-gray-100 text-gray-400 px-2 py-0.5 rounded-md">
                +{pincodes.length - 6} more
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// CITY ROW IN PICKER
// ─────────────────────────────────────────────────────────────────────────────

const CityRow: React.FC<{
  city: AvailableCity;
  onAddZone: (zoneId: string) => void;
  onRemoveZone: (areaId: string) => void;
  areas: ServiceArea[];
  loadingZoneId: string | null;
}> = ({ city, onAddZone, onRemoveZone, areas, loadingZoneId }) => {
  const [open, setOpen] = useState(false);

  const addedCount = city.zones.filter(z => z.already_added).length;
  const allAdded   = addedCount === city.zones.length && city.zones.length > 0;

  const areaForZone = useCallback((zoneId: string): string | undefined => {
    const area = areas.find(a => (a as any).zone_id === zoneId);
    return area ? (area as any).id : undefined;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [areas]);

  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          {/* City icon */}
          <div className={`w-10 h-10 flex items-center justify-center rounded-xl flex-shrink-0 ${
            allAdded ? 'bg-emerald-100' : addedCount > 0 ? 'bg-[#FEC925]/20' : 'bg-gray-50'
          }`}>
            <CityIcon
              city={city.name}
              iconUrl={(city as any).icon_url}
              size={32}
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-900 text-sm">{city.name}</span>
              {city.is_popular && <Star size={11} className="text-[#FEC925] fill-[#FEC925]" />}
              {city.is_major && (
                <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-bold">Metro</span>
              )}
            </div>
            <p className="text-xs text-gray-400">{city.state}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {addedCount > 0 && (
            <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
              {addedCount}/{city.zones.length} added
            </span>
          )}
          {open ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
        </div>
      </button>

      {open && (
        <div className="px-4 pb-4 border-t border-gray-50">
          <p className="text-xs text-gray-400 mt-3 mb-2">
            {city.is_major ? `Select zones in ${city.name}:` : `Toggle service in ${city.name}:`}
          </p>
          <div className="flex flex-wrap gap-2">
            {city.zones.map(zone => {
              const added   = zone.already_added;
              const areaId  = areaForZone(zone.id);
              const loading = loadingZoneId === zone.id;

              return (
                <button
                  key={zone.id}
                  disabled={loading}
                  onClick={() => added && areaId ? onRemoveZone(areaId) : onAddZone(zone.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border-2 transition-all ${
                    added
                      ? 'border-emerald-300 bg-emerald-50 text-emerald-700 hover:border-red-300 hover:bg-red-50 hover:text-red-600'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-[#FEC925] hover:bg-[#FEC925]/10 hover:text-[#1a1a1a]'
                  } disabled:opacity-50`}
                >
                  {loading ? <Loader2 size={11} className="animate-spin" />
                    : added ? <CheckCircle size={11} />
                    : <Plus size={11} />}
                  {zone.name}
                  {zone.pincode_count > 0 && (
                    <span className="opacity-50">({zone.pincode_count})</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// POPULAR CITIES GRID  (icon cards — matches homepage reference design)
// ─────────────────────────────────────────────────────────────────────────────

const PopularCityGrid: React.FC<{
  cities: AvailableCity[];
  onCityClick: (city: AvailableCity) => void;
  areas: ServiceArea[];
}> = ({ cities, onCityClick, areas }) => {
  const popular = cities.filter(c => c.is_popular);
  if (!popular.length) return null;

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Star size={13} className="text-[#FEC925] fill-[#FEC925]" />
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide">Popular Cities</h3>
      </div>
      <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
        {popular.map(city => {
          const addedZones = city.zones.filter(z => z.already_added).length;
          return (
            <button
              key={city.id}
              onClick={() => onCityClick(city)}
              className="flex flex-col items-center gap-2 p-3 rounded-2xl border-2 hover:border-[#FEC925] hover:shadow-md transition-all group cursor-pointer"
              style={{ borderColor: addedZones > 0 ? '#1DB8A0' : '#f0f0f0', background: addedZones > 0 ? '#f0faf8' : 'white' }}
            >
              <div className="relative w-14 h-14 flex items-center justify-center">
                <CityIcon city={city.name} iconUrl={(city as any).icon_url} size={52} />
                {addedZones > 0 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                    <CheckCircle size={12} className="text-white" />
                  </div>
                )}
              </div>
              <span className="text-xs font-bold text-gray-700 group-hover:text-[#1a1a1a] text-center leading-tight">
                {city.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// ZONE PICKER MODAL
// ─────────────────────────────────────────────────────────────────────────────

const ZonePickerModal: React.FC<{
  onClose: () => void;
  areas: ServiceArea[];
  onAddZone: (zoneId: string) => void;
  onRemoveZone: (areaId: string) => void;
  loadingZoneId: string | null;
  initialCity?: AvailableCity | null;
}> = ({ onClose, areas, onAddZone, onRemoveZone, loadingZoneId, initialCity }) => {
  const [search, setSearch]   = useState('');
  const [showAll, setShowAll] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['availableCities'],
    queryFn:  partnerService.getAvailableCities,
    staleTime: 5 * 60 * 1000,
  });

  const cities = data?.results ?? [];

  const filtered = useMemo(() => {
    if (!search.trim()) return cities;
    const q = search.toLowerCase();
    return cities
      .map(city => ({
        ...city,
        zones: city.zones.filter(z =>
          z.name.toLowerCase().includes(q) ||
          z.pincodes.some(p => p.includes(q))
        ),
      }))
      .filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.state.toLowerCase().includes(q) ||
        c.zones.length > 0
      );
  }, [cities, search]);

  const popular = filtered.filter(c => c.is_popular);
  const others  = filtered.filter(c => !c.is_popular);
  const visible = showAll ? others : others.slice(0, 8);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 flex-shrink-0">
          <div>
            <h2 className="text-lg font-extrabold text-gray-900">Add Service Areas</h2>
            <p className="text-xs text-gray-500 mt-0.5">Select zones where you provide service</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl">
            <X size={20} />
          </button>
        </div>

        {/* Search */}
        <div className="px-6 py-4 border-b border-gray-50 flex-shrink-0">
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search city, zone or pincode..."
              className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#FEC925] transition-colors"
              autoFocus
            />
          </div>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={28} className="animate-spin text-[#FEC925]" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <MapPin size={32} className="mx-auto mb-3 text-gray-300" />
              <p className="font-semibold">No results found</p>
              <p className="text-sm">Try a different city name or pincode</p>
            </div>
          ) : (
            <>
              {/* Popular city icon grid */}
              {popular.length > 0 && !search && (
                <PopularCityGrid
                  cities={popular}
                  areas={areas}
                  onCityClick={() => {}} // tapping expands inline below
                />
              )}

              {/* Popular city zone rows */}
              {popular.length > 0 && (
                <div className="space-y-2">
                  {popular.map(city => (
                    <CityRow
                      key={city.id}
                      city={city}
                      areas={areas}
                      onAddZone={onAddZone}
                      onRemoveZone={onRemoveZone}
                      loadingZoneId={loadingZoneId}
                    />
                  ))}
                </div>
              )}

              {/* Other cities */}
              {others.length > 0 && (
                <section>
                  {!search && popular.length > 0 && (
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">All Cities</h3>
                  )}
                  <div className="space-y-2">
                    {visible.map(city => (
                      <CityRow
                        key={city.id}
                        city={city}
                        areas={areas}
                        onAddZone={onAddZone}
                        onRemoveZone={onRemoveZone}
                        loadingZoneId={loadingZoneId}
                      />
                    ))}
                  </div>
                  {!showAll && others.length > 8 && !search && (
                    <button
                      onClick={() => setShowAll(true)}
                      className="w-full mt-3 py-2.5 text-sm font-semibold text-gray-500 hover:text-gray-700 border-2 border-dashed border-gray-200 rounded-xl hover:border-gray-300 transition-colors"
                    >
                      Show {others.length - 8} more cities
                    </button>
                  )}
                </section>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex-shrink-0 bg-gray-50">
          <p className="text-xs text-gray-500">
            <span className="font-semibold text-gray-700">{areas.filter(a => a.is_active).length}</span> active zones ·
            Cities and zones are managed by FlipCash. Contact support to request a new area.
          </p>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────

export const PartnerAreaPage: React.FC = () => {
  const toast       = useToast();
  const queryClient = useQueryClient();
  const [showPicker, setShowPicker]       = useState(false);
  const [filter, setFilter]               = useState<'all' | 'active' | 'inactive'>('all');
  const [loadingZoneId, setLoadingZoneId] = useState<string | null>(null);

  const { data: areas = [], isLoading } = useQuery<ServiceArea[]>({
    queryKey: ['partnerServiceAreas'],
    queryFn:  partnerService.getServiceAreas,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['partnerServiceAreas'] });
    queryClient.invalidateQueries({ queryKey: ['availableCities'] });
  };

  const addMutation = useMutation({
    mutationFn: (zoneId: string) => partnerService.addServiceAreaByZone(zoneId),
    onMutate:   zoneId => setLoadingZoneId(zoneId),
    onSettled:  ()     => setLoadingZoneId(null),
    onSuccess:  () => { invalidate(); toast.success('Zone added!'); },
    onError:    (e: any) => toast.error(e.response?.data?.detail || 'Failed to add zone.'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => partnerService.deleteServiceArea(id),
    onSuccess:  () => { invalidate(); toast.success('Zone removed.'); },
    onError:    (e: any) => toast.error(e.response?.data?.detail || 'Failed to remove zone.'),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) =>
      partnerService.toggleServiceArea(id, is_active),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['partnerServiceAreas'] }); },
  });

  const handleDelete  = (id: string) => {
    if (window.confirm('Remove this zone? You may miss leads in this area.')) deleteMutation.mutate(id);
  };
  const handleToggle  = (id: string, is_active: boolean) => toggleMutation.mutate({ id, is_active });
  const handleAddZone = (zoneId: string)  => addMutation.mutate(zoneId);
  const handleRemove  = (areaId: string)  => deleteMutation.mutate(areaId);

  const filteredAreas = areas.filter(a => {
    if (filter === 'active')   return a.is_active;
    if (filter === 'inactive') return !a.is_active;
    return true;
  });

  const activeCount = areas.filter(a => a.is_active).length;

  const byCity = useMemo(() => {
    const map: Record<string, ServiceArea[]> = {};
    filteredAreas.forEach(a => {
      const key = a.city || 'Other';
      (map[key] = map[key] || []).push(a);
    });
    return map;
  }, [filteredAreas]);

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900">Service Areas</h2>
          <p className="text-sm text-gray-500 mt-0.5">Manage zones where you provide service</p>
        </div>
        <button
          onClick={() => setShowPicker(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#1a1a1a] text-white rounded-xl font-bold text-sm hover:bg-[#2d2d2d] transition-colors"
        >
          <Plus size={16} /> Add Areas
        </button>
      </div>

      {/* Stats */}
      {areas.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Zones',  value: areas.length,                  color: 'text-gray-900' },
            { label: 'Active',       value: activeCount,                    color: 'text-emerald-600' },
            { label: 'Paused',       value: areas.length - activeCount,     color: 'text-gray-400' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
              <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Areas list */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 md:px-8 py-5 border-b border-gray-100 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#FEC925]/10 rounded-xl"><Map size={20} className="text-[#1a1a1a]" /></div>
            <h2 className="text-lg font-bold text-gray-900">My Service Zones</h2>
          </div>
          {areas.length > 0 && (
            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
              {(['all', 'active', 'inactive'] as const).map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                    filter === f ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >{f}</button>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 md:p-8">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-gray-100 rounded-2xl animate-pulse" />)}
            </div>
          ) : filteredAreas.length > 0 ? (
            <div className="space-y-8">
              {Object.entries(byCity).map(([city, cityAreas]) => (
                <div key={city}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 flex items-center justify-center">
                      <CityIcon
                        city={city}
                        iconUrl={(cityAreas[0] as any).icon_url}
                        size={28}
                      />
                    </div>
                    <h3 className="text-sm font-bold text-gray-700">{city}</h3>
                    <span className="text-xs text-gray-400">· {cityAreas.length} zone{cityAreas.length !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {cityAreas.map(area => (
                      <AreaCard
                        key={(area as any).id}
                        area={area}
                        onDelete={handleDelete}
                        onToggle={handleToggle}
                        isDeleting={deleteMutation.isPending}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <MapPin size={28} className="text-gray-300" />
              </div>
              {areas.length > 0 ? (
                <><h3 className="font-bold text-gray-700 mb-1">No {filter} zones</h3>
                <p className="text-sm text-gray-500">Switch the filter above</p></>
              ) : (
                <><h3 className="font-bold text-gray-700 mb-1">No service zones yet</h3>
                <p className="text-sm text-gray-500 mb-4 max-w-xs mx-auto">Add zones to start receiving leads in those areas</p>
                <button onClick={() => setShowPicker(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FEC925] text-[#1a1a1a] rounded-xl font-bold text-sm hover:bg-[#f0bc1a] transition-colors">
                  <Plus size={16} /> Add First Zone
                </button></>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Tip */}
      <div className="flex items-start gap-3 p-4 bg-[#FEC925]/10 border border-[#FEC925]/40 rounded-xl">
        <AlertCircle size={15} className="text-[#1a1a1a] flex-shrink-0 mt-0.5" />
        <p className="text-xs text-gray-700 leading-relaxed">
          Leads are matched based on the customer's pincode. Adding more zones improves
          matching accuracy. You can pause a zone anytime without losing it.
        </p>
      </div>

      {/* Zone picker modal */}
      {showPicker && (
        <ZonePickerModal
          onClose={() => setShowPicker(false)}
          areas={areas}
          onAddZone={handleAddZone}
          onRemoveZone={handleRemove}
          loadingZoneId={loadingZoneId}
        />
      )}
    </div>
  );
};