/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Globe, Compass, CheckCircle, ExternalLink, MapPin, 
  RotateCcw, Layers, Filter, Phone, Mail, Building
} from 'lucide-react';
import { Client } from '../types';

interface ClientMapProps {
  clients: Client[];
  language: 'ar' | 'en';
}

interface GeocodedClient {
  client: Client;
  lat: number;
  lng: number;
}

// Default geolocation helper for standard Saudi cities mapping
const defaultCityCoordinates: { [key: string]: { lat: number; lng: number } } = {
  'الرياض': { lat: 24.7136, lng: 46.6753 },
  'جدة': { lat: 21.5433, lng: 39.1728 },
  'مكة': { lat: 21.3891, lng: 39.8579 },
  'الدمام': { lat: 26.4207, lng: 50.0888 },
  'الخبر': { lat: 26.2886, lng: 50.2068 },
  'المدينة': { lat: 24.5247, lng: 39.5692 },
  'الهفوف': { lat: 25.3646, lng: 49.5872 },
  'تبوك': { lat: 28.3835, lng: 36.5662 },
  'أبها': { lat: 18.2164, lng: 42.5053 },
  'خميس مشيط': { lat: 18.3000, lng: 42.7333 },
  'حائل': { lat: 27.5219, lng: 41.6961 },
  'نجران': { lat: 17.4924, lng: 44.1277 },
  'جازان': { lat: 16.8892, lng: 42.5611 },
  'الجبيل': { lat: 27.0046, lng: 49.6592 },
  'ينبع': { lat: 24.0895, lng: 38.0618 },
  'الطائف': { lat: 21.2854, lng: 40.4222 },
  'Riyadh': { lat: 24.7136, lng: 46.6753 },
  'Jeddah': { lat: 21.5433, lng: 39.1728 },
  'Makkah': { lat: 21.3891, lng: 39.8579 },
  'Dammam': { lat: 26.4207, lng: 50.0888 },
  'Khobar': { lat: 26.2886, lng: 50.2068 },
  'Madinah': { lat: 24.5247, lng: 39.5692 },
};

// Precise client address geolocation fallback dictionary to ensure accurate plots instantly
const addressCoordinatePresets: { [key: string]: { lat: number; lng: number } } = {
  'الرياض، العليا': { lat: 24.7116, lng: 46.6744 },
  'الرياض، المرسلات': { lat: 24.7475, lng: 46.6975 },
  'الرياض القدس': { lat: 24.7731, lng: 46.7725 },
  'جدة، الحمراء': { lat: 21.5169, lng: 39.1558 },
  'الدمام، الشاطئ': { lat: 26.4520, lng: 50.1180 },
  'الخبر، الكورنيش': { lat: 26.2910, lng: 50.2150 },
};

