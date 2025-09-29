"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { 
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import type { Map as LeafletMap } from 'leaflet';
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons in Leaflet
delete (L.Icon.Default.prototype as { _getIconUrl?: () => string })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface CoordinatePickerProps {
  onCoordinatesChange: (lat: number, lng: number) => void;
  initialLat?: number;
  initialLng?: number;
}

// Component to handle map clicks
function MapClickHandler({ onCoordinatesChange }: { onCoordinatesChange: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => {
      onCoordinatesChange(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// Component to handle location finding
function LocationFinder({ onCoordinatesChange }: { onCoordinatesChange: (lat: number, lng: number) => void }) {
  useMapEvents({
    locationfound: (e) => {
      onCoordinatesChange(e.latlng.lat, e.latlng.lng);
    },
  });

  return null;
}

export function CoordinatePicker({ 
  onCoordinatesChange, 
  initialLat = -6.200000,
  initialLng = 106.816666
}: CoordinatePickerProps) {
  const [selectedPosition, setSelectedPosition] = useState<[number, number] | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const mapRef = useRef<LeafletMap | null>(null);

  const handleFindLocation = () => {
    if (mapRef.current) {
      mapRef.current.locate().on('locationfound', function(e) {
        mapRef.current?.setView(e.latlng, 16);
        setSelectedPosition([e.latlng.lat, e.latlng.lng]);
        onCoordinatesChange(e.latlng.lat, e.latlng.lng);
      }).on('locationerror', function(e) {
        console.error("Location error:", e.message);
      });
    }
  };

  const handleMapClick = (lat: number, lng: number) => {
    setSelectedPosition([lat, lng]);
    onCoordinatesChange(lat, lng);
  };

  return (
    <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline">Pilih Koordinat</Button>
      </DrawerTrigger>
      <DrawerContent className="h-[80vh] max-w-4xl mx-auto">
        <DrawerHeader>
          <DrawerTitle>Pilih Koordinat</DrawerTitle>
          <DrawerDescription>
            Klik pada peta untuk memilih titik atau gunakan tombol di bawah untuk memilih lokasi Anda saat ini.
          </DrawerDescription>
        </DrawerHeader>
        
        <div className="p-4 h-[60vh]">
          <MapContainer
            center={[initialLat, initialLng]}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
            ref={mapRef}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {selectedPosition && (
              <Marker position={selectedPosition} />
            )}
            <MapClickHandler onCoordinatesChange={handleMapClick} />
          <div className="absolute bottom-4 left-4 z-[1000]">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => {
                if (mapRef.current) {
                  mapRef.current.locate().on('locationfound', function(e) {
                    setSelectedPosition([e.latlng.lat, e.latlng.lng]);
                    onCoordinatesChange(e.latlng.lat, e.latlng.lng);
                    mapRef.current?.setView(e.latlng, 16);
                  }).on('locationerror', function(e) {
                    console.error("Location error:", e.message);
                  });
                }
              }}
            >
              Gunakan Lokasi Saat Ini
            </Button>
          </div>
        </MapContainer>
        </div>
        
        <DrawerFooter className="grid grid-cols-2 gap-2">
          <DrawerClose asChild>
            <Button variant="outline">Batal</Button>
          </DrawerClose>
          <Button 
            onClick={() => {
              setIsDrawerOpen(false);
              // If no coordinates selected, use initial position
              if (!selectedPosition) {
                onCoordinatesChange(initialLat, initialLng);
              }
            }}
          >
            Simpan Pilihan
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}