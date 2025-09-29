"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Leaf, 
  Thermometer,
  ThermometerSun, 
  Bug, 
  Brain,
  MapPin,
  MapPinned,
  User,
  Cloud,
  CloudSunRain,
  Droplets,
  Wind,
  Sun,
  CloudRain,
  Image,
  ImageOff,
  HeartOff,
  AlertTriangle,
  Sprout,
  ChevronDown,
  ChevronUp,
  Zap
} from "lucide-react";
import dynamic from "next/dynamic";
import { MobileSidebar } from "@/components/layout/sidebar";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { DashboardWrapper } from "@/components/dashboard-wrapper";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Dynamically import the map component to avoid SSR issues
const MapComponent = dynamic(() => import("@/components/map"), { 
  ssr: false,
  loading: () => <div className="h-64 rounded-lg bg-gray-100 border-2 border-dashed flex items-center justify-center">Memuat peta...</div>
});

import type { Plot, Farmer, ClimateData, PestMonitoring, AIRecommendation } from "@/types";

type Recommendation = {
  id: number;
  plot_id: number;
  recommendation_title: string;
  recommendation_text: string;
  recommendation_date: string;
};

export default function DashboardPage() {
  const [selectedPlot, setSelectedPlot] = useState<number | null>(null);
  const [plots, setPlots] = useState<Plot[]>([]);
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [climateData, setClimateData] = useState<ClimateData[]>([]);
  const [pestMonitoring, setPestMonitoring] = useState<PestMonitoring[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAerialImage, setShowAerialImage] = useState(false);
  const [isPestMonitoringMinimized, setIsPestMonitoringMinimized] = useState(true);
  const [selectedPest, setSelectedPest] = useState<PestMonitoring | null>(null);
  const [showPestPopup, setShowPestPopup] = useState(false);
  const [selectedRecommendation, setSelectedRecommendation] = useState<Recommendation | null>(null);
  const [showRecommendationPopup, setShowRecommendationPopup] = useState(false);

  // Helper function to get status color and text for pest monitoring
  const getPestStatusIndicator = (status: string) => {
    // Handle empty/null/undefined status
    if (!status) {
      return {
        bgColor: "bg-white border border-gray-200",
        textColor: "text-gray-800",
        tooltip: null // No tooltip for empty status
      };
    }
    
    switch (status.toLowerCase()) {
      case "tidak parah":
        return {
          bgColor: "bg-yellow-100",
          textColor: "text-yellow-800",
          tooltip: "Tidak Parah"
        };
      case "sedang":
        return {
          bgColor: "bg-green-100",
          textColor: "text-green-800",
          tooltip: "Sedang"
        };
      case "parah":
        return {
          bgColor: "bg-orange-100",
          textColor: "text-orange-800",
          tooltip: "Parah"
        };
      case "sangat parah":
        return {
          bgColor: "bg-red-100",
          textColor: "text-red-800",
          tooltip: "Sangat Parah"
        };
      default:
        // For unknown status, use white background
        return {
          bgColor: "bg-white border border-gray-200",
          textColor: "text-gray-800",
          tooltip: null // No tooltip for unknown status
        };
    }
  };

    // Component for displaying pest status with Zap icon and tooltip
  const PestStatusIndicator = ({ status }: { status: string }) => {
    const statusInfo = getPestStatusIndicator(status);
    
    // Only show tooltip if there's a valid status with tooltip text
    if (statusInfo.tooltip) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={`p-1 rounded-full ${statusInfo.bgColor}`}>
              <Zap className={`h-4 w-4 ${statusInfo.textColor}`} />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{statusInfo.tooltip}</p>
          </TooltipContent>
        </Tooltip>
      );
    } else {
      // For empty or unknown status, show zap icon with white background and no tooltip
      return (
        <div className={`p-1 rounded-full ${statusInfo.bgColor}`}>
          <Zap className={`h-4 w-4 ${statusInfo.textColor}`} />
        </div>
      );
    }
  };

  // Get current farmer based on selected plot
  const getCurrentFarmer = () => {
    if (!selectedPlot) return null;
    const plot = plots.find(p => p.id === selectedPlot);
    if (!plot) return null;
    return farmers.find(f => f.id === plot.farmer_id);
  };

  // Get current climate data based on selected plot
  const getCurrentClimateData = () => {
    if (!selectedPlot) return [];
    return climateData.filter(cd => cd.plot_id === selectedPlot);
  };

  // Get current pest monitoring data based on selected plot
  const getCurrentPestMonitoring = () => {
    if (!selectedPlot) return [];
    return pestMonitoring.filter(pm => pm.plot_id === selectedPlot);
  };

  // Get current recommendations based on selected plot
  const getCurrentRecommendations = () => {
    if (!selectedPlot) return [];
    return recommendations.filter(r => r.plot_id === selectedPlot);
  };

  const currentFarmer = getCurrentFarmer();
  const currentClimateData = getCurrentClimateData();
  const currentPestMonitoring = getCurrentPestMonitoring();
  const currentRecommendations = getCurrentRecommendations();

  const handlePestClick = (pest: PestMonitoring) => {
    setSelectedPest(pest);
    setShowPestPopup(true);
  };

  const closePestPopup = () => {
    setShowPestPopup(false);
    setSelectedPest(null);
  };

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch all data in parallel
        const [plotsRes, farmersRes, climateRes, pestRes, recommendationsRes] = await Promise.all([
          fetch('/api/dashboard/plots'),
          fetch('/api/dashboard/farmers'),
          fetch('/api/dashboard/climate'),
          fetch('/api/dashboard/pests'),
          fetch('/api/dashboard/recommendations')
        ]);
        
        // Check if all requests were successful
        if (!plotsRes.ok || !farmersRes.ok || !climateRes.ok || !pestRes.ok || !recommendationsRes.ok) {
          throw new Error('Failed to fetch dashboard data');
        }
        
        // Parse JSON responses
        const [plotsResData, farmersResData, climateResData, pestResData, recommendationsResData] = await Promise.all([
          plotsRes.json(),
          farmersRes.json(),
          climateRes.json(),
          pestRes.json(),
          recommendationsRes.json()
        ]);
        
        // Handle different response formats
        // plots, climate, pests, and recommendations APIs return raw arrays
        // farmers API returns { success: boolean, data: [] }
        const plotsData = Array.isArray(plotsResData) ? plotsResData : (plotsResData.data || []);
        const farmersData = Array.isArray(farmersResData) ? farmersResData : (farmersResData.data || []);
        const climateData = Array.isArray(climateResData) ? climateResData : (climateResData.data || []);
        const pestData = Array.isArray(pestResData) ? pestResData : (pestResData.data || []);
        const recommendationsData = Array.isArray(recommendationsResData) ? recommendationsResData : (recommendationsResData.data || []);
        
        setPlots(plotsData);
        setFarmers(farmersData);
        setClimateData(climateData);
        setPestMonitoring(pestData);
        setRecommendations(recommendationsData);
        
        // Set default selected plot
        if (plotsData.length > 0) {
          setSelectedPlot(plotsData[0].id);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Gagal memuat data dashboard. Silakan coba lagi.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="p-4 md:p-6">
        <div className="space-y-6">
          {/* Farmer Data Card Skeleton */}
          <div className="space-y-4">
            <Skeleton className="h-6 w-1/4" />
            <div className="grid grid-cols-1 gap-4">
              <Skeleton className="h-32 w-full rounded-xl" />
            </div>
          </div>

          {/* Map Card Skeleton */}
          <div className="space-y-4">
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-80 w-full rounded-xl" />
          </div>

          {/* Climate Data Card Skeleton */}
          <div className="space-y-4">
            <Skeleton className="h-6 w-1/4" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-24 w-full rounded-xl" />
              <Skeleton className="h-24 w-full rounded-xl" />
              <Skeleton className="h-24 w-full rounded-xl" />
              <Skeleton className="h-24 w-full rounded-xl" />
            </div>
          </div>

          {/* Pest Monitoring Card Skeleton */}
          <div className="space-y-4">
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-48 w-full rounded-xl" />
          </div>

          {/* AI Recommendation Card Skeleton */}
          <div className="space-y-4">
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-24 w-full rounded-xl" />
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
      selectedPlot={selectedPlot} 
      onPlotSelect={setSelectedPlot}
    >
      <TooltipProvider>
        <div className="flex min-h-screen bg-background">
        {/* Main content */}
        <div className="flex flex-1 flex-col">
          {/* Main content */}
          <main className="flex-1 overflow-auto p-4 md:p-6">
            {loading ? (
              <div className="space-y-6">
                {/* Farmer Data Card Skeleton */}
                <div className="space-y-4">
                  <Skeleton className="h-6 w-1/4" />
                  <div className="grid grid-cols-1 gap-4">
                    <Skeleton className="h-32 w-full rounded-xl" />
                  </div>
                </div>

                {/* Map Card Skeleton */}
                <div className="space-y-4">
                  <Skeleton className="h-6 w-1/4" />
                  <Skeleton className="h-80 w-full rounded-xl" />
                </div>

                {/* Climate Data Card Skeleton */}
                <div className="space-y-4">
                  <Skeleton className="h-6 w-1/4" />
                  <div className="grid grid-cols-2 gap-4">
                    <Skeleton className="h-24 w-full rounded-xl" />
                    <Skeleton className="h-24 w-full rounded-xl" />
                    <Skeleton className="h-24 w-full rounded-xl" />
                    <Skeleton className="h-24 w-full rounded-xl" />
                  </div>
                </div>

                {/* Pest Monitoring Card Skeleton */}
                <div className="space-y-4">
                  <Skeleton className="h-6 w-1/4" />
                  <Skeleton className="h-48 w-full rounded-xl" />
                </div>

                {/* AI Recommendation Card Skeleton */}
                <div className="space-y-4">
                  <Skeleton className="h-6 w-1/4" />
                  <Skeleton className="h-24 w-full rounded-xl" />
                </div>
              </div>
            ) : error ? (
              <div className="flex justify-center items-center h-64">
                <div className="text-center">
                  <p className="text-red-500 mb-4">{error}</p>
                  <Button onClick={() => window.location.reload()}>
                    Coba Lagi
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Farmer Data Card */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Informasi Dasar
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {currentFarmer ? (
                        <div className="space-y-4">
                          <div className="flex items-start gap-4">
                            {currentFarmer.photo_url ? (
                              <img 
                                src={currentFarmer.photo_url} 
                                alt={currentFarmer.full_name} 
                                className="w-16 h-16 rounded-xl object-cover border-2 border-gray-200"
                              />
                            ) : (
                              <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
                            )}
                            <div>
                              <h3 className="font-semibold">{currentFarmer.full_name}</h3>
                              <p className="text-sm text-muted-foreground">{currentFarmer.gender}</p>
                            </div>
                          </div>
                          
                          <div className="space-y-2 text-sm">
                            <div className="grid grid-cols-4 gap-2">
                              <span className="text-muted-foreground col-span-1">No. Telp:</span>
                              <span className="col-span-3 text-right">{currentFarmer.phone_number}</span>
                            </div>
                            <div className="grid grid-cols-4 gap-2">
                              <span className="text-muted-foreground col-span-1">Alamat:</span>
                              <span className="col-span-3 text-right">{currentFarmer.address}</span>
                            </div>
                            <div className="grid grid-cols-4 gap-2">
                              <span className="text-muted-foreground col-span-1">Group:</span>
                              <span className="col-span-3 text-right">{currentFarmer.farmer_group}</span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <p>No farmer data available</p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Map Card */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5" />
                        Peta Lahan
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64 md:h-80 rounded-lg bg-gray-100 border-2 border-dashed flex items-center justify-center">
                        {selectedPlot ? (
                          <MapComponent 
                            plot={plots.find(p => p.id === selectedPlot) ?? null}
                            farmer={currentFarmer}
                          />
                        ) : (
                          <p>Select a plot to view map</p>
                        )}
                      </div>
                      
                    </CardContent>
                  </Card>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Climate Data Card */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CloudSunRain className="h-5 w-5" />
                        Data Klimatologi
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {currentClimateData.length > 0 ? (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            
                            
                            <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
                              <div className="flex items-center gap-2 mb-2">
                                <ThermometerSun className="h-4 w-4 text-orange-500" />
                                <span className="text-sm font-medium">Suhu</span>
                              </div>
                              <p className="text-2xl font-bold">
                                {currentClimateData[0].temperature_celsius} <span className="text-sm font-normal">°C</span>
                              </p>
                              <p className="text-xs text-muted-foreground">Hari ini</p>
                            </div>

                            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                              <div className="flex items-center gap-2 mb-2">
                                <CloudRain className="h-4 w-4 text-blue-500" />
                                <span className="text-sm font-medium">Curah Hujan</span>
                              </div>
                              <p className="text-2xl font-bold">
                                {currentClimateData[0].rainfall_mm} <span className="text-sm font-normal">mm</span>
                              </p>
                              <p className="text-xs text-muted-foreground">Hari ini</p>
                            </div>
                            
                            <div className="bg-cyan-50 dark:bg-cyan-900/20 p-4 rounded-lg">
                              <div className="flex items-center gap-2 mb-2">
                                <Droplets className="h-4 w-4 text-cyan-500" />
                                <span className="text-sm font-medium">Kelembapan</span>
                              </div>
                              <p className="text-2xl font-bold">
                                {currentClimateData[0].humidity_percent} <span className="text-sm font-normal">%</span>
                              </p>
                              <p className="text-xs text-muted-foreground">Hari ini</p>
                            </div>
                            
                            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                              <div className="flex items-center gap-2 mb-2">
                                <Wind className="h-4 w-4 text-green-500" />
                                <span className="text-sm font-medium">Kecepatan Angin</span>
                              </div>
                              <p className="text-2xl font-bold">
                                {currentClimateData[0].wind_speed_kmh} <span className="text-sm font-normal">km/h</span>
                              </p>
                              <p className="text-xs text-muted-foreground">Hari ini</p>
                            </div>
                          </div>
                          
                          
                        </div>
                      ) : (
                        <p>No climate data available</p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Pest Monitoring Card */}
                  <Card>
                    <CardHeader 
                      className="cursor-pointer hover:bg-muted/50 transition-colors flex flex-row items-center justify-between"
                      onClick={() => setIsPestMonitoringMinimized(!isPestMonitoringMinimized)}
                    >
                      <CardTitle className="flex items-center gap-2">
                        <Bug className="h-5 w-5" />
                        Monitoring Hama, Penyakit & Gulma
                      </CardTitle>
                      {isPestMonitoringMinimized ? (
                        <ChevronDown className="h-5 w-5" />
                      ) : (
                        <ChevronUp className="h-5 w-5" />
                      )}
                    </CardHeader>
                    <CardContent>
                      {currentPestMonitoring.length > 0 ? (
                        isPestMonitoringMinimized ? (
                          // Minimized view - show only first hama item
                          <div className="space-y-4">
                            {currentPestMonitoring.filter(pest => 
                              pest.threat_type.toLowerCase().includes('hama')
                            ).length > 0 && (
                              <div>
                                {currentPestMonitoring
                                  .filter(pest => 
                                    pest.threat_type.toLowerCase().includes('hama')
                                  )
                                  .slice(0, 1) // Only show first item
                                  .map((pest) => (
                                    <div 
                                      key={pest.id} 
                                      className="flex items-start gap-3 p-3 border rounded-lg mb-2 cursor-pointer hover:bg-muted transition-colors"
                                      onClick={() => handlePestClick(pest)}>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <div className="bg-gray-200 border-2 border-dashed rounded-xl w-12 h-12 flex items-center justify-center">
                                            <Bug className="h-6 w-6 text-muted-foreground" />
                                          </div>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>Hama</p>
                                        </TooltipContent>
                                      </Tooltip>
                                      <div className="flex-1">
                                        <div className="flex justify-between items-center">
                                          <h4 className="font-medium">{pest.threat_name}</h4>
                                          <PestStatusIndicator status={pest.status} />
                                        </div>
                                        <p className="text-sm text-muted-foreground">{pest.scientific_name}</p>
                                      </div>
                                    </div>
                                  ))}
                              </div>
                            )}
                          </div>
                        ) : (
                          // Maximized view - show all items
                          <div className="space-y-4">
                            {/* Hama Section */}
                            {currentPestMonitoring.filter(pest => 
                              pest.threat_type.toLowerCase().includes('hama')
                            ).length > 0 && (
                              <div>
                                {currentPestMonitoring
                                  .filter(pest => 
                                    pest.threat_type.toLowerCase().includes('hama')
                                  )
                                  .map((pest) => (
                                    <div 
                                      key={pest.id} 
                                      className="flex items-start gap-3 p-3 border rounded-lg mb-2 cursor-pointer hover:bg-muted transition-colors"
                                      onClick={() => handlePestClick(pest)}>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <div className="bg-gray-200 border-2 border-dashed rounded-xl w-12 h-12 flex items-center justify-center">
                                            <Bug className="h-6 w-6 text-muted-foreground" />
                                          </div>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>Hama</p>
                                        </TooltipContent>
                                      </Tooltip>
                                      <div className="flex-1">
                                        <div className="flex justify-between items-center">
                                          <h4 className="font-medium">{pest.threat_name}</h4>
                                          <PestStatusIndicator status={pest.status} />
                                        </div>
                                        <p className="text-sm text-muted-foreground">{pest.scientific_name}</p>
                                      </div>
                                    </div>
                                  ))}
                              </div>
                            )}
                            
                            {/* Penyakit Section */}
                            {currentPestMonitoring.filter(pest => 
                              pest.threat_type.toLowerCase().includes('penyakit')
                            ).length > 0 && (
                              <div>
                                {currentPestMonitoring
                                  .filter(pest => 
                                    pest.threat_type.toLowerCase().includes('penyakit')
                                  )
                                  .map((pest) => (
                                    <div 
                                      key={pest.id} 
                                      className="flex items-start gap-3 p-3 border rounded-lg mb-2 cursor-pointer hover:bg-muted transition-colors"
                                      onClick={() => handlePestClick(pest)}>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <div className="bg-gray-200 border-2 border-dashed rounded-xl w-12 h-12 flex items-center justify-center">
                                            <AlertTriangle className="h-6 w-6 text-muted-foreground" />
                                          </div>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>Penyakit</p>
                                        </TooltipContent>
                                      </Tooltip>
                                      <div className="flex-1">
                                        <div className="flex justify-between items-center">
                                          <h4 className="font-medium">{pest.threat_name}</h4>
                                          <PestStatusIndicator status={pest.status} />
                                        </div>
                                        <p className="text-sm text-muted-foreground">{pest.scientific_name}</p>
                                      </div>
                                    </div>
                                  ))}
                              </div>
                            )}
                            
                            {/* Gulma Section */}
                            {currentPestMonitoring.filter(pest => 
                              pest.threat_type.toLowerCase().includes('gulma')
                            ).length > 0 && (
                              <div>
                                {currentPestMonitoring
                                  .filter(pest => 
                                    pest.threat_type.toLowerCase().includes('gulma')
                                  )
                                  .map((pest) => (
                                    <div 
                                      key={pest.id} 
                                      className="flex items-start gap-3 p-3 border rounded-lg mb-2 cursor-pointer hover:bg-muted transition-colors"
                                      onClick={() => handlePestClick(pest)}>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <div className="bg-gray-200 border-2 border-dashed rounded-xl w-12 h-12 flex items-center justify-center">
                                            <Sprout className="h-6 w-6 text-muted-foreground" />
                                          </div>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>Gulma</p>
                                        </TooltipContent>
                                      </Tooltip>
                                      <div className="flex-1">
                                        <div className="flex justify-between items-center">
                                          <h4 className="font-medium">{pest.threat_name}</h4>
                                          <PestStatusIndicator status={pest.status} />
                                        </div>
                                        <p className="text-sm text-muted-foreground">{pest.scientific_name}</p>
                                      </div>
                                    </div>
                                  ))}
                              </div>
                            )}
                          </div>
                        )
                      ) : (
                        <p>No pest monitoring data available</p>
                      )}
                    </CardContent>
                  </Card>

                  {/* AI Recommendation Card */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Brain className="h-5 w-5" />
                        Rekomendasi AI
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {currentRecommendations.length > 0 ? (
                        <div 
                          className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                          onClick={() => {
                            // Show popup with first recommendation
                            const firstRec = currentRecommendations[0];
                            setSelectedRecommendation(firstRec);
                            setShowRecommendationPopup(true);
                          }}
                        >
                          <div className="flex justify-between items-start">
                            <h4 className="font-medium">Rekomendasi Mingguan</h4>
                            <p className="text-xs text-muted-foreground">
                              {currentRecommendations[0] ? new Date(currentRecommendations[0].recommendation_date).toLocaleDateString() : ''}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <p>No AI recommendations available</p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Pest Detail Popup */}
            {showPestPopup && selectedPest && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000] p-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-bold">{selectedPest.threat_name}</h3>
                      <button 
                        onClick={closePestPopup}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Image Section */}
                      <div className="flex items-center justify-center">
                        {selectedPest.image_url ? (
                          <img 
                            src={selectedPest.image_url} 
                            alt={selectedPest.threat_name}
                            className="w-full h-auto max-h-80 object-contain rounded-lg"
                          />
                        ) : (
                          <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-64 flex items-center justify-center">
                            <ImageOff className="h-12 w-12 text-gray-400" />
                          </div>
                        )}
                      </div>
                      
                      {/* Text Section */}
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-muted-foreground">Nama Ilmiah</h4>
                          <p>{selectedPest.scientific_name}</p>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold text-muted-foreground">Deskripsi</h4>
                          <p className="text-justify">{selectedPest.description}</p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-semibold text-muted-foreground">Terdeteksi Pada</h4>
                            <p>{new Date(selectedPest.detected_at).toLocaleDateString('id-ID')}</p>
                          </div>
                          
                          <div>
                            <h4 className="font-semibold text-muted-foreground">Status</h4>
                            <div className="mt-1 flex items-center gap-2">
                              <PestStatusIndicator status={selectedPest.status} />
                              <p>{selectedPest.status}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Recommendation Detail Popup */}
            {showRecommendationPopup && selectedRecommendation && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000] p-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-bold">{selectedRecommendation.recommendation_title}</h3>
                      <button 
                        onClick={() => {
                          setShowRecommendationPopup(false);
                          setSelectedRecommendation(null);
                        }}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                        <div className="prose prose-sm max-w-none dark:prose-invert">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {selectedRecommendation.recommendation_text}
                          </ReactMarkdown>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-2">
                          <Brain className="h-5 w-5 text-blue-500" />
                          <span className="font-medium">Rekomendasi AI</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <span className="font-medium">Tanggal:</span> {new Date(selectedRecommendation.recommendation_date).toLocaleDateString('id-ID')}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
      </TooltipProvider>
    </DashboardWrapper>
  );
}