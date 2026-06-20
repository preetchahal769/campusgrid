"use client"

import * as React from 'react';

interface PendingStudent {
  id: string;
  name: string;
  distance: number;
  home_lat: number;
  home_lng: number;
}

interface DriverViewProps {
  pendingStudents: PendingStudent[];
  busRoutePath: [number, number][];
  onAssignStop: (studentId: string, lat: number, lng: number, stopName: string) => void;
  loading: boolean;
}

export function DriverRouteSplitPane({ pendingStudents, busRoutePath, onAssignStop, loading }: DriverViewProps) {
  const [selectedStudent, setSelectedStudent] = React.useState<PendingStudent | null>(pendingStudents[0] || null);
  const [stopMarker, setStopMarker] = React.useState<[number, number] | null>(null);
  const [stopName, setStopName] = React.useState('');
  const [leafletLoaded, setLeafletLoaded] = React.useState(false);
  const mapRef = React.useRef<HTMLDivElement>(null);

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
    if (selectedStudent) {
      setStopMarker([selectedStudent.home_lat + 0.0002, selectedStudent.home_lng + 0.0002]);
    }
  }, [selectedStudent]);

  React.useEffect(() => {
    if (!leafletLoaded || !mapRef.current || !window.L || !selectedStudent) return;

    const L = window.L;
    let mapInstance: any = null;
    let parentMarker: any = null;
    let stopMarkerInstance: any = null;
    let routeLineInstance: any = null;

    const parentIcon = L.icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      shadowSize: [41, 41]
    });

    const driverIcon = L.icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      shadowSize: [41, 41]
    });

    mapInstance = L.map(mapRef.current!).setView([selectedStudent.home_lat, selectedStudent.home_lng], 16);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap'
    }).addTo(mapInstance);

    // Red marker representing parent home gate
    parentMarker = L.marker([selectedStudent.home_lat, selectedStudent.home_lng], { icon: parentIcon }).addTo(mapInstance);

    // Green marker representing proposed pickup stop
    const initialStopCoords = stopMarker || [selectedStudent.home_lat + 0.0002, selectedStudent.home_lng + 0.0002];
    stopMarkerInstance = L.marker(initialStopCoords, { icon: driverIcon, draggable: true }).addTo(mapInstance);

    stopMarkerInstance.on('dragend', () => {
      const position = stopMarkerInstance.getLatLng();
      setStopMarker([position.lat, position.lng]);
    });

    // Draw bus path line
    if (busRoutePath.length > 0) {
      routeLineInstance = L.polyline(busRoutePath, { color: '#0A4EA6', weight: 4, dashArray: '5, 10' }).addTo(mapInstance);
    }

    // Capture map click event to assign stop coordinates
    mapInstance.on('click', (e: any) => {
      stopMarkerInstance.setLatLng(e.latlng);
      setStopMarker([e.latlng.lat, e.latlng.lng]);
    });

    return () => {
      if (mapInstance) {
        mapInstance.remove();
      }
    };
  }, [leafletLoaded, selectedStudent]);

  return (
    <div className="flex flex-col md:flex-row h-[550px] bg-white border border-zinc-150 rounded-3xl shadow-xl overflow-hidden">
      {/* Top/Left Pane: Listing */}
      <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-zinc-150 flex flex-col">
        <div className="p-4 border-b border-zinc-100">
          <h3 className="font-black text-zinc-900 text-sm">Stop Allocation Queue</h3>
          <p className="text-[11px] text-zinc-500 font-medium">Map safe pick points for parent requests.</p>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {pendingStudents.map((student) => (
            <button
              key={student.id}
              onClick={() => setSelectedStudent(student)}
              type="button"
              className={`w-full text-left p-3.5 rounded-2xl border transition-all duration-300 ${
                selectedStudent?.id === student.id
                  ? 'border-blue-600/30 bg-blue-50/15'
                  : 'border-zinc-50 hover:bg-zinc-50/50'
              }`}
            >
              <h4 className="font-bold text-zinc-950 text-xs">{student.name}</h4>
              <p className="text-[10px] text-zinc-400 font-semibold mt-0.5">GATE OFFSET: {student.distance}m</p>
            </button>
          ))}
        </div>
      </div>

      {/* Bottom/Right Pane: Interactive Map Canvas */}
      <div className="flex-1 flex flex-col relative">
        {selectedStudent ? (
          <>
            <div className="h-full relative flex-1">
              <div ref={mapRef} className="h-full w-full" />
            </div>

            {/* Float Action panel */}
            <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md border border-zinc-200 rounded-2xl shadow-xl p-4 flex flex-col sm:flex-row gap-3 items-center z-[1000]">
              <div className="w-full sm:flex-1">
                <input
                  type="text"
                  placeholder="Stop Name (e.g. Landmark, Gate Sector 4)"
                  value={stopName}
                  maxLength={100}
                  onChange={(e) => setStopName(e.target.value)}
                  className="w-full border border-zinc-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-blue-500"
                />
              </div>
              <button
                onClick={() => {
                  if (stopMarker && stopName.trim()) {
                    onAssignStop(selectedStudent.id, stopMarker[0], stopMarker[1], stopName);
                  }
                }}
                disabled={loading || !stopName.trim() || !stopMarker || !leafletLoaded}
                type="button"
                className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-black text-xs px-5 py-3 rounded-xl transition duration-300 disabled:opacity-50"
              >
                Confirm Pick Point
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-zinc-400 font-semibold text-xs bg-zinc-50">
            No pending allocation requests.
          </div>
        )}
      </div>
    </div>
  );
}
