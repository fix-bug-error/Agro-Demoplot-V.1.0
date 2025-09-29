"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
Dialog,
DialogContent,
DialogHeader,
DialogTitle,
DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
Select,
SelectContent,
SelectItem,
SelectTrigger,
SelectValue,
} from "@/components/ui/select";
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
  profile?: string;
};
export default function FarmerPage() {
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFarmer, setSelectedFarmer] = useState<Farmer | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFarmerListMinimized, setIsFarmerListMinimized] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [farmerToEdit, setFarmerToEdit] = useState<Farmer | null>(null);
  const [avatarDialogOpen, setAvatarDialogOpen] = useState(false);
  const [currentAvatar, setCurrentAvatar] = useState<string | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addFarmerGender, setAddFarmerGender] = useState<string>("");
  const [addFarmerEducation, setAddFarmerEducation] = useState<string>("");
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
        // Debug: Log the response structure
        console.log("Farmers API Response:", farmersData);
        
        // Handle different response formats
        // Some APIs return { success: boolean, data: [] } while others return raw array
        const farmersArray = Array.isArray(farmersData) 
          ? farmersData 
          : (farmersData.data || []);
          
        // Debug: Log the date_of_birth format
        if (farmersArray && farmersArray.length > 0) {
          console.log("First farmer date_of_birth:", farmersArray[0].date_of_birth);
        }
        // Add mock profile data for demonstration
        const farmersWithProfile = farmersArray.map((farmer: Farmer) => ({
          ...farmer,
          profile: farmer.profile || `Halo, nama saya ${farmer.full_name}. Saya adalah seorang petani yang berdedikasi dalam mengelola lahan kopi. Saya telah berkecimpung di bidang pertanian selama bertahun-tahun dan selalu berusaha menerapkan metode terbaik untuk menghasilkan kopi berkualitas tinggi.`
        }));
        setFarmers(farmersWithProfile);
        // Automatically select the first farmer if none is selected
        if (!selectedFarmer && farmersWithProfile && farmersWithProfile.length > 0) {
          setSelectedFarmer(farmersWithProfile[0]);
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
    setAddDialogOpen(true);
  };
  
  const handleSaveNewFarmer = async () => {
    // Get the form values
    const fullName = (document.getElementById('add_full_name') as HTMLInputElement)?.value || '';
    const nationalId = (document.getElementById('add_national_id') as HTMLInputElement)?.value || '';
    const birthDate = (document.getElementById('add_birth_date') as HTMLInputElement)?.value || '';
    
    // Use the state variables for gender and education
    const gender = addFarmerGender;
    const education = addFarmerEducation;
    
    const phone = (document.getElementById('add_phone') as HTMLInputElement)?.value || '';
    const address = (document.getElementById('add_address') as HTMLInputElement)?.value || '';
    const group = (document.getElementById('add_group') as HTMLInputElement)?.value || '';

    // Create new farmer object
    const newFarmer: Farmer = {
      id: Math.max(...farmers.map(f => f.id), 0) + 1, // Simple ID generation
      full_name: fullName,
      national_id: nationalId,
      date_of_birth: birthDate,
      education: education,
      gender: gender,
      phone_number: phone,
      address: address,
      farmer_group: group,
      photo_url: currentAvatar || '', // Use selected avatar or empty string
      profile: `Halo, nama saya ${fullName}. Saya adalah seorang petani yang berdedikasi dalam mengelola lahan kopi.`
    };

    try {
      // Call API to add farmer
      const response = await fetch('/api/dashboard/farmers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newFarmer),
      });
      
      if (response.ok) {
        // Add the new farmer to the local state
        const updatedFarmers = [...farmers, newFarmer];
        setFarmers(updatedFarmers);
        
        setAddDialogOpen(false);
        
        // Reset form fields and avatar selection
        setCurrentAvatar(null);
        setAddFarmerGender("");
        setAddFarmerEducation("");
        
        // Show success alert
        setShowSuccessAlert(true);
        setTimeout(() => setShowSuccessAlert(false), 3000);
      } else {
        throw new Error('Failed to add farmer');
      }
    } catch (error) {
      console.error('Error adding farmer:', error);
      alert('Gagal menambahkan data petani. Silakan coba lagi.');
    }
  };
  
  const handleEditFarmer = (farmer: Farmer) => {
    setFarmerToEdit(farmer);
    setEditDialogOpen(true);
  };
  const handleDeleteFarmer = (id: number) => {
    setFarmers(farmers.filter(farmer => farmer.id !== id));
    if (selectedFarmer && selectedFarmer.id === id) {
      setSelectedFarmer(null);
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
            {/* Farmer card image skeleton */}
            <Skeleton className="h-48 w-full rounded-xl" />
            
            {/* Farmer list card skeleton */}
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
            
            {/* Profile introduction card skeleton */}
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-1/3" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-6">
            {/* Farmer detail card skeleton */}
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Skeleton className="h-64 w-full rounded-xl" />
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
    <>
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
                          const farmerWithProfile = {...farmer, profile: farmer.profile || `Halo, nama saya ${farmer.full_name}. Saya adalah seorang petani yang berdedikasi dalam mengelola lahan kopi. Saya telah berkecimpung di bidang pertanian selama bertahun-tahun dan selalu berusaha menerapkan metode terbaik untuk menghasilkan kopi berkualitas tinggi.`};
                          setSelectedFarmer(farmerWithProfile);
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
          {/* Profile Introduction Card */}
          <Card>
            <CardHeader>
              <CardTitle>Perkenalan Singkat</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedFarmer ? (
                <div className="space-y-4">
                  {selectedFarmer.profile ? (
                    <p className="text-muted-foreground">{selectedFarmer.profile}</p>
                  ) : (
                    <p className="text-muted-foreground italic">
                      Belum ada perkenalan untuk petani ini.
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-center py-4 text-muted-foreground">
                  Pilih petani untuk melihat perkenalannya
                </p>
              )}
            </CardContent>
          </Card>
        </div>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedFarmer ? "Detail Petani" : "Detail Petani"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedFarmer ? (
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
                  <div className="pt-4">
                    <Button 
                      className="w-full" 
                      onClick={() => {
                        if (selectedFarmer) {
                          setFarmerToEdit(selectedFarmer);
                          setEditDialogOpen(true);
                        }
                      }}
                    >
                      Edit
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <User className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="font-medium mb-1">Tidak ada petani dipilih</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Pilih petani dari daftar untuk melihat detailnya
                  </p>
                  <Button onClick={() => setAddDialogOpen(true)}>
                    Tambah Petani Baru
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
    
    {/* Success Alert */}
    {showSuccessAlert && (
      <div className="fixed top-4 right-4 z-50">
        <Alert className="bg-green-100 border-green-200 text-green-800">
          <AlertDescription className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Sukses! perubahan berhasil disimpan</span>
          </AlertDescription>
        </Alert>
      </div>
    )}
    
    {/* Edit Farmer Dialog */}
    <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Profil Petani</DialogTitle>
        </DialogHeader>
        {farmerToEdit && (
          <div className="space-y-4 py-4">
            <div className="flex flex-col items-center gap-4">
              {farmerToEdit.photo_url ? (
                <img 
                  src={farmerToEdit.photo_url} 
                  alt={farmerToEdit.full_name} 
                  className="w-32 h-32 rounded-xl object-cover border-2 border-gray-200"
                />
              ) : (
                <div className="bg-gray-200 border-2 border-dashed rounded-xl w-32 h-32" />
              )}
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  type="button"
                  onClick={() => setAvatarDialogOpen(true)}
                >
                  Avatar
                </Button>
                <Button variant="outline" size="sm">
                  Ganti Foto
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit_full_name">Nama Lengkap</Label>
              <Input 
                id="edit_full_name" 
                defaultValue={farmerToEdit.full_name}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_national_id">NIK</Label>
              <Input 
                id="edit_national_id" 
                defaultValue={farmerToEdit.national_id}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_birth_date">Tanggal Lahir</Label>
                <Input 
                  id="edit_birth_date" 
                  type="date" 
                  defaultValue={(() => {
                    try {
                      const date = new Date(farmerToEdit.date_of_birth);
                      if (isNaN(date.getTime())) return farmerToEdit.date_of_birth;
                      return date.toISOString().split('T')[0];
                    } catch {
                      return farmerToEdit.date_of_birth;
                    }
                  })()}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_gender">Jenis Kelamin</Label>
                <Select 
                  defaultValue={farmerToEdit.gender} 
                  onValueChange={(value) => {
                    if (farmerToEdit) {
                      setFarmerToEdit({...farmerToEdit, gender: value});
                    }
                  }}
                >
                  <SelectTrigger id="edit_gender">
                    <SelectValue placeholder="Pilih jenis kelamin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                    <SelectItem value="Perempuan">Perempuan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_education">Pendidikan</Label>
                <Select 
                  defaultValue={farmerToEdit.education} 
                  onValueChange={(value) => {
                    if (farmerToEdit) {
                      setFarmerToEdit({...farmerToEdit, education: value});
                    }
                  }}
                >
                  <SelectTrigger id="edit_education">
                    <SelectValue placeholder="Pilih pendidikan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Tidak ada">Tidak ada</SelectItem>
                    <SelectItem value="SD">SD</SelectItem>
                    <SelectItem value="SMP">SMP</SelectItem>
                    <SelectItem value="SMA">SMA</SelectItem>
                    <SelectItem value="Perguruan Tinggi">Perguruan Tinggi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_phone">No. Telepon</Label>
                <Input 
                  id="edit_phone" 
                  defaultValue={farmerToEdit.phone_number}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_address">Alamat</Label>
              <Input 
                id="edit_address" 
                defaultValue={farmerToEdit.address}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_group">Kelompok Tani</Label>
              <Input 
                id="edit_group" 
                defaultValue={farmerToEdit.farmer_group}
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button 
                className="flex-1" 
                onClick={async () => {
                  // Get the form values
                  const fullName = (document.getElementById('edit_full_name') as HTMLInputElement)?.value || farmerToEdit.full_name;
                  const nationalId = (document.getElementById('edit_national_id') as HTMLInputElement)?.value || farmerToEdit.national_id;
                  const birthDate = (document.getElementById('edit_birth_date') as HTMLInputElement)?.value || farmerToEdit.date_of_birth;
                  const gender = (document.getElementById('edit_gender') as HTMLInputElement)?.value || farmerToEdit.gender;
                  const education = (document.getElementById('edit_education') as HTMLInputElement)?.value || farmerToEdit.education;
                  const phone = (document.getElementById('edit_phone') as HTMLInputElement)?.value || farmerToEdit.phone_number;
                  const address = (document.getElementById('edit_address') as HTMLInputElement)?.value || farmerToEdit.address;
                  const group = (document.getElementById('edit_group') as HTMLInputElement)?.value || farmerToEdit.farmer_group;
                  
                  // Update the farmer data
                  const updatedFarmer: Farmer = {
                    ...farmerToEdit,
                    full_name: fullName,
                    national_id: nationalId,
                    date_of_birth: birthDate,
                    gender: gender,
                    education: education,
                    phone_number: phone,
                    address: address,
                    farmer_group: group,
                  };
                  
                  try {
                    // Call API to update farmer
                    const response = await fetch(`/api/dashboard/farmers/${farmerToEdit.id}`, {
                      method: 'PUT',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify(updatedFarmer),
                    });
                    
                    if (response.ok) {
                      // Update the local state
                      const updatedFarmers = farmers.map(farmer => 
                        farmer.id === farmerToEdit.id ? updatedFarmer : farmer
                      );
                      setFarmers(updatedFarmers);
                      
                      // If the updated farmer is the currently selected one, update that too
                      if (selectedFarmer && selectedFarmer.id === farmerToEdit.id) {
                        setSelectedFarmer(updatedFarmer);
                      }
                      
                      setEditDialogOpen(false);
                      
                      // Show success alert
                      setShowSuccessAlert(true);
                      setTimeout(() => setShowSuccessAlert(false), 3000);
                    } else {
                      throw new Error('Failed to update farmer');
                    }
                  } catch (error) {
                    console.error('Error updating farmer:', error);
                    alert('Gagal memperbarui data petani. Silakan coba lagi.');
                  }
                }}
              >
                Simpan
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setEditDialogOpen(false)}
              >
                Batal
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
    
    {/* Avatar Selection Dialog */}
    <Dialog open={avatarDialogOpen} onOpenChange={setAvatarDialogOpen}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Pilih Avatar</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-muted-foreground mb-4">Pilih avatar untuk profil Anda</p>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
            {[
              'male.png', 'male1.png', 'male2.png', 'male3.png', 'male4.png',
              'female.png', 'female1.png', 'female2.png', 'female3.png', 'female4.png'
            ].map((avatar, index) => (
              <div 
                key={index} 
                className="flex flex-col items-center cursor-pointer"
                onClick={() => {
                  // Update the farmerToEdit object with the new avatar
                  if (farmerToEdit) {
                    setFarmerToEdit({
                      ...farmerToEdit,
                      photo_url: `/avatar/${avatar}`
                    });
                  }
                  
                  setAvatarDialogOpen(false);
                }}
              >
                <img 
                  src={`/avatar/${avatar}`} 
                  alt={`Avatar ${index + 1}`}
                  className="w-16 h-16 rounded-lg object-cover border-2 border-transparent hover:border-primary transition-colors"
                />
                <span className="text-xs mt-1 text-center">Avatar {index + 1}</span>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
    
    {/* Add Farmer Dialog */}
    <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tambah Petani Baru</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex flex-col items-center gap-4">
            <div className="bg-gray-200 border-2 border-dashed rounded-xl w-32 h-32" />
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                type="button"
                onClick={() => setAvatarDialogOpen(true)}
              >
                Avatar
              </Button>
              <Button variant="outline" size="sm">
                Upload Foto
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="add_full_name">Nama Lengkap</Label>
            <Input 
              id="add_full_name" 
              placeholder="Masukkan nama lengkap"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="add_national_id">NIK</Label>
            <Input 
              id="add_national_id" 
              placeholder="Masukkan NIK"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="add_birth_date">Tanggal Lahir</Label>
              <Input 
                id="add_birth_date" 
                type="date" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add_gender">Jenis Kelamin</Label>
              <Select 
                onValueChange={(value) => {
                  setAddFarmerGender(value);
                }}
              >
                <SelectTrigger id="add_gender">
                  <SelectValue placeholder="Pilih jenis kelamin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                  <SelectItem value="Perempuan">Perempuan</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="add_education">Pendidikan</Label>
              <Select 
                onValueChange={(value) => {
                  setAddFarmerEducation(value);
                }}
              >
                <SelectTrigger id="add_education">
                  <SelectValue placeholder="Pilih pendidikan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Tidak ada">Tidak ada</SelectItem>
                  <SelectItem value="SD">SD</SelectItem>
                  <SelectItem value="SMP">SMP</SelectItem>
                  <SelectItem value="SMA">SMA</SelectItem>
                  <SelectItem value="Perguruan Tinggi">Perguruan Tinggi</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="add_phone">No. Telepon</Label>
              <Input 
                id="add_phone" 
                placeholder="Masukkan nomor telepon"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="add_address">Alamat</Label>
            <Input 
              id="add_address" 
              placeholder="Masukkan alamat lengkap"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="add_group">Kelompok Tani</Label>
            <Input 
              id="add_group" 
              placeholder="Masukkan kelompok tani"
            />
          </div>
          <div className="flex gap-2 pt-4">
            <Button 
              className="flex-1" 
              onClick={async () => {\n                // Get the form values\n                const fullName = (document.getElementById('add_full_name') as HTMLInputElement)?.value || '';\n                const nationalId = (document.getElementById('add_national_id') as HTMLInputElement)?.value || '';\n                const birthDate = (document.getElementById('add_birth_date') as HTMLInputElement)?.value || '';\n                \n                // For gender and education, we'll need to track them separately since Select doesn't have an input value\n                // We'll use a data attribute or state, but for now we'll just get them from the Select components\n                const genderSelect = document.querySelector('[id="add_gender"] .[\\\\:value]') as HTMLElement;\n                let gender = '';\n                if (genderSelect) {\n                  gender = genderSelect.textContent || '';\n                } else {\n                  // Fallback to a hidden input or default value if needed\n                  gender = (document.querySelector('[id="add_gender"] + div input') as HTMLInputElement)?.value || '';\n                }\n                \n                const educationSelect = document.querySelector('[id="add_education"] .[\\\\:value]') as HTMLElement;\n                let education = '';\n                if (educationSelect) {\n                  education = educationSelect.textContent || '';\n                } else {\n                  // Fallback to a hidden input or default value if needed\n                  education = (document.querySelector('[id="add_education"] + div input') as HTMLInputElement)?.value || '';\n                }\n                \n                const phone = (document.getElementById('add_phone') as HTMLInputElement)?.value || '';\n                const address = (document.getElementById('add_address') as HTMLInputElement)?.value || '';\n                const group = (document.getElementById('add_group') as HTMLInputElement)?.value || '';\n
                
                // Create new farmer object
                const newFarmer: Farmer = {
                  id: Math.max(...farmers.map(f => f.id), 0) + 1, // Simple ID generation
                  full_name: fullName,
                  national_id: nationalId,
                  date_of_birth: birthDate,
                  education: education,
                  gender: gender,
                  phone_number: phone,
                  address: address,
                  farmer_group: group,
                  photo_url: currentAvatar || '', // Use selected avatar or empty string
                  profile: `Halo, nama saya ${fullName}. Saya adalah seorang petani yang berdedikasi dalam mengelola lahan kopi.`
                };
                
                try {
                  // Call API to add farmer
                  const response = await fetch('/api/dashboard/farmers', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(newFarmer),
                  });
                  
                  if (response.ok) {
                    // Add the new farmer to the local state
                    const updatedFarmers = [...farmers, newFarmer];
                    setFarmers(updatedFarmers);
                    
                    setAddDialogOpen(false);
                    
