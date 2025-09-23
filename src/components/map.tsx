"use client";

import "leaflet/dist/leaflet.css";
import "leaflet-gesture-handling/dist/leaflet-gesture-handling.css";
import { MapContainer, TileLayer, Marker, Popup, Polygon } from "react-leaflet";
import type { Map as LeafletMap } from 'leaflet';
import L from "leaflet";
import 'leaflet-gesture-handling';
import styles from '@/app/dashboard/map/map.module.css';
import { useEffect, useRef, useState } from "react";

// Define a type for map with gesture handling
type ExtendedLeafletMap = LeafletMap & {
  gestureHandling?: {
    enable: () => void;
    disable: () => void;
  };
}

// Define types for polygon data
type PolygonData = Record<string, unknown> | unknown[] | string | null;

// Define GeoJSON types
interface GeoJsonPolygon {
  type: "Polygon";
  coordinates: number[][][];
}

interface GeoJsonMultiPolygon {
  type: "MultiPolygon";
  coordinates: number[][][][];
}

type GeoJsonGeometry = GeoJsonPolygon | GeoJsonMultiPolygon;

// Helper function to format polygon data for Leaflet
const formatPolygonForLeaflet = (polygon: PolygonData): [number, number][] => {
  try {
    console.log('Raw polygon data:', polygon);
    
    // Handle null or undefined
    if (!polygon) {
      console.log('Polygon is null or undefined');
      return [];
    }
    
    // Handle array of coordinate pairs [[lat, lng], [lat, lng], ...]
    if (Array.isArray(polygon) && polygon.length > 0) {
      // Check if it's an array of coordinate pairs
      if (Array.isArray(polygon[0]) && polygon[0].length >= 2) {
        console.log('Polygon is array of coordinate pairs');
        // Ensure all elements are valid coordinate pairs
        return (polygon as [number, number][]).filter((coord) => 
          Array.isArray(coord) && coord.length >= 2 && 
          typeof coord[0] === 'number' && typeof coord[1] === 'number'
        ).map((coord) => [coord[0], coord[1]] as [number, number]);
      }
      // Handle flat array [lat, lng, lat, lng, ...]
      else if (typeof polygon[0] === 'number') {
        console.log('Polygon is flat array of coordinates');
        const formatted: [number, number][] = [];
        for (let i = 0; i < polygon.length; i += 2) {
          if (i + 1 < polygon.length) {
            formatted.push([polygon[i] as number, polygon[i + 1] as number]);
          }
        }
        return formatted;
      }
    }
    
    // Handle GeoJSON-like objects { "type": "Polygon", "coordinates": [...] }
    if (typeof polygon === 'object' && polygon !== null && 'type' in polygon) {
      const geoJson = polygon as unknown as GeoJsonGeometry;
      if (geoJson.type === 'Polygon' && 'coordinates' in geoJson && Array.isArray(geoJson.coordinates)) {
        console.log('Polygon is GeoJSON Polygon');
        // For GeoJSON, the first ring is the exterior ring
        const exteriorRing = geoJson.coordinates[0];
        if (Array.isArray(exteriorRing)) {
          return exteriorRing.map((coord) => [coord[1], coord[0]] as [number, number]); // Swap lat/lng order
        }
      }
      
      // Handle other GeoJSON geometries
      if (geoJson.type === 'MultiPolygon' && 'coordinates' in geoJson && Array.isArray(geoJson.coordinates)) {
        console.log('Polygon is GeoJSON MultiPolygon');
        // Just take the first polygon for simplicity
        const firstPolygon = geoJson.coordinates[0];
        if (Array.isArray(firstPolygon) && firstPolygon.length > 0) {
          const exteriorRing = firstPolygon[0];
          if (Array.isArray(exteriorRing)) {
            return exteriorRing.map((coord) => [coord[1], coord[0]] as [number, number]); // Swap lat/lng order
          }
        }
      }
    }
    
    // Handle simple object with coordinates property
    if (typeof polygon === 'object' && polygon !== null && 'coordinates' in polygon) {
      const polygonObj = polygon as Record<string, unknown>;
      if (Array.isArray(polygonObj.coordinates)) {
        console.log('Polygon has coordinates property');
        // Check if coordinates is an array of coordinate pairs
        if (Array.isArray(polygonObj.coordinates[0]) && (polygonObj.coordinates[0] as unknown[]).length >= 2) {
          return (polygonObj.coordinates as [number, number][]).filter((coord) => 
            Array.isArray(coord) && coord.length >= 2 && 
            typeof coord[0] === 'number' && typeof coord[1] === 'number'
          ).map((coord) => [coord[0], coord[1]] as [number, number]);
        }
        // Handle flat array in coordinates property
        else if (typeof polygonObj.coordinates[0] === 'number') {
          const formatted: [number, number][] = [];
          for (let i = 0; i < polygonObj.coordinates.length; i += 2) {
            if (i + 1 < polygonObj.coordinates.length) {
              formatted.push([polygonObj.coordinates[i], polygonObj.coordinates[i + 1]]);
            }
          }
          return formatted;
        }
      }
    }
    
    // Handle stringified JSON (common when data comes from database)
    if (typeof polygon === 'string') {
      console.log('Polygon is string, parsing JSON');
      try {
        const parsed = JSON.parse(polygon);
        return formatPolygonForLeaflet(parsed); // Recursive call with parsed data
      } catch (parseError) {
        console.error('Error parsing polygon string:', parseError);
      }
    }
    
    // Handle object with nested structure that might come from Supabase
    if (typeof polygon === 'object' && polygon !== null) {
      console.log('Polygon is object, checking for nested coordinates');
      const polygonObj = polygon as Record<string, unknown>;
      
      // Check for direct coordinate arrays
      for (const key in polygonObj) {
        if (Array.isArray(polygonObj[key]) && (polygonObj[key] as unknown[]).length > 0) {
          // Check if this array contains coordinate pairs
          if (Array.isArray((polygonObj[key] as unknown[])[0]) && ((polygonObj[key] as unknown[][])[0] as unknown[]).length >= 2) {
            return (polygonObj[key] as [number, number][]).filter((coord) => 
              Array.isArray(coord) && coord.length >= 2 && 
              typeof coord[0] === 'number' && typeof coord[1] === 'number'
            ).map((coord) => [coord[0], coord[1]] as [number, number]);
          }
          // Check if this array contains flat coordinates
          else if (typeof (polygonObj[key] as unknown[])[0] === 'number') {
            const formatted: [number, number][] = [];
            for (let i = 0; i < (polygonObj[key] as number[]).length; i += 2) {
              if (i + 1 < (polygonObj[key] as number[]).length) {
                formatted.push([(polygonObj[key] as number[])[i], (polygonObj[key] as number[])[i + 1]]);
              }
            }
            return formatted;
          }
        }
      }
    }
    
    console.log('Could not parse polygon data');
    // If we can't parse it, return empty array
    return [];
  } catch (error) {
    console.error('Error parsing polygon data:', error);
    return [];
  }
};

