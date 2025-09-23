"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Brain, 
  RefreshCw,
  Calendar,
  Sprout,
  Thermometer,
  Bug
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { DashboardWrapper } from "@/components/dashboard-wrapper";
import type { Plot } from "@/types";

// Mock data types
type Recommendation = {
  id: number;
  plot_id: number;
  recommendation_title: string;
  recommendation_text: string;
  recommendation_date: string;
  based_on?: string[]; // What data the recommendation is based on
};

export default function AIRecommendationsPage() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [plots, setPlots] = useState<Plot[]>([]);
  const [selectedPlot, setSelectedPlot] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  // const [error, setError] = useState<string | null>(null);

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // setError(null);
        
        // Fetch all data in parallel
        const [plotsRes, recommendationsRes] = await Promise.all([
          fetch('/api/dashboard/plots'),
          fetch('/api/dashboard/recommendations')
        ]);
        
        // Check if all requests were successful
        if (!plotsRes.ok || !recommendationsRes.ok) {
          throw new Error('Failed to fetch recommendations data');
        }
        
        // Parse JSON responses
        const [plotsData, recommendationsData] = await Promise.all([
          plotsRes.json(),
          recommendationsRes.json()
        ]);
        
        // Sort plots to ensure Demoplot 1, Demoplot 2, ..., Demoplot 10 order
        const sortedPlots = [...plotsData].sort((a, b) => {
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
        setRecommendations(recommendationsData);
        
        // Set default selected plot
        if (sortedPlots.length > 0) {
          setSelectedPlot(sortedPlots[0].id);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        // setError("Gagal memuat rekomendasi. Silakan coba lagi.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Filter recommendations based on selected plot
  const filteredRecommendations = recommendations.filter(rec => rec.plot_id === selectedPlot);
  
  // Get current plot
  const currentPlot = plots.find(plot => plot.id === selectedPlot) || plots[0];

  // Generate new recommendation
  const generateRecommendation = () => {
    setLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      const newRecommendation: Recommendation = {
        id: recommendations.length + 1,
        plot_id: selectedPlot,
        recommendation_title: "Rekomendasi Baru",
        recommendation_text: "Ini adalah rekomendasi baru berdasarkan data terkini dari kondisi plot Anda. Lakukan pengecekan rutin untuk memastikan tanaman tumbuh dengan baik.",
        recommendation_date: new Date().toISOString().split('T')[0],
        based_on: ["data_terkini"]
      };
      
      setRecommendations([newRecommendation, ...recommendations]);
      setLoading(false);
    }, 1500);
  };

  // Get icon based on recommendation content
  const getRecommendationIcon = (title: string) => {
    if (title.toLowerCase().includes("hama") || title.toLowerCase().includes("penyakit")) {
      return <Bug className="h-5 w-5" />;
    }
    if (title.toLowerCase().includes("siram") || title.toLowerCase().includes("air")) {
      return <Thermometer className="h-5 w-5" />;
    }
    // Use Brain as default icon instead of Sprout
    return <Brain className="h-5 w-5" />;
  };

  return (
    <DashboardWrapper 
      plots={plots} 
      selectedPlot={selectedPlot} 
      onPlotSelect={setSelectedPlot}
    >
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl font-bold">Rekomendasi AI</h1>
          <Button onClick={generateRecommendation} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Menghasilkan..." : "Hasilkan Rekomendasi"}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">
                      Berdasarkan data iklim dan monitoring terkini
                    </h3>
                  </div>
                </div>
              </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredRecommendations.length > 0 ? (
                  filteredRecommendations.map((rec) => (
                    <div 
                      key={rec.id}
                      className="p-5 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                      
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <h3 className="font-semibold text-lg">{rec.recommendation_title}</h3>
                            <span className="text-sm text-muted-foreground flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {new Date(rec.recommendation_date).toLocaleDateString('id-ID')}
                            </span>
                          </div>
                          <div className="mt-2 text-muted-foreground prose prose-sm max-w-none">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {rec.recommendation_text}
                            </ReactMarkdown>
                          </div>
                          {rec.based_on && rec.based_on.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {rec.based_on.map((basis, index) => (
                                <span 
                                  key={index} 
                                  className="text-xs bg-secondary px-2 py-1 rounded-full"
                                >
                                  {basis.replace(/_/g, ' ')}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center py-8 text-muted-foreground">
                    Tidak ada rekomendasi yang tersedia
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Tentang Rekomendasi AI
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Rekomendasi AI kami dibuat berdasarkan analisis data iklim, kondisi tanah, 
                  dan hasil monitoring hama serta penyakit secara real-time.
                </p>
                
                <div className="space-y-3">
                  <h4 className="font-medium">Faktor yang dianalisis:</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <Thermometer className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <span>Data suhu dan kelembapan</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Bug className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <span>Hasil monitoring hama & penyakit</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Sprout className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <span>Kondisi tanaman & fase pertumbuhan</span>
                    </li>
                  </ul>
                </div>
                
                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-2">Tips:</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Perbarui data secara rutin untuk rekomendasi terbaik</li>
                    <li>• Tinjau rekomendasi sebelum mengimplementasikannya</li>
                    <li>• Hubungi ahli jika diperlukan penjelasan lebih lanjut</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  </DashboardWrapper>
  );
}