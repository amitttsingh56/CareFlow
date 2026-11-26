import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Link } from 'react-router-dom';
import { FreshnessBadge } from './FreshnessBadge';
import { StatusChip } from './StatusChip';
import { ChevronRight, Bed, Clock } from 'lucide-react';

// Create custom colored marker icons for Leaflet
const createColorIcon = (status) => {
  let bgColor = '#10B981'; // normal - green
  let pulseBorder = 'rgba(16, 185, 129, 0.4)';

  if (status === 'Busy') {
    bgColor = '#F59E0B'; // busy - amber
    pulseBorder = 'rgba(245, 158, 11, 0.4)';
  } else if (status === 'Limited') {
    bgColor = '#EF4444'; // limited - red
    pulseBorder = 'rgba(239, 68, 68, 0.4)';
  }

  const html = `
    <div style="
      position: relative;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <div style="
        position: absolute;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background-color: ${pulseBorder};
        animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
      "></div>
      <div style="
        position: relative;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background-color: ${bgColor};
        border: 2px solid #ffffff;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: #ffffff;
        font-size: 11px;
        font-weight: bold;
      ">
        +
      </div>
    </div>
  `;

  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: html,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18],
  });
};

// Component to dynamically fit map bounds to markers
const MapBoundsAdjuster = ({ hospitals }) => {
  const map = useMap();

  useEffect(() => {
    if (hospitals && hospitals.length > 0) {
      const bounds = L.latLngBounds(hospitals.map((h) => [h.latitude, h.longitude]));
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }
  }, [hospitals, map]);

  return null;
};

export const LeafletMap = ({ hospitals = [], center = [25.3176, 82.9739], zoom = 12 }) => {
  return (
    <div className="w-full h-full min-h-[480px] rounded-card overflow-hidden shadow-card border border-gray-200">
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        className="w-full h-full"
        style={{ minHeight: '480px' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {hospitals.map((hospital) => {
          const icon = createColorIcon(hospital.emergencyStatus);
          return (
            <Marker
              key={hospital.id}
              position={[hospital.latitude, hospital.longitude]}
              icon={icon}
            >
              <Popup className="careflow-popup">
                <div className="p-1 max-w-xs space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <StatusChip status={hospital.emergencyStatus} type="emergency" />
                    <FreshnessBadge freshness={hospital.freshness} />
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-navy-800 leading-snug">
                      {hospital.name}
                    </h4>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                      {hospital.address}, {hospital.city}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-center bg-gray-50 p-2 rounded-lg text-xs">
                    <div>
                      <span className="text-gray-400 block text-[10px]">Est. OPD Wait</span>
                      <strong className="text-navy-800">
                        ~{hospital.avgDeptWaitMins || 20} min
                      </strong>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px]">Gen Beds Avail</span>
                      <strong className="text-emerald-700">
                        {hospital.generalBedsAvailable}
                      </strong>
                    </div>
                  </div>

                  <Link
                    to={`/hospitals/${hospital.id}`}
                    className="w-full py-1.5 px-3 rounded-lg text-xs font-semibold bg-navy-800 text-white hover:bg-navy-900 transition-colors flex items-center justify-center gap-1 text-center"
                  >
                    <span>View Capacity & Queue</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </Popup>
            </Marker>
          );
        })}

        <MapBoundsAdjuster hospitals={hospitals} />
      </MapContainer>
    </div>
  );
};

export default LeafletMap;
