"use client"

import * as React from 'react';

declare global {
  interface Window {
    L: any;
  }
}

interface ParentMapProps {
  studentId: string;
  onSubmit: (lat: number, lng: number) => void;
  submitting: boolean;
}

export function ParentRouteRequestMap({ studentId, onSubmit, submitting }: ParentMapProps) {
  const mapRef = React.useRef<HTMLDivElement>(null);
  const [coords, setCoords] = React.useState<[number, number]>([28.6139, 77.2090]);
  const [leafletLoaded, setLeafletLoaded] = React.useState(false);

  React.useEffect(() => {
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    if (!window.L) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.async = true;
      script.onload = () => setLeafletLoaded(true);
      document.body.appendChild(script);
    } else {
      setLeafletLoaded(true);
    }
  }, []);

  React.useEffect(() => {
    if (!leafletLoaded || !mapRef.current || !window.L) return;

    const L = window.L;
    let mapInstance: any = null;
    let markerInstance: any = null;

    const redIcon = L.icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      shadowSize: [41, 41]
    });

    function initializeMap(initialCoords: [number, number]) {
      if (mapInstance) return;

      mapInstance = L.map(mapRef.current!).setView(initialCoords, 16);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap'
      }).addTo(mapInstance);

      markerInstance = L.marker(initialCoords, { icon: redIcon, draggable: true }).addTo(mapInstance);

      markerInstance.on('dragend', () => {
        const position = markerInstance.getLatLng();
        setCoords([position.lat, position.lng]);
      });

      mapInstance.on('move', () => {
        const center = mapInstance.getCenter();
        markerInstance.setLatLng(center);
        setCoords([center.lat, center.lng]);
      });
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userCoords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setCoords(userCoords);
        initializeMap(userCoords);
      },
      () => {
        initializeMap([28.6139, 77.2090]);
      }
    );

    return () => {
      if (mapInstance) {
        mapInstance.remove();
      }
    };
  }, [leafletLoaded]);

  return (
    <div className="flex flex-col bg-white rounded-3xl border border-zinc-150 shadow-xl overflow-hidden p-6 max-w-xl mx-auto space-y-4">
      <div>
        <h3 className="text-lg font-black text-zinc-900">Map your Home Gate</h3>
        <p className="text-xs text-zinc-500 font-medium">Drag map marker to your home gate and tap 'Request Stop'.</p>
      </div>

      <div className="h-72 w-full rounded-2xl overflow-hidden border border-zinc-200 relative">
        <div ref={mapRef} className="h-full w-full" />
        
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[1000] pointer-events-none">
          <div className="w-8 h-8 border-2 border-dashed border-red-500 rounded-full flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-red-600 rounded-full" />
          </div>
        </div>
      </div>

      <div className="bg-zinc-50 rounded-2xl p-4 flex justify-between items-center text-xs font-semibold text-zinc-700">
        <div>
          <span className="text-zinc-400 block font-medium">STAGING COORDINATES</span>
          {coords[0].toFixed(5)}, {coords[1].toFixed(5)}
        </div>
        <button
          onClick={() => onSubmit(coords[0], coords[1])}
          disabled={submitting || !leafletLoaded}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-xl transition duration-300 disabled:opacity-50"
        >
          {submitting ? 'Requesting...' : 'Request Stop'}
        </button>
      </div>
    </div>
  );
}
