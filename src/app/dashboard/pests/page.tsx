"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Bug, 
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  AlertTriangle,
  Sprout
} from "lucide-react";

import type { PestMonitoring, Plot } from "@/types";

export default function PestsPage() {
  const [monitoringData, setMonitoringData] = useState<PestMonitoring[]>([]);
  const [plots, setPlots] = useState<Plot[]>([]);
  const [selectedPlot, setSelectedPlot] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedThreat, setSelectedThreat] = useState<PestMonitoring | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state for editing/adding threats
  const [formData, setFormData] = useState({
    threat_name: "",
    threat_type: "hama",
    status: "tidak parah",
    description: "",
    image_url: ""
  });

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch all data in parallel
        const [plotsRes, pestRes] = await Promise.all([
          fetch('/api/dashboard/plots'),
          fetch('/api/dashboard/pests')
        ]);
        
        // Check if all requests were successful
        if (!plotsRes.ok || !pestRes.ok) {
          throw new Error('Failed to fetch pest monitoring data');
        }
        
        // Parse JSON responses
        const [plotsData, pestData] = await Promise.all([
          plotsRes.json(),
          pestRes.json()
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
        setMonitoringData(pestData);
        
        // Set default selected plot
        if (sortedPlots.length > 0) {
          setSelectedPlot(sortedPlots[0].id);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Gagal memuat data monitoring. Silakan coba lagi.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Filter data based on selected plot and search term
  const filteredData = monitoringData
    .filter(data => data.plot_id === selectedPlot)
    .filter(data => 
      data.threat_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      data.threat_type.toLowerCase().includes(searchTerm.toLowerCase())
    );

  // Get current plot
  const currentPlot = plots.find(plot => plot.id === selectedPlot) || plots[0];

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "tidak parah": return "bg-green-100 text-green-800";
      case "sedang": return "bg-yellow-100 text-yellow-800";
      case "parah": return "bg-orange-100 text-orange-800";
      case "sangat parah": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  // Get threat type icon
  const getThreatIcon = (type: string) => {
    const normalizedType = type.toLowerCase().trim();
    console.log('Getting icon for threat type:', type, 'normalized:', normalizedType);
    switch (normalizedType) {
      case "hama": 
        console.log('Returning Bug icon');
        return <Bug className="h-4 w-4" />;
      case "penyakit": 
        console.log('Returning AlertTriangle icon');
        return <AlertTriangle className="h-4 w-4" />;
      case "gulma": 
        console.log('Returning Sprout icon');
        return <Sprout className="h-4 w-4" />;
      default: 
        console.log('Returning default Bug icon');
        return <Bug className="h-4 w-4" />;
    }
  };

  const handleAddThreat = () => {
    setIsAdding(true);
    setSelectedThreat(null);
    // Initialize form data for new threat
    setFormData({
      threat_name: "",
      threat_type: "hama",
      status: "tidak parah",
      description: "",
      image_url: ""
    });
  };

  const handleViewThreat = (threat: PestMonitoring) => {
    setSelectedThreat(threat);
    // Update form data with selected threat details
    setFormData({
      threat_name: threat.threat_name || "",
      threat_type: threat.threat_type || "hama",
      status: threat.status || "tidak parah",
      description: threat.description || "",
      image_url: threat.image_url || ""
    });
    setIsAdding(false);
  };

  const handleEditThreat = (threat: PestMonitoring) => {
    setSelectedThreat(threat);
    // Update form data with selected threat details
    setFormData({
      threat_name: threat.threat_name || "",
      threat_type: threat.threat_type || "hama",
      status: threat.status || "tidak parah",
      description: threat.description || "",
      image_url: threat.image_url || ""
    });
    setIsAdding(false);
  };

  const handleDeleteThreat = (id: number) => {
    setMonitoringData(monitoringData.filter(item => item.id !== id));
    if (selectedThreat && selectedThreat.id === id) {
      setSelectedThreat(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Memuat data monitoring...</p>
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold">Monitoring Hama, Penyakit & Gulma</h1>
        <Button onClick={handleAddThreat}>
          <Plus className="h-4 w-4 mr-2" />
          Tambah Monitoring
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row gap-4">
                <select 
                  value={selectedPlot}
                  onChange={(e) => setSelectedPlot(Number(e.target.value))}
                  className="border rounded-md px-3 py-2 text-sm max-w-[200px] bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                >
                  {plots.map(plot => (
                    <option key={plot.id} value={plot.id}>
                      {plot.plot_name}
                    </option>
                  ))}
                </select>
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Cari hama, penyakit, atau gulma..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {filteredData.length > 0 ? (
                  <>
                    {/* Hama Section */}
                    {filteredData.filter(threat => 
                      threat.threat_type.toLowerCase().includes('hama')
                    ).length > 0 && (
                      <div>
                        <h3 className="font-medium text-sm mb-3 text-muted-foreground border-b pb-1">Hama</h3>
                        {filteredData
                          .filter(threat => 
                            threat.threat_type.toLowerCase().includes('hama')
                          )
                          .map((threat) => (
                            <div 
                              key={threat.id}
                              className={`p-4 border rounded-lg transition-colors mb-3 relative ${
                                selectedThreat?.id === threat.id 
                                  ? "border-primary bg-primary/10" 
                                  : "hover:bg-muted"
                              }`}
                            >
                              {/* Action buttons - responsive positioning */}
                              <div className="flex gap-1 mb-3 sm:absolute sm:top-4 sm:right-4 sm:mb-0">
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  onClick={() => handleViewThreat(threat)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  onClick={() => handleEditThreat(threat)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  onClick={() => handleDeleteThreat(threat.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                              
                              {/* Main content */}
                              <div className="flex items-start gap-3">
                                <div>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h3 className="font-semibold">{threat.threat_name}</h3>
                                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(threat.status)}`}>
                                      {threat.status}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                                    <span className="text-sm text-muted-foreground capitalize flex items-center gap-1">
                                      {getThreatIcon(threat.threat_type)}
                                      {threat.threat_type}
                                    </span>
                                    <span className="text-sm text-muted-foreground">
                                      • {new Date(threat.detected_at).toLocaleDateString('id-ID')}
                                    </span>
                                  </div>
                                  <p className="text-sm mt-2 line-clamp-2">
                                    {threat.description}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                    
                    {/* Penyakit Section */}
                    {filteredData.filter(threat => 
                      threat.threat_type.toLowerCase().includes('penyakit')
                    ).length > 0 && (
                      <div>
                        <h3 className="font-medium text-sm mb-3 text-muted-foreground border-b pb-1">Penyakit</h3>
                        {filteredData
                          .filter(threat => 
                            threat.threat_type.toLowerCase().includes('penyakit')
                          )
                          .map((threat) => (
                            <div 
                              key={threat.id}
                              className={`p-4 border rounded-lg transition-colors mb-3 relative ${
                                selectedThreat?.id === threat.id 
                                  ? "border-primary bg-primary/10" 
                                  : "hover:bg-muted"
                              }`}
                            >
                              {/* Action buttons - responsive positioning */}
                              <div className="flex gap-1 mb-3 sm:absolute sm:top-4 sm:right-4 sm:mb-0">
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  onClick={() => handleViewThreat(threat)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  onClick={() => handleEditThreat(threat)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  onClick={() => handleDeleteThreat(threat.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                              
                              {/* Main content */}
                              <div className="flex items-start gap-3">
                                <div>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h3 className="font-semibold">{threat.threat_name}</h3>
                                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(threat.status)}`}>
                                      {threat.status}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                                    <span className="text-sm text-muted-foreground capitalize flex items-center gap-1">
                                      {getThreatIcon(threat.threat_type)}
                                      {threat.threat_type}
                                    </span>
                                    <span className="text-sm text-muted-foreground">
                                      • {new Date(threat.detected_at).toLocaleDateString('id-ID')}
                                    </span>
                                  </div>
                                  <p className="text-sm mt-2 line-clamp-2">
                                    {threat.description}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                    
                    {/* Gulma Section */}
                    {filteredData.filter(threat => 
                      threat.threat_type.toLowerCase().includes('gulma')
                    ).length > 0 && (
                      <div>
                        <h3 className="font-medium text-sm mb-3 text-muted-foreground border-b pb-1">Gulma</h3>
                        {filteredData
                          .filter(threat => 
                            threat.threat_type.toLowerCase().includes('gulma')
                          )
                          .map((threat) => (
                            <div 
                              key={threat.id}
                              className={`p-4 border rounded-lg transition-colors mb-3 relative ${
                                selectedThreat?.id === threat.id 
                                  ? "border-primary bg-primary/10" 
                                  : "hover:bg-muted"
                              }`}
                            >
                              {/* Action buttons - responsive positioning */}
                              <div className="flex gap-1 mb-3 sm:absolute sm:top-4 sm:right-4 sm:mb-0">
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  onClick={() => handleViewThreat(threat)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  onClick={() => handleEditThreat(threat)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  onClick={() => handleDeleteThreat(threat.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                              
                              {/* Main content */}
                              <div className="flex items-start gap-3">
                                <div>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h3 className="font-semibold">{threat.threat_name}</h3>
                                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(threat.status)}`}>
                                      {threat.status}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                                    <span className="text-sm text-muted-foreground capitalize flex items-center gap-1">
                                      {getThreatIcon(threat.threat_type)}
                                      {threat.threat_type}
                                    </span>
                                    <span className="text-sm text-muted-foreground">
                                      • {new Date(threat.detected_at).toLocaleDateString('id-ID')}
                                    </span>
                                  </div>
                                  <p className="text-sm mt-2 line-clamp-2">
                                    {threat.description}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-center py-8 text-muted-foreground">
                    Tidak ada data monitoring yang ditemukan
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>
                {isAdding ? "Tambah Monitoring Baru" : 
                 selectedThreat ? `Detail Monitoring: ${formData.threat_name}` : "Detail Monitoring"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isAdding || selectedThreat ? (
                <div className="space-y-4">
                  <div className="flex flex-col items-center gap-4">
                    {formData.image_url ? (
                      <img 
                        src={formData.image_url} 
                        alt={formData.threat_name}
                        className="rounded-xl w-64 h-64 object-cover border-2 border-gray-200"
                      />
                    ) : (
                      <div className="bg-gray-200 border-2 border-dashed rounded-xl w-64 h-64 flex items-center justify-center" />
                    )}
                    <Button variant="outline" size="sm">
                      {isAdding ? "Upload Foto" : "Ganti Foto"}
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Jenis Ancaman</label>
                    <div className="grid grid-cols-3 gap-2">
                      <Button 
                        variant="outline" 
                        className={formData.threat_type === "hama" ? "border-primary" : ""}
                        onClick={() => setFormData({...formData, threat_type: "hama"})}
                      >
                        <Bug className="h-4 w-4 mr-2" />
                        Hama
                      </Button>
                      <Button 
                        variant="outline" 
                        className={formData.threat_type === "penyakit" ? "border-primary" : ""}
                        onClick={() => setFormData({...formData, threat_type: "penyakit"})}
                      >
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Penyakit
                      </Button>
                      <Button 
                        variant="outline" 
                        className={formData.threat_type === "gulma" ? "border-primary" : ""}
                        onClick={() => setFormData({...formData, threat_type: "gulma"})}
                      >
                        <Sprout className="h-4 w-4 mr-2" />
                        Gulma
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="threat_name" className="text-sm font-medium">
                      Nama Hama/Penyakit/Gulma
                    </label>
                    <Input 
                      id="threat_name" 
                      value={formData.threat_name} 
                      onChange={(e) => setFormData({...formData, threat_name: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="status" className="text-sm font-medium">
                      Status
                    </label>
                    <select 
                      id="status"
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                      className="border rounded-md px-3 py-2 text-sm w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                    >
                      <option value="tidak parah">Tidak Parah</option>
                      <option value="sedang">Sedang</option>
                      <option value="parah">Parah</option>
                      <option value="sangat parah">Sangat Parah</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="description" className="text-sm font-medium">
                      Deskripsi
                    </label>
                    <textarea 
                      id="description"
                      value={formData.description} 
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="border rounded-md px-3 py-2 text-sm w-full min-h-[100px]"
                    />
                  </div>
                  
                  <div className="flex gap-2 pt-4">
                    <Button className="flex-1">
                      {isAdding ? "Simpan" : "Update"}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setIsAdding(false);
                        setSelectedThreat(null);
                        // Reset form data to match selected threat
                        if (selectedThreat) {
                          setFormData({
                            threat_name: selectedThreat.threat_name || "",
                            threat_type: selectedThreat.threat_type || "hama",
                            status: selectedThreat.status || "tidak parah",
                            description: selectedThreat.description || "",
                            image_url: selectedThreat.image_url || ""
                          });
                        }
                      }}
                    >
                      Batal
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Bug className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="font-medium mb-1">Tidak ada data dipilih</h3>
                  <p className="text-sm text-muted-foreground">
                    Pilih data monitoring untuk melihat detailnya
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}