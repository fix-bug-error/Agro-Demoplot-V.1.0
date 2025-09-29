"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { 
  Bug, 
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  AlertTriangle,
  Sprout,
  BookMarked,
  X,
  ChevronUp,
  ChevronDown,
  Zap
} from "lucide-react";

import type { PestMonitoring, Plot } from "@/types";
import { DashboardWrapper } from "@/components/dashboard-wrapper";

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
          <div className={`${statusInfo.bgColor} p-1 rounded-full`}>
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
      <div className={`${statusInfo.bgColor} p-1 rounded-full`}>
        <Zap className={`h-4 w-4 ${statusInfo.textColor}`} />
      </div>
    );
  }
};

// Utility function to compress and resize image
const compressImage = (file: File, maxSizeKB: number = 500): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Calculate new dimensions maintaining 1:1 aspect ratio
      const maxSize = Math.max(img.width, img.height);
      const scale = Math.min(1, Math.sqrt((maxSizeKB * 1024) / (file.size * 0.8)) || 0.8);
      const newWidth = Math.min(maxSize, 1000); // Limit max dimension to 1000px
      const newHeight = newWidth;
      
      canvas.width = newWidth;
      canvas.height = newHeight;
      
      // Draw image on canvas with 1:1 aspect ratio (center crop)
      const aspectRatio = img.width / img.height;
      let sourceX = 0;
      let sourceY = 0;
      let sourceWidth = img.width;
      let sourceHeight = img.height;
      
      if (aspectRatio > 1) {
        // Landscape image - crop width
        sourceWidth = img.height;
        sourceX = (img.width - sourceWidth) / 2;
      } else {
        // Portrait image - crop height
        sourceHeight = img.width;
        sourceY = (img.height - sourceHeight) / 2;
      }
      
      ctx?.drawImage(img, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, newWidth, newHeight);
      
      // Try different quality settings until image is under maxSizeKB
      let quality = 0.9;
      let dataUrl;
      
      do {
        dataUrl = canvas.toDataURL('image/jpeg', quality);
        const byteString = atob(dataUrl.split(',')[1]);
        const byteLength = byteString.length;
        const sizeKB = byteLength / 1024;
        
        if (sizeKB <= maxSizeKB) {
          resolve(dataURLToBlob(dataUrl));
          return;
        }
        
        quality -= 0.1;
        if (quality < 0.1) break; // Minimum quality
      } while (true);
      
      // If quality reduction wasn't enough, resort to smaller dimensions
      canvas.width = newWidth * 0.8;
      canvas.height = newHeight * 0.8;
      ctx?.drawImage(img, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, canvas.width, canvas.height);
      dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      resolve(dataURLToBlob(dataUrl));
    };
    
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};

