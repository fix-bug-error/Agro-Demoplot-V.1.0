"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MapPin, Cherry, Image, ImageOff, ChevronUp, ChevronDown, Search, Plus } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Tooltip as ShadcnTooltip,
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import dynamic from "next/dynamic";

import { Skeleton } from "@/components/ui/skeleton";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

// Dynamically import the map component to avoid SSR issues
const MapComponent = dynamic(() => import("@/components/map"), { 
  ssr: false,
  loading: () => <div className="h-96 rounded-lg bg-gray-100 border-2 border-dashed flex items-center justify-center">Memuat peta...</div>
});

// Dynamically import the coordinate picker to avoid SSR issues with Leaflet
const CoordinatePicker = dynamic(() => import("@/components/coordinate-picker").then(mod => mod.CoordinatePicker), {
  ssr: false,
  loading: () => <Button variant="outline" disabled>Memuat peta...</Button>
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
  productivity?: number;
};

export default function MapPage() {
  const [selectedPlot, setSelectedPlot] = useState<number | null>(null);
  const [plots, setPlots] = useState<Plot[]>([]);
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPlotListMinimized, setIsPlotListMinimized] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState("");
  
  // State for add plot dialog
  const [isAddPlotDialogOpen, setIsAddPlotDialogOpen] = useState(false);
  const [newPlotData, setNewPlotData] = useState({
    plot_name: "",
    farmer_id: 0,
    location_name: "",
    latitude: 0,
    longitude: 0,
    area_hectares: 0,
    demoplot_hectares: 0,
    altitude: 0,
    list_of_plants: "",
    number_of_coffee: 0,
    number_of_shade_trees: 0,
    productivity: 0
  });
  
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);

  // Function to handle adding a new plot
  const handleAddPlot = async () => {
    try {
      // Validate required fields
      if (!newPlotData.plot_name || newPlotData.farmer_id === 0) {
        alert("Nama plot dan petani harus diisi");
        return;
      }

      // Prepare data for submission
      const plotToSubmit = {
        ...newPlotData,
        // Ensure numeric fields are properly formatted
        latitude: parseFloat(newPlotData.latitude.toString()) || 0,
        longitude: parseFloat(newPlotData.longitude.toString()) || 0,
        area_hectares: parseFloat(newPlotData.area_hectares.toString()) || 0,
        demoplot_hectares: parseFloat(newPlotData.demoplot_hectares.toString()) || 0,
        altitude: parseFloat(newPlotData.altitude.toString()) || 0,
        number_of_coffee: parseInt(newPlotData.number_of_coffee.toString()) || 0,
        number_of_shade_trees: parseInt(newPlotData.number_of_shade_trees.toString()) || 0,
        productivity: parseFloat(newPlotData.productivity.toString()) || 0
      };

      // Submit to API
      const response = await fetch('/api/dashboard/plots', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(plotToSubmit),
      });

      if (response.ok) {
        const newPlot = await response.json();
        
        // Add to local state
        setPlots([...plots, newPlot]);
        
        // Close dialog and reset form
        setIsAddPlotDialogOpen(false);
        setNewPlotData({
          plot_name: "",
          farmer_id: 0,
          location_name: "",
          latitude: 0,
          longitude: 0,
          area_hectares: 0,
          demoplot_hectares: 0,
          altitude: 0,
          list_of_plants: "",
          number_of_coffee: 0,
          number_of_shade_trees: 0,
          productivity: 0
        });
        
        // Show success alert
        setShowSuccessAlert(true);
        setTimeout(() => setShowSuccessAlert(false), 3000);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Gagal menambahkan plot");
      }
    } catch (error) {
      console.error("Error adding plot:", error);
      alert("Gagal menambahkan plot: " + (error instanceof Error ? error.message : "Terjadi kesalahan"));
    }
  };

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
        const [plotsResData, farmersResData] = await Promise.all([
          plotsRes.json(),
          farmersRes.json()
        ]);
        
        // Handle different response formats
        // plots API returns raw array, farmers API returns { success: boolean, data: [] }
        const plotsData = Array.isArray(plotsResData) ? plotsResData : (plotsResData.data || []);
        const farmersData = Array.isArray(farmersResData) ? farmersResData : (farmersResData.data || []);
        
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
  
  // Filter plots based on search term
  const filteredPlots = plots.filter(plot => 
    plot.plot_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plot.location_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort plots by name to ensure Demoplot 1, Demoplot 2, etc. order
  const sortedPlots = [...filteredPlots].sort((a, b) => {
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
      <div className="space-y-6">
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-1/4" />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Farm card image skeleton */}
            <Skeleton className="h-48 w-full rounded-xl" />
            
            {/* Plot list card skeleton */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <Skeleton className="h-10 w-full" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Skeleton className="h-20 w-full rounded-lg" />
                  <Skeleton className="h-20 w-full rounded-lg" />
                  <Skeleton className="h-20 w-full rounded-lg" />
                </div>
              </CardContent>
            </Card>
            
            {/* Map card skeleton */}
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-1/3" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-96 w-full rounded-lg" />
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-6">
            {/* Detail card skeleton */}
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Skeleton className="h-40 w-full" />
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-full" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Aerial photo card skeleton */}
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-1/3" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Skeleton className="h-80 w-full rounded-lg aspect-square" />
                  <div className="flex gap-2">
                    <Skeleton className="h-10 flex-1" />
                    <Skeleton className="h-10 flex-1" />
                  </div>
                </div>
              </CardContent>
            </Card>
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
    <TooltipProvider>
      <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Informasi Lahan</h1>
        <ShadcnTooltip>
          <TooltipTrigger asChild>
            <Button onClick={() => setIsAddPlotDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Plot
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Fitur Masih Eksperimental</p>
          </TooltipContent>
        </ShadcnTooltip>
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
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Cari plot atau lokasi..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                {isPlotListMinimized ? (
                  <ChevronDown className="h-5 w-5 ml-2" />
                ) : (
                  <ChevronUp className="h-5 w-5 ml-2" />
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
                  {sortedPlots.length > 0 ? (
                    sortedPlots.map((plot) => {
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
                    })
                  ) : (
                    <p className="text-center py-8 text-muted-foreground">
                      Tidak ada data plot yang ditemukan
                    </p>
                  )}
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
              <div className="h-96 rounded-lg bg-gray-100 border-2 border-dashed flex items-center justify-center relative z-20 overflow-hidden touch-auto">
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
              <CardTitle>
                {currentPlot ? "Detail Plot" : "Detail Plot"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {currentPlot ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="space-y-2">
                      <Label htmlFor="plot_name">Nama Plot</Label>
                      <div className="p-2 border rounded-md">
                        {currentPlot.plot_name}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="location_name">Lokasi</Label>
                      <div className="p-2 border rounded-md">
                        {currentPlot.location_name}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="farmer_name">Nama Petani</Label>
                      <div className="p-2 border rounded-md">
                        {currentFarmer ? currentFarmer.full_name : "-"}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="area_hectares">Luas Lahan</Label>
                        <div className="p-2 border rounded-md">
                          {currentPlot.area_hectares} ha
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="demoplot_hectares">Luas Demoplot</Label>
                        <div className="p-2 border rounded-md">
                          {currentPlot.demoplot_hectares} ha
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="latitude">Koordinat (Lintang)</Label>
                      <div className="p-2 border rounded-md">
                        {currentPlot.latitude.toFixed(4)}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="longitude">Koordinat (Bujur)</Label>
                      <div className="p-2 border rounded-md">
                        {currentPlot.longitude.toFixed(4)}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="altitude">Ketinggian</Label>
                      <div className="p-2 border rounded-md">
                        {currentPlot.altitude} mdpl
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="list_of_plants">Jenis Tanaman</Label>
                      <div className="p-2 border rounded-md">
                        {currentPlot.list_of_plants || "-"}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="number_of_coffee">Jumlah Pohon <br />Kopi</Label>
                        <div className="p-2 border rounded-md">
                          {currentPlot.number_of_coffee || 0}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="number_of_shade_trees">Jumlah Pohon <br />Penaung</Label>
                        <div className="p-2 border rounded-md">
                          {currentPlot.number_of_shade_trees || 0}
                        </div>
                      </div>
                    </div>
                    
                    {/* Pie Chart for Coffee and Shade Trees Distribution */}
                    {(currentPlot.number_of_coffee || currentPlot.number_of_shade_trees) && (
                      <div className="mt-4">
                        <h4 className="font-medium text-sm mb-2">Distribusi Tanaman</h4>
                        <div className="h-64">
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
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                                
                              >
                                <Cell fill="#8884d8" />
                                <Cell fill="#82ca9d" />
                              </Pie>
                              <Tooltip formatter={(value, name, props) => {
                                // Calculate the total value
                                const total = (currentPlot.number_of_coffee || 0) + (currentPlot.number_of_shade_trees || 0);
                                // Calculate the percentage
                                const percentage = total > 0 ? Math.round((Number(value) / total) * 100) : 0;
                                return [`${value} (${percentage}%)`, name];
                              }} />
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    )}
                    
                    {/* Coffee Production Section */}
                    <div className="border-t pt-4 mt-4 text-center">
                      <h4 className="font-medium text-sm mb-2 flex items-center justify-center gap-2">
                        <Cherry className="h-4 w-4 mx-auto" />
                        <span className="mx-auto">Produksi Kopi Per Tahun</span>
                      </h4>
                      {currentPlot.productivity ? (
                        <div className="text-center">
                          <p className="text-2xl font-bold text-green-600">{currentPlot.productivity}</p>
                          <p className="text-xs text-muted-foreground">Kg per hektar per tahun</p>
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground italic">
                          Data produksi belum tersedia
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="font-medium mb-1">Tidak ada plot dipilih</h3>
                  <p className="text-sm text-muted-foreground">
                    Pilih plot dari daftar untuk melihat detailnya
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
          
          
        </div>
      </div>
      
      {/* Add Plot Dialog */}
        <Dialog open={isAddPlotDialogOpen} onOpenChange={setIsAddPlotDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Tambah Plot Baru</DialogTitle>
              <DialogDescription>
                Tambahkan data plot baru ke dalam sistem
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="plot_name">Nama Plot</Label>
                  <Input
                    id="plot_name"
                    value={newPlotData.plot_name}
                    onChange={(e) => setNewPlotData({...newPlotData, plot_name: e.target.value})}
                    placeholder="Masukkan nama plot"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="farmer_id">Petani</Label>
                  <Select
                    value={newPlotData.farmer_id.toString()}
                    onValueChange={(value) => setNewPlotData({...newPlotData, farmer_id: parseInt(value)})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih petani" />
                    </SelectTrigger>
                    <SelectContent>
                      {farmers.map((farmer) => (
                        <SelectItem key={farmer.id} value={farmer.id.toString()}>
                          {farmer.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="location_name">Lokasi</Label>
                <Input
                  id="location_name"
                  value={newPlotData.location_name}
                  onChange={(e) => setNewPlotData({...newPlotData, location_name: e.target.value})}
                  placeholder="Masukkan lokasi plot"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="area_hectares">Luas Lahan (ha)</Label>
                  <Input
                    id="area_hectares"
                    type="number"
                    step="any"
                    value={newPlotData.area_hectares}
                    onChange={(e) => setNewPlotData({...newPlotData, area_hectares: parseFloat(e.target.value) || 0})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="demoplot_hectares">Luas Demoplot (ha)</Label>
                  <Input
                    id="demoplot_hectares"
                    type="number"
                    step="any"
                    value={newPlotData.demoplot_hectares}
                    onChange={(e) => setNewPlotData({...newPlotData, demoplot_hectares: parseFloat(e.target.value) || 0})}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="latitude">Koordinat Lintang</Label>
                  <Input
                    id="latitude"
                    type="number"
                    step="any"
                    value={newPlotData.latitude}
                    onChange={(e) => setNewPlotData({...newPlotData, latitude: parseFloat(e.target.value) || 0})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="longitude">Koordinat Bujur</Label>
                  <Input
                    id="longitude"
                    type="number"
                    step="any"
                    value={newPlotData.longitude}
                    onChange={(e) => setNewPlotData({...newPlotData, longitude: parseFloat(e.target.value) || 0})}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex gap-2">
                  <CoordinatePicker 
                    onCoordinatesChange={(lat, lng) => {
                      setNewPlotData({
                        ...newPlotData,
                        latitude: lat,
                        longitude: lng
                      });
                    }}
                  />
                  <TooltipProvider>
                    <ShadcnTooltip>
                      <TooltipTrigger asChild>
                        <button 
                          type="button" 
                          className="border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                          onClick={(e) => {
                            e.preventDefault();
                            // Prevent any action, just show tooltip
                          }}
                        >
                          Upload Polygon
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Fitur Belum Tersedia</p>
                      </TooltipContent>
                    </ShadcnTooltip>
                  </TooltipProvider>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="altitude">Ketinggian (mdpl)</Label>
                <Input
                  id="altitude"
                  type="number"
                  value={newPlotData.altitude}
                  onChange={(e) => setNewPlotData({...newPlotData, altitude: parseInt(e.target.value) || 0})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="list_of_plants">Jenis Tanaman</Label>
                <Input
                  id="list_of_plants"
                  value={newPlotData.list_of_plants}
                  onChange={(e) => setNewPlotData({...newPlotData, list_of_plants: e.target.value})}
                  placeholder="Masukkan jenis tanaman"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="number_of_coffee">Jumlah Pohon Kopi</Label>
                  <Input
                    id="number_of_coffee"
                    type="number"
                    value={newPlotData.number_of_coffee}
                    onChange={(e) => setNewPlotData({...newPlotData, number_of_coffee: parseInt(e.target.value) || 0})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="number_of_shade_trees">Jumlah Pohon Penaung</Label>
                  <Input
                    id="number_of_shade_trees"
                    type="number"
                    value={newPlotData.number_of_shade_trees}
                    onChange={(e) => setNewPlotData({...newPlotData, number_of_shade_trees: parseInt(e.target.value) || 0})}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="productivity">Produktivitas (kg/hektar/tahun)</Label>
                <Input
                  id="productivity"
                  type="number"
                  step="any"
                  value={newPlotData.productivity}
                  onChange={(e) => setNewPlotData({...newPlotData, productivity: parseFloat(e.target.value) || 0})}
                />
              </div>
            </div>
            
            {/* Success Alert */}
            {showSuccessAlert && (
              <Alert className="bg-green-100 border-green-200 text-green-800 mb-4">
                <AlertDescription className="flex items-center gap-2">
                  <span>✓</span>
                  <span>Plot berhasil ditambahkan!</span>
                </AlertDescription>
              </Alert>
            )}
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddPlotDialogOpen(false)}>
                Batal
              </Button>
              <Button onClick={handleAddPlot}>
                Simpan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        
      </div>
    </TooltipProvider>
  );
}