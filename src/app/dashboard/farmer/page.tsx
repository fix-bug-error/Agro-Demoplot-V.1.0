"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  User, 
  Users, 
  Plus, 
  Edit, 
  Trash2,
  Search,
  ChevronUp,
  ChevronDown
} from "lucide-react";

// Helper function to format date
const formatDate = (dateString: string | undefined): string => {
  console.log("Formatting date:", dateString); // Debug log
  if (!dateString) return "-";
  
  try {
    // Handle ISO date strings (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss)
    if (dateString.match(/^\d{4}-\d{2}-\d{2}/)) {
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        // Use 3-letter month abbreviations
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
        const day = date.getDate().toString().padStart(2, '0');
        const month = months[date.getMonth()];
        const year = date.getFullYear();
        return `${day} ${month} ${year}`;
      }
    }
    
    // Handle DD/MM/YYYY format
    if (dateString.match(/^\d{1,2}\/\d{1,2}\/\d{4}/)) {
      const parts = dateString.split("/");
      if (parts.length === 3) {
        const [day, month, year] = parts;
        const parsedDate = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
        if (!isNaN(parsedDate.getTime())) {
          // Use 3-letter month abbreviations
          const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
          const formattedDay = parsedDate.getDate().toString().padStart(2, '0');
          const formattedMonth = months[parsedDate.getMonth()];
          const formattedYear = parsedDate.getFullYear();
          return `${formattedDay} ${formattedMonth} ${formattedYear}`;
        }
      }
    }
    
    // Handle DD-MM-YYYY format
    if (dateString.match(/^\d{1,2}-\d{1,2}-\d{4}/)) {
      const parts = dateString.split("-");
      if (parts.length === 3) {
        const [day, month, year] = parts;
        const parsedDate = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
        if (!isNaN(parsedDate.getTime())) {
          // Use 3-letter month abbreviations
          const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
          const formattedDay = parsedDate.getDate().toString().padStart(2, '0');
          const formattedMonth = months[parsedDate.getMonth()];
          const formattedYear = parsedDate.getFullYear();
          return `${formattedDay} ${formattedMonth} ${formattedYear}`;
        }
      }
    }
    
    // If we can't parse it, return as is
    return dateString;
  } catch (error) {
    console.error("Error formatting date:", error);
    return dateString || "-";
  }
};

// Mock data types
type Farmer = {
  id: number;
  full_name: string;
  national_id: string;
  date_of_birth: string;
  education: string;
  gender: string;
  phone_number: string;
  address: string;
  farmer_group: string;
  photo_url: string;
};