// Helper to convert data URL to Blob
const dataURLToBlob = (dataURL: string): Blob => {
  const byteString = atob(dataURL.split(',')[1]);
  const mimeString = dataURL.split(',')[0].split(':')[1].split(';')[0];
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], { type: mimeString });
};

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
    image_url: "",
    scientific_name: "",
    detected_at: "",
    plot_id: selectedPlot
  });

  // Memoized filtered data to avoid recomputation
  const filteredData = useMemo(() => 
    monitoringData.filter(data => data.plot_id === selectedPlot),
    [monitoringData, selectedPlot]
  );
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

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
        // Interface for API response (before normalization)
        interface APIPestResponse {
          id: number;
          threat_name: string;
          threat_type: string;
          status: string;
          description: string;
          photo_url?: string | null;
          image_url?: string | null;  // In case API returns this field
          scientific_name?: string | null;
          plot_id: number;
          detected_at: string;
        }
        
        // Normalize the pest data to ensure consistent field names (photo_url -> image_url)
        const normalizedPestData = pestData.map((item: APIPestResponse) => ({
          id: item.id,
          threat_name: item.threat_name || "",
          threat_type: item.threat_type || "",
          status: item.status || "",
          description: item.description || "",
          image_url: item.photo_url || item.image_url || null, // Handle both field names
          scientific_name: item.scientific_name || "",
          plot_id: item.plot_id || selectedPlot,
          detected_at: item.detected_at || ""
        }));
        setMonitoringData(normalizedPestData);
        
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

  // Filter data based on selected plot only (search functionality removed)
  

  // Auto-select first threat from the selected plot when plot changes or filteredData updates
  useEffect(() => {
    if (filteredData.length > 0) {
      const firstThreat = filteredData[0];
      setSelectedThreat(firstThreat);
      setSelectedThreatForMinimizedView(firstThreat);
      setFormData({
        threat_name: firstThreat.threat_name || "",
        threat_type: firstThreat.threat_type || "hama",
        status: firstThreat.status || "tidak parah",
        description: firstThreat.description || "",
        image_url: firstThreat.image_url || "",
        scientific_name: firstThreat.scientific_name || "",
        detected_at: firstThreat.detected_at ? new Date(firstThreat.detected_at).toISOString().split('T')[0] : "",
        plot_id: firstThreat.plot_id
      });
    } else {
      // No threats available for this plot
      setSelectedThreat(null);
      setSelectedThreatForMinimizedView(null);
      setFormData({
        threat_name: "",
        threat_type: "hama",
        status: "tidak parah",
        description: "",
        image_url: "",
        scientific_name: "",
        detected_at: "",
        plot_id: selectedPlot
      });
    }
    setIsAdding(false); // Exit edit mode if in edit mode
  }, [selectedPlot, filteredData]);

  // Get current plot
  const currentPlot = plots.find(plot => plot.id === selectedPlot) || plots[0];

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "tidak parah": return "bg-yellow-100 text-yellow-800";
      case "sedang": return "bg-green-100 text-green-800";
      case "parah": return "bg-orange-100 text-orange-800";
      case "sangat parah": return "bg-red-100 text-red-800";
      default: return "bg-white text-gray-800 border border-gray-200";
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
    // Initialize form data for new threat with today's date
    const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
    setFormData({
      threat_name: "",
      threat_type: "hama",
      status: "tidak parah",
      description: "",
      image_url: "",
      scientific_name: "",
      detected_at: today,
      plot_id: selectedPlot
    });
  };

  const handleViewThreat = (threat: PestMonitoring) => {
    setSelectedThreat(threat);
    setSelectedThreatForMinimizedView(threat); // Set this as the selected threat to display in minimized view
    // Update form data with selected threat details
    setFormData({
      threat_name: threat.threat_name || "",
      threat_type: threat.threat_type || "hama",
      status: threat.status || "tidak parah",
      description: threat.description || "",
      image_url: threat.image_url || "",
      scientific_name: threat.scientific_name || "",
      detected_at: threat.detected_at ? new Date(threat.detected_at).toISOString().split('T')[0] : "",
      plot_id: threat.plot_id
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
      image_url: threat.image_url || "",
      scientific_name: threat.scientific_name || "",
      detected_at: threat.detected_at ? new Date(threat.detected_at).toISOString().split('T')[0] : "",
      plot_id: threat.plot_id
    });
    setIsAdding(true); // Switch to edit mode
  };

  const handleDeleteThreat = (id: number) => {
    setMonitoringData(monitoringData.filter(item => item.id !== id));
    if (selectedThreat && selectedThreat.id === id) {
      setSelectedThreat(null);
    }
    
    // Show success alert
    setAlertMessage({type: 'success', message: 'Data monitoring berhasil dihapus'});
    
    // Hide alert after 3 seconds
    setTimeout(() => {
      setAlertMessage(null);
    }, 3000);
  };

  const handleSaveThreat = async () => {
    if (!formData.threat_name.trim()) {
      alert("Nama Hama/Penyakit/Gulma harus diisi!");
      return;
    }

    try {
      let imageUrl: string | null = formData.image_url;
      
      // Upload image if there's a new file and it's a client-side URL (data:image or blob)
      if (imageFile && (formData.image_url?.startsWith('data:image') || formData.image_url?.startsWith('blob:'))) {
        try {
          setIsUploading(true);
          imageUrl = await uploadImageToStorage(imageFile, formData.threat_name);
          if (!imageUrl) {
            alert("Gagal mengunggah gambar. Data akan disimpan tanpa gambar.");
          }
        } catch (error) {
          console.error("Upload error:", error);
          alert("Gagal mengunggah gambar. Data akan disimpan tanpa gambar.");
          // Continue saving without image
        } finally {
          setIsUploading(false);
        }
      }

      if (isAdding) {
        // Creating new threat
        const newThreat = {
          threat_name: formData.threat_name,
          threat_type: formData.threat_type,
          status: formData.status,
          description: formData.description,
          photo_url: imageUrl || null, // Explicitly handle null case
          scientific_name: formData.scientific_name || "", // Include scientific name if available, default to empty string
          detected_at: formData.detected_at || new Date().toISOString(), // Use provided date or current date
          plot_id: selectedPlot // Associate with currently selected plot
        };

        console.log("Attempting to save new threat:", newThreat); // Debug log

        // Save to database via API
        const response = await fetch('/api/dashboard/pests', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newThreat),
        });

        console.log("Response status:", response.status); // Debug log

        if (response.ok) {
          const savedThreat = await response.json();
          console.log("Saved threat:", savedThreat); // Debug log
          
          // Normalize the saved threat to match PestMonitoring type (photo_url -> image_url)
          const normalizedThreat: PestMonitoring = {
            id: savedThreat.id || Date.now(),
            threat_name: savedThreat.threat_name || "",
            threat_type: savedThreat.threat_type || "hama",
            status: savedThreat.status || "tidak parah",
            description: savedThreat.description || "",
            image_url: savedThreat.photo_url || savedThreat.image_url || null, // Handle both field names
            scientific_name: savedThreat.scientific_name || "",
            plot_id: savedThreat.plot_id || selectedPlot,
            detected_at: savedThreat.detected_at || new Date().toISOString()
          };
          
          // Add to local state
          setMonitoringData([...monitoringData, normalizedThreat]);
          // Reset form and exit adding mode
          setIsAdding(false);
          setSelectedThreat(null);
          setFormData({
            threat_name: "",
            threat_type: "hama",
            status: "tidak parah",
            description: "",
            image_url: "",
            scientific_name: "",
            detected_at: "",
            plot_id: selectedPlot
          });
          setImageFile(null);
          
          // Show success alert
          setAlertMessage({type: 'success', message: 'Data monitoring berhasil ditambahkan'});
          
          // Hide alert after 3 seconds
          setTimeout(() => {
            setAlertMessage(null);
          }, 3000);
        } else {
          const errorData = await response.json();
          console.error("API error response:", errorData);
          setAlertMessage({type: 'error', message: `Gagal menyimpan data monitoring: ${errorData.error || response.statusText}`});
          // Hide alert after 3 seconds
          setTimeout(() => {
            setAlertMessage(null);
          }, 3000);
        }
      } else if (selectedThreat) {
        // Updating existing threat - create a properly typed object for API
        const updatedThreatForAPI = {
          id: selectedThreat.id,
          threat_name: formData.threat_name || "",
          threat_type: formData.threat_type || "hama",
          status: formData.status || "tidak parah",
          description: formData.description || "",
          photo_url: imageUrl ?? null, // Use the uploaded image URL or explicitly set to null
          scientific_name: formData.scientific_name || "", // Ensure it's a string, not null
          plot_id: selectedThreat.plot_id,
          detected_at: formData.detected_at || selectedThreat.detected_at || new Date().toISOString()
        };
        
        // But keep the normalized version for local state updates
        const updatedThreat: PestMonitoring = {
          id: selectedThreat.id,
          threat_name: formData.threat_name || "",
          threat_type: formData.threat_type || "hama",
          status: formData.status || "tidak parah",
          description: formData.description || "",
          image_url: imageUrl ?? null, // This follows the frontend type definition (can be null)
          scientific_name: formData.scientific_name || "", // This follows the frontend type definition
          plot_id: selectedThreat.plot_id,
          detected_at: formData.detected_at || selectedThreat.detected_at || new Date().toISOString()
        };

        console.log("Attempting to update threat:", updatedThreat); // Debug log

        // Update database via API
        const response = await fetch(`/api/dashboard/pests/${selectedThreat.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedThreatForAPI),
        });

        console.log("Update response status:", response.status); // Debug log

        if (response.ok) {
          const updatedResponse = await response.json();
          
          // Normalize the updated threat to match PestMonitoring type (photo_url -> image_url)
          const normalizedUpdatedThreat: PestMonitoring = {
            id: updatedResponse.id || selectedThreat.id,
            threat_name: updatedResponse.threat_name || "",
            threat_type: updatedResponse.threat_type || "hama",
            status: updatedResponse.status || "tidak parah",
            description: updatedResponse.description || "",
            image_url: updatedResponse.image_url || updatedResponse.photo_url || null, // Handle both field names
            scientific_name: updatedResponse.scientific_name || "",
            plot_id: updatedResponse.plot_id || selectedThreat.plot_id,
            detected_at: updatedResponse.detected_at || selectedThreat.detected_at || new Date().toISOString()
          };
          
          // Update local state
          setMonitoringData(monitoringData.map(item => 
            item.id === selectedThreat.id ? normalizedUpdatedThreat : item
          ));
          
          // Show success alert
          setAlertMessage({type: 'success', message: 'Data monitoring berhasil diperbarui'});
          
          // Hide alert after 3 seconds
          setTimeout(() => {
            setAlertMessage(null);
          }, 3000);
        } else {
          const errorData = await response.json();
          console.error("Update API error response:", errorData);
          setAlertMessage({type: 'error', message: `Gagal memperbarui data monitoring: ${errorData.error || response.statusText}`});
          // Hide alert after 3 seconds
          setTimeout(() => {
            setAlertMessage(null);
          }, 3000);
        }
      }
    } catch (error) {
        console.error('Error saving threat:', error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        setAlertMessage({type: 'error', message: "Terjadi kesalahan saat menyimpan data monitoring: " + errorMessage});
        // Hide alert after 3 seconds
        setTimeout(() => {
          setAlertMessage(null);
        }, 3000);
      } finally {
        setIsUploading(false);
      }
  };

  // Define the type for encyclopedia entries
  interface EncyclopediaEntry {
    id: number;
    threat_name: string;
    threat_type: string;
    description: string;
    image_url: string;
    scientific_name: string;
    control?: string;
  }

  const [encyclopediaData, setEncyclopediaData] = useState<EncyclopediaEntry[]>([]);
  const [isEncyclopediaOpen, setIsEncyclopediaOpen] = useState(false);
  const [encyclopediaFromDialog, setEncyclopediaFromDialog] = useState(false);
  const [alertMessage, setAlertMessage] = useState<{type: 'success' | 'error', message: string} | null>(null);
  const [encyclopediaLoading, setEncyclopediaLoading] = useState(false);
  const [encyclopediaFilter, setEncyclopediaFilter] = useState<string>('hama'); // 'hama', 'penyakit', 'gulma'
  
  // State for minimizing the main pest list
  const [isPestListMinimized, setIsPestListMinimized] = useState(true); // Default to minimized
  const [selectedThreatForMinimizedView, setSelectedThreatForMinimizedView] = useState<PestMonitoring | null>(null);
  
  // State for tracking expanded/collapsed state of encyclopedia items
  const [expandedEncyclopediaItems, setExpandedEncyclopediaItems] = useState<Record<number, boolean>>({});
  
  // Initialize expanded state for encyclopedia items when data changes
  useEffect(() => {
    const initialExpandedState: Record<number, boolean> = {};
    encyclopediaData.forEach(item => {
      // Default to minimized (false) for all entries
      initialExpandedState[item.id] = false;
    });
    setExpandedEncyclopediaItems(initialExpandedState);
  }, [encyclopediaData]);
  
  // Filter encyclopedia data based on selected filter
  const filteredEncyclopediaData = encyclopediaData.filter((item: EncyclopediaEntry) => {
    return item.threat_type?.toLowerCase() === encyclopediaFilter;
  });
  
  const [selectedEncyclopediaEntry, setSelectedEncyclopediaEntry] = useState<EncyclopediaEntry | null>(null);
  
  const handleEncyclopediaClick = async (event?: React.MouseEvent<HTMLButtonElement>) => {
    // This is for when called from outside dialog (like header)
    setEncyclopediaLoading(true);
    try {
      // Fetch data from the ensiklo_hpg table
      const response = await fetch('/api/dashboard/encyclopedia');
      if (response.ok) {
        const data = await response.json();
        setEncyclopediaData(data);
        setIsEncyclopediaOpen(true);
        setEncyclopediaFromDialog(false);
      } else {
        console.error('Failed to fetch encyclopedia data');
        // For now, we'll show an empty state or mock data if the API isn't available
        setEncyclopediaData([]);
        setIsEncyclopediaOpen(true);
        setEncyclopediaFromDialog(false);
      }
    } catch (error) {
      console.error('Error fetching encyclopedia data:', error);
      // Show empty state in case of error
      setEncyclopediaData([]);
      setIsEncyclopediaOpen(true);
      setEncyclopediaFromDialog(false);
    } finally {
      setEncyclopediaLoading(false);
    }
  };
  
  const handleEncyclopediaFromDialog = async () => {
    // This is specifically for when called from dialog (tambah/edit)
    setEncyclopediaLoading(true);
    try {
      // Fetch data from the ensiklo_hpg table
      const response = await fetch('/api/dashboard/encyclopedia');
      if (response.ok) {
        const data = await response.json();
        setEncyclopediaData(data);
        setIsEncyclopediaOpen(true);
        setEncyclopediaFromDialog(true);
      } else {
        console.error('Failed to fetch encyclopedia data');
        // For now, we'll show an empty state or mock data if the API isn't available
        setEncyclopediaData([]);
        setIsEncyclopediaOpen(true);
        setEncyclopediaFromDialog(true);
      }
    } catch (error) {
      console.error('Error fetching encyclopedia data:', error);
      // Show empty state in case of error
      setEncyclopediaData([]);
      setIsEncyclopediaOpen(true);
      setEncyclopediaFromDialog(true);
    } finally {
      setEncyclopediaLoading(false);
    }
  };
  
  const handleSelectEncyclopediaEntry = (entry: EncyclopediaEntry) => {
    // Update the form data with the selected encyclopedia entry
    setFormData({
      threat_name: entry.threat_name || "",
      threat_type: entry.threat_type || "hama",
      status: "tidak parah", // Default status for new entries
      description: entry.description || "",
      image_url: entry.image_url || "",
      scientific_name: entry.scientific_name || "",
      detected_at: formData.detected_at || "", // Preserve the existing date
      plot_id: selectedPlot
    });
    
    // Close the encyclopedia modal using setTimeout to avoid conflicts with parent dialog
    setTimeout(() => {
      setIsEncyclopediaOpen(false);
      setEncyclopediaFromDialog(false); // Reset this state as well
    }, 0);
    
    setSelectedEncyclopediaEntry(entry);
  };
  
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement> | Event) => {
    // Type guard to handle cases where e is React.ChangeEvent or Event
    const target = e.target as HTMLInputElement;
    const file = target?.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    
    try {
      // Check if file is an image
      if (!file.type.startsWith('image/')) {
        alert('Silakan pilih file gambar yang valid');
        return;
      }
      
      // Compress the image
      const compressedImage = await compressImage(file, 500); // Max 500KB
      
      // Convert to base64 to preview immediately
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setFormData({
            ...formData,
            image_url: event.target.result as string
          });
          setImageFile(file); // Keep the original file for upload
        }
      };
      reader.readAsDataURL(compressedImage);
    } catch (error) {
        console.error('Error compressing image:', error);
        setAlertMessage({type: 'error', message: 'Terjadi kesalahan saat mengompres gambar. Silakan coba lagi.'});
        // Hide alert after 3 seconds
        setTimeout(() => {
          setAlertMessage(null);
        }, 3000);
      } finally {
        setIsUploading(false);
      }
  };
  
  const triggerFileSelect = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.onchange = handleImageUpload;
    fileInput.click();
  };
  
  // Function to upload image to Supabase storage
  const uploadImageToStorage = async (file: File, threatName: string): Promise<string | null> => {
    try {
      // Import Supabase client for storage operations
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      
      // Try to upload directly to the known bucket name without listing buckets
      // (since the user has already confirmed the bucket exists)
      const targetBucket = 'upload_images'; // your specific bucket name
      const fileName = `${threatName.replace(/\s+/g, '_')}_${Date.now()}`;
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const filePath = `hpg/${fileName}.${fileExt}`;  // Using hpg folder based on your URL structure
      
      console.log(`Uploading to bucket: ${targetBucket}, path: ${filePath}`);
      
      // Upload to Supabase storage
      const { data, error } = await supabase
        .storage
        .from(targetBucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (error) {
        console.error('Error uploading image:', error);
        throw error;
      }
      
      // Get public URL for the uploaded image from the correct bucket
      const { data: urlData } = supabase
        .storage
        .from(targetBucket)
        .getPublicUrl(filePath);
        
      return urlData?.publicUrl || null;
    } catch (error: unknown) {
          console.error('Error in uploadImageToStorage:', error);
          // Return error message for debugging
          const errorMessage = error instanceof Error ? error.message : String(error);
          setAlertMessage({type: 'error', message: `Upload error: ${errorMessage}`});
          // Hide alert after 3 seconds
          setTimeout(() => {
            setAlertMessage(null);
          }, 3000);
          return null;
        }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-1/4" />
          <Skeleton className="h-10 w-32" />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Threat list card skeleton */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <Skeleton className="h-10 w-full" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Skeleton className="h-24 w-full rounded-lg" />
                  <Skeleton className="h-24 w-full rounded-lg" />
                  <Skeleton className="h-24 w-full rounded-lg" />
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-6">
            {/* Threat detail card skeleton */}
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Skeleton className="h-48 w-full rounded-xl" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <div className="grid grid-cols-2 gap-4">
                    <Skeleton className="h-10" />
                    <Skeleton className="h-10" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Skeleton className="h-10" />
                    <Skeleton className="h-10" />
                  </div>
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <div className="flex gap-2 pt-4">
                    <Skeleton className="h-10 flex-1" />
                    <Skeleton className="h-10 w-20" />
                    <Skeleton className="h-10 w-20" />
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
    <DashboardWrapper 
      plots={plots} 
      selectedPlot={selectedPlot} 
      onPlotSelect={setSelectedPlot}
    >
      {alertMessage && (
        <div className="fixed top-4 right-4 z-[100]">
          <Alert className={`${alertMessage.type === 'success' ? 'bg-green-100 border-green-200 text-green-800' : 'bg-red-100 border-red-200 text-red-800'}`}>
            <AlertDescription>
              {alertMessage.message}
            </AlertDescription>
          </Alert>
        </div>
      )}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl font-bold">Monitoring Hama, Penyakit & Gulma</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleEncyclopediaClick}>
              <BookMarked className="h-4 w-4 mr-2" />
              Ensiklo HPG
            </Button>
            <Dialog open={isAdding && !selectedThreat} onOpenChange={(open) => {
              if (!open) {
                setIsAdding(false);
                setSelectedThreat(null);
                // Reset form when dialog is closed
                const today = new Date().toISOString().split('T')[0];
                setFormData({
                  threat_name: "",
                  threat_type: "hama",
                  status: "tidak parah",
                  description: "",
                  image_url: "",
                  scientific_name: "",
                  detected_at: today,
                  plot_id: selectedPlot
                });
                setImageFile(null);
              } else {
                handleAddThreat(); // Initialize form for adding
              }
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Monitoring
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Tambah Monitoring Baru</DialogTitle>
                  <DialogDescription>
                    Tambahkan data monitoring hama, penyakit, atau gulma baru
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6">
                  {/* Image Section */}
                  <div className="flex flex-col items-center gap-4">
                    {formData.image_url ? (
                      <img 
                        src={formData.image_url} 
                        alt={formData.threat_name}
                        className="rounded-xl w-full max-w-[320px] max-h-[320px] object-contain border-2 border-gray-200"
                      />
                    ) : (
                      <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full max-w-[320px] max-h-[320px] flex items-center justify-center aspect-square" />
                    )}
                    
                    {/* Upload/Ganti Foto button */}
                    <Button 
                      variant="outline" 
                      size="sm"
                      type="button"
                      onClick={triggerFileSelect}
                      disabled={isUploading}
                    >
                      {isUploading ? "Mengunggah..." : "Upload Foto"}
                    </Button>
                  </div>
                  
                  {/* Form fields */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Jenis Ancaman</label>
                      <div className="grid grid-cols-3 gap-2">
                        <Button 
                          variant={formData.threat_type === "hama" ? "default" : "outline"} 
                          className={formData.threat_type === "hama" ? "border-primary" : ""}
                          onClick={() => setFormData({...formData, threat_type: "hama"})}
                        >
                          <Bug className="h-4 w-4 mr-2" />
                          Hama
                        </Button>
                        <Button 
                          variant={formData.threat_type === "penyakit" ? "default" : "outline"} 
                          className={formData.threat_type === "penyakit" ? "border-primary" : ""}
                          onClick={() => setFormData({...formData, threat_type: "penyakit"})}
                        >
                          <AlertTriangle className="h-4 w-4 mr-2" />
                          Penyakit
                        </Button>
                        <Button 
                          variant={formData.threat_type === "gulma" ? "default" : "outline"} 
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
                      <label htmlFor="scientific_name" className="text-sm font-medium">
                        Nama Ilmiah
                      </label>
                      <Input 
                        id="scientific_name" 
                        value={formData.scientific_name} 
                        onChange={(e) => setFormData({...formData, scientific_name: e.target.value})}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
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
                        <label htmlFor="detected_at" className="text-sm font-medium">
                          Tanggal Deteksi
                        </label>
                        <Input 
                          id="detected_at"
                          type="date"
                          value={formData.detected_at || ""}
                          onChange={(e) => setFormData({...formData, detected_at: e.target.value})}
                        />
                      </div>
                    </div>
                    
                    {/* Full-width description field */}
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
                    
                    <div>
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="w-full"
                        onClick={handleEncyclopediaFromDialog}
                      >
                        <BookMarked className="h-4 w-4 mr-2" />
                        Cari dari Ensiklo HPG
                      </Button>
                    </div>
                    
                    <div className="flex gap-2 pt-4">
                      <Button 
                        className="flex-1" 
                        onClick={handleSaveThreat}
                        disabled={isUploading}
                      >
                        {isUploading ? "Menyimpan..." : "Simpan"}
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setIsAdding(false);
                          setSelectedThreat(null);
                          // Reset form 
                          const today = new Date().toISOString().split('T')[0];
                          setFormData({
                            threat_name: "",
                            threat_type: "hama",
                            status: "tidak parah",
                            description: "",
                            image_url: "",
                            scientific_name: "",
                            detected_at: today,
                            plot_id: selectedPlot
                          });
                          setImageFile(null);
                        }}
                      >
                        Batal
                      </Button>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Responsive grid layout - desktop swaps positions, mobile keeps original order */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Mobile: HPG List first, then Detail Monitoring */}
          {/* Desktop: Detail Monitoring first (col-span-2), then HPG List (col-span-1) */}
          
          {/* Detail Monitoring Card - Desktop: Appears first, Mobile: Appears second */}
          <div className="order-2 lg:order-1 lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>
                  {isAdding ? (selectedThreat ? "Edit Monitoring" : "Tambah Monitoring Baru") : "Detail Monitoring"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(selectedThreat || isAdding) ? (
                  <div className="space-y-6">
                    {isAdding ? (
                      // Edit/Add mode - show form
                      <>
                        <div className="flex flex-col md:flex-row gap-6">
                          {/* Image Section */}
                          <div className="flex flex-col items-center gap-4 flex-shrink-0">
                            {formData.image_url ? (
                              <img 
                                src={formData.image_url} 
                                alt={formData.threat_name}
                                className="rounded-xl w-80 h-80 object-cover border-2 border-gray-200"
                              />
                            ) : (
                              <div className="bg-gray-200 border-2 border-dashed rounded-xl w-80 h-80 flex items-center justify-center" />
                            )}
                            
                            {/* Upload/Ganti Foto button */}
                            <Button 
                              variant="outline" 
                              size="sm"
                              type="button"
                              onClick={triggerFileSelect}
                              disabled={isUploading}
                            >
                              {isUploading ? "Mengunggah..." : (selectedThreat ? "Ganti Foto" : "Upload Foto")}
                            </Button>
                          </div>
                          
                          {/* Form fields */}
                          <div className="space-y-4 flex-1">
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
                              <label htmlFor="scientific_name" className="text-sm font-medium">
                                Nama Ilmiah
                              </label>
                              <Input 
                                id="scientific_name" 
                                value={formData.scientific_name} 
                                onChange={(e) => setFormData({...formData, scientific_name: e.target.value})}
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
                              <label htmlFor="detected_at" className="text-sm font-medium">
                                Tanggal Deteksi
                              </label>
                              <Input 
                                id="detected_at"
                                type="date"
                                value={formData.detected_at || ""}
                                onChange={(e) => setFormData({...formData, detected_at: e.target.value})}
                              />
                            </div>
                          </div>
                        </div>
                        
                        {/* Full-width description field */}
                        <div className="space-y-2">
                          <label htmlFor="description" className="text-sm font-medium">
                            Deskripsi
                          </label>
                          <textarea 
                            id="description"
                            value={formData.description} 
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                            className="border rounded-md px-3 py-2 text-sm w-full min-h-[150px]"
                          />
                        </div>
                        
                        <div className="pt-2">
                          <Button 
                            type="button" 
                            variant="outline" 
                            className="w-full"
                            onClick={handleEncyclopediaFromDialog}
                          >
                            <BookMarked className="h-4 w-4 mr-2" />
                            Cari dari Ensiklo HPG
                          </Button>
                        </div>
                        
                        <div className="flex gap-2 pt-4">
                          <Button className="flex-1" onClick={handleSaveThreat}>
                            {selectedThreat ? "Update" : "Simpan"}
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={() => {
                              setIsAdding(false);
                              // Reset form data to match selected threat
                              if (selectedThreat) {
                                setFormData({
                                  threat_name: selectedThreat.threat_name || "",
                                  threat_type: selectedThreat.threat_type || "hama",
                                  status: selectedThreat.status || "tidak parah",
                                  description: selectedThreat.description || "",
                                  image_url: selectedThreat.image_url || "",
                                  scientific_name: selectedThreat.scientific_name || "",
                                  detected_at: selectedThreat.detected_at ? new Date(selectedThreat.detected_at).toISOString().split('T')[0] : "",
                                  plot_id: selectedThreat.plot_id
                                });
                              } else {
                                // Reset form for new item
                                const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
                                setFormData({
                                  threat_name: "",
                                  threat_type: "hama",
                                  status: "tidak parah",
                                  description: "",
                                  image_url: "",
                                  scientific_name: "",
                                  detected_at: today,
                                  plot_id: selectedPlot
                                });
                              }
                            }}
                          >
                            Batal
                          </Button>
                        </div>
                      </>
                    ) : selectedThreat ? (
                      // View mode - show threat details
                      <>
                        <div className="flex flex-col md:flex-row gap-6">
                          {/* Image Section */}
                          <div className="flex flex-col items-center gap-4 flex-shrink-0">
                            {formData.image_url ? (
                              <img 
                                src={formData.image_url} 
                                alt={formData.threat_name}
                                className="rounded-xl w-80 h-80 object-cover border-2 border-gray-200"
                              />
                            ) : (
                              <div className="bg-gray-200 border-2 border-dashed rounded-xl w-80 h-80 flex items-center justify-center" />
                            )}
                          </div>
                          
                          {/* Details in a single column next to image */}
                          <div className="space-y-4 flex-1">
                            <div>
                              <p className="text-sm text-muted-foreground">Nama Hama/Penyakit/Gulma</p>
                              <p className="font-medium">{formData.threat_name}</p>
                            </div>
                            
                            <div>
                              <p className="text-sm text-muted-foreground">Nama Ilmiah</p>
                              <p className="font-medium">{formData.scientific_name || "-"}</p>
                            </div>
                            
                            <div>
                              <p className="text-sm text-muted-foreground">Jenis Ancaman</p>
                              <p className="font-medium capitalize flex items-center gap-1">
                                {getThreatIcon(formData.threat_type)}
                                {formData.threat_type}
                              </p>
                            </div>
                            
                            <div>
                              <p className="text-sm text-muted-foreground">Status</p>
                              <div className="flex items-center gap-2">
                                <PestStatusIndicator status={formData.status} />
                                <span className="text-sm">
                                  {formData.status}
                                </span>
                              </div>
                            </div>
                            
                            <div>
                              <p className="text-sm text-muted-foreground">Tanggal Deteksi</p>
                              <p className="font-medium">{new Date(selectedThreat?.detected_at || '').toLocaleDateString('id-ID')}</p>
                            </div>
                          </div>
                        </div>
                        
                        {/* Description below the image and details */}
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">Deskripsi</p>
                          <p className="text-sm whitespace-pre-line">{formData.description || "-"}</p>
                        </div>
                        
                        {/* Button to enter edit mode */}
                        
                      </>
                    ) : (
                      // This should not happen, but just in case
                      <div></div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Bug className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="font-medium mb-1">Tidak ada data monitoring</h3>
                    <p className="text-sm text-muted-foreground">
                      Tidak ada data monitoring untuk plot yang dipilih. Klik &quot;Tambah Monitoring&quot; untuk membuat data baru.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* HPG List Card - Desktop: Appears second, Mobile: Appears first */}
          <div className="order-1 lg:order-2 space-y-6">
            <Card>
              <CardHeader 
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => setIsPestListMinimized(!isPestListMinimized)}
              >
                <div className="flex justify-between items-center">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Cari hama, penyakit, atau gulma..."
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  {isPestListMinimized ? (
                    <ChevronDown className="h-5 w-5 ml-2" />
                  ) : (
                    <ChevronUp className="h-5 w-5 ml-2" />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {isPestListMinimized ? (
                  // Minimized view - show only selected or first threat from current plot
                  <div className="space-y-4">
                    {filteredData.length > 0 ? (
                      <div 
                        className={`p-4 border rounded-lg transition-colors cursor-pointer ${
                          selectedThreatForMinimizedView ? 
                            (selectedThreat?.id === selectedThreatForMinimizedView.id ? 
                              "border-primary bg-primary/10" : "hover:bg-muted") :
                          (selectedThreat?.id === filteredData[0].id ? 
                            "border-primary bg-primary/10" : "hover:bg-muted")
                        }`}
                        onClick={() => {
                          // When the minimized card is clicked, show its details in view mode
                          const threatToDisplay = selectedThreatForMinimizedView || filteredData[0];
                          setSelectedThreat(threatToDisplay);
                          setFormData({
                            threat_name: threatToDisplay.threat_name || "",
                            threat_type: threatToDisplay.threat_type || "hama",
                            status: threatToDisplay.status || "tidak parah",
                            description: threatToDisplay.description || "",
                            image_url: threatToDisplay.image_url || "",
                            scientific_name: threatToDisplay.scientific_name || "",
                            detected_at: threatToDisplay.detected_at ? new Date(threatToDisplay.detected_at).toISOString().split('T')[0] : "",
                            plot_id: threatToDisplay.plot_id
                          });
                          setIsAdding(false); // Show in view mode, not edit mode
                        }}
                      >
                        {(() => {
                          // Show the selected threat or first threat from the current plot in minimized view
                          const threatToDisplay = selectedThreatForMinimizedView || filteredData[0];
                          return (
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <h3 className="font-semibold">{threatToDisplay?.threat_name || "Tidak ada data"}</h3>
                                </div>
                                {threatToDisplay?.scientific_name && (
                                  <p className="text-sm italic text-muted-foreground">{threatToDisplay.scientific_name}</p>
                                )}
                              </div>
                              {threatToDisplay?.status && (
                                <div className="ml-2">
                                  <PestStatusIndicator status={threatToDisplay.status} />
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    ) : (
                      <p className="text-center py-8 text-muted-foreground">
                        Tidak ada data monitoring yang ditemukan
                      </p>
                    )}
                  </div>
                ) : (
                  // Expanded view - show all threats
                  <div className="space-y-4">
                    {filteredData.length > 0 ? (
                      filteredData.map((threat) => (
                        <div 
                          key={threat.id}
                          className={`p-4 border rounded-lg transition-colors cursor-pointer relative ${
                            selectedThreat?.id === threat.id 
                              ? "border-primary bg-primary/10" 
                              : "hover:bg-muted"
                          }`}
                          onClick={() => {
                            setSelectedThreatForMinimizedView(threat);
                            setIsPestListMinimized(true); // Auto-minimize after selection
                            // Also update the detail view with this threat in view mode
                            setSelectedThreat(threat);
                            setFormData({
                              threat_name: threat.threat_name || "",
                              threat_type: threat.threat_type || "hama",
                              status: threat.status || "tidak parah",
                              description: threat.description || "",
                              image_url: threat.image_url || "",
                              scientific_name: threat.scientific_name || "",
                              detected_at: threat.detected_at ? new Date(threat.detected_at).toISOString().split('T')[0] : "",
                              plot_id: threat.plot_id
                            });
                            setIsAdding(false); // Show in view mode, not edit mode
                          }}
                        >
                          <div className="flex gap-1 mb-3 sm:absolute sm:top-4 sm:right-4 sm:mb-0">
                              <Dialog open={isAdding && selectedThreat?.id === threat.id} onOpenChange={(open) => {
                                if (!open) {
                                  setIsAdding(false);
                                } else {
                                  // Set the threat to edit
                                  setSelectedThreat(threat);
                                  setIsAdding(true); // Switch to edit mode
                                  setFormData({
                                    threat_name: threat.threat_name || "",
                                    threat_type: threat.threat_type || "hama",
                                    status: threat.status || "tidak parah",
                                    description: threat.description || "",
                                    image_url: threat.image_url || "",
                                    scientific_name: threat.scientific_name || "",
                                    detected_at: threat.detected_at ? new Date(threat.detected_at).toISOString().split('T')[0] : "",
                                    plot_id: threat.plot_id
                                  });
                                }
                              }}>
                                <DialogTrigger asChild>
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    onClick={(e) => {
                                      e.stopPropagation(); // Prevent the card click event
                                      // Set the threat to edit
                                      setSelectedThreat(threat);
                                      setIsAdding(true); // Switch to edit mode
                                      setFormData({
                                        threat_name: threat.threat_name || "",
                                        threat_type: threat.threat_type || "hama",
                                        status: threat.status || "tidak parah",
                                        description: threat.description || "",
                                        image_url: threat.image_url || "",
                                        scientific_name: threat.scientific_name || "",
                                        detected_at: threat.detected_at ? new Date(threat.detected_at).toISOString().split('T')[0] : "",
                                        plot_id: threat.plot_id
                                      });
                                    }}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                                  <DialogHeader>
                                    <DialogTitle>Edit Monitoring</DialogTitle>
                                    <DialogDescription>
                                      Edit data monitoring hama, penyakit, atau gulma
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-6">
                                    {/* Image Section */}
                                    <div className="flex flex-col items-center gap-4">
                                      {formData.image_url ? (
                                        <img 
                                          src={formData.image_url} 
                                          alt={formData.threat_name}
                                          className="rounded-xl w-full max-w-[320px] max-h-[320px] object-contain border-2 border-gray-200"
                                        />
                                      ) : (
                                        <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full max-w-[320px] max-h-[320px] flex items-center justify-center aspect-square" />
                                      )}
                                      
                                      {/* Upload/Ganti Foto button */}
                                      <Button 
                                        variant="outline" 
                                        size="sm"
                                        type="button"
                                        onClick={triggerFileSelect}
                                        disabled={isUploading}
                                      >
                                        {isUploading ? "Mengunggah..." : "Ganti Foto"}
                                      </Button>
                                    </div>
                                    
                                    {/* Form fields */}
                                    <div className="space-y-4">
                                      <div className="space-y-2">
                                        <label className="text-sm font-medium">Jenis Ancaman</label>
                                        <div className="grid grid-cols-3 gap-2">
                                          <Button 
                                            variant={formData.threat_type === "hama" ? "default" : "outline"} 
                                            className={formData.threat_type === "hama" ? "border-primary" : ""}
                                            onClick={() => setFormData({...formData, threat_type: "hama"})}
                                          >
                                            <Bug className="h-4 w-4 mr-2" />
                                            Hama
                                          </Button>
                                          <Button 
                                            variant={formData.threat_type === "penyakit" ? "default" : "outline"} 
                                            className={formData.threat_type === "penyakit" ? "border-primary" : ""}
                                            onClick={() => setFormData({...formData, threat_type: "penyakit"})}
                                          >
                                            <AlertTriangle className="h-4 w-4 mr-2" />
                                            Penyakit
                                          </Button>
                                          <Button 
                                            variant={formData.threat_type === "gulma" ? "default" : "outline"} 
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
                                        <label htmlFor="scientific_name" className="text-sm font-medium">
                                          Nama Ilmiah
                                        </label>
                                        <Input 
                                          id="scientific_name" 
                                          value={formData.scientific_name} 
                                          onChange={(e) => setFormData({...formData, scientific_name: e.target.value})}
                                        />
                                      </div>
                                      
                                      <div className="grid grid-cols-2 gap-4">
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
                                          <label htmlFor="detected_at" className="text-sm font-medium">
                                            Tanggal Deteksi
                                          </label>
                                          <Input 
                                            id="detected_at"
                                            type="date"
                                            value={formData.detected_at || ""}
                                            onChange={(e) => setFormData({...formData, detected_at: e.target.value})}
                                          />
                                        </div>
                                      </div>
                                      
                                      {/* Full-width description field */}
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
                                      
                                      <div>
                                        <Button 
                                          type="button" 
                                          variant="outline" 
                                          className="w-full"
                                          onClick={handleEncyclopediaFromDialog}
                                        >
                                          <BookMarked className="h-4 w-4 mr-2" />
                                          Cari dari Ensiklo HPG
                                        </Button>
                                      </div>
                                      
                                      <div className="flex gap-2 pt-4">
                                        <Button 
                                          className="flex-1" 
                                          onClick={handleSaveThreat}
                                          disabled={isUploading}
                                        >
                                          {isUploading ? "Menyimpan..." : "Update"}
                                        </Button>
                                        <Button 
                                          variant="outline" 
                                          onClick={() => {
                                            setIsAdding(false);
                                            // Reset form to match selected threat
                                            if (selectedThreat) {
                                              setFormData({
                                                threat_name: selectedThreat.threat_name || "",
                                                threat_type: selectedThreat.threat_type || "hama",
                                                status: selectedThreat.status || "tidak parah",
                                                description: selectedThreat.description || "",
                                                image_url: selectedThreat.image_url || "",
                                                scientific_name: selectedThreat.scientific_name || "",
                                                detected_at: selectedThreat.detected_at ? new Date(selectedThreat.detected_at).toISOString().split('T')[0] : "",
                                                plot_id: selectedThreat.plot_id
                                              });
                                            } 
                                          }}
                                        >
                                          Batal
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    onClick={(e) => {
                                      e.stopPropagation(); // Prevent the card click event
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Apakah anda yakin?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Tindakan ini tidak bisa dibatalkan. Data monitoring akan dihapus secara permanen dari sistem.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Batal</AlertDialogCancel>
                                    <AlertDialogAction 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteThreat(threat.id);
                                      }}>
                                      Lanjutkan
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          
                          {/* Main content */}
                          <div className="flex items-start gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-semibold">{threat.threat_name}</h3>
                              </div>
                              {threat.scientific_name && (
                                <p className="text-sm italic text-muted-foreground">{threat.scientific_name}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-center py-8 text-muted-foreground">
                        Tidak ada data monitoring yang ditemukan
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
    </div>
    
    {/* Encyclopedia Drawer */}
    <Drawer open={isEncyclopediaOpen} onOpenChange={(open) => {
      if (!open) {
        setIsEncyclopediaOpen(false);
        setEncyclopediaFromDialog(false); // Reset state when closing
      }
    }}>
      <DrawerContent className="h-[90vh] max-h-[90vh] overflow-hidden">
        <DrawerHeader className="border-b dark:border-gray-700 relative">
          <div className="text-center">
            <DrawerTitle>Ensiklo HPG (Hama, Penyakit & Gulma)</DrawerTitle>
            <DrawerDescription>Cari data hama, penyakit, atau gulma dari ensiklopedia</DrawerDescription>
          </div>
          <button 
            onClick={() => {
              setIsEncyclopediaOpen(false);
              setEncyclopediaFromDialog(false); // Reset state when closing
            }}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="h-6 w-6" />
          </button>
        </DrawerHeader>
        
        <div className="p-4 border-b dark:border-gray-700 flex justify-center">
          <div className="flex flex-wrap gap-2 justify-center">
            <Button
              variant={encyclopediaFilter === 'hama' || encyclopediaFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setEncyclopediaFilter('hama')}
              className={(encyclopediaFilter === 'hama' || encyclopediaFilter === 'all') ? 'dark:bg-blue-600 dark:hover:bg-blue-700' : 'dark:border-gray-600 dark:text-white dark:hover:bg-gray-700'}
            >
              <Bug className="h-4 w-4 mr-1" />
              Hama
            </Button>
            <Button
              variant={encyclopediaFilter === 'penyakit' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setEncyclopediaFilter('penyakit')}
              className={encyclopediaFilter === 'penyakit' ? 'dark:bg-blue-600 dark:hover:bg-blue-700' : 'dark:border-gray-600 dark:text-white dark:hover:bg-gray-700'}
            >
              <AlertTriangle className="h-4 w-4 mr-1" />
              Penyakit
            </Button>
            <Button
              variant={encyclopediaFilter === 'gulma' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setEncyclopediaFilter('gulma')}
              className={encyclopediaFilter === 'gulma' ? 'dark:bg-blue-600 dark:hover:bg-blue-700' : 'dark:border-gray-600 dark:text-white dark:hover:bg-gray-700'}
            >
              <Sprout className="h-4 w-4 mr-1" />
              Gulma
            </Button>
          </div>
        </div>
        
        <div className="overflow-y-auto flex-1 p-4 dark:bg-gray-800 dark:text-white">
          {encyclopediaLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-32 w-full rounded-lg" />
              <Skeleton className="h-32 w-full rounded-lg" />
              <Skeleton className="h-32 w-full rounded-lg" />
            </div>
          ) : filteredEncyclopediaData.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredEncyclopediaData.map((item, index) => (
                <div key={item.id || index} className="border rounded-lg p-4 hover:shadow-md transition-shadow dark:border-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600">
                  <div className="md:flex md:items-start md:gap-3 space-y-3 md:space-y-0 cursor-pointer" onClick={() => {
                      // Toggle expanded state for this specific item
                      const newExpandedItems = {...expandedEncyclopediaItems};
                      newExpandedItems[item.id] = !newExpandedItems[item.id];
                      setExpandedEncyclopediaItems(newExpandedItems);
                    }}>
                    <div className="hidden md:block">
                      {item.image_url ? (
                        <img 
                          src={item.image_url} 
                          alt={item.threat_name} 
                          className="w-48 h-48 object-cover rounded-md flex-shrink-0"
                        />
                      ) : (
                        <div className="bg-gray-200 border-2 border-dashed rounded-xl w-48 h-48 flex-shrink-0" />
                      )}
                    </div>
                    <div className="md:hidden w-full">
                      {item.image_url ? (
                        <img 
                          src={item.image_url} 
                          alt={item.threat_name} 
                          className="w-full aspect-square object-cover rounded-md"
                        />
                      ) : (
                        <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full aspect-square" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg dark:text-white">{item.threat_name || 'Nama HPG'}</h3>
                          {item.scientific_name && (
                            <p className="text-sm italic text-gray-600 dark:text-gray-300">{item.scientific_name}</p>
                          )}
                          <p className="text-sm text-gray-600 mt-1 dark:text-gray-300">
                            <span className="font-medium">Jenis:</span> {item.threat_type || 'Tidak diketahui'}
                          </p>
                        </div>
                        <ChevronDown className={`h-5 w-5 ml-2 transform transition-transform ${expandedEncyclopediaItems[item.id] ? 'rotate-180' : ''}`} />
                      </div>
                      {encyclopediaFromDialog && (
                        <div className="mt-2">
                          <Button 
                            size="sm" 
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent card toggle
                              // Use setTimeout to separate the state updates to avoid conflicts
                              setTimeout(() => handleSelectEncyclopediaEntry(item), 0);
                            }}
                            className="dark:bg-green-600 dark:hover:bg-green-700"
                          >
                            Pilih
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Expanded content - only shown when expanded */}
                  {expandedEncyclopediaItems[item.id] && (
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                      <div className="mt-3">
                        <p className="font-medium dark:text-white">Deskripsi:</p>
                        <p className="dark:text-gray-200">{item.description || 'Deskripsi tidak tersedia.'}</p>
                      </div>
                      
                      {item.control && (
                        <div className="mt-2">
                          <p className="font-medium dark:text-white">Pengendalian:</p>
                          <p className="dark:text-gray-200">{item.control}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-40 text-center dark:text-white">
              <p>
                {encyclopediaData.length > 0 
                  ? `Tidak ada data ${encyclopediaFilter === 'all' ? '' : encyclopediaFilter} dalam ensiklo HPG.` 
                  : 'Data ensiklo HPG tidak ditemukan atau sedang dalam pengembangan.'}
              </p>
            </div>
          )}
        </div>
        
      </DrawerContent>
    </Drawer>
    </DashboardWrapper>
    </TooltipProvider>
  );
}