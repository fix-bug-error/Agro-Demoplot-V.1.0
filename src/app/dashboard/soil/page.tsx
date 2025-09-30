'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, FileText, Database, RotateCcw } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import SoilInfo from '@/components/SoilInfo';
import { DashboardWrapper } from '@/components/dashboard-wrapper';
import type { Plot } from '@/types';

export default function SoilConditionPage() {
  const [plots, setPlots] = useState<Plot[]>([]);
  const [selectedPlotId, setSelectedPlotId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [soilProperties, setSoilProperties] = useState<string[]>([]);
  const [soilPropertiesLoading, setSoilPropertiesLoading] = useState(false);
  const [selectedDepth, setSelectedDepth] = useState<string | null>("0-5cm");

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all data in parallel
        const [plotsRes] = await Promise.all([
          fetch('/api/dashboard/plots'),
          // We don't need to fetch soil data directly here since it's handled by SoilInfo component
        ]);

        if (!plotsRes.ok) {
          throw new Error('Failed to fetch plot data');
        }

        const plotsData = await plotsRes.json();
        
        // Sort plots to ensure Demoplot 1, Demoplot 2, ..., Demoplot 10 order
        const sortedPlots = [...plotsData].sort((a: Plot, b: Plot) => {
          // Extract numbers from plot names like "Demoplot 1", "Demoplot 2", etc.
          const numA = a.plot_name.match(/\d+/);
          const numB = b.plot_name.match(/\d+/);
          
          if (numA && numB) {
            return parseInt(numA[0]) - parseInt(numB[0]);
          }
          
          // If no numbers found, sort alphabetically
          return a.plot_name.localeCompare(b.plot_name);
        });

        setPlots(sortedPlots);

        // Set default selected plot
        if (sortedPlots.length > 0) {
          setSelectedPlotId(sortedPlots[0].id);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Gagal memuat data lahan. Silakan coba lagi.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fetch available soil properties when selectedPlotId changes
  useEffect(() => {
    const fetchSoilProperties = async () => {
      if (!selectedPlotId) {
        setSoilProperties([]);
        return;
      }

      setSoilPropertiesLoading(true);
      try {
        const response = await fetch(`/api/dashboard/soil?plotId=${selectedPlotId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          
          // Extract unique property names from the response
          const uniqueProperties = [...new Set(data.map((item: { property: string }) => item.property))] as string[];
          setSoilProperties(uniqueProperties);
        } else {
          console.error('Failed to fetch soil properties');
          setSoilProperties([]);
        }
      } catch (err) {
        console.error('Error fetching soil properties:', err);
        setSoilProperties([]);
      } finally {
        setSoilPropertiesLoading(false);
      }
    };

    fetchSoilProperties();
  }, [selectedPlotId]);

  if (loading) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-40" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-96 w-full rounded-xl" />
          </div>
          
          <div className="space-y-6">
            <Skeleton className="h-48 w-full rounded-xl" />
            <Skeleton className="h-40 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Coba Lagi
          </Button>
        </div>
      </div>
    );
  }

  return (
    <DashboardWrapper 
      plots={plots} 
      selectedPlot={selectedPlotId} 
      onPlotSelect={setSelectedPlotId}
    >
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl font-bold">Karakteristik Tanah</h1>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            {selectedPlotId && (
              <SoilInfo plotId={selectedPlotId} compactButtonOnly={true} />
            )}
            {/* Depth Filter Buttons */}
            <div className="flex rounded-md overflow-hidden border w-full sm:w-auto">
              <Button 
                variant={selectedDepth === "0-5cm" ? "default" : "outline"}
                size="sm"
                className="rounded-none border-0 flex-1 text-xs sm:text-sm"
                onClick={() => setSelectedDepth("0-5cm")}
              >
                0-5cm
              </Button>
              <Button 
                variant={selectedDepth === "5-15cm" ? "default" : "outline"}
                size="sm"
                className="rounded-none border-0 border-l flex-1 text-xs sm:text-sm"
                onClick={() => setSelectedDepth("5-15cm")}
              >
                5-15cm
              </Button>
              <Button 
                variant={selectedDepth === "15-30cm" ? "default" : "outline"}
                size="sm"
                className="rounded-none border-0 border-l flex-1 text-xs sm:text-sm"
                onClick={() => setSelectedDepth("15-30cm")}
              >
                15-30cm
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {selectedPlotId ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <SoilInfo plotId={selectedPlotId} depthFilter={selectedDepth} />
                </div>
                
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          <span>Ringkasan Informasi</span>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <MapPin className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Lahan Terpilih</p>
                            <p className="font-medium">
                              {plots.find(p => p.id === selectedPlotId)?.plot_name}
                            </p>
                          </div>
                        </div>
                        
                        <div className="pt-4">
                          <h4 className="font-medium mb-2">Parameter Tanah Tersedia:</h4>
                          {soilPropertiesLoading ? (
                            <p className="text-sm text-muted-foreground">Memuat parameter tanah...</p>
                          ) : soilProperties.length > 0 ? (
                            <ul className="text-sm text-muted-foreground space-y-1">
                              {/* Define the fixed order for displaying soil properties */}
                              {['sand', 'silt', 'clay', 'phh2o', 'soc', 'bdod', 'cfvo', 'cec', 'nitrogen', 'ocd', 'ocs']
                                .filter(property => soilProperties.includes(property))
                                .map((property, index) => {
                                  // Map property names to more user-friendly labels
                                  const propertyLabels: Record<string, string> = {
                                    clay: 'Kandungan Liat (Clay)',
                                    silt: 'Kandungan Debu (Silt)',
                                    sand: 'Kandungan Pasir (Sand)',
                                    phh2o: 'Derajat Keasaman (pH)',
                                    soc: 'Karbon Organik Tanah',
                                    bdod: 'Berat Isi Tanah',
                                    cec: 'Kapasitas Tukar Kation',
                                    nitrogen: 'Kandungan Nitrogen',
                                    cfvo: 'Fragmen Kasar',
                                    ocd: 'Kepadatan Organik',
                                    ocs: 'Simpanan Karbon Organik'
                                  };
                                  
                                  const label = propertyLabels[property] || property;
                                  return (
                                    <li key={property}>• {label}</li>
                                  );
                                })}
                            </ul>
                          ) : (
                            <p className="text-sm text-muted-foreground">Tidak ada parameter tanah tersedia</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
              {/* Full-width Sumber Data card */}
              <div className="lg:col-span-3">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Database className="h-4 w-4" />
                      Sumber Data
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                     Data tanah diperoleh dari SoilGrids - Sistem informasi tanah digital global 
                      berbasis artificial intelligence dan machine learning. 
                      Model prediksi SoilGrids menggunakan observasi profil tanah dari basis data WoSIS 
                      beserta serangkaian kovariat lingkungan. Kovariat dipilih dari 400 lapisan lingkungan 
                      dan informasi lingkungan lainnya seperti iklim, tutupan lahan, dan morfologi medan.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Pilih Lahan</h3>
                  <p className="text-muted-foreground mb-4">
                    Pilih lahan dari daftar untuk melihat informasi karakteristik tanah
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Tidak ada lahan yang tersedia
                  </p>
                </CardContent>
              </Card>
              {/* Full-width Sumber Data card for no plot selected state */}
              <div className="lg:col-span-3">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Database className="h-4 w-4" />
                      Sumber Data
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Data tanah diperoleh dari SoilGrids - Sistem informasi tanah digital global 
                      berbasis artificial intelligence dan machine learning. 
                      Model prediksi SoilGrids menggunakan observasi profil tanah dari basis data WoSIS 
                      beserta serangkaian kovariat lingkungan. Kovariat dipilih dari 400 lapisan lingkungan 
                      dan informasi lingkungan lainnya seperti iklim, tutupan lahan, dan morfologi medan.
                    </p>
                    
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardWrapper>
  );
}