export default function FarmerPage() {
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFarmer, setSelectedFarmer] = useState<Farmer | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFarmerListMinimized, setIsFarmerListMinimized] = useState(true);

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch farmers
        const farmersRes = await fetch('/api/dashboard/farmers');
        
        if (!farmersRes.ok) {
          throw new Error('Failed to fetch farmers data');
        }
        
        const farmersData = await farmersRes.json();
        // Debug: Log the date_of_birth format
        if (farmersData && farmersData.length > 0) {
          console.log("First farmer date_of_birth:", farmersData[0].date_of_birth);
        }
        setFarmers(farmersData);
        
        // Automatically select the first farmer if none is selected
        if (!selectedFarmer && farmersData && farmersData.length > 0) {
          setSelectedFarmer(farmersData[0]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Gagal memuat data petani. Silakan coba lagi.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Filter farmers based on search term
  const filteredFarmers = farmers.filter(farmer => 
    farmer.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    farmer.farmer_group.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddFarmer = () => {
    setIsAdding(true);
    setSelectedFarmer(null);
  };

  const handleEditFarmer = (farmer: Farmer) => {
    setSelectedFarmer(farmer);
    setIsAdding(false);
  };

  const handleDeleteFarmer = (id: number) => {
    setFarmers(farmers.filter(farmer => farmer.id !== id));
    if (selectedFarmer && selectedFarmer.id === id) {
      setSelectedFarmer(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Memuat data petani...</p>
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
        <h1 className="text-2xl font-bold">Profil Petani</h1>
        <Button onClick={handleAddFarmer}>
          <Plus className="h-4 w-4 mr-2" />
          Tambah Petani
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* New card for farmercard.png image */}
          <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
            <img 
              src="/farmercard.png" 
              alt="Farmer Card" 
              className="w-full h-auto object-contain"
            />
          </div>
          
          <Card>
            <CardHeader 
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => setIsFarmerListMinimized(!isFarmerListMinimized)}
            >
              <div className="flex justify-between items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Cari petani atau kelompok tani..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                {isFarmerListMinimized ? (
                  <ChevronDown className="h-5 w-5 ml-2" />
                ) : (
                  <ChevronUp className="h-5 w-5 ml-2" />
                )}
              </div>
            </CardHeader>
            <CardContent>
              {isFarmerListMinimized ? (
                // Minimized view - show only selected farmer
                <div className="space-y-4">
                  {selectedFarmer ? (
                    <div 
                      className="p-4 border rounded-lg bg-primary/10 border-primary"
                    >
                      {selectedFarmer.photo_url ? (
                        <img 
                          src={selectedFarmer.photo_url} 
                          alt={selectedFarmer.full_name} 
                          className="w-12 h-12 rounded-lg object-cover border border-gray-200 float-left mr-3"
                        />
                      ) : (
                        <div className="bg-gray-200 border-2 border-dashed rounded-lg w-12 h-12 float-left mr-3" />
                      )}
                      <div>
                        <div className="flex justify-between">
                          <h3 className="font-semibold">{selectedFarmer.full_name}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {selectedFarmer.gender} • {selectedFarmer.phone_number}
                        </p>
                        <p className="text-sm mt-1">
                          {selectedFarmer.address}
                        </p>
                        <div className="flex items-center gap-1 mt-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {selectedFarmer.farmer_group}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-center py-8 text-muted-foreground">
                      Tidak ada petani dipilih
                    </p>
                  )}
                </div>
              ) : (
                // Expanded view - show all farmers
                <div className="space-y-4">
                  {filteredFarmers.length > 0 ? (
                    filteredFarmers.map((farmer) => (
                      <div 
                        key={farmer.id}
                        className={`p-4 border rounded-lg transition-colors flex items-start gap-3 ${
                          selectedFarmer?.id === farmer.id 
                            ? "border-primary bg-primary/10" 
                            : "hover:bg-muted"
                        }`}
                        onClick={() => {
                          setSelectedFarmer(farmer);
                          // Auto-minimize after selection
                          setIsFarmerListMinimized(true);
                        }}
                      >
                        {farmer.photo_url ? (
                          <img 
                            src={farmer.photo_url} 
                            alt={farmer.full_name} 
                            className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                          />
                        ) : (
                          <div className="bg-gray-200 border-2 border-dashed rounded-lg w-12 h-12" />
                        )}
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <h3 className="font-semibold">{farmer.full_name}</h3>
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditFarmer(farmer);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteFarmer(farmer.id);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {farmer.gender} • {farmer.phone_number}
                          </p>
                          <p className="text-sm mt-1">
                            {farmer.address}
                          </p>
                          <div className="flex items-center gap-1 mt-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              {farmer.farmer_group}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center py-8 text-muted-foreground">
                      Tidak ada data petani yang ditemukan
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>
                {isAdding ? "Tambah Petani Baru" : 
                 selectedFarmer ? "Detail Petani" : "Detail Petani"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isAdding ? (
                <div className="space-y-4">
                  <div className="flex flex-col items-center gap-4">
                    <div className="bg-gray-200 border-2 border-dashed rounded-xl w-64 h-64" />
                    <Button variant="outline" size="sm">
                      Upload Foto
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Nama Lengkap</Label>
                    <Input 
                      id="full_name" 
                    />
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="national_id">NIK</Label>
                      <Input 
                        id="national_id" 
                      />
                    </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="birth_date">Tanggal Lahir</Label>
                      <Input 
                        id="birth_date" 
                        type="date"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gender">Jenis Kelamin</Label>
                      <Input 
                        id="gender" 
                      />
                    </div>
                  </div>
                                    
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                    <Label htmlFor="education">Pendidikan</Label>
                    <Input 
                      id="education" 
                    />
                  </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">No. Telepon</Label>
                      <Input 
                        id="phone" 
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="address">Alamat</Label>
                    <Input 
                      id="address" 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="group">Kelompok Tani</Label>
                    <Input 
                      id="group" 
                    />
                  </div>
                  
                  <div className="flex gap-2 pt-4">
                    <Button className="flex-1">
                      Simpan
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setIsAdding(false);
                        setSelectedFarmer(null);
                      }}
                    >
                      Batal
                    </Button>
                  </div>
                </div>
              ) : selectedFarmer ? (
                <div className="space-y-4">
                  <div className="flex flex-col items-center gap-4">
                    {selectedFarmer.photo_url ? (
                      <img 
                        src={selectedFarmer.photo_url} 
                        alt={selectedFarmer.full_name} 
                        className="w-64 h-64 rounded-xl object-cover border-2 border-gray-200"
                      />
                    ) : (
                      <div className="bg-gray-200 border-2 border-dashed rounded-xl w-64 h-64" />
                    )}
                    <Button variant="outline" size="sm">
                      Ganti Foto
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Nama Lengkap</Label>
                    <div className="p-2 border rounded-md">
                      {selectedFarmer.full_name || "-"}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="national_id">NIK</Label>
                    <div className="p-2 border rounded-md">
                      {selectedFarmer.national_id || "-"}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="birth_date">Tanggal Lahir</Label>
                      <div className="p-2 border rounded-md">
                        {formatDate(selectedFarmer.date_of_birth)}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gender">Jenis Kelamin</Label>
                      <div className="p-2 border rounded-md">
                        {selectedFarmer.gender || "-"}
                      </div>
                    </div>
                  </div>
                                    
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="education">Pendidikan</Label>
                      <div className="p-2 border rounded-md">
                        {selectedFarmer.education || "-"}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">No. Telepon</Label>
                      <div className="p-2 border rounded-md">
                        {selectedFarmer.phone_number || "-"}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="address">Alamat</Label>
                    <div className="p-2 border rounded-md">
                      {selectedFarmer.address || "-"}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="group">Kelompok Tani</Label>
                    <div className="p-2 border rounded-md">
                      {selectedFarmer.farmer_group || "-"}
                    </div>
                  </div>
                  
                  <div className="flex gap-2 pt-4">
                    <Button className="flex-1" onClick={() => setIsAdding(true)}>
                      Edit
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setSelectedFarmer(null)}
                    >
                      Batal
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <User className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="font-medium mb-1">Tidak ada petani dipilih</h3>
                  <p className="text-sm text-muted-foreground">
                    Pilih petani dari daftar untuk melihat detailnya
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