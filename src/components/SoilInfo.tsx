'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SoilPoint {
  id: number;
  plot_id: number;
  lat: number;
  lon: number;
  property: string;
  depth: string;
  stat_mean: number | null;
  q05: number | null;
  q50: number | null;
  q95: number | null;
  uncertainty: number | null;
  raw: Record<string, unknown>;
  queried_at: string;
  updated_at: string;
  stat_mean_readable: number | null;
}

interface SoilProperty {
  id: number; // Will be the first record's ID for the depth layer
  plot_id: number;
  depth: string;
  depth_from_cm: number;
  depth_to_cm: number;
  lat: number;
  lon: number;
  properties: {
    [key: string]: number | null; // Dynamic properties like clay, silt, sand, etc.
  };
  queried_at?: string;
  updated_at?: string;
}

interface SoilInfoProps {
  plotId: number;
  compactButtonOnly?: boolean;
  depthFilter?: string | null;
}

export default function SoilInfo({ plotId, compactButtonOnly = false, depthFilter }: SoilInfoProps) {
  const [loading, setLoading] = useState(false);
  const [soilData, setSoilData] = useState<SoilProperty[] | null>(null);
  const [error, setError] = useState<string | null>(null);



  // Load soil data whenever the plotId changes (similar to climate data)
  useEffect(() => {
    const loadSoilData = async () => {
      // Skip loading if in compact mode (used for the button component)
      if (compactButtonOnly) return;

      setLoading(true);
      setError(null);
      
      try {
        // Build the API URL with plotId and potentially depth filter
        let apiUrl = `/api/dashboard/soil?plotId=${plotId}`;
        if (depthFilter) {
          apiUrl += `&depth=${encodeURIComponent(depthFilter)}`;
        }

        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data: SoilPoint[] = await response.json();
          
          // Transform the data from individual property rows to grouped by depth
          const groupedData: SoilProperty[] = [];
          
          // Group by depth
          const depthGroups: { [key: string]: SoilPoint[] } = {};
          data.forEach(record => {
            if (!depthGroups[record.depth]) {
              depthGroups[record.depth] = [];
            }
            depthGroups[record.depth].push(record);
          });
          
          // Convert each depth group to a single SoilProperty object
          Object.entries(depthGroups).forEach(([depth, records]) => {
            // Extract depth range from depth string (e.g., "0-5cm" -> from=0, to=5)
            const depthParts = depth.replace('cm', '').split('-');
            const from = parseInt(depthParts[0]);
            const to = depthParts[1] ? parseInt(depthParts[1]) : from + 5;
            
            // Find first record for this depth to get common properties
            const firstRecord = records[0];
            
            // Create a properties object with all the property values
            const properties: { [key: string]: number | null } = {};
            records.forEach(record => {
              // Use stat_mean_readable if available (for pH and other transformed values), otherwise use stat_mean
              properties[record.property] = record.stat_mean_readable !== null && record.stat_mean_readable !== undefined
                ? record.stat_mean_readable 
                : record.stat_mean;
            });
            
            const groupedRecord: SoilProperty = {
              id: firstRecord.id, // Use the first record's ID
              plot_id: firstRecord.plot_id,
              depth: depth,
              depth_from_cm: from,
              depth_to_cm: to,
              lat: firstRecord.lat,
              lon: firstRecord.lon,
              properties: properties,
              queried_at: firstRecord.queried_at,
              updated_at: firstRecord.updated_at
            };
            
            groupedData.push(groupedRecord);
          });
          
          // Sort by depth from shallow to deep
          groupedData.sort((a, b) => a.depth_from_cm - b.depth_from_cm);
          
          setSoilData(groupedData);
        } else {
          // Handle error response from the API
          const errorData = await response.json();
          setError(errorData.error || 'Failed to load soil data');
        }
      } catch (err) {
        console.error('Error loading soil data:', err);
        setError('Failed to load soil data');
      } finally {
        setLoading(false);
      }
    };

    loadSoilData();
  }, [plotId, depthFilter, compactButtonOnly]);

  // Format a single soil property value for display
  const formatSoilProperty = (value: number | null, propertyKey?: string) => {
    if (value === null || value === undefined) return 'N/A';
    
    let displayedUnit = '';
    
    switch(propertyKey) {
      case 'phh2o': // pH already transformed in stat_mean_readable
        displayedUnit = '';
        return `${value}${displayedUnit}`;
      case 'soc':
        displayedUnit = 'g/kg';
        return `${value}${displayedUnit}`;
      case 'nitrogen':
        displayedUnit = 'g/kg';
        return `${value}${displayedUnit}`;
      case 'cec':
        displayedUnit = 'cmol/kg';
        return `${value}${displayedUnit}`;
      case 'bdod':
        displayedUnit = 'kg/m³';
        return `${value}${displayedUnit}`;
      case 'sand':
      case 'silt':
      case 'clay':
      case 'cfvo':
        displayedUnit = '%';
        return `${value}${displayedUnit}`;
      default:
        // For other properties, return raw value
        return `${value}`;
    }
  };



  return (
    <>
      {loading && (
        <Card>
          <CardHeader>
            <CardTitle>Profil Tanah</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center items-center h-32">
              <p className="text-muted-foreground">Memuat data tanah...</p>
            </div>
          </CardContent>
        </Card>
      )}
      {!loading && error && (
        <Card>
          <CardHeader>
            <CardTitle>Profil Tanah</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          </CardContent>
        </Card>
      )}
      {!loading && !error && soilData && soilData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Profil Tanah</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Create sections for each depth layer */}
              {soilData.map((layer) => (
                <div key={layer.id} className="border rounded-lg p-4">
                  <div className="bg-muted p-3 rounded-md text-sm mb-4">
                    <p>Kedalaman: {layer.depth_from_cm}cm - {layer.depth_to_cm}cm</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {layer.properties?.sand !== undefined && layer.properties?.sand !== null && (
                      <div className="flex flex-row lg:flex-col justify-between items-center lg:items-start gap-3 lg:gap-1">
                        <h3 className="font-medium text-muted-foreground">Kandungan Pasir</h3>
                        <p className="text-lg">{formatSoilProperty(layer.properties?.sand, 'sand')}</p>
                      </div>
                    )}
                    {layer.properties?.silt !== undefined && layer.properties?.silt !== null && (
                      <div className="flex flex-row lg:flex-col justify-between items-center lg:items-start gap-3 lg:gap-1">
                        <h3 className="font-medium text-muted-foreground">Kandungan Debu</h3>
                        <p className="text-lg">{formatSoilProperty(layer.properties?.silt, 'silt')}</p>
                      </div>
                    )}
                    {layer.properties?.clay !== undefined && layer.properties?.clay !== null && (
                      <div className="flex flex-row lg:flex-col justify-between items-center lg:items-start gap-3 lg:gap-1">
                        <h3 className="font-medium text-muted-foreground">Kandungan Liat</h3>
                        <p className="text-lg">{formatSoilProperty(layer.properties?.clay, 'clay')}</p>
                      </div>
                    )}
                    {layer.properties?.phh2o !== undefined && layer.properties?.phh2o !== null && (
                      <div className="flex flex-row lg:flex-col justify-between items-center lg:items-start gap-3 lg:gap-1">
                        <h3 className="font-medium text-muted-foreground">pH Tanah</h3>
                        <p className="text-lg">{formatSoilProperty(layer.properties?.phh2o, 'phh2o')}</p>
                      </div>
                    )}
                    {layer.properties?.soc !== undefined && layer.properties?.soc !== null && (
                      <div className="flex flex-row lg:flex-col justify-between items-center lg:items-start gap-3 lg:gap-1">
                        <h3 className="font-medium text-muted-foreground">Karbon Organik Tanah</h3>
                        <p className="text-lg">{formatSoilProperty(layer.properties?.soc, 'soc')}</p>
                      </div>
                    )}
                    {layer.properties?.bdod !== undefined && layer.properties?.bdod !== null && (
                      <div className="flex flex-row lg:flex-col justify-between items-center lg:items-start gap-3 lg:gap-1">
                        <h3 className="font-medium text-muted-foreground">Berat Isi Tanah</h3>
                        <p className="text-lg">{formatSoilProperty(layer.properties?.bdod, 'bdod')}</p>
                      </div>
                    )}
                    {layer.properties?.cfvo !== undefined && layer.properties?.cfvo !== null && (
                      <div className="flex flex-row lg:flex-col justify-between items-center lg:items-start gap-3 lg:gap-1">
                        <h3 className="font-medium text-muted-foreground">Fragmen Kasar</h3>
                        <p className="text-lg">{formatSoilProperty(layer.properties?.cfvo, 'cfvo')}</p>
                      </div>
                    )}
                    {layer.properties?.cec !== undefined && layer.properties?.cec !== null && (
                      <div className="flex flex-row lg:flex-col justify-between items-center lg:items-start gap-3 lg:gap-1">
                        <h3 className="font-medium text-muted-foreground">Kapasitas Tukar Kation</h3>
                        <p className="text-lg">{formatSoilProperty(layer.properties?.cec, 'cec')}</p>
                      </div>
                    )}
                    {layer.properties?.nitrogen !== undefined && layer.properties?.nitrogen !== null && (
                      <div className="flex flex-row lg:flex-col justify-between items-center lg:items-start gap-3 lg:gap-1">
                        <h3 className="font-medium text-muted-foreground">Nitrogen</h3>
                        <p className="text-lg">{formatSoilProperty(layer.properties?.nitrogen, 'nitrogen')}</p>
                      </div>
                    )}
                  </div>
                  

                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}