export default function ClientMap({ clients, language }: ClientMapProps) {
  const isRtl = language === 'ar';
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);

  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [geocodedClients, setGeocodedClients] = useState<GeocodedClient[]>([]);

  // Geocode clients from addresses
  useEffect(() => {
    const mapped: GeocodedClient[] = [];

    clients.forEach((client) => {
      const address = client.address || '';
      if (!address) return;

      // 1. Direct preset coordinates
      if (addressCoordinatePresets[address]) {
        mapped.push({
          client,
          ...addressCoordinatePresets[address],
        });
        return;
      }

      // 2. City match with gentle random offset
      let foundCity = false;
      Object.keys(defaultCityCoordinates).forEach((cityKey) => {
        if (!foundCity && address.toLowerCase().includes(cityKey.toLowerCase())) {
          const jitterLat = (Math.random() - 0.5) * 0.03;
          const jitterLng = (Math.random() - 0.5) * 0.03;
          mapped.push({
            client,
            lat: defaultCityCoordinates[cityKey].lat + jitterLat,
            lng: defaultCityCoordinates[cityKey].lng + jitterLng,
          });
          foundCity = true;
        }
      });

      // 3. Fallback default (Riyadh central)
      if (!foundCity) {
        const jitterLat = (Math.random() - 0.5) * 0.04;
        const jitterLng = (Math.random() - 0.5) * 0.04;
        mapped.push({
          client,
          lat: 24.7136 + jitterLat,
          lng: 46.6753 + jitterLng,
        });
      }
    });

    setGeocodedClients(mapped);
  }, [clients]);

  // Filtered clients list
  const displayClients = geocodedClients.filter((gc) => {
    if (selectedStatusFilter === 'all') return true;
    return gc.client.status === selectedStatusFilter;
  });

  // Get status color & emoji
  const getStatusMeta = (status: string) => {
    switch (status) {
      case 'active_client':
        return { 
          color: '#FF6500', 
          bgLight: '#FFF7ED', 
          emoji: '👑', 
          labelAr: 'عميل نشط', 
          labelEn: 'Active Client' 
        };
      case 'negotiating':
        return { 
          color: '#F59E0B', 
          bgLight: '#FEF3C7', 
          emoji: '🤝', 
          labelAr: 'قيد التفاوض', 
          labelEn: 'Negotiating' 
        };
      case 'lead':
        return { 
          color: '#10B981', 
          bgLight: '#D1FAE5', 
          emoji: '⭐', 
          labelAr: 'عميل محتمل', 
          labelEn: 'Lead' 
        };
      default:
        return { 
          color: '#64748B', 
          bgLight: '#F1F5F9', 
          emoji: '💼', 
          labelAr: 'جديد', 
          labelEn: 'New' 
        };
    }
  };

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [24.5, 45.0], // Saudi Arabia center
        zoom: 6,
        scrollWheelZoom: true,
        zoomControl: false // Add customized zoom control
      });

      // Customized top-right / top-left zoom control
      L.control.zoom({
        position: isRtl ? 'topleft' : 'topright'
      }).addTo(map);

      // OpenStreetMap Standard Tiles (100% Free & Open-Source)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors'
      }).addTo(map);

      markersGroupRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    // Invalidate size in case parent container resized
    setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 150);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markersGroupRef.current = null;
      }
    };
  }, []);

  // Update Markers when displayClients or language changes
  useEffect(() => {
    if (!mapInstanceRef.current || !markersGroupRef.current) return;

    markersGroupRef.current.clearLayers();
    const bounds = L.latLngBounds([]);

    displayClients.forEach(({ client, lat, lng }) => {
      const meta = getStatusMeta(client.status);
      const statusLabel = isRtl ? meta.labelAr : meta.labelEn;

      // Custom HTML Marker using L.divIcon
      const markerIcon = L.divIcon({
        className: 'custom-client-marker',
        html: `
          <div style="
            position: relative;
            display: flex;
            flex-direction: column;
            align-items: center;
            transform: translate(-50%, -100%);
            cursor: pointer;
            filter: drop-shadow(0 3px 6px rgba(0,0,0,0.25));
          ">
            <div style="
              width: 32px;
              height: 32px;
              background: ${meta.color};
              border: 2.5px solid #ffffff;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 13px;
              color: #ffffff;
              box-shadow: 0 0 0 2px ${meta.color}40;
              transition: transform 0.2s ease;
            ">
              ${meta.emoji}
            </div>
            <div style="
              width: 0;
              height: 0;
              border-left: 5px solid transparent;
              border-right: 5px solid transparent;
              border-top: 6px solid ${meta.color};
              margin-top: -1px;
            "></div>
          </div>
        `,
        iconSize: [32, 38],
        iconAnchor: [16, 38],
        popupAnchor: [0, -36]
      });

      const marker = L.marker([lat, lng], { icon: markerIcon });

      // Custom Rich Popup Content
      const popupHtml = `
        <div style="
          font-family: inherit;
          min-width: 210px;
          padding: 4px;
          color: #1e293b;
          direction: ${isRtl ? 'rtl' : 'ltr'};
          text-align: ${isRtl ? 'right' : 'left'};
        ">
          <div style="
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 6px;
            margin-bottom: 8px;
          ">
            <strong style="font-size: 13px; color: #0f172a;">${client.name}</strong>
            <span style="
              font-size: 9px;
              font-weight: 800;
              background: ${meta.bgLight};
              color: ${meta.color};
              border: 1px solid ${meta.color}35;
              padding: 2px 7px;
              border-radius: 9999px;
              white-space: nowrap;
            ">
              ${meta.emoji} ${statusLabel}
            </span>
          </div>

          ${client.company_name ? `
            <div style="font-size: 11px; color: #475569; margin-bottom: 4px; display: flex; items-center; gap: 4px;">
              <span>🏢</span> <strong>${client.company_name}</strong>
            </div>
          ` : ''}

          ${client.address ? `
            <div style="font-size: 11px; color: #64748b; margin-bottom: 6px; line-height: 1.4;">
              <span>📍</span> ${client.address}
            </div>
          ` : ''}

          ${client.phone ? `
            <div style="font-size: 11px; margin-bottom: 4px;">
              <a href="tel:${client.phone}" style="color: #FF6500; font-weight: bold; text-decoration: none; font-family: monospace;">
                📞 ${client.phone}
              </a>
            </div>
          ` : ''}

          ${client.email ? `
            <div style="font-size: 10px; margin-bottom: 8px;">
              <a href="mailto:${client.email}" style="color: #0284c7; text-decoration: none; font-family: monospace;">
                ✉️ ${client.email}
              </a>
            </div>
          ` : ''}

          <div style="
            margin-top: 8px;
            padding-top: 6px;
            border-top: 1px solid #f1f5f9;
            display: flex;
            justify-content: flex-end;
          ">
            <a 
              href="https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}" 
              target="_blank" 
              rel="noopener noreferrer" 
              style="
                display: inline-flex;
                align-items: center;
                gap: 4px;
                font-size: 10px;
                font-weight: 800;
                color: #ffffff;
                background: #FF6500;
                padding: 4px 10px;
                border-radius: 8px;
                text-decoration: none;
                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
              "
            >
              <span>🧭</span>
              <span>${isRtl ? 'عرض الاتجاهات' : 'Get Directions'}</span>
            </a>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, {
        maxWidth: 280,
        className: 'custom-leaflet-popup'
      });

      markersGroupRef.current!.addLayer(marker);
      bounds.extend([lat, lng]);
    });

    // Auto-fit to visible markers
    if (bounds.isValid() && displayClients.length > 0) {
      mapInstanceRef.current.fitBounds(bounds, {
        padding: [45, 45],
        maxZoom: 13
      });
    }
  }, [displayClients, isRtl]);

  const handleRecenter = () => {
    if (!mapInstanceRef.current) return;
    if (displayClients.length > 0) {
      const bounds = L.latLngBounds([]);
      displayClients.forEach(c => bounds.extend([c.lat, c.lng]));
      if (bounds.isValid()) {
        mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
        return;
      }
    }
    // Default fallback to Saudi Arabia center
    mapInstanceRef.current.setView([24.5, 45.0], 6);
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 font-sans">
      {/* Map Header with Filters and Badges */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-black text-slate-900 text-sm sm:text-base tracking-tight flex items-center gap-2">
              <Globe className="w-4.5 h-4.5 text-[#FF6500]" />
              <span>{isRtl ? 'التوزيع الجغرافي للعملاء (OpenStreetMap)' : 'Client Geographical Map (OpenStreetMap)'}</span>
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-emerald-600" />
              <span>{isRtl ? 'مجاني 100%' : '100% Free OSM'}</span>
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {isRtl 
              ? `يتم عرض مواقع ${displayClients.length} عميل من أصل ${clients.length} عبر خريطة OpenStreetMap التفاعلية الحرة` 
              : `Displaying ${displayClients.length} of ${clients.length} clients on live interactive OpenStreetMap`}
          </p>
        </div>

        {/* Filter Controls & Actions */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <button
            type="button"
            onClick={() => setSelectedStatusFilter('all')}
            className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-bold transition-all cursor-pointer ${
              selectedStatusFilter === 'all'
                ? 'bg-[#0B192C] text-white border-[#0B192C] shadow-xs'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {isRtl ? 'الكل' : 'All'} ({geocodedClients.length})
          </button>

          <button
            type="button"
            onClick={() => setSelectedStatusFilter('active_client')}
            className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
              selectedStatusFilter === 'active_client'
                ? 'bg-[#FF6500] text-white border-[#FF6500] shadow-xs'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span>👑</span>
            <span>{isRtl ? 'نشط' : 'Active'}</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedStatusFilter('negotiating')}
            className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
              selectedStatusFilter === 'negotiating'
                ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span>🤝</span>
            <span>{isRtl ? 'تفاوض' : 'Negotiating'}</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedStatusFilter('lead')}
            className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
              selectedStatusFilter === 'lead'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span>⭐</span>
            <span>{isRtl ? 'مرشح' : 'Leads'}</span>
          </button>

          <button
            type="button"
            onClick={handleRecenter}
            title={isRtl ? 'إعادة ضبط العرض' : 'Recenter Map'}
            className="p-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 cursor-pointer transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Map Stage layout */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-xs bg-slate-100">
        <div 
          ref={mapContainerRef} 
          className="w-full h-[420px] sm:h-[480px] z-0" 
          style={{ width: '100%', height: '450px' }}
        />

        {/* Legend indicator in Corner */}
        <div className={`absolute bottom-3 ${isRtl ? 'left-3' : 'right-3'} bg-white/95 backdrop-blur-xs p-3 rounded-xl border border-slate-200/90 shadow-md text-[10px] font-bold space-y-2 z-1000 max-w-[175px]`}>
          <div className="text-slate-800 uppercase tracking-widest text-[9px] pb-1 border-b border-slate-100 font-extrabold flex items-center justify-between">
            <span>{isRtl ? 'دليل الحالات' : 'Map Legend'}</span>
            <span className="text-[8px] text-[#FF6500] font-mono">OSM</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#FF6500' }}></span>
            <span className="text-slate-700">👑 {isRtl ? 'عميل نشط' : 'Active Client'}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#F59E0B' }}></span>
            <span className="text-slate-700">🤝 {isRtl ? 'قيد التفاوض' : 'Negotiating'}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#10B981' }}></span>
            <span className="text-slate-700">⭐ {isRtl ? 'عميل محتمل' : 'Lead'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
