"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Image, ImageOff, ChevronUp, ChevronDown, X } from "lucide-react";
import dynamic from "next/dynamic";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

// Dynamically import the map component to avoid SSR issues
const MapComponent = dynamic(() => import("@/components/map"), { 
  ssr: false,
  loading: () => <div className="h-96 rounded-lg bg-gray-100 border-2 border-dashed flex items-center justify-center">Memuat peta...</div>
});

// Mock data types
type Farmer = {
  id: number;
  full_name: string;
  national_id: string;
  birth_date: string;
  education: string;
  gender: string;
  phone_number: string;
  address: string;
  farmer_group: string;
  photo_url: string;
};

type Plot = {
  id: number;
  farmer_id: number;
  plot_name: string;
  location_name: string;
  latitude: number;
  longitude: number;
  area_hectares: number;
  map_image_url: string;
  demoplot_hectares: number;
  altitude: number;
  list_of_plants: string;
  number_of_coffee: number;
  number_of_shade_trees: number;
  polygon: Record<string, unknown> | unknown[] | string | null; // Bisa dalam berbagai format JSON (GeoJSON, array, dll)
};

export default function MapPage() {
  const [selectedPlot, setSelectedPlot] = useState<number | null>(null);
  const [plots, setPlots] = useState<Plot[]>([]);
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPlotListMinimized, setIsPlotListMinimized] = useState(true);
  const [isImagePopupOpen, setIsImagePopupOpen] = useState(false);

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch all data in parallel
        const [plotsRes, farmersRes] = await Promise.all([
          fetch('/api/dashboard/plots'),
          fetch('/api/dashboard/farmers')
        ]);
        
        // Check if all requests were successful
        if (!plotsRes.ok || !farmersRes.ok) {
          throw new Error('Failed to fetch map data');
        }
        
        // Parse JSON responses
        const [plotsData, farmersData] = await Promise.all([
          plotsRes.json(),
          farmersRes.json()
        ]);
        
        setPlots(plotsData);
        setFarmers(farmersData);
        
        // Set default selected plot
        if (plotsData.length > 0) {
          setSelectedPlot(plotsData[0].id);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Gagal memuat data peta. Silakan coba lagi.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Get current farmer based on selected plot
  const getCurrentFarmer = () => {
    if (!selectedPlot) return null;
    const plot = plots.find(p => p.id === selectedPlot);
    if (!plot) return null;
    return farmers.find(f => f.id === plot.farmer_id);
  };

  const currentFarmer = getCurrentFarmer();
  const currentPlot = plots.find(p => p.id === selectedPlot) || null;
  
  // Sort plots by name to ensure Demoplot 1, Demoplot 2, etc. order
  const sortedPlots = [...plots].sort((a, b) => {
    // Extract numbers from plot names like "Demoplot 1", "Demoplot 2", etc.
    const numA = a.plot_name.match(/\d+/);
    const numB = b.plot_name.match(/\d+/);
    
    if (numA && numB) {
      return parseInt(numA[0]) - parseInt(numB[0]);
    }
    
    // If no numbers found, sort alphabetically
    return a.plot_name.localeCompare(b.plot_name);
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Memuat data peta...</p>
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Informasi Kebun</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Farm Card Image */}
          <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
            <img 
              src="/farmcard.png" 
              alt="Farm Card" 
              className="w-full h-auto object-contain"
            />
          </div>

          <Card>
            <CardHeader 
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => setIsPlotListMinimized(!isPlotListMinimized)}
            >
              <div className="flex justify-between items-center">
                <CardTitle>Daftar Plot</CardTitle>
                {isPlotListMinimized ? (
                  <ChevronDown className="h-5 w-5" />
                ) : (
                  <ChevronUp className="h-5 w-5" />
                )}
              </div>
            </CardHeader>
            <CardContent>
              {isPlotListMinimized ? (
                // Minimized view - show only selected plot
                <div className="space-y-4">
                  {currentPlot ? (
                    <div 
                      className="p-4 border rounded-lg bg-primary/10 border-primary"
                    >
                      <div className="flex justify-between">
                        <h3 className="font-semibold">{currentPlot.plot_name}</h3>
                        <span className="text-sm text-muted-foreground">
                          {currentPlot.area_hectares} ha
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {currentPlot.location_name}
                      </p>
                      {currentFarmer && (
                        <p className="text-sm mt-1">
                          Petani: {currentFarmer.full_name}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">Pilih plot untuk melihat detail</p>
                  )}
                </div>
              ) : (
                // Expanded view - show all plots
                <div className="space-y-4">
                  {sortedPlots.map((plot) => {
                    const farmer = farmers.find(f => f.id === plot.farmer_id);
                    return (
                      <div 
                        key={plot.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedPlot === plot.id 
                            ? "border-primary bg-primary/10" 
                            : "hover:bg-muted"
                        }`}
                        onClick={() => {
                        setSelectedPlot(plot.id);
                        // Auto-minimize after selection
                        setIsPlotListMinimized(true);
                      }}
                      >
                        <div className="flex justify-between">
                          <h3 className="font-semibold">{plot.plot_name}</h3>
                          <span className="text-sm text-muted-foreground">
                            {plot.area_hectares} ha
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {plot.location_name}
                        </p>
                        {farmer && (
                          <p className="text-sm mt-1">
                            Petani: {farmer.full_name}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Peta Interaktif
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96 rounded-lg bg-gray-100 border-2 border-dashed flex items-center justify-center relative z-20 overflow-hidden">
                {selectedPlot ? (
                  <div className="w-full h-full">
                    <MapComponent 
                      plot={currentPlot} 
                      farmer={currentFarmer}
                    />
                  </div>
                ) : (
                  <p>Pilih plot untuk melihat peta</p>
                )}
              </div>
            </CardContent>
          </Card>

          
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Detail Plot</CardTitle>
            </CardHeader>
            <CardContent>
              {currentPlot ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <h3 className="font-semibold">{currentPlot.plot_name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {currentPlot.location_name}
                    </p>
                  </div>
                  
                  {currentFarmer && (
                    <div>
                      <h4 className="font-medium text-sm mb-1">Petani</h4>
                      <p className="text-sm">{currentFarmer.full_name}</p>
                    </div>
                  )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Luas lahan</p>
                      <p>{currentPlot.area_hectares} ha</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Luas Demoplot</p>
                      <p>{currentPlot.demoplot_hectares} ha</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Koordinat</p>
                      <p>{currentPlot.latitude.toFixed(4)}, {currentPlot.longitude.toFixed(4)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Ketinggian</p>
                      <p>{currentPlot.altitude} mdpl</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Daftar Jenis Tanaman</p>
                      <p>{currentPlot.list_of_plants || "-"}</p>
                    </div>
                    
                    
                    {/* Pie Chart for Coffee and Shade Trees Distribution */}
                    {(currentPlot.number_of_coffee || currentPlot.number_of_shade_trees) && (
                      <div className="mt-4">
                        <h4 className="font-medium text-sm mb-2">Distribusi Tanaman</h4>
                        <div className="h-48">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={[
                                  { name: 'Kopi', value: currentPlot.number_of_coffee || 0 },
                                  { name: 'Penaung', value: currentPlot.number_of_shade_trees || 0 }
                                ]}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={60}
                                fill="#8884d8"
                                dataKey="value"
                                
                              >
                                <Cell fill="#8884d8" />
                                <Cell fill="#82ca9d" />
                              </Pie>
                              <Tooltip formatter={(value) => [value, 'Jumlah']} />
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <p>Pilih plot untuk melihat detail</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="h-5 w-5" />
                Foto Udara
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-square rounded-lg bg-gray-100 border-2 border-dashed flex items-center justify-center overflow-hidden">
                {currentPlot ? (
                  currentPlot.map_image_url ? (
                    <img 
                      src={currentPlot.map_image_url} 
                      alt={`Foto Udara ${currentPlot.plot_name}`} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center p-4">
                      <ImageOff className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                      <p className="text-muted-foreground text-center">
                        Foto udara belum tersedia
                      </p>
                    </div>
                  )
                ) : (
                  <p>Pilih plot untuk melihat foto udara</p>
                )}
              </div>
              {currentPlot && (
                <div className="flex gap-2 mt-4">
                  <Button 
                    className="flex-1"
                    variant="outline" 
                    onClick={() => setIsImagePopupOpen(true)}
                    disabled={!currentPlot.map_image_url}
                  >
                    Tampilkan
                  </Button>
                  <Button 
                    className="flex-1"
                    variant="outline" 
                    onClick={async () => {
                      if (!currentPlot.map_image_url) return;
                      
                      try {
                        // Fetch the image as a blob
                        const response = await fetch(currentPlot.map_image_url);
                        const blob = await response.blob();
                        
                        // Create a temporary URL for the blob
                        const url = window.URL.createObjectURL(blob);
                        
                        // Create a temporary link to trigger the download
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = `foto-udara-${currentPlot.plot_name.replace(/\s+/g, '-')}.jpg`;
                        document.body.appendChild(link);
                        link.click();
                        
                        // Clean up
                        document.body.removeChild(link);
                        window.URL.revokeObjectURL(url);
                      } catch (error) {
                        console.error('Error downloading image:', error);
                        // Optionally show an error message to the user
                      }
                    }}
                    disabled={!currentPlot.map_image_url}
                  >
                    Unduh
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Image Popup */}
      {isImagePopupOpen && currentPlot && currentPlot.map_image_url && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[10000] p-4">
          <div className="relative max-w-4xl max-h-full w-full h-full flex items-center justify-center">
            <button 
              className="absolute top-2 right-2 text-white bg-black bg-opacity-50 rounded-full p-2 z-10"
              onClick={() => setIsImagePopupOpen(false)}
            >
              <X className="h-6 w-6" />
            </button>
            <img 
              src={currentPlot.map_image_url} 
              alt={`Foto Udara ${currentPlot.plot_name}`} 
              className="max-w-full max-h-full object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}