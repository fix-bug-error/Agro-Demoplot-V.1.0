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
import { MapContainer, TileLayer, Marker, useMapEvents, ZoomControl, FeatureGroup } from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import type { Map as LeafletMap } from 'leaflet';
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import styles from '@/app/dashboard/map/map.module.css';
import { MapPin, VectorSquare } from "lucide-react";

// Fix for default marker icons in Leaflet
delete (L.Icon.Default.prototype as { _getIconUrl?: () => string })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface CoordinatePickerProps {
  onCoordinatesChange: (lat: number, lng: number) => void;
  onPolygonChange?: (data: { 
    polygon: Record<string, unknown> | unknown[] | string | null; 
    centroid: { lat: number; lng: number }; 
    area_hectares: number; 
    area_demoplot_hectares: number 
  }) => void;
  initialLat?: number;
  initialLng?: number;
}

// Component to handle map clicks
function MapClickHandler({ onCoordinatesChange, activeMode }: { onCoordinatesChange: (lat: number, lng: number) => void, activeMode: 'marker' | 'polygon' | null }) {
  useMapEvents({
    click: (e) => {
      // Only handle clicks when in marker mode
      if (activeMode === 'marker') {
        onCoordinatesChange(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
}



export function CoordinatePicker({ 
  onCoordinatesChange,
  onPolygonChange,
  initialLat = -0.789275,
  initialLng = 119.9303
}: CoordinatePickerProps) {
  const [selectedPosition, setSelectedPosition] = useState<[number, number] | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [basemap, setBasemap] = useState<'osm' | 'google'>('osm');
  const [drawnPolygon, setDrawnPolygon] = useState<L.Polygon | null>(null);
  const [activeMode, setActiveMode] = useState<'marker' | 'polygon' | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);

  const handleMapClick = (lat: number, lng: number) => {
    // Only handle map clicks when in marker mode
    if (activeMode === 'marker') {
      setSelectedPosition([lat, lng]);
      onCoordinatesChange(lat, lng);
    }
  };

  const toggleBasemap = () => {
    setBasemap(prev => prev === 'osm' ? 'google' : 'osm');
  };

  // Function to calculate the area of a polygon using a simple approximation for small areas
  // This method converts lat/lng differences to meters, then uses the shoelace formula
  const calculatePolygonArea = (coords: L.LatLng[]) => {
    if (coords.length < 3) return 0;

    // Use a simple planar approximation for small areas like farm plots
    const latLngToMeters = (lat1: number, lng1: number, lat2: number, lng2: number) => {
      // Convert lat/lng differences to approximate meters
      // 1 degree of latitude is approximately 111320 meters
      // 1 degree of longitude varies with latitude, approximately 111320 * cos(lat) meters
      const latDiff = (lat2 - lat1) * 111320;
      const lngDiff = (lng2 - lng1) * 111320 * Math.cos((lat1 + lat2) * Math.PI / 360);
      return { x: lngDiff, y: latDiff };
    };

    // Create Cartesian coordinates from lat/lng
    const cartesianCoords = [];
    // Use first coordinate as the reference point
    const refLat = coords[0].lat;
    const refLng = coords[0].lng;
    
    for (let i = 0; i < coords.length; i++) {
      const { x, y } = latLngToMeters(refLat, refLng, coords[i].lat, coords[i].lng);
      cartesianCoords.push({ x, y });
    }

    // Apply the shoelace formula to calculate the area
    let area = 0;
    for (let i = 0; i < cartesianCoords.length; i++) {
      const j = (i + 1) % cartesianCoords.length;
      area += cartesianCoords[i].x * cartesianCoords[j].y;
      area -= cartesianCoords[j].x * cartesianCoords[i].y;
    }
    
    area = Math.abs(area) / 2; // Area in square meters
    
    // Convert to hectares (1 hectare = 10,000 square meters)
    return area / 10000;
  };

  const handlePolygonCreated = (e: { layer: L.Polygon }) => {
    // Store the drawn polygon
    setDrawnPolygon(e.layer);
    
    // Get the coordinates of the polygon ensuring we get the nested array correctly
    let coordinates = e.layer.getLatLngs();
    // If coordinates is nested (as it usually is with leaflet-draw), extract the first ring
    if (Array.isArray(coordinates) && coordinates.length > 0 && Array.isArray(coordinates[0])) {
      coordinates = coordinates[0];
    } else if (Array.isArray(coordinates) && coordinates.length > 0) {
      coordinates = coordinates;
    } else {
      console.error("Could not extract coordinates from drawn polygon");
      return;
    }
    
    // Convert to GeoJSON format
    // Determine the actual type of coordinates and handle accordingly
    const flatCoords = Array.isArray(coordinates[0]) ? coordinates[0] as L.LatLng[] : coordinates as L.LatLng[];
    const geoJson = {
      type: "Polygon",
      coordinates: [flatCoords.map((coord: L.LatLng) => [coord.lng, coord.lat])]
    };
    
    // Calculate centroid of the polygon
    let centroidLat = 0;
    let centroidLng = 0;
    if (flatCoords.length > 0) {
      flatCoords.forEach((coord: L.LatLng) => {
        centroidLat += coord.lat;
        centroidLng += coord.lng;
      });
      centroidLat /= flatCoords.length;
      centroidLng /= flatCoords.length;
    }
    
    // Calculate area using the planar approximation method
    const areaHectares = Math.max(0.001, parseFloat(calculatePolygonArea(flatCoords).toFixed(4)));
    const demoPlotAreaHectares = parseFloat(areaHectares.toFixed(4)); // Same as land area, not 10%
    
    console.log("Final area values:", {
      area_hectares: areaHectares,
      demo_plot_area_hectares: demoPlotAreaHectares
    });
    
    // Log the calculated values for debugging
    console.log("Polygon calculations:", {
      centroid: { lat: centroidLat, lng: centroidLng },
      area_hectares: areaHectares,
      demo_plot_area_hectares: demoPlotAreaHectares
    });
    
    // Pass the polygon data and calculated values to the parent component
    if (onPolygonChange) {
      const polygonData = {
        polygon: geoJson,
        centroid: { lat: centroidLat, lng: centroidLng },
        area_hectares: areaHectares,
        area_demoplot_hectares: demoPlotAreaHectares
      };
      
      console.log("Sending polygon data to parent:", polygonData);
      onPolygonChange(polygonData);
    }
    
    // Pass the centroid coordinates to the existing callback
    onCoordinatesChange(centroidLat, centroidLng);
    
    console.log("Drawn polygon coordinates:", geoJson);
    console.log("Polygon centroid:", centroidLat, centroidLng);
    console.log("Calculated area (hectares):", areaHectares);
    console.log("Demo plot area (hectares):", demoPlotAreaHectares);
  };

  return (
    <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline">Buka Peta</Button>
      </DrawerTrigger>
      <DrawerContent className="h-[80vh] max-w-4xl mx-auto">
        {/* Close Button - consistent with other dialogs */}
        <button
          onClick={() => setIsDrawerOpen(false)}
          className="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
          aria-label="Close"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="15"
            height="15"
            viewBox="0 0 15 15"
            fill="none"
          >
            <path
              d="M12.854 3.146a.5.5 0 0 0-.708 0L7.5 7.793 2.854 3.146a.5.5 0 1 0-.708.708L6.793 8.5l-4.647 4.646a.5.5 0 0 0 .708.708L7.5 9.207l4.646 4.647a.5.5 0 0 0 .708-.708L8.207 8.5l4.647-4.646a.5.5 0 0 0 0-.708Z"
              fill="currentColor"
              fillRule="evenodd"
              clipRule="evenodd"
            />
          </svg>
          <span className="sr-only">Close</span>
        </button>
        
        <DrawerHeader>
          <DrawerTitle>Tentukan Lokasi Plot</DrawerTitle>
          <DrawerDescription>
            Anda dapat menggunakan lokasi saat ini, mengklik langsung pada peta, atau menggambar polygon untuk menentukan area plot.
          </DrawerDescription>
        </DrawerHeader>
        
        <div className="p-4 h-[60vh] relative">
          <div className="relative w-full h-full">
            <MapContainer
              center={[initialLat, initialLng]}
              zoom={4}
              maxZoom={23}
              className={styles.mapContainer}
              ref={mapRef}
              zoomControl={false} // Disable default zoom control to avoid conflicts
            >
              {basemap === 'osm' ? (
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  maxNativeZoom={19}
                  maxZoom={23}
                />
              ) : (
                <TileLayer
                  attribution='&copy; Google Maps'
                  url="https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
                  maxNativeZoom={20}
                  maxZoom={23}
                />
              )}
              {/* Show marker when in marker mode */}
              {activeMode === 'marker' && selectedPosition && (
                <Marker position={selectedPosition} />
              )}
              <MapClickHandler onCoordinatesChange={handleMapClick} activeMode={activeMode} />
              <ZoomControl position="bottomleft" />
              
              {/* Feature Group for Drawn Items - Only show when in polygon drawing mode */}
              {activeMode === 'polygon' && (
                <FeatureGroup>
                  <EditControl
                    position="topleft"
                    onCreated={(e) => {
                      console.log("=== EDIT CONTROL ONCREATED CALLED ===");
                      console.log("EditControl event:", e);
                      handlePolygonCreated(e);
                      console.log("=== END OF EDIT CONTROL ONCREATED ===");
                    }}
                    draw={{
                      polyline: false,
                      rectangle: false,
                      circle: false,
                      circlemarker: false,
                      marker: false,
                      polygon: {
                        allowIntersection: false, // Restricts shapes to simple polygons
                        drawError: {
                          color: '#e1e100', // Color the shape will turn when intersects
                          message: '<strong>Error:</strong> shape edges cannot intersect!' // Message that will appear when intersect
                        },
                        shapeOptions: {
                          color: '#3b82f6',
                          weight: 3
                        }
                      }
                    }}
                    edit={{
                      remove: true
                    }}
                  />
                </FeatureGroup>
              )}
              
              {/* Instruction overlay when in marker mode */}
              {activeMode === 'marker' && (
                <div className="absolute top-2 left-2 z-30 bg-white dark:bg-gray-800 px-3 py-2 rounded shadow-md text-sm font-medium border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200">
                  Klik pada peta untuk memilih lokasi
                </div>
              )}
            </MapContainer>
            
            {/* Basemap Toggle Button */}
            <button
              onClick={toggleBasemap}
              className="absolute top-2 right-2 z-20 bg-white dark:bg-gray-800 px-3 py-1 rounded shadow-md text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200"
              aria-label={`Ganti ke ${basemap === 'osm' ? 'Satelit' : 'OSM'}`}
            >
              {basemap === 'osm' ? 'Satelit' : 'OSM'}
            </button>
          </div>
        </div>
        <div className="px-4 flex gap-2">
          <Button 
            type="button" 
            variant={activeMode === 'marker' ? "default" : "outline"}
            className="flex-1"
            onClick={() => {
              // Set marker mode and clear any existing polygon
              setActiveMode(activeMode === 'marker' ? null : 'marker');
              setDrawnPolygon(null);
              
              // If in marker mode, get current location
              if (activeMode !== 'marker' && mapRef.current) {
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
            <div className="flex items-center justify-center">
              <MapPin className="h-4 w-4" />
              <span className="sr-only md:not-sr-only ml-2">Gunakan Lokasi Saat Ini</span>
            </div>
          </Button>
          <Button 
            type="button" 
            variant={activeMode === 'polygon' ? "default" : "outline"}
            className="flex-1"
            onClick={() => {
              // Set polygon mode and clear any existing marker
              setActiveMode(activeMode === 'polygon' ? null : 'polygon');
              setSelectedPosition(null);
            }}
          >
            <VectorSquare className="h-4 w-4 mr-2" />
            <span className="sr-only md:not-sr-only ml-2">Gambar Polygon</span>
          </Button>
          <Button 
            onClick={() => {
              // Close the drawer
              setIsDrawerOpen(false);
              // The polygon data should have already been sent via onPolygonChange
              // If there's no selected position and no polygon data was sent, 
              // use the initial position
              if (!selectedPosition && !drawnPolygon) {
                onCoordinatesChange(initialLat, initialLng);
              }
            }}
            className="flex-1"
          >
            Simpan
          </Button>
        </div>
        
        <DrawerFooter className="hidden">
          {/* Hidden footer to maintain drawer structure */}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}