import type { Plot, Farmer } from "@/types";

export default function MapComponent({ 
  plot,
  farmer
}: {
  plot: Plot | null | undefined;
  farmer: Farmer | null | undefined;
}) {
  const mapRef = useRef<L.Map>(null);
  const [basemap, setBasemap] = useState<'osm' | 'esri'>('osm');

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Initialize gesture handling and fix marker icons on the client side
  useEffect(() => {
    // Fix for default marker icons in Leaflet
    if (typeof window !== 'undefined') {
      // Initialize gesture handling if available
      if ((L as unknown as { GestureHandling?: unknown }).GestureHandling) {
        L.Map.addInitHook("addHandler", "gestureHandling", (L as unknown as { GestureHandling?: unknown }).GestureHandling);
      }

      const iconPrototype = L.Icon.Default.prototype as unknown as Record<string, unknown>;
      delete iconPrototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });
    }
  }, []);

  // Log polygon data for debugging
  useEffect(() => {
    if (plot && plot.polygon) {
      console.log('Polygon data from database:', plot.polygon);
      console.log('Formatted polygon data:', formatPolygonForLeaflet(plot.polygon));
    }
  }, [plot]);

  // Add mobile gesture handling
  useEffect(() => {
    // Only prevent pull-to-refresh on mobile
    const handleTouchStart = (e: Event) => {
      if (e.target instanceof Element && e.target.closest('.mapContainer')) {
        // Prevent pull-to-refresh on mobile
        if ('touches' in e && (e as TouchEvent).touches.length > 1) {
          e.preventDefault();
        }
      }
    };

    // Add event listeners
    const mapElement = document.querySelector('.mapContainer');
    if (mapElement) {
      mapElement.addEventListener('touchstart', handleTouchStart as EventListener, { passive: false });
    }

    return () => {
      // Clean up event listeners
      if (mapElement) {
        mapElement.removeEventListener('touchstart', handleTouchStart as EventListener);
      }
    };
  }, []);

  // Update map view when plot changes
  useEffect(() => {
    if (mapRef.current && plot) {
      const map = mapRef.current;
      map.setView([plot.latitude, plot.longitude], 15);
    }
  }, [plot]);

  // Setup map after it's ready
  useEffect(() => {
    if (typeof window !== 'undefined' && mapRef.current) {
      // Tunggu sebentar untuk memastikan map benar-benar siap
      const timeoutId = setTimeout(() => {
        if (mapRef.current) {
          handleMapReady(mapRef.current);
        }
      }, 100);
      
      return () => clearTimeout(timeoutId);
    }
  }, []);

  const toggleBasemap = () => {
    setBasemap(prev => prev === 'osm' ? 'esri' : 'osm');
  };

  // Setup map after it's ready
  const handleMapReady = (map: L.Map) => {
    // Store map reference with type assertion
    mapRef.current = map as ExtendedLeafletMap;
    
    // Small delay to ensure map is fully initialized
    setTimeout(() => {
      try {
        // Check if gesture handling is available and enable it
        const mapWithGesture = map as ExtendedLeafletMap;
        if (mapWithGesture.gestureHandling) {
          mapWithGesture.gestureHandling.enable();
          console.log('Gesture handling enabled');
        } else {
          console.log('Gesture handling not available on map instance');
        }
      } catch (error) {
        console.error('Error enabling gesture handling:', error);
      }
    }, 500);
    
    // Re-enable default zoom controls
    if (map.zoomControl) {
      map.zoomControl.setPosition('topright');
    }
  };

  return (
    <div className="relative w-full h-full">
      {isClient ? (
        <MapContainer 
          key={plot?.id}
          center={plot ? [plot.latitude, plot.longitude] : [0, 0]} 
          zoom={15} 
          className={styles.mapContainer}
          ref={mapRef}
          // Ensure zoom control is enabled with default settings
          zoomControl={true}
          // Set max zoom level to 20
          maxZoom={20}
        >
          {basemap === 'osm' ? (
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          ) : (
            <TileLayer
              attribution='&copy; <a href="https://www.esri.com/">Esri</a> contributors'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
          )}
          {plot && plot.polygon && formatPolygonForLeaflet(plot.polygon).length > 0 && (
            <Polygon 
              positions={formatPolygonForLeaflet(plot.polygon)} 
              color="#3b82f6"
              fillColor="#3b82f6"
              fillOpacity={0.2}
              weight={2}
            >
              <Popup>
                <b>Batas Plot {plot.plot_name}</b><br />
                Luas: {plot.area_hectares} ha
              </Popup>
            </Polygon>
          )}
          {plot && (
            <Marker position={[plot.latitude, plot.longitude]}>
              <Popup>
                <b>{plot.plot_name}</b><br />
                {farmer ? farmer.full_name : "Petani tidak ditemukan"}<br />
                Luas: {plot.area_hectares} ha
              </Popup>
            </Marker>
          )}
        </MapContainer>
      ) : (
        <div className={styles.mapContainer} style={{ width: '100%', height: '100%' }} />
      )}
      <button
        onClick={toggleBasemap}
        className="absolute top-2 right-2 z-20 bg-white dark:bg-gray-800 px-3 py-1 rounded shadow-md text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200"
        aria-label={`Ganti ke ${basemap === 'osm' ? 'ESRI' : 'OSM'}`}
      >
        {basemap === 'osm' ? 'ESRI' : 'OSM'}
      </button>
    </div>
  